#!/usr/bin/env python3
"""修复 community 目录下 MDX 文件的 frontmatter"""

import os
import re
from pathlib import Path

# 文件标题映射
TITLE_MAP = {
    'discord': 'Nioh 3 Discord Community - Join 10,000+ Players Today!',
    'gameplay': 'Nioh 3 Gameplay - First 60 Minutes Will BLOW Your Mind!',
    'multiplayer': 'Nioh 3 Multiplayer Guide - Co-op Tips & Strategies',
    'reddit': 'Nioh 3 Reddit Community - Best Tips & Discussions',
    'wiki': 'Nioh 3 Wiki Guide - Everything You Need in ONE Place!',
    'ost': 'Nioh 3 OST - Epic Soundtrack & Music Analysis',
    'preview': 'Nioh 3 Preview - What to Expect from the Latest Release',
    'co-op': 'Nioh 3 Co-op Guide - Master Multiplayer with Friends',
    'metacritic': 'Nioh 3 Metacritic Score - Reviews & Ratings Analysis',
    'pvp': 'Nioh 3 PvP Guide - Dominate in Player vs Player Combat',
    'review': 'Nioh 3 Review - Is It Worth Playing in 2026?',
}

# 描述映射
DESCRIPTION_MAP = {
    'discord': 'Join the Nioh 3 Discord community with over 10,000 active players. Get tips, strategies, and connect with fellow samurai warriors.',
    'gameplay': 'Experience the first 60 minutes of Nioh 3 gameplay. Discover epic combat, boss fights, and stunning visuals in this action-packed adventure.',
    'multiplayer': 'Master Nioh 3 multiplayer with our comprehensive co-op guide. Learn strategies, tips, and how to team up with friends effectively.',
    'reddit': 'Explore the Nioh 3 Reddit community for the latest tips, builds, and discussions. Connect with players and improve your gameplay.',
    'wiki': 'Complete Nioh 3 wiki guide covering characters, bosses, mechanics, and strategies. Everything you need to master the game.',
    'ost': 'Discover the epic Nioh 3 soundtrack and original score. Explore the music that brings the Sengoku period to life.',
    'preview': 'Get an exclusive preview of Nioh 3 features, gameplay, and what makes this the best entry in the series yet.',
    'co-op': 'Learn how to master Nioh 3 co-op mode. Team up with friends and conquer the toughest challenges together.',
    'metacritic': 'Check out Nioh 3 Metacritic scores, critic reviews, and player ratings. See what the gaming community thinks.',
    'pvp': 'Dominate Nioh 3 PvP with our expert guide. Learn combat strategies, builds, and tactics for player vs player battles.',
    'review': 'Read our comprehensive Nioh 3 review covering gameplay, graphics, story, and whether it lives up to the hype.',
}

def fix_frontmatter(file_path):
    """修复单个 MDX 文件的 frontmatter"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 获取文件名（不含扩展名）
    filename = Path(file_path).stem

    # 如果文件已经有正确的 frontmatter（包含 title 字段），跳过
    if re.match(r'^---\s*\ntitle:', content):
        print(f"[OK] {filename}.mdx already has correct frontmatter, skipping")
        return

    # 提取 video 配置（如果存在）
    video_match = re.search(r'video:\s*\n\s*enabled:.*?(?=\n---|\Z)', content, re.DOTALL)
    video_config = video_match.group(0) if video_match else None

    # 移除开头的 --- 和 video 配置
    content = re.sub(r'^---\s*\n', '', content)
    if video_config:
        content = content.replace(video_config, '')
    content = re.sub(r'^---\s*\n', '', content)

    # 清理开头的空行
    content = content.lstrip('\n')

    # 获取标题和描述
    title = TITLE_MAP.get(filename, f'Nioh 3 {filename.title()}')
    description = DESCRIPTION_MAP.get(filename, f'Comprehensive guide to Nioh 3 {filename}.')

    # 构建新的 frontmatter
    new_frontmatter = f"""---
title: "{title}"
description: "{description}"
keywords: ["nioh 3 {filename}", "nioh 3", "{filename}", "nioh 3 guide"]
canonical: "/community/{filename}/"
date: "2026-02-01"
"""

    # 如果有 video 配置，添加到 frontmatter
    if video_config:
        new_frontmatter += video_config + '\n'

    new_frontmatter += '---\n\n'

    # 组合新内容
    new_content = new_frontmatter + content

    # 写回文件
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"[OK] Fixed {filename}.mdx")

def main():
    """主函数"""
    content_dir = Path('src/content/en/community')

    if not content_dir.exists():
        print(f"错误：目录不存在 {content_dir}")
        return

    mdx_files = list(content_dir.glob('*.mdx'))

    if not mdx_files:
        print(f"错误：在 {content_dir} 中没有找到 MDX 文件")
        return

    print(f"找到 {len(mdx_files)} 个 MDX 文件\n")

    for file_path in mdx_files:
        fix_frontmatter(file_path)

    print(f"\n[DONE] Processed {len(mdx_files)} files")

if __name__ == '__main__':
    main()
