#!/usr/bin/env python3
"""删除 MDX 文件中的第二个视频嵌入，只保留第一个"""

import re
from pathlib import Path

def remove_second_video_embed(content):
    """删除第二个视频嵌入区块"""
    # 匹配所有视频嵌入区块
    pattern = r'<div\s+style="position:\s*relative;[^>]*>.*?<iframe.*?</iframe>.*?</div>'
    matches = list(re.finditer(pattern, content, re.DOTALL | re.IGNORECASE))

    if len(matches) <= 1:
        return content, 0

    # 删除第二个及之后的所有视频嵌入
    new_content = content
    removed_count = 0

    # 从后往前删除，避免索引变化
    for i in range(len(matches) - 1, 0, -1):
        match = matches[i]
        # 同时删除视频前的标题（如果有）
        # 查找视频前的 "**Video Embed**" 或类似标题
        start_pos = match.start()
        # 向前查找最多200个字符，看是否有视频标题
        search_start = max(0, start_pos - 200)
        before_text = content[search_start:start_pos]

        # 查找视频标题行
        title_patterns = [
            r'\n\*\*Video Embed\*\*\n+.*?\n+',
            r'\n### Related Videos?\n+.*?\n+',
            r'\n## Video .*?\n+.*?\n+',
        ]

        title_match = None
        for title_pattern in title_patterns:
            title_match = re.search(title_pattern, before_text, re.IGNORECASE)
            if title_match:
                # 调整起始位置
                start_pos = search_start + title_match.start()
                break

        new_content = new_content[:start_pos] + new_content[match.end():]
        removed_count += 1

    return new_content, removed_count

def process_mdx_file(file_path, dry_run=True):
    """处理单个 MDX 文件"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content, removed_count = remove_second_video_embed(content)

    if removed_count == 0:
        return None

    result = {
        'file': str(file_path),
        'removed_count': removed_count
    }

    if not dry_run:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        result['modified'] = True

    return result

def main():
    content_dir = Path('src/content/en')
    results = []

    print("Scanning all MDX files...\n")

    for mdx_file in content_dir.rglob('*.mdx'):
        result = process_mdx_file(mdx_file, dry_run=True)
        if result:
            results.append(result)

    if not results:
        print("OK - All files have only one video")
        return

    print(f"Found {len(results)} files with multiple videos\n")
    print("=" * 80)
    print("Files to be updated:")
    print("=" * 80)

    for r in results:
        print(f"{r['file']}: will remove {r['removed_count']} video(s)")

    print("\n" + "=" * 80)
    print(f"\nTotal files to modify: {len(results)}")
    print("\nTo apply changes, run: python remove-extra-videos.py --apply")

if __name__ == '__main__':
    import sys
    if '--apply' in sys.argv:
        print("Applying changes...\n")
        content_dir = Path('src/content/en')
        modified_count = 0
        total_removed = 0

        for mdx_file in content_dir.rglob('*.mdx'):
            result = process_mdx_file(mdx_file, dry_run=False)
            if result and result.get('modified'):
                modified_count += 1
                total_removed += result['removed_count']
                print(f"Modified: {result['file']} (removed {result['removed_count']} video(s))")

        print(f"\nTotal files modified: {modified_count}")
        print(f"Total videos removed: {total_removed}")
    else:
        main()
