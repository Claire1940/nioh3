#!/usr/bin/env python3
"""
优化视频分配,降低重复率至20%以下
策略:为重复使用超过2次的视频寻找替代方案
"""

import os
import json
import re
from pathlib import Path
from collections import defaultdict

def load_video_metadata():
    """加载视频元数据缓存"""
    cache_file = Path('tools/articles/modules/generation/video_metadata_cache.json')
    if cache_file.exists():
        with open(cache_file, 'r', encoding='utf-8')  as f:
            return json.load(f)
    return {}

def get_all_available_videos(video_metadata):
    """获取所有可用的视频ID"""
    return [vid for vid, data in video_metadata.items() if data.get('enabled', True)]

def analyze_video_usage():
    """分析当前视频使用情况"""
    content_dir = Path('src/content/en')
    video_usage = defaultdict(list)  # video_id -> [file_paths]

    for mdx_file in content_dir.rglob('*.mdx'):
        content = mdx_file.read_text(encoding='utf-8')
        video_match = re.search(r'youtubeId:\s*"([^"]+)"', content)
        if video_match:
            video_id = video_match.group(1)
            video_usage[video_id].append(mdx_file)

    return video_usage

def replace_video_in_file(file_path, old_video_id, new_video_id, video_metadata):
    """替换文件中的视频ID"""
    content = file_path.read_text(encoding='utf-8')
    new_video_info = video_metadata.get(new_video_id, {})

    # 替换youtubeId
    content = re.sub(
        r'youtubeId:\s*"' + old_video_id + r'"',
        f'youtubeId: "{new_video_id}"',
        content
    )

    # 替换title
    if 'title' in new_video_info:
        content = re.sub(
            r'(video:.*?title:\s*")[^"]*(")',
            r'\1' + new_video_info['title'] + r'\2',
            content,
            flags=re.DOTALL
        )

    # 替换description
    if 'description' in new_video_info:
        content = re.sub(
            r'(video:.*?description:\s*")[^"]*(")',
            r'\1' + new_video_info['description'] + r'\2',
            content,
            flags=re.DOTALL
        )

    # 替换duration
    if 'duration' in new_video_info:
        content = re.sub(
            r'(video:.*?duration:\s*")[^"]*(")',
            r'\1' + new_video_info['duration'] + r'\2',
            content,
            flags=re.DOTALL
        )

    # 替换uploadDate
    if 'uploadDate' in new_video_info:
        content = re.sub(
            r'(video:.*?uploadDate:\s*")[^"]*(")',
            r'\1' + new_video_info['uploadDate'] + r'\2',
            content,
            flags=re.DOTALL
        )

    file_path.write_text(content, encoding='utf-8')

def optimize_video_distribution():
    """优化视频分配"""
    video_metadata = load_video_metadata()
    available_videos = get_all_available_videos(video_metadata)
    video_usage = analyze_video_usage()

    print(f"Total available videos: {len(available_videos)}")
    print(f"Currently used videos: {len(video_usage)}")

    # 找出使用次数超过2次的视频
    overused_videos = {vid: files for vid, files in video_usage.items() if len(files) > 2}

    print(f"\nOverused videos (used more than 2 times):")
    for vid, files in sorted(overused_videos.items(), key=lambda x: len(x[1]), reverse=True):
        print(f"  - {vid}: {len(files)} times")

    # 找出未使用或使用次数少的视频
    used_video_ids = set(video_usage.keys())
    unused_videos = [vid for vid in available_videos if vid not in used_video_ids]
    lightly_used_videos = [vid for vid, files in video_usage.items() if len(files) <= 2]

    print(f"\nUnused videos: {len(unused_videos)}")
    print(f"Lightly used videos (<=2 times): {len(lightly_used_videos)}")

    # 可用于替换的视频池
    replacement_pool = unused_videos + lightly_used_videos
    print(f"Total replacement pool: {len(replacement_pool)} videos")

    if not replacement_pool:
        print("\nNo videos available for replacement!")
        return

    # 开始替换
    replacements = 0
    replacement_index = 0

    for overused_vid, files in sorted(overused_videos.items(), key=lambda x: len(x[1]), reverse=True):
        # 保留前2个使用,替换其余的
        files_to_replace = files[2:]

        for file_path in files_to_replace:
            if replacement_index >= len(replacement_pool):
                print("\nRan out of replacement videos!")
                break

            new_video_id = replacement_pool[replacement_index]
            replacement_index += 1

            try:
                replace_video_in_file(file_path, overused_vid, new_video_id, video_metadata)
                replacements += 1
                print(f"OK: {file_path.relative_to(Path('src/content/en'))}: {overused_vid} -> {new_video_id}")
            except Exception as e:
                print(f"ERROR: {file_path}: {e}")

    print(f"\nReplacement Summary:")
    print(f"  - Total replacements: {replacements}")

    # 重新分析使用情况
    new_video_usage = analyze_video_usage()
    total_articles = sum(len(files) for files in new_video_usage.values())
    unique_videos = len(new_video_usage)

    if total_articles > 0:
        repeat_rate = (1 - unique_videos / total_articles) * 100
        print(f"  - New video repeat rate: {repeat_rate:.1f}%")
        print(f"  - Unique videos used: {unique_videos}")
        print(f"  - Total articles: {total_articles}")

    # 显示新的使用统计
    print(f"\nNew video usage (top 10):")
    for vid, files in sorted(new_video_usage.items(), key=lambda x: len(x[1]), reverse=True)[:10]:
        print(f"  - {vid}: {len(files)} times")

if __name__ == '__main__':
    print("Starting video distribution optimization...")
    optimize_video_distribution()
    print("\nCompleted!")
