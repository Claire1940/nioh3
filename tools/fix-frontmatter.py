#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量修复 MDX 文件的 frontmatter 格式
"""

import os
import re
import sys
from pathlib import Path

# 设置输出编码
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 需要修复的文件列表
FILES_TO_FIX = [
    "builds/axe-build.mdx",
    "builds/code.mdx",
    "builds/katana-build.mdx",
    "builds/odachi.mdx",
    "builds/spear-build.mdx",
    "builds/tonfa.mdx",
    "builds/weapons.mdx",
    "combat/no-damage.mdx",
    "combat/samurai-style.mdx",
    "combat/stance-guide.mdx",
    "guides/female-character.mdx",
    "guides/new-game-plus.mdx",
    "guides/trophy-guide.mdx",
    "guides/vs-elden-ring.mdx",
    "guides/walkthrough.mdx",
    "guides/worth-it.mdx",
    "lore/story.mdx",
    "lore/timeline.mdx",
    "news/steelbook.mdx",
    "news/update.mdx",
    "platforms/demo-review.mdx",
    "platforms/pc.mdx",
    "platforms/ps5.mdx",
    "platforms/ps5-pro.mdx",
    "platforms/steam.mdx",
    "world/all-bosses.mdx",
    "world/boss.mdx",
    "world/boss-tier-list.mdx",
    "world/secret-areas.mdx",
    "world/yokai.mdx",
]

def extract_title_from_content(content):
    """从内容中提取标题"""
    lines = content.strip().split('\n')
    for line in lines[:10]:
        line = line.strip()
        if line and not line.startswith('#'):
            if 'Nioh 3' in line or 'nioh 3' in line:
                match = re.search(r'(Nioh 3[^.!?]*)', line, re.IGNORECASE)
                if match:
                    title = match.group(1).strip()
                    title = re.sub(r'\*\*', '', title)
                    title = re.sub(r'\s+', ' ', title)
                    return title[:100]
    return "Nioh 3 Guide"

def extract_description_from_content(content):
    """从内容中提取描述"""
    lines = content.strip().split('\n')
    for line in lines[:15]:
        line = line.strip()
        if line and not line.startswith('#') and len(line) > 50:
            desc = re.sub(r'\*\*', '', line)
            desc = re.sub(r'\s+', ' ', desc)
            return desc[:200]
    return "Comprehensive guide for Nioh 3 players"

def generate_keywords(file_path, title):
    """根据文件路径和标题生成关键词"""
    category = file_path.split('/')[0]
    slug = Path(file_path).stem
    keywords = [
        f"nioh 3 {slug.replace('-', ' ')}",
        f"nioh 3 {category}",
        "nioh 3 guide",
    ]
    title_words = title.lower().split()
    for word in title_words:
        if len(word) > 4 and word not in ['nioh', 'guide', 'this']:
            keywords.append(word)
    return keywords[:5]

def fix_frontmatter(file_path):
    """修复单个文件的 frontmatter"""
    full_path = Path("src/content/en") / file_path

    if not full_path.exists():
        print(f"[FAIL] File not found: {file_path}")
        return False

    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 检查是否已经有正确的 frontmatter
    if content.startswith('---\ntitle:'):
        print(f"[SKIP] Already correct: {file_path}")
        return True

    # 移除错误的 frontmatter
    if content.startswith('---\n'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            content = parts[2].strip()
        else:
            content = content[4:].strip()

    # 生成标题和描述
    title = extract_title_from_content(content)
    description = extract_description_from_content(content)
    keywords = generate_keywords(file_path, title)

    # 生成 canonical URL
    category = file_path.split('/')[0]
    slug = Path(file_path).stem
    canonical = f"https://nioh3.org/{category}/{slug}"

    # 构建新的 frontmatter
    frontmatter = f"""---
title: "{title}"
description: "{description}"
keywords: {keywords}
canonical: {canonical}
date: 2026-02-01
video:
  enabled: false
---

"""

    # 写入文件
    new_content = frontmatter + content
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"[OK] Fixed: {file_path}")
    return True

def main():
    print("Starting batch fix for MDX frontmatter...\n")

    success_count = 0
    fail_count = 0

    for file_path in FILES_TO_FIX:
        try:
            if fix_frontmatter(file_path):
                success_count += 1
            else:
                fail_count += 1
        except Exception as e:
            print(f"[ERROR] Failed to fix {file_path}: {str(e)}")
            fail_count += 1

    print(f"\nSummary:")
    print(f"Success: {success_count} files")
    print(f"Failed: {fail_count} files")

if __name__ == "__main__":
    main()
