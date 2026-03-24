#!/usr/bin/env python3
"""检查并修复 MDX 文件中的视频问题"""

import os
import re
from pathlib import Path
import requests
from time import sleep

def extract_iframe_sections(content):
    """提取所有 iframe 视频区块"""
    pattern = r'<div style="position: relative;[^>]*>.*?</div>\s*</div>'
    matches = list(re.finditer(pattern, content, re.DOTALL))
    return matches

def extract_youtube_id_from_iframe(iframe_html):
    """从 iframe HTML 中提取 YouTube ID"""
    match = re.search(r'youtube\.com/embed/([a-zA-Z0-9_-]+)', iframe_html)
    return match.group(1) if match else None

def check_video_playable(youtube_id):
    """检查 YouTube 视频是否可播放"""
    try:
        url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={youtube_id}&format=json"
        response = requests.get(url, timeout=5)
        return response.status_code == 200
    except:
        return False

def process_mdx_file(file_path, dry_run=True):
    """处理单个 MDX 文件"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    iframe_matches = extract_iframe_sections(content)

    if len(iframe_matches) == 0:
        return None

    if len(iframe_matches) == 1:
        # 只有一个视频，检查是否可播放
        youtube_id = extract_youtube_id_from_iframe(iframe_matches[0].group())
        if youtube_id:
            is_playable = check_video_playable(youtube_id)
            if not is_playable:
                return {
                    'file': str(file_path),
                    'action': 'check_playable',
                    'video_count': 1,
                    'youtube_id': youtube_id,
                    'playable': False
                }
        return None

    # 有多个视频，保留中间的那个
    middle_index = len(iframe_matches) // 2
    keep_match = iframe_matches[middle_index]

    youtube_ids = [extract_youtube_id_from_iframe(m.group()) for m in iframe_matches]
    keep_id = youtube_ids[middle_index]

    # 检查保留的视频是否可播放
    is_playable = check_video_playable(keep_id) if keep_id else False

    result = {
        'file': str(file_path),
        'action': 'remove_extra',
        'video_count': len(iframe_matches),
        'youtube_ids': youtube_ids,
        'keep_index': middle_index,
        'keep_id': keep_id,
        'playable': is_playable
    }

    if not dry_run:
        # 删除其他视频，只保留中间的
        new_content = content
        # 从后往前删除，避免索引变化
        for i in range(len(iframe_matches) - 1, -1, -1):
            if i != middle_index:
                match = iframe_matches[i]
                new_content = new_content[:match.start()] + new_content[match.end():]

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
        sleep(0.1)  # 避免请求过快

    if not results:
        print("OK - All videos are fine")
        return

    # 统计
    multi_video_files = [r for r in results if r['action'] == 'remove_extra']
    unplayable_files = [r for r in results if not r.get('playable', True)]

    print(f"Found issues:")
    print(f"  - {len(multi_video_files)} files with multiple videos")
    print(f"  - {len(unplayable_files)} files with unplayable videos\n")

    if multi_video_files:
        print("=" * 80)
        print("Files with multiple videos:")
        print("=" * 80)
        for r in multi_video_files:
            print(f"\nFile: {r['file']}")
            print(f"  Video count: {r['video_count']}")
            print(f"  All video IDs: {', '.join(r['youtube_ids'])}")
            print(f"  Will keep: Video #{r['keep_index'] + 1} (ID: {r['keep_id']})")
            print(f"  Playable: {'YES' if r['playable'] else 'NO'}")

    if unplayable_files:
        print("\n" + "=" * 80)
        print("Unplayable videos:")
        print("=" * 80)
        for r in unplayable_files:
            print(f"\nFile: {r['file']}")
            if r['action'] == 'remove_extra':
                print(f"  Keep video ID: {r['keep_id']}")
            else:
                print(f"  Video ID: {r['youtube_id']}")

if __name__ == '__main__':
    main()
