#!/usr/bin/env python3
"""检查 MDX 文件中 frontmatter 的 youtubeId 和 iframe 中的 youtubeId 是否一致"""

import os
import re
from pathlib import Path

def extract_frontmatter_youtube_id(content):
    """从 frontmatter 中提取 youtubeId"""
    match = re.search(r'youtubeId:\s*["\']?([a-zA-Z0-9_-]+)["\']?', content)
    return match.group(1) if match else None

def extract_iframe_youtube_ids(content):
    """从 iframe 中提取所有 YouTube ID"""
    pattern = r'youtube\.com/embed/([a-zA-Z0-9_-]+)'
    return re.findall(pattern, content)

def check_mdx_file(file_path):
    """检查单个 MDX 文件"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    frontmatter_id = extract_frontmatter_youtube_id(content)
    iframe_ids = extract_iframe_youtube_ids(content)

    if not frontmatter_id:
        return None

    if not iframe_ids:
        return None

    # 检查是否有不一致的 ID
    mismatches = [iframe_id for iframe_id in iframe_ids if iframe_id != frontmatter_id]

    if mismatches:
        return {
            'file': str(file_path),
            'frontmatter_id': frontmatter_id,
            'iframe_ids': iframe_ids,
            'mismatches': mismatches
        }

    return None

def main():
    content_dir = Path('src/content/en')
    issues = []

    for mdx_file in content_dir.rglob('*.mdx'):
        result = check_mdx_file(mdx_file)
        if result:
            issues.append(result)

    if issues:
        print(f"发现 {len(issues)} 个文件存在视频 ID 不一致问题：\n")
        for issue in issues:
            print(f"文件: {issue['file']}")
            print(f"  Frontmatter youtubeId: {issue['frontmatter_id']}")
            print(f"  Iframe 中的 ID: {', '.join(issue['iframe_ids'])}")
            print(f"  不匹配的 ID: {', '.join(issue['mismatches'])}")
            print()
    else:
        print("OK - All video IDs are consistent")

if __name__ == '__main__':
    main()
