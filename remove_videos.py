#!/usr/bin/env python3
"""删除所有无关的YouTube视频嵌入"""

import os
import re
from pathlib import Path

# 需要删除的无关视频ID列表（旧游戏内容）
UNWANTED_VIDEO_IDS = [
    'tNRlv6w7eh8',  # Old game MMORPG - First Impressions
    'j9VOMcZuQa8',  # OSRS - Sailing OST Playlist (无关音乐)
    'YjV63x3K1L0',  # Old game food
    'CfkSh3Dczy4',  # Old game review
    'zIcPeOI5cIo',  # Old game for beginners
    'm4gArx7n_Nk',  # Old game new player guide
    '5UtDtVE09Z8',  # Old game old school
    'ITigJ0ojE2E',  # Old game indie MMO
    'dHlbFy63Mvc',  # Old game armor
    'YpU3Ye0qLik',  # Old game gameplay
    'vMgidYyKqZw',  # Old game playtest
    '7O4Jakhm_GE',  # Uncovering secrets
    '7muZfD8_mYs',  # Baldwin's quest
    'jg14OtLayjw',  # Biggest new MMOs
    'sKwU9MnLhw4',  # Old game Q&A
    'TIK1GTkoJ0o',  # Old game gameplay
]

def remove_video_embeds(content):
    """Remove YouTube iframe embeds for unwanted videos"""
    for video_id in UNWANTED_VIDEO_IDS:
        # Remove iframe with this video ID
        pattern = rf'<div style="position: relative; padding-bottom: 56\.25%; height: 0; margin: 2rem 0; border-radius: 0\.5rem; overflow: hidden;"\s*>\s*<iframe[^>]*src="https://www\.youtube\.com/embed/{video_id}"[^>]*>.*?</iframe>\s*</div>'
        content = re.sub(pattern, '', content, flags=re.DOTALL)

    # Also remove placeholder {{VIDEO_ID}} embeds
    pattern = r'<div style="position: relative; padding-bottom: 56\.25%; height: 0; margin: 2rem 0; border-radius: 0\.5rem; overflow: hidden;"\s*>\s*<iframe[^>]*src="https://www\.youtube\.com/embed/\{\{VIDEO_ID\}\}"[^>]*>.*?</iframe>\s*</div>'
    content = re.sub(pattern, '', content, flags=re.DOTALL)

    # Remove any leftover video-related text that mentions old game content
    lines = content.split('\n')
    filtered_lines = []
    skip_next = False

    for line in lines:
        # Skip video guide lines that reference old game content or generic video content
        if 'video' in line.lower() and ('2xko' in line.lower() or 'youtube' in line.lower() or 'embed' in line.lower()):
            if 'src=' in line or 'youtube.com' in line or '{{VIDEO' in line:
                skip_next = True
                continue
        if skip_next and line.strip() == '':
            skip_next = False
            continue
        if skip_next and not line.strip().startswith('<'):
            continue
        skip_next = False
        filtered_lines.append(line)

    return '\n'.join(filtered_lines)

def process_files():
    """Process all MDX files and remove unwanted videos"""
    content_dir = Path('D:/web/01222xko/src/content/en')

    removed_count = 0
    processed_files = 0

    for mdx_file in content_dir.rglob('*.mdx'):
        with open(mdx_file, 'r', encoding='utf-8') as f:
            original_content = f.read()

        # Check if file contains any youtube embeds
        if 'youtube.com/embed' in original_content:
            processed_files += 1
            new_content = remove_video_embeds(original_content)

            if new_content != original_content:
                removed_count += 1
                with open(mdx_file, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"[OK] Cleaned: {mdx_file.relative_to('D:/web/01222xko')}")

    print(f"\nSummary:")
    print(f"- Processed files: {processed_files}")
    print(f"- Modified files: {removed_count}")

if __name__ == '__main__':
    process_files()
