#!/usr/bin/env python3
"""测试iframe匹配模式"""

import re

# 测试内容
test_content = """
This video demonstrates gameplay in **Solo Hunters** and showcases some of the intense, cooperative action.

<div style="position: relative; padding-bottom: 56.25%; height: 0; margin: 2rem 0; border-radius: 0.5rem; overflow: hidden;">
  <iframe
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    src="https://www.youtube.com/embed/rZtntZGeECw"
    title="Solo Hunters - Gameplay Reveal Trailer"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
  ></iframe>
</div>

## FAQs About Solo Hunters on Steam
"""

print("Original content:")
print(test_content)
print("\n" + "="*60 + "\n")

# 测试不同的正则模式
patterns = [
    (r'(?:This video[^\n]*\n\n)?<div[^>]*style="[^"]*position:\s*relative[^"]*"[^>]*>[\s\S]*?<iframe[\s\S]*?</iframe>[\s\S]*?</div>\n*', 'Pattern 1: div with iframe'),
    (r'<div[^>]*>[\s\S]*?<iframe[\s\S]*?</iframe>[\s\S]*?</div>', 'Pattern 2: Simple div with iframe'),
    (r'<div[^>]*style[^>]*>.*?<iframe.*?</iframe>.*?</div>', 'Pattern 3: Greedy match'),
]

for pattern, description in patterns:
    print(f"Testing: {description}")
    matches = re.findall(pattern, test_content, re.DOTALL | re.MULTILINE)
    if matches:
        print(f"  FOUND {len(matches)} match(es)")
        for i, match in enumerate(matches):
            print(f"  Match {i+1}: {match[:100]}...")
    else:
        print("  NO MATCH")
    print()
