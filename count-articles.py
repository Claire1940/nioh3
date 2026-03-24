#!/usr/bin/env python3
"""统计每个栏目下的文章数量"""

from pathlib import Path

def count_articles():
    """统计所有栏目的文章数"""
    content_dir = Path('src/content/en')

    categories = [
        'walkthrough',
        'endings',
        'survival',
        'creatures',
        'collectibles',
        'technical',
        'game-info',
        'sales'
    ]

    total = 0
    results = []

    for category in categories:
        category_path = content_dir / category
        if category_path.exists():
            mdx_files = list(category_path.glob('*.mdx'))
            count = len(mdx_files)
            total += count
            results.append((category, count))
            print(f"{category.title():15} {count:3} 篇")
        else:
            results.append((category, 0))
            print(f"{category.title():15}   0 篇 (目录不存在)")

    print(f"\n{'总计':15} {total:3} 篇")

    return results, total

if __name__ == '__main__':
    count_articles()
