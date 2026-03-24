#!/usr/bin/env python3
"""清理 MDX 文件中不相关的视频"""

import os
import re
from pathlib import Path

def extract_video_title_from_frontmatter(frontmatter):
    """从 frontmatter 中提取视频标题"""
    # 查找 video 区块中的 title
    title_match = re.search(r'video:.*?title:\s*["\'](.+?)["\']', frontmatter, re.DOTALL)
    if title_match:
        return title_match.group(1)
    return None

def is_irrelevant_video(title):
    """判断视频是否与LORT游戏无关"""
    if not title:
        return False

    title_lower = title.lower()

    # 不相关的关键词
    irrelevant_keywords = [
        'lotr',  # 指环王
        'lord of the rings',
        'gandalf',
        'ambient music',
        'cumbia',
        'moron',
        'roch0',
        'middle earth',
        'bedtime stories',
    ]

    for keyword in irrelevant_keywords:
        if keyword in title_lower:
            return True

    return False

def extract_all_video_embeds(content):
    """提取所有视频嵌入区块"""
    # 匹配从 <div style="position: relative; 开始到 </div> 结束的区块（包含iframe）
    pattern = r'<div\s+style="position:\s*relative;[^>]*>.*?<iframe.*?</iframe>.*?</div>'
    matches = list(re.finditer(pattern, content, re.DOTALL | re.IGNORECASE))
    return matches

def extract_video_card_embeds(content):
    """提取带信息卡片的视频嵌入"""
    # 匹配包含视频标题卡片的嵌入（有 📹 emoji 和标题）
    pattern = r'<div style="position: relative;[^>]*>.*?<iframe.*?</iframe>.*?</div>\s*</div>\s*(?:<div[^>]*>.*?📹.*?</div>)?'
    matches = list(re.finditer(pattern, content, re.DOTALL))

    # 筛选出真正带卡片的
    card_matches = []
    for match in matches:
        embed_text = match.group()
        # 检查是否包含标题卡片（有 📹 或者有额外的 div 包含标题）
        if '📹' in embed_text or 'title=' in embed_text:
            card_matches.append(match)

    return card_matches

def process_mdx_file(file_path, dry_run=True):
    """处理单个 MDX 文件"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 提取 frontmatter 中的视频标题
    frontmatter_match = re.search(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not frontmatter_match:
        return None

    frontmatter = frontmatter_match.group(1)

    # 提取视频标题
    video_title = extract_video_title_from_frontmatter(frontmatter)

    # 提取 youtubeId
    youtube_id_match = re.search(r'youtubeId:\s*["\']?([a-zA-Z0-9_-]+)["\']?', frontmatter)
    youtube_id = youtube_id_match.group(1) if youtube_id_match else None

    # 检查是否是不相关的视频
    is_irrelevant = is_irrelevant_video(video_title)

    # 提取所有视频嵌入
    all_embeds = extract_all_video_embeds(content)

    # 如果没有视频标题，也没有嵌入，跳过
    if not video_title and len(all_embeds) == 0:
        return None

    result = {
        'file': str(file_path),
        'youtube_id': youtube_id,
        'video_title': video_title,
        'is_irrelevant': is_irrelevant,
        'embed_count': len(all_embeds),
        'action': None
    }

    if is_irrelevant:
        result['action'] = 'remove_irrelevant'
        if not dry_run:
            # 删除所有视频嵌入
            new_content = content
            for match in reversed(all_embeds):
                new_content = new_content[:match.start()] + new_content[match.end():]

            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            result['modified'] = True

    elif len(all_embeds) > 1:
        # 有多个视频，保留第一个简单的iframe，删除其他
        result['action'] = 'remove_extra'
        if not dry_run:
            new_content = content
            # 从后往前删除（保留第一个）
            for i in range(len(all_embeds) - 1, 0, -1):
                match = all_embeds[i]
                new_content = new_content[:match.start()] + new_content[match.end():]

            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            result['modified'] = True

    return result if result['action'] else None

def main():
    content_dir = Path('src/content/en')
    results = []

    print("Scanning all MDX files...\n")

    for mdx_file in content_dir.rglob('*.mdx'):
        result = process_mdx_file(mdx_file, dry_run=True)
        if result:
            results.append(result)

    if not results:
        print("OK - All videos are fine")
        return

    # 统计
    irrelevant_files = [r for r in results if r['action'] == 'remove_irrelevant']
    multi_video_files = [r for r in results if r['action'] == 'remove_extra']

    print(f"Found issues:")
    print(f"  - {len(irrelevant_files)} files with irrelevant videos")
    print(f"  - {len(multi_video_files)} files with multiple videos\n")

    if irrelevant_files:
        print("=" * 80)
        print("Files with irrelevant videos (will be removed):")
        print("=" * 80)
        for r in irrelevant_files:
            print(f"\nFile: {r['file']}")
            print(f"  Video ID: {r['youtube_id']}")
            print(f"  Title: {r['video_title']}")
            print(f"  Embeds: {r['embed_count']}")

    if multi_video_files:
        print("\n" + "=" * 80)
        print("Files with multiple videos (will keep first, remove others):")
        print("=" * 80)
        for r in multi_video_files:
            print(f"\nFile: {r['file']}")
            print(f"  Video ID: {r['youtube_id']}")
            print(f"  Title: {r['video_title']}")
            print(f"  Embeds: {r['embed_count']}")

    print("\n" + "=" * 80)
    print(f"\nTotal files to modify: {len(results)}")
    print("\nTo apply changes, run: python clean-videos.py --apply")

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
        print(f"\nTotal files modified: {modified_count}")
    else:
        main()
