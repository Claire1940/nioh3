#!/usr/bin/env python3
"""测试真实文件"""

import re

# 读取真实文件
with open('src/content/en/basics/steam.mdx', 'r', encoding='utf-8') as f:
    content = f.read()

print(f"File length: {len(content)} characters")
print(f"Contains <iframe: {'<iframe' in content}")
print(f"Contains </iframe>: {'</iframe>' in content}")
print()

# 分离frontmatter
parts = content.split('---', 2)
print(f"Parts after split: {len(parts)}")

if len(parts) >= 3:
    body = parts[2]
    print(f"Body length: {len(body)} characters")
    print(f"Body contains <iframe: {'<iframe' in body}")
    print()

    # 查找iframe位置
    iframe_start = body.find('<iframe')
    if iframe_start != -1:
        print(f"Found <iframe at position: {iframe_start}")
        print("Context around iframe:")
        print(body[max(0, iframe_start-100):iframe_start+200])
        print()

    # 测试正则匹配
    pattern = r'<div[^>]*>[\s\S]*?<iframe[\s\S]*?</iframe>[\s\S]*?</div>'
    matches = re.findall(pattern, body)
    print(f"Regex matches found: {len(matches)}")

    if matches:
        print("First match preview:")
        print(matches[0][:200])
