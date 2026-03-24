#!/usr/bin/env python3
"""修复损坏的 YAML frontmatter"""

import re
from pathlib import Path

# 需要修复的文件及其正确的 frontmatter
fixes = {
    'src/content/en/creatures/cart-entity.mdx': {
        'title': 'The Moving Shopping Cart in Hellmart: How to Avoid This Entity',
        'description': 'Learn how to survive the moving shopping cart entity in Hellmart. Updated Jan 2026 with detection tips and avoidance strategies.',
        'keywords': ['hellmart cart', 'shopping cart entity', 'Hellmart creatures', 'moving cart', 'night shift survival'],
        'canonical': 'https://hellmartgame.org/creatures/cart-entity'
    },
    'src/content/en/creatures/entities-guide.mdx': {
        'title': 'Complete Hellmart Entities Guide: Identify & Survive All Threats',
        'description': 'Master all Hellmart entities with this complete guide. Learn to identify hostile customers and survive night shifts. Updated Jan 2026.',
        'keywords': ['hellmart entities', 'Hellmart creatures guide', 'hostile customers', 'entity identification', 'survival guide'],
        'canonical': 'https://hellmartgame.org/creatures/entities-guide'
    },
    'src/content/en/collectibles/radio-stations.mdx': {
        'title': 'Hellmart Radio Stations: Hidden Messages & Secret Broadcasts',
        'description': 'Discover all Hellmart radio stations and decode hidden messages. Updated Jan 2026 with frequency guide and secret broadcasts.',
        'keywords': ['hellmart radio', 'radio stations', 'hidden messages', 'secret broadcasts', 'Hellmart collectibles'],
        'canonical': 'https://hellmartgame.org/collectibles/radio-stations'
    },
    'src/content/en/technical/exploits.mdx': {
        'title': 'Hellmart Exploits & Glitches: Known Issues & Workarounds',
        'description': 'Learn about Hellmart exploits and glitches. Updated Jan 2026 with known issues, workarounds, and community findings.',
        'keywords': ['hellmart exploits', 'Hellmart glitches', 'game bugs', 'workarounds', 'technical issues'],
        'canonical': 'https://hellmartgame.org/technical/exploits'
    },
    'src/content/en/technical/steam-deck.mdx': {
        'title': 'Hellmart on Steam Deck: Performance Guide & Optimal Settings',
        'description': 'Play Hellmart on Steam Deck with optimal performance. Updated Jan 2026 with settings guide and performance tips.',
        'keywords': ['hellmart steam deck', 'Steam Deck performance', 'portable gaming', 'Hellmart settings', 'optimization guide'],
        'canonical': 'https://hellmartgame.org/technical/steam-deck'
    }
}

def fix_file(file_path, metadata):
    """修复单个文件"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 找到 frontmatter 结束位置
        parts = content.split('---', 2)
        if len(parts) < 3:
            print(f"Error: {file_path} - Invalid frontmatter structure")
            return False

        body = parts[2]

        # 提取 video 信息（如果存在）
        video_match = re.search(r'video:\s*\n\s*enabled:.*?uploadDate: "[^"]*"', content, re.DOTALL)
        video_section = video_match.group(0) if video_match else ''

        # 构建新的 frontmatter
        keywords_str = ', '.join([f'"{kw}"' for kw in metadata['keywords']])
        new_frontmatter = f'''---
title: "{metadata['title']}"
description: "{metadata['description']}"
keywords: [{keywords_str}]
canonical: "{metadata['canonical']}"
date: "2026-01-31"'''

        if video_section:
            new_frontmatter += f'\n{video_section}'

        new_frontmatter += '\n---'

        # 写入新内容
        new_content = new_frontmatter + body
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f"Fixed: {file_path}")
        return True

    except Exception as e:
        print(f"Error fixing {file_path}: {e}")
        return False

def main():
    """批量修复文件"""
    fixed_count = 0

    for file_path, metadata in fixes.items():
        if Path(file_path).exists():
            if fix_file(file_path, metadata):
                fixed_count += 1
        else:
            print(f"File not found: {file_path}")

    print(f"\n修复完成: {fixed_count}/{len(fixes)} 个文件")

if __name__ == '__main__':
    main()
