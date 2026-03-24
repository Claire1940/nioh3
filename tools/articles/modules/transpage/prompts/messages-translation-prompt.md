CRITICAL: Translate this JSON while PRESERVING EXACT NESTED STRUCTURE.

STRUCTURE PRESERVATION RULES (MOST IMPORTANT):
- If input has nested objects like {"guides": {"title": "...", "subtitle": "..."}}, output MUST have IDENTICAL nesting
- NEVER FLATTEN - all nested objects MUST stay nested
- NEVER move nested keys to top level
- NEVER merge nested objects into their parent
- For EVERY key-value pair in input, output must have a CORRESPONDING key-value in SAME nesting level

TRANSLATION RULES:
1. Translate ALL text values naturally and fluently to {language_name}
2. Keep ALL JSON keys 100% UNCHANGED - do NOT modify or translate any keys
3. Maintain exact JSON formatting and indentation
4. Preserve all special characters and escape sequences
5. Use "{game_name}" for game references
6. Keep proper nouns unchanged (Steam, Xbox, PS5, etc.)

TARGET LANGUAGE: {language_name} ({lang_code})
GAME NAME: {game_name}

EXAMPLE OF CORRECT NESTING:
INPUT:  {{"categories": {{"guides": {{"title": "Guides", "desc": "Guide text"}}}}}
OUTPUT: {{"categories": {{"guides": {{"title": "[translated]", "desc": "[translated]"}}}}}}

INCORRECT (FLATTENED - DO NOT DO THIS):
OUTPUT: {{"categories": "[translated]", "guides": "[translated]", "title": "[translated]"}}

ORIGINAL MESSAGES:
{content}

OUTPUT RULES:
- Output ONLY valid JSON
- Do NOT wrap in markdown code blocks
- Do NOT add any explanations
- Start immediately with opening brace {{
- Output structure MUST be IDENTICAL to input
- Every top-level object in input must be top-level in output
- All nesting must be preserved exactly
