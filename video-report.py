#!/usr/bin/env python3
"""生成视频清理报告"""

import re
from pathlib import Path
from collections import Counter

def extract_video_info(file_path):
    """提取文章的视频信息"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    frontmatter_match = re.search(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not frontmatter_match:
        return None

    frontmatter = frontmatter_match.group(1)

    youtube_id_match = re.search(r'youtubeId:\s*["\']?([a-zA-Z0-9_-]+)["\']?', frontmatter)
    youtube_id = youtube_id_match.group(1) if youtube_id_match else None

    title_match = re.search(r'video:.*?title:\s*["\'](.+?)["\']', frontmatter, re.DOTALL)
    title = title_match.group(1) if title_match else None

    # 计算视频嵌入数量
    embed_count = len(re.findall(r'<div\s+style="position:\s*relative', content, re.IGNORECASE))

    return {
        'file': str(file_path),
        'youtube_id': youtube_id,
        'title': title,
        'embed_count': embed_count
    }

def main():
    content_dir = Path('src/content/en')
    all_videos = []

    for mdx_file in content_dir.rglob('*.mdx'):
        video_info = extract_video_info(mdx_file)
        if video_info and video_info['youtube_id']:
            all_videos.append(video_info)

    print("=" * 80)
    print("VIDEO CLEANUP REPORT")
    print("=" * 80)
    print(f"\nTotal articles with videos: {len(all_videos)}")

    # 统计视频使用情况
    video_counter = Counter([v['youtube_id'] for v in all_videos])
    title_counter = Counter([v['title'] for v in all_videos])

    print(f"\n--- Video Distribution ---")
    for video_id, count in video_counter.most_common():
        # 找到对应的标题
        title = next((v['title'] for v in all_videos if v['youtube_id'] == video_id), 'Unknown')
        try:
            print(f"  {video_id}: {count} articles - {title}")
        except UnicodeEncodeError:
            print(f"  {video_id}: {count} articles - [Title contains special characters]")

    # 检查多视频文章
    multi_video_files = [v for v in all_videos if v['embed_count'] > 1]
    print(f"\n--- Multiple Video Embeds ---")
    if multi_video_files:
        print(f"  Found {len(multi_video_files)} files with multiple video embeds:")
        for v in multi_video_files[:5]:
            print(f"    {v['file']}: {v['embed_count']} embeds")
    else:
        print("  OK - All files have only one video embed")

    # 检查不相关视频
    irrelevant_keywords = ['lotr', 'lord of the rings', 'gandalf', 'ambient', 'cumbia', 'middle earth']
    irrelevant_videos = []
    for v in all_videos:
        if v['title']:
            title_lower = v['title'].lower()
            if any(keyword in title_lower for keyword in irrelevant_keywords):
                irrelevant_videos.append(v)

    print(f"\n--- Irrelevant Videos ---")
    if irrelevant_videos:
        print(f"  Found {len(irrelevant_videos)} files with irrelevant videos:")
        for v in irrelevant_videos[:5]:
            print(f"    {v['file']}: {v['title']}")
    else:
        print("  OK - All videos are Solo Hunters-related")

    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"  Total articles: {len(all_videos)}")
    print(f"  Unique videos: {len(video_counter)}")
    print(f"  Multiple embeds: {len(multi_video_files)}")
    print(f"  Irrelevant videos: {len(irrelevant_videos)}")
    print("\n" + "=" * 80)

if __name__ == '__main__':
    main()
