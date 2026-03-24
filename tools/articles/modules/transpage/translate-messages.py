#!/usr/bin/env python3
"""
Messages Translation Script
Translates en.json to multiple languages

Usage:
    python translate-messages.py [--test] [--overwrite] [--lang es,pt,ru]
"""

import asyncio
import json
import os
import sys
import argparse
import aiohttp
from pathlib import Path
from typing import List

# Add the parent directory to Python path to import shared config
script_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(script_dir)
sys.path.insert(0, parent_dir)

# Import from same module directory
from translator import MessagesTranslator


class MessagesTranslationManager:
    """Manager for batch translating messages files"""

    def __init__(self, config_path: str = None):
        """
        Initialize translation manager

        Args:
            config_path: Path to configuration file (defaults to shared config)
        """
        if config_path is None:
            # Use shared config from translate module
            # script_dir = tools/articles/modules/transpage
            # We need tools/articles/modules/translate/translate_config.json
            modules_dir = os.path.dirname(script_dir)  # tools/articles/modules
            translate_module_dir = os.path.join(modules_dir, 'translate')
            config_path = os.path.join(translate_module_dir, 'translate_config.json')

        self.config_path = config_path
        self.config = None
        self.translator = None
        self.messages_dir = None

    def load_config(self) -> bool:
        """Load configuration from JSON file"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                self.config = json.load(f)
            print(f"[OK] Configuration loaded from {self.config_path}")
            return True
        except Exception as e:
            print(f"[FAIL] Error loading configuration: {str(e)}")
            return False

    def initialize(self) -> bool:
        """Initialize translator"""
        try:
            self.translator = MessagesTranslator(self.config)
            self.messages_dir = Path('src/messages/')
            print("[OK] Translator initialized")
            return True
        except Exception as e:
            print(f"[FAIL] Error initializing translator: {str(e)}")
            return False

    def read_english_messages(self) -> str:
        """
        Read English messages file

        Returns:
            JSON string of English messages
        """
        en_file = self.messages_dir / 'en.json'

        if not en_file.exists():
            print(f"[FAIL] English messages file not found: {en_file}")
            return None

        try:
            with open(en_file, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"[FAIL] Error reading English messages: {str(e)}")
            return None

    async def translate_all_messages(
        self,
        target_langs: List[str],
        overwrite: bool = False
    ):
        """
        Translate English messages to target languages

        Args:
            target_langs: List of target language codes
            overwrite: Whether to overwrite existing files
        """
        print("\n" + "=" * 60)
        print("[START] STARTING MESSAGES TRANSLATION")
        print("=" * 60 + "\n")

        print(f"[TARGET] Target languages: {', '.join(target_langs)}")

        # Read English messages
        en_messages = self.read_english_messages()

        if not en_messages:
            print("[FAIL] Failed to read English messages")
            return

        print(f"[OK] English messages loaded ({len(en_messages)} characters)\n")

        # Use default ClientSession
        async with aiohttp.ClientSession() as session:
            # Build translation tasks
            all_tasks = []

            print("[BUILD] Building translation tasks...")
            for lang in target_langs:
                output_path = self.messages_dir / f'{lang}.json'

                # Skip if exists and not overwrite
                if output_path.exists() and not overwrite:
                    print(f"  [SKIP] Skipping {lang}.json (already exists)")
                    continue

                # Create translation task
                task_info = {
                    'lang': lang,
                    'output_path': output_path,
                    'task': self.translator.translate_and_save(
                        en_messages,
                        lang,
                        output_path,
                        session
                    )
                }
                all_tasks.append(task_info)

            if not all_tasks:
                print("[OK] All messages already translated!")
                return

            print(f"[OK] Built {len(all_tasks)} translation tasks\n")

            # Execute all tasks in parallel
            print(f"[EXEC] Executing {len(all_tasks)} translation tasks in parallel...\n")

            results = await asyncio.gather(*[t['task'] for t in all_tasks], return_exceptions=True)

            # Collect statistics
            print("\n[STATS] Collecting statistics...\n")
            stats = {
                'total': len(all_tasks),
                'success': 0,
                'failed': 0
            }

            for task_info, result in zip(all_tasks, results):
                lang = task_info['lang']

                if result is True:
                    stats['success'] += 1
                elif isinstance(result, Exception):
                    print(f"  [FAIL] [{lang.upper()}] Exception: {type(result).__name__}")
                    stats['failed'] += 1
                else:
                    stats['failed'] += 1

        # Print summary
        print("\n" + "=" * 60)
        print("[STATS] TRANSLATION COMPLETE")
        print("=" * 60)
        print(f"Total tasks:      {stats['total']}")
        print(f"[OK] Successful:    {stats['success']}")
        print(f"[FAIL] Failed:        {stats['failed']}")
        if stats['total'] > 0:
            print(f"Success rate:     {stats['success'] / stats['total'] * 100:.1f}%")
        print("=" * 60 + "\n")


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Translate messages to multiple languages')
    parser.add_argument('--overwrite', action='store_true', help='Overwrite existing translations')
    parser.add_argument('--lang', type=str, default=None, help='Target languages (comma-separated, e.g., es,pt,ru)')

    args = parser.parse_args()

    # Initialize manager
    manager = MessagesTranslationManager()

    if not manager.load_config():
        sys.exit(1)

    if not manager.initialize():
        sys.exit(1)

    # Determine target languages
    if args.lang:
        target_langs = [lang.strip() for lang in args.lang.split(',')]
    else:
        # Default: all languages from config
        target_langs = manager.config.get('languages', ['es', 'pt', 'ru'])

    print(f"[LANG] Target languages: {', '.join(target_langs)}")

    # Run translation
    asyncio.run(manager.translate_all_messages(
        target_langs=target_langs,
        overwrite=args.overwrite
    ))


if __name__ == '__main__':
    main()
