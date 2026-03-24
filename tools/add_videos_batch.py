#!/usr/bin/env python3
"""
批量为缺少视频的MDX文章添加YouTube视频
"""

import os
import json
import re
from pathlib import Path

# 视频分配策略 - 根据文章类型分配相关视频
VIDEO_ASSIGNMENTS = {
    # Builds类文章 - 使用build和gameplay相关视频
    'builds': [
        'wuHt-X1XxkQ',  # Dual swords gameplay
        '9emtpyx1GLQ',  # Axe build
        'L4PcxgkHRNo',  # Samurai build
        '0CfP4Vvwa_w',  # Kusarigama
        'u8X6Cq6WaXI',  # Best weapon
        'PDlDnChNDBg',  # Full gameplay
    ],
    # Combat类文章 - 使用战斗技巧视频
    'combat': [
        '0sWmxmLbuFg',  # Ninja style
        'R0w7YFK5hn4',  # No damage
        'L4PcxgkHRNo',  # Samurai build
        'PDlDnChNDBg',  # Full gameplay
        '17838xuoR_4', # Boss fight
    ],
    # Guides类文章 - 使用新手指南和预览视频
    'guides': [
        'sRgPERnL_Ic',  # Preview & early thoughts
        'PDlDnChNDBg',  # Full gameplay
        'UcbvtJQui-M',  # Walkthrough part 1
        '17838xuoR_4', # Demo
    ],
    # Community类文章 - 使用预览、评测视频
    'community': [
        'sRgPERnL_Ic',  # Preview
        'bL_umw0ScIA',  # Features trailer
        'UcbvtJQui-M',  # Walkthrough
    ],
    # World类文章 - 使用探索和boss战视频
    'world': [
        'PDlDnChNDBg',  # Full gameplay
        '17838xuoR_4', # Boss fight
        'UcbvtJQui-M',  # Walkthrough
    ],
    # Lore类文章 - 使用故事相关视频
    'lore': [
        'PDlDnChNDBg',  # Full gameplay
        'UcbvtJQui-M',  # Walkthrough
        'sRgPERnL_Ic',  # Preview
    ],
    # News类文章 - 使用预告和新闻视频
    'news': [
        'bL_umw0ScIA',  # Features trailer
        'sRgPERnL_Ic',  # Preview
        'UcbvtJQui-M',  # Walkthrough
    ],
    # Platforms类文章 - 使用demo和性能测试视频
    'platforms': [
        '17838xuoR_4', # Demo
        'PDlDnChNDBg',  # Full gameplay
        'sRgPERnL_Ic',  # Preview
    ],
}

def load_video_metadata():
    """加载视频元数据缓存"""
    cache_file = Path('tools/articles/modules/generation/video_metadata_cache.json')
    if cache_file.exists():
        with open(cache_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def get_article_category(file_path):
    """从文件路径获取文章分类"""
    parts = file_path.parts
    if 'builds' in parts:
        return 'builds'
    elif 'combat' in parts:
        return 'combat'
    elif 'guides' in parts:
        return 'guides'
    elif 'community' in parts:
        return 'community'
    elif 'world' in parts:
        return 'world'
    elif 'lore' in parts:
        return 'lore'
    elif 'news' in parts:
        return 'news'
    elif 'platforms' in parts:
        return 'platforms'
    return 'guides'  # 默认分类

def has_video(content):
    """检查文章是否已有视频"""
    # 检查是否有video字段且youtubeId不为空
    video_pattern = r'video:\s*\n\s+enabled:\s*true\s*\n\s+youtubeId:\s*"([^"]+)"'
    match = re.search(video_pattern, content)
    return match is not None and match.group(1) != ""

def get_next_video_for_category(category, used_videos, video_metadata):
    """为指定分类获取下一个可用视频"""
    videos = VIDEO_ASSIGNMENTS.get(category, VIDEO_ASSIGNMENTS['guides'])

    # 找到使用次数最少的视频
    min_usage = float('inf')
    selected_video = None

    for video_id in videos:
        if video_id in video_metadata:
            usage_count = used_videos.get(video_id, 0)
            if usage_count < min_usage:
                min_usage = usage_count
                selected_video = video_id

    return selected_video

def add_video_to_frontmatter(content, video_id, video_metadata):
    """在frontmatter中添加视频信息"""
    video_info = video_metadata.get(video_id, {})

    # 提取frontmatter
    frontmatter_pattern = r'^---\n(.*?)\n---'
    match = re.search(frontmatter_pattern, content, re.DOTALL)

    if not match:
        print("  WARNING: Frontmatter not found")
        return content

    frontmatter = match.group(1)

    # 检查是否已有video字段
    if 'video:' in frontmatter:
        print("  WARNING: Video field already exists, skipping")
        return content

    # 构建video字段
    video_block = f'''video:
  enabled: true
  youtubeId: "{video_id}"
  title: "{video_info.get('title', 'Nioh 3 Gameplay')}"
  description: "{video_info.get('description', 'Nioh 3 gameplay and guide')}"
  duration: "{video_info.get('duration', 'PT10M0S')}"
  uploadDate: "{video_info.get('uploadDate', '2026-01-29')}"'''

    # 在date字段后添加video字段
    new_frontmatter = re.sub(
        r'(date:\s*"[^"]*")',
        r'\1\n' + video_block,
        frontmatter
    )

    # 替换原内容
    new_content = content.replace(frontmatter, new_frontmatter)
    return new_content

def process_articles():
    """处理所有缺少视频的文章"""
    content_dir = Path('src/content/en')
    video_metadata = load_video_metadata()

    # 统计已使用的视频
    used_videos = {}

    # 首先统计现有视频使用情况
    print("Analyzing current video usage...")
    for mdx_file in content_dir.rglob('*.mdx'):
        content = mdx_file.read_text(encoding='utf-8')
        video_match = re.search(r'youtubeId:\s*"([^"]+)"', content)
        if video_match:
            video_id = video_match.group(1)
            used_videos[video_id] = used_videos.get(video_id, 0) + 1

    print(f"Current: {len(used_videos)} unique videos in use")
    for vid, count in sorted(used_videos.items(), key=lambda x: x[1], reverse=True)[:5]:
        print(f"   - {vid}: {count} times")

    # 处理缺少视频的文章
    print("\nAdding videos to articles...")
    processed = 0
    skipped = 0

    for mdx_file in sorted(content_dir.rglob('*.mdx')):
        content = mdx_file.read_text(encoding='utf-8')

        if has_video(content):
            skipped += 1
            continue

        # 获取文章分类
        category = get_article_category(mdx_file)

        # 获取合适的视频
        video_id = get_next_video_for_category(category, used_videos, video_metadata)

        if not video_id:
            print(f"WARNING: {mdx_file.relative_to(content_dir)}: No suitable video found")
            continue

        # 添加视频
        new_content = add_video_to_frontmatter(content, video_id, video_metadata)

        if new_content != content:
            mdx_file.write_text(new_content, encoding='utf-8')
            used_videos[video_id] = used_videos.get(video_id, 0) + 1
            processed += 1
            print(f"OK: {mdx_file.relative_to(content_dir)}: Added video {video_id}")

    print(f"\nProcessing Summary:")
    print(f"   - Videos added: {processed} articles")
    print(f"   - Already had videos (skipped): {skipped} articles")
    print(f"   - Total: {processed + skipped} articles")

    # 显示最终视频使用统计
    print(f"\nFinal Video Usage Statistics:")
    for vid, count in sorted(used_videos.items(), key=lambda x: x[1], reverse=True):
        print(f"   - {vid}: {count} times")

    # 计算重复率
    total_articles = processed + skipped
    unique_videos = len(used_videos)
    if total_articles > 0:
        repeat_rate = (1 - unique_videos / total_articles) * 100
        print(f"\nVideo Repeat Rate: {repeat_rate:.1f}%")

if __name__ == '__main__':
    print("Starting batch video addition to MDX articles...")
    process_articles()
    print("\nCompleted!")
