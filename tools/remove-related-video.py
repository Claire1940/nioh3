#!/usr/bin/env python3
"""
删除文章中残留的 "Related Video:" 文本
"""

import re
from pathlib import Path

def remove_related_video_text(filepath):
    """删除文章中的Related Video文本"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 删除各种格式的 "Related Video:" 文本
    patterns = [
        r'\*\*Related Video:\*\*\n\n.*?(?=\n\n|\Z)',
        r'### Related Video:\n\n.*?(?=\n\n|\Z)',
        r'\*\*Related Video:\*\*.*?(?=\n\n|\Z)',
        r'### Related Video:.*?(?=\n\n|\Z)',
    ]

    for pattern in patterns:
        content = re.sub(pattern, '', content, flags=re.DOTALL)

    # 清理多余空行
    content = re.sub(r'\n{3,}', '\n\n', content)
    content = content.strip() + '\n'

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True

    return False

def main():
    """主函数"""
    files_to_fix = [
        "src/content/en/builds/tonfa.mdx",
        "src/content/en/builds/weapons.mdx",
        "src/content/en/combat/stats-guide.mdx",
        "src/content/en/community/pvp.mdx",
        "src/content/en/lore/story.mdx",
    ]

    print("[INFO] Removing 'Related Video:' text...")

    fixed_count = 0
    for filepath in files_to_fix:
        path = Path(filepath)
        if path.exists():
            if remove_related_video_text(path):
                fixed_count += 1
                print(f"[FIXED] {filepath}")
        else:
            print(f"[SKIP] {filepath} not found")

    print(f"\n[SUMMARY] Fixed {fixed_count} files")

if __name__ == "__main__":
    main()
