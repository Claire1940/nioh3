#!/usr/bin/env python3
"""
更新所有codes文章中的codes列表
"""
import os
import re
from pathlib import Path

# 最新的有效codes
WORKING_CODES = """- **WWWW** – 200 Gems
- **RELEASE** – Class Reroll
- **RESETMYSTATS** – SP Reset (Stat Points Reset)
- **CLASSREROLL** – Class Reroll"""

def update_codes_in_file(file_path):
    """更新单个文件中的codes"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 查找codes列表部分并替换
    # 匹配从"- **"开始的列表项
    pattern = r'(## (?:All Working|Current Working|Latest).*?Codes.*?\n\n.*?\n\n)(- \*\*[A-Z0-9]+\*\*.*?\n)+(\n|According to|These codes|As of)'

    def replace_codes(match):
        header = match.group(1)
        footer = match.group(3)
        return header + WORKING_CODES + '\n\n' + footer

    # 尝试替换
    new_content = re.sub(pattern, replace_codes, content, flags=re.DOTALL)

    # 如果没有匹配到，尝试另一种模式
    if new_content == content:
        pattern2 = r'(## .*?[Cc]odes.*?\n\n.*?\n\n)(- \*\*.*?\n)+'
        new_content = re.sub(pattern2, lambda m: m.group(1) + WORKING_CODES + '\n\n', content, flags=re.DOTALL)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def main():
    codes_dir = Path('../../../../src/content/en/codes')

    updated = 0
    skipped = 0

    print("Updating codes in all codes articles...\n")

    for mdx_file in codes_dir.glob('*.mdx'):
        if update_codes_in_file(mdx_file):
            print(f"OK Updated: {mdx_file.name}")
            updated += 1
        else:
            print(f"SKIP No codes pattern found: {mdx_file.name}")
            skipped += 1

    print(f"\n{'='*60}")
    print(f"Update Complete")
    print(f"{'='*60}")
    print(f"Updated: {updated} files")
    print(f"Skipped: {skipped} files")
    print(f"{'='*60}\n")

if __name__ == '__main__':
    main()
