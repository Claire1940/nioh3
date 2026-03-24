#!/usr/bin/env python3
"""通过HTTP请求统计每个栏目的文章数"""

import urllib.request
import re

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

for category in categories:
    try:
        url = f'http://localhost:3000/{category}'
        with urllib.request.urlopen(url, timeout=10) as response:
            html = response.read().decode('utf-8')

        # 统计 "Updated:" 出现次数
        count = html.count('Updated:')
        total += count

        print(f"{category.title():15} {count:3} 篇")

    except Exception as e:
        print(f"{category.title():15}   ? 篇 (错误: {e})")

print(f"\n{'总计':15} {total:3} 篇")
