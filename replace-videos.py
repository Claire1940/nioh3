#!/usr/bin/env python3
"""替换 MDX 文件中不相关的视频为 Solo Hunters 相关视频"""

import os
import re
import json
import random
from pathlib import Path

# Solo Hunters 相关视频列表
LORT_VIDEOS = [
    {
        "id": "LvUiE-Lc8iE",
        "title": "Launch Trailer - Solo Hunters",
        "description": "Official launch trailer showcasing Solo Hunters's core gameplay, classes, and co-op action",
        "duration": "PT1M30S",
        "uploadDate": "2025-01-15"
    },
    {
        "id": "xDTOPSBe1wM",
        "title": "Solo Hunters - Official Announcement Trailer",
        "description": "First look at Solo Hunters's world, mechanics, and roguelite systems",
        "duration": "PT2M15S",
        "uploadDate": "2024-12-01"
    },
    {
        "id": "EOGAnyCaQjs",
        "title": "Before You Buy - Solo Hunters",
        "description": "Comprehensive review covering gameplay, performance, and value proposition",
        "duration": "PT10M45S",
        "uploadDate": "2025-01-20"
    },
    {
        "id": "h1D3655rwlI",
        "title": "Solo Hunters - Gameplay PC [4K 60FPS]",
        "description": "Full gameplay footage in 4K showcasing actual game performance",
        "duration": "PT15M30S",
        "uploadDate": "2025-01-18"
    }
]

def extract_video_info_from_frontmatter(frontmatter):
    """从 frontmatter 中提取视频信息"""
    youtube_id_match = re.search(r'youtubeId:\s*["\']?([a-zA-Z0-9_-]+)["\']?', frontmatter)
    youtube_id = youtube_id_match.group(1) if youtube_id_match else None

    title_match = re.search(r'video:.*?title:\s*["\'](.+?)["\']', frontmatter, re.DOTALL)
    title = title_match.group(1) if title_match else None

    return youtube_id, title

def is_irrelevant_video(title):
    """判断视频是否与LORT游戏无关"""
    if not title:
        return False

    title_lower = title.lower()

    irrelevant_keywords = [
        'lotr',
        'lord of the rings',
        'gandalf',
        'ambient music',
        'cumbia',
        'moron',
        'roch0',
        'middle earth',
        'bedtime stories',
        'shipping containers',
        'fellowship',
        'you shall not pass',
        'extended edition',
    ]

    for keyword in irrelevant_keywords:
        if keyword in title_lower:
            return True

    return False

def replace_video_in_frontmatter(content, new_video):
    """替换 frontmatter 中的视频信息"""
    # 查找 video 区块
    video_block_pattern = r'(video:\s*\n\s*enabled:.*?\n\s*youtubeId:.*?\n\s*title:.*?\n\s*description:.*?\n\s*duration:.*?\n\s*uploadDate:.*?\n)'

    new_video_block = f'''video:
  enabled: true
  youtubeId: "{new_video['id']}"
  title: "{new_video['title']}"
  description: "{new_video['description']}"
  duration: "{new_video['duration']}"
  uploadDate: "{new_video['uploadDate']}"
'''

    new_content = re.sub(video_block_pattern, new_video_block, content, count=1, flags=re.DOTALL)
    return new_content

def replace_video_in_iframe(content, old_id, new_video):
    """替换 iframe 中的视频 ID 和标题"""
    # 替换 YouTube ID
    content = re.sub(
        rf'youtube\.com/embed/{old_id}',
        f'youtube.com/embed/{new_video["id"]}',
        content
    )

    # 替换 title 属性
    content = re.sub(
        r'title="[^"]*"',
        f'title="{new_video["title"]}"',
        content,
        count=1
    )

    return content

def process_mdx_file(file_path, dry_run=True):
    """处理单个 MDX 文件"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    frontmatter_match = re.search(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not frontmatter_match:
        return None

    frontmatter = frontmatter_match.group(1)
    youtube_id, video_title = extract_video_info_from_frontmatter(frontmatter)

    if not is_irrelevant_video(video_title):
        return None

    # 选择一个随机的 Solo Hunters 视频
    new_video = random.choice(LORT_VIDEOS)

    result = {
        'file': str(file_path),
        'old_id': youtube_id,
        'old_title': video_title,
        'new_id': new_video['id'],
        'new_title': new_video['title']
    }

    if not dry_run:
        # 替换 frontmatter 中的视频信息
        new_content = replace_video_in_frontmatter(content, new_video)

        # 替换 iframe 中的视频 ID
        if youtube_id:
            new_content = replace_video_in_iframe(new_content, youtube_id, new_video)

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
        print("OK - All videos are Solo Hunters-related")
        return

    print(f"Found {len(results)} files with irrelevant videos\n")
    print("=" * 80)
    print("Files to be updated:")
    print("=" * 80)

    for r in results:
        print(f"\nFile: {r['file']}")
        print(f"  Old: {r['old_title']}")
        print(f"  New: {r['new_title']}")

    print("\n" + "=" * 80)
    print(f"\nTotal files to modify: {len(results)}")
    print("\nTo apply changes, run: python replace-videos.py --apply")

if __name__ == '__main__':
    import sys
    if '--apply' in sys.argv:
        print("Applying changes...\n")
        content_dir = Path('src/content/en')
        modified_count = 0
        for mdx_file in content_dir.rglob('*.mdx'):
            result = process_mdx_file(mdx_file, dry_run=False)
            if result and result.get('modified'):
                modified_count += 1
                print(f"Modified: {result['file']}")
                print(f"  {result['old_title']} -> {result['new_title']}")
        print(f"\nTotal files modified: {modified_count}")
    else:
        main()
