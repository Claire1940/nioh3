#!/usr/bin/env python3
"""清理 MDX 文件中不相关的视频 - 调试版本"""

import os
import re
from pathlib import Path

def extract_video_info_from_frontmatter(frontmatter):
    """从 frontmatter 中提取视频信息"""
    # 提取 youtubeId
    youtube_id_match = re.search(r'youtubeId:\s*["\']?([a-zA-Z0-9_-]+)["\']?', frontmatter)
    youtube_id = youtube_id_match.group(1) if youtube_id_match else None

    # 提取 title (在 video 区块中)
    title_match = re.search(r'video:.*?title:\s*["\'](.+?)["\']', frontmatter, re.DOTALL)
    title = title_match.group(1) if title_match else None

    return youtube_id, title

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

# 测试单个文件
test_file = Path('src/content/en/basics/price.mdx')
with open(test_file, 'r', encoding='utf-8') as f:
    content = f.read()

frontmatter_match = re.search(r'^---\n(.*?)\n---', content, re.DOTALL)
if frontmatter_match:
    frontmatter = frontmatter_match.group(1)
    youtube_id, title = extract_video_info_from_frontmatter(frontmatter)

    print(f"File: {test_file}")
    print(f"YouTube ID: {youtube_id}")
    print(f"Title: {title}")
    print(f"Is irrelevant: {is_irrelevant_video(title)}")
