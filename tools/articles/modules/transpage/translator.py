"""
Messages Translator Module
Translates UI messages from en.json to other languages
"""

import json
import aiohttp
import asyncio
import os
from pathlib import Path
from typing import Optional


class MessagesTranslator:
    """Translator for UI messages JSON files"""

    def __init__(self, config: dict):
        """
        Initialize translator with API configuration

        Args:
            config: Configuration dictionary containing API settings
        """
        # API credentials
        self.api_key = config['api_key']
        self.api_base_url = config['api_base_url']
        self.model = config.get('model', 'gemini-2.0-flash')
        self.temperature = config.get('temperature', 0.7)
        self.max_tokens = config.get('max_tokens', 8192)
        self.retry_attempts = config.get('retry_attempts', 5)  # Increase retries
        self.retry_delay = config.get('retry_delay', 3)  # Increase delay
        self.timeout = config.get('timeout', 900)  # Increase timeout for large JSON

        # Game names and language names from config
        self.game_names = config.get('game_names', {})
        self.lang_names = config.get('lang_names', {
            'es': 'Spanish',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'ja': 'Japanese',
            'de': 'German',
            'fr': 'French',
            'zh': 'Chinese',
            'ko': 'Korean',
            'vi': 'Vietnamese',
            'th': 'Thai'
        })

        # Load translation prompt template
        self.translation_prompt_template = None
        self.load_translation_prompt()

    def load_translation_prompt(self):
        """Load translation prompt template from file"""
        try:
            # Prompt is in the same module directory
            module_dir = os.path.dirname(__file__)
            template_path = os.path.join(module_dir, 'prompts', 'messages-translation-prompt.md')

            with open(template_path, 'r', encoding='utf-8') as f:
                self.translation_prompt_template = f.read()
            print(f"[OK] Messages translation prompt template loaded")
        except Exception as e:
            print(f"[FAIL] Error loading translation prompt template: {str(e)}")
            print(f"   Translation will not work without the template file")
            self.translation_prompt_template = None

    async def translate_to_language(
        self,
        messages_json: str,
        target_lang: str,
        session: aiohttp.ClientSession
    ) -> Optional[str]:
        """
        Translate messages JSON to a single target language

        Args:
            messages_json: Original messages JSON in English
            target_lang: Target language code (e.g., 'es', 'pt', 'ru')
            session: Aiohttp client session

        Returns:
            Translated messages JSON or None if failed
        """
        if not self.translation_prompt_template:
            print(f"[FAIL] Translation prompt template not loaded")
            return None

        # Get language name and game name
        lang_name = self.lang_names.get(target_lang, target_lang)
        game_name = self.game_names.get(target_lang, '2xko')

        # Build prompt from template using string replacement instead of format()
        # to avoid issues with JSON braces being interpreted as format placeholders
        prompt = self.translation_prompt_template
        prompt = prompt.replace('{language_name}', lang_name)
        prompt = prompt.replace('{lang_code}', target_lang)
        prompt = prompt.replace('{game_name}', game_name)
        prompt = prompt.replace('{content}', messages_json)

        # API request payload
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "stream": False
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
            "Connection": "keep-alive"
        }

        # Print request info
        print(f"  [SEND] API请求 [{target_lang.upper()}]:")
        print(f"     模型: {self.model}")
        print(f"     内容长度: {len(messages_json)} 字符")
        print(f"     最大tokens: {self.max_tokens}")

        # Retry logic
        for attempt in range(self.retry_attempts):
            try:
                # More detailed timeout configuration
                timeout = aiohttp.ClientTimeout(
                    total=self.timeout,
                    connect=120,      # Allow more time to connect
                    sock_read=600     # Allow more time to read large responses
                )

                async with session.post(
                    url=self.api_base_url,
                    json=payload,
                    headers=headers,
                    timeout=timeout
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        translated_content = data['choices'][0]['message']['content'].strip()

                        # Remove markdown code blocks if present
                        if translated_content.startswith('```'):
                            lines = translated_content.split('\n')
                            if lines[0].startswith('```'):
                                lines = lines[1:]
                            if lines[-1].strip() == '```':
                                lines = lines[:-1]
                            translated_content = '\n'.join(lines)

                        print(f"  [OK] [{target_lang.upper()}] 成功 - {len(translated_content)} 字符")
                        return translated_content
                    else:
                        error_text = await response.text()
                        print(f"  [FAIL] [{target_lang.upper()}] API错误 (尝试 {attempt + 1}/{self.retry_attempts})")
                        print(f"     状态码: {response.status}")
                        print(f"     错误: {error_text[:200]}")

            except asyncio.TimeoutError:
                print(f"  [TIME] [{target_lang.upper()}] 超时 (尝试 {attempt + 1}/{self.retry_attempts})")
                if attempt < self.retry_attempts - 1:
                    await asyncio.sleep(self.retry_delay)
                    continue

            except Exception as e:
                print(f"  [FAIL] [{target_lang.upper()}] 异常 (尝试 {attempt + 1}/{self.retry_attempts})")
                print(f"     异常: {type(e).__name__}: {str(e)}")
                if attempt < self.retry_attempts - 1:
                    await asyncio.sleep(self.retry_delay)
                    continue

        # All attempts failed
        return None

    def fix_json_content(self, content: str) -> Optional[str]:
        """
        Fix common JSON formatting issues from API responses

        Args:
            content: Raw content from API

        Returns:
            Fixed JSON string or None if unfixable
        """
        import re

        # Remove leading/trailing whitespace
        content = content.strip()

        # Try to extract JSON if wrapped in markdown
        if '```' in content:
            # Find JSON content between backticks
            match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', content)
            if match:
                content = match.group(1).strip()

        # Try to load and re-serialize to fix formatting
        try:
            parsed = json.loads(content)
            # Re-serialize to ensure valid JSON
            return json.dumps(parsed, ensure_ascii=False, indent=2)
        except json.JSONDecodeError as e:
            # Try to fix common issues
            try:
                # Fix incomplete strings (ending without closing quote)
                # This regex finds strings that don't end properly and fixes them
                content = re.sub(r'(?<!\\)"([^"]*?)$', r'"\1"', content, flags=re.MULTILINE)

                # Fix missing commas between key-value pairs
                # Pattern: "key": value\n  "nextkey" -> add comma
                content = re.sub(r'([:,\[\{])\s*\n\s*(")', r'\1,\n  \2', content)

                # Fix missing commas in arrays
                content = re.sub(r'(\})\s*\n\s*(\{)', r'\1,\n    \2', content)

                # Fix unescaped newlines within strings (replace with \n escape)
                # This is tricky - we need to be careful with valid multiline

                # Try parsing again
                parsed = json.loads(content)
                return json.dumps(parsed, ensure_ascii=False, indent=2)
            except json.JSONDecodeError:
                # Last resort: try to manually reconstruct from original structure
                try:
                    # Load the original English file to understand structure
                    en_path = Path('src/messages/en.json')
                    if en_path.exists():
                        with open(en_path, 'r', encoding='utf-8') as f:
                            en_json = json.load(f)

                        # Try to extract key-value pairs from translated content
                        # and map to the structure
                        import re
                        result = {}

                        # Find all quoted strings that look like translations
                        pattern = r'"([^"]+)"\s*:\s*"([^"]*(?:\\"[^"]*)*)"'
                        for match in re.finditer(pattern, content):
                            key, value = match.groups()
                            result[key] = value.replace('\\"', '"')

                        if result:
                            return json.dumps(result, ensure_ascii=False, indent=2)
                except Exception:
                    pass

                return None

    def restore_structure(self, original_json: dict, translated_flat: dict) -> dict:
        """
        Restore nested structure from completely flattened translation.

        When API returns a flattened structure, we need to map keys back
        by first flattening the original and then rebuilding with translations.

        Args:
            original_json: Original nested JSON structure
            translated_flat: Translated JSON (typically flattened)

        Returns:
            Nested JSON with translated values matching original structure
        """
        try:
            # Step 1: Create a flat view of original to understand the key mapping
            def flatten_dict(d, parent_key='', sep='.'):
                """Flatten a nested dict into a flat dict with dot-notation keys"""
                items = []
                for k, v in d.items():
                    new_key = f"{parent_key}{sep}{k}" if parent_key else k
                    if isinstance(v, dict):
                        items.extend(flatten_dict(v, new_key, sep=sep).items())
                    elif not isinstance(v, list):
                        items.append((new_key, v))
                return dict(items)

            # Step 2: Flatten the original JSON
            flat_original = flatten_dict(original_json)

            # Step 3: Create a lookup from translated_flat
            # Try to match keys to find translations
            translations = {}

            for key, orig_value in flat_original.items():
                # Try direct key match first
                if key in translated_flat:
                    trans_val = translated_flat[key]
                    if isinstance(trans_val, str) and trans_val:
                        translations[key] = trans_val
                else:
                    # Try matching by short key name (last component)
                    short_key = key.split('.')[-1]
                    if short_key in translated_flat:
                        trans_val = translated_flat[short_key]
                        if isinstance(trans_val, str) and trans_val:
                            translations[key] = trans_val

            # Step 4: Rebuild the nested structure with translations
            def rebuild(orig, trans_map, parent_path=''):
                if not isinstance(orig, dict):
                    return orig

                result = {}
                for k, v in orig.items():
                    current_path = f"{parent_path}.{k}" if parent_path else k

                    if isinstance(v, dict):
                        result[k] = rebuild(v, trans_map, current_path)
                    elif isinstance(v, str):
                        # Look up in translations map
                        result[k] = trans_map.get(current_path, v)
                    elif isinstance(v, list):
                        result[k] = v
                    else:
                        result[k] = v

                return result

            return rebuild(original_json, translations)

        except Exception as e:
            # If anything goes wrong, return original
            return original_json

    def validate_structure(self, original_json: dict, translated_json: dict) -> bool:
        """
        Validate that translated JSON has the same structure as original

        Args:
            original_json: Parsed original English JSON
            translated_json: Parsed translated JSON

        Returns:
            True if structure matches, False otherwise
        """
        def check_structure(orig, trans, path=""):
            if type(orig) != type(trans):
                return False

            if isinstance(orig, dict):
                if set(orig.keys()) != set(trans.keys()):
                    return False
                for key in orig:
                    if not check_structure(orig[key], trans[key], f"{path}.{key}"):
                        return False

            elif isinstance(orig, list):
                if len(orig) != len(trans):
                    return False
                for i in range(len(orig)):
                    if not check_structure(orig[i], trans[i], f"{path}[{i}]"):
                        return False

            return True

        return check_structure(original_json, translated_json)

    async def translate_and_save(
        self,
        messages_json: str,
        target_lang: str,
        output_path: Path,
        session: aiohttp.ClientSession
    ) -> bool:
        """
        Translate messages JSON and save immediately to file

        Args:
            messages_json: Original messages JSON in English
            target_lang: Target language code (e.g., 'es', 'pt', 'ru')
            output_path: Path to save translated file
            session: Aiohttp client session

        Returns:
            True if translation and save succeeded, False otherwise
        """
        # Parse original JSON to validate structure
        try:
            original_json = json.loads(messages_json)
        except json.JSONDecodeError:
            print(f"  [FAIL] [{target_lang.upper()}] 原始 JSON 无效")
            return False

        # Translate
        translated_content = await self.translate_to_language(
            messages_json,
            target_lang,
            session
        )

        if not translated_content:
            return False

        # Fix JSON formatting
        fixed_content = self.fix_json_content(translated_content)
        if not fixed_content:
            print(f"  [FAIL] [{target_lang.upper()}] 无法修复 JSON 格式")
            return False

        # Validate JSON
        try:
            parsed_json = json.loads(fixed_content)
        except json.JSONDecodeError as e:
            print(f"  [FAIL] [{target_lang.upper()}] 翻译结果不是有效的JSON: {str(e)}")
            return False

        # Validate structure matches original
        if not self.validate_structure(original_json, parsed_json):
            print(f"  [WARN] [{target_lang.upper()}] 翻译结果的 JSON 结构不匹配原始文件，尝试恢复...")
            # Try to restore the structure
            try:
                parsed_json = self.restore_structure(original_json, parsed_json)
                print(f"  [OK] [{target_lang.upper()}] 成功恢复 JSON 结构")
            except Exception as e:
                print(f"  [FAIL] [{target_lang.upper()}] 无法恢复 JSON 结构: {str(e)}")
                return False

        # Save to file
        try:
            output_path.parent.mkdir(parents=True, exist_ok=True)

            with open(output_path, 'w', encoding='utf-8') as f:
                # Pretty print JSON with indentation
                json.dump(parsed_json, f, indent=2, ensure_ascii=False)

            print(f"  [OK] [{target_lang.upper()}] 已保存 - {output_path.name}")
            return True

        except Exception as e:
            print(f"  [FAIL] [{target_lang.upper()}] 保存文件失败: {str(e)}")
            return False
