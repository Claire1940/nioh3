#!/usr/bin/env python3
"""
智能替换文章中的视频ID
根据文章路径和主题选择最合适的视频
"""
import os
import re
from pathlib import Path

# 视频ID映射 - 根据文章类型选择合适的视频
VIDEO_MAPPING = {
    # Codes相关文章
    'codes/all-codes': '3CKCho45HFY',  # ALL WORKING CODES
    'codes/redeem-codes': '3CKCho45HFY',  # ALL WORKING CODES
    'codes/new-codes': 'IG2UV0ie68Y',  # Codes & Tutorial
    'codes/beta-codes': 'IG2UV0ie68Y',  # Codes & Tutorial
    'codes/open-beta-codes': 'IG2UV0ie68Y',  # Codes & Tutorial

    # Stats/Build相关文章
    'builds/stats-guide': 'wBaS9mByPxQ',  # META Stats Guide
    'builds/stat-priority': 'wBaS9mByPxQ',  # META Stats Guide
    'builds/reroll-guide': 'RW1mMe9CDsc',  # STOP Wasting Stats
    'builds/best-builds': 'RW1mMe9CDsc',  # STOP Wasting Stats
    'builds/best-class': 'FvYNBh3cIHI',  # COMPLETE Beginner Guide
    'builds/fast-progression': 'FvYNBh3cIHI',  # COMPLETE Beginner Guide
    'builds/beginner-power': 'P94AmXm-j1M',  # BEST Beginner Power
    'builds/boss-abilities': 'P94AmXm-j1M',  # BEST Beginner Power
    'builds/abilities-tier-list': 'uB13DyId5fc',  # ULTIMATE GUIDE
    'builds/best-abilities': 'uB13DyId5fc',  # ULTIMATE GUIDE

    # Content相关文章
    'content/classes': 'uB13DyId5fc',  # ULTIMATE GUIDE (BEST CLASSES)
    'content/enchanting': '0OjcN18uQKs',  # Enchanting Explained
    'content/titles': 'uB13DyId5fc',  # ULTIMATE GUIDE (TITLES)
    'content/release': '9x7u7l0qXFw',  # Solo Hunters Is INSANE
    'content/free-gems': '3CKCho45HFY',  # ALL WORKING CODES
    'content/new-map': '2A_XZ-SAU1w',  # New map released
    'content/rune-summon': 'uB13DyId5fc',  # ULTIMATE GUIDE
    'content/power-summon': 'P94AmXm-j1M',  # BEST Beginner Power
    'content/daily-quests': 'FvYNBh3cIHI',  # COMPLETE Beginner Guide
    'content/mythic-drop-rates': 'uB13DyId5fc',  # ULTIMATE GUIDE
    'content/aoe-farming': 'FvYNBh3cIHI',  # COMPLETE Beginner Guide

    # Guides相关文章
    'guides/complete-guide': 'FvYNBh3cIHI',  # COMPLETE Beginner Guide
    'guides/beginner-guide': 'FvYNBh3cIHI',  # COMPLETE Beginner Guide
    'guides/pro-tips': 'wBaS9mByPxQ',  # META Stats Guide (PRO Tips)
    'guides/noob-to-pro': 'wBaS9mByPxQ',  # Noob To PRO
    'guides/campaign': 'FvYNBh3cIHI',  # COMPLETE Beginner Guide
    'guides/tutorial': 'AdvpiYe5dDc',  # ULTIMATE Beginner's Guide
    'guides/upgrade': 'uB13DyId5fc',  # ULTIMATE GUIDE
    'guides/npc-locations': 'FvYNBh3cIHI',  # COMPLETE Beginner Guide
    'guides/map-guide': '2A_XZ-SAU1w',  # New map released

    # Gameplay相关文章
    'gameplay/overview': '9x7u7l0qXFw',  # Solo Hunters Is INSANE
    'gameplay/roblox': '9x7u7l0qXFw',  # Solo Hunters Is INSANE
    'gameplay/trailer': 'FvYNBh3cIHI',  # COMPLETE Beginner Guide
    'gameplay/tv': 'FvYNBh3cIHI',  # COMPLETE Beginner Guide

    # Beta相关文章
    'beta/open-beta': 'BY9At0O6bo0',  # BETA ABERTO
    'beta/beta-testing': 'ADlMYSw7hZQ',  # beta testing

    # Mods相关文章
    'mods/script': 'Y6CYx2HU7xQ',  # SCRIPT AUTO FARM
    'mods/left-4-dead-2': 'FvYNBh3cIHI',  # COMPLETE Beginner Guide

    # Community相关文章
    'community/discord': 'FvYNBh3cIHI',  # COMPLETE Beginner Guide
    'community/trello': 'FvYNBh3cIHI',  # COMPLETE Beginner Guide
    'community/wiki': 'uB13DyId5fc',  # ULTIMATE GUIDE
    'community/sad-life': 'FvYNBh3cIHI',  # COMPLETE Beginner Guide
    'community/march-boss': 'uB13DyId5fc',  # ULTIMATE GUIDE
    'community/tio-siegfrid': 'uB13DyId5fc',  # ULTIMATE GUIDE
}

def replace_video_id(file_path, new_video_id):
    """替换MDX文件中的视频ID"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 替换youtubeId
    content = re.sub(
        r'youtubeId: "[^"]*"',
        f'youtubeId: "{new_video_id}"',
        content
    )

    # 替换VIDEO_ID注释
    content = re.sub(
        r'<!-- VIDEO_ID: [a-zA-Z0-9_-]+ -->',
        f'<!-- VIDEO_ID: {new_video_id} -->',
        content
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    return True

def main():
    content_dir = Path('../../../../src/content/en')

    replaced_count = 0
    skipped_count = 0

    print("Starting video ID replacement...\n")

    for article_path, video_id in VIDEO_MAPPING.items():
        file_path = content_dir / f"{article_path}.mdx"

        if file_path.exists():
            replace_video_id(file_path, video_id)
            print(f"OK {article_path}.mdx -> {video_id}")
            replaced_count += 1
        else:
            print(f"WARNING File not found: {article_path}.mdx")
            skipped_count += 1

    print(f"\n{'='*60}")
    print(f"Replacement Complete")
    print(f"{'='*60}")
    print(f"Successfully replaced: {replaced_count} files")
    print(f"Skipped: {skipped_count} files")
    print(f"{'='*60}\n")

if __name__ == '__main__':
    main()
