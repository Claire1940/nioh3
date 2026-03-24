#!/usr/bin/env python3
import re
from pathlib import Path

test_file = Path('src/content/en/basics/price.mdx')
with open(test_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 测试不同的正则表达式
patterns = [
    r'<div\s+style="position:\s*relative;[^>]*>.*?</div>\s*</div>',
    r'<div style="position: relative;[^>]*>.*?</div>\s*</div>',
    r'<iframe',
]

for i, pattern in enumerate(patterns):
    matches = list(re.finditer(pattern, content, re.DOTALL | re.IGNORECASE))
    print(f"Pattern {i+1}: Found {len(matches)} matches")
    if matches:
        print(f"  First match preview: {matches[0].group()[:100]}...")
