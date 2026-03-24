#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json

# 加载精简后的关键词
with open('keywords_refined.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 生成markdown内容
markdown_content = "# 2xko 关键词分类\n\n"
markdown_content += f"**总关键词数: {data['total']} 个**\n\n"
markdown_content += "## 分类统计\n\n"
markdown_content += "| 分类 | 关键词数 |\n"
markdown_content += "|------|--------|\n"

for category_name, keywords in data['categories'].items():
    markdown_content += f"| {category_name} | {len(keywords)} |\n"

markdown_content += "\n---\n\n"

# 逐个分类生成详细内容
for category_name, keywords in data['categories'].items():
    markdown_content += f"## {category_name}\n\n"
    markdown_content += f"**数量: {len(keywords)} 个**\n\n"

    markdown_content += "| # | 关键词 | 搜索量 |\n"
    markdown_content += "|---|--------|--------|\n"

    for idx, item in enumerate(keywords, 1):
        keyword = item['keyword']
        volume = item['volume']
        markdown_content += f"| {idx} | {keyword} | {volume} |\n"

    markdown_content += "\n"

# 保存markdown文件
with open('tools/demand/关键词分类.md', 'w', encoding='utf-8') as f:
    f.write(markdown_content)

print("Keyword classification markdown generated successfully!")
print(f"Total keywords: {data['total']}")
print("\nCategory breakdown:")
for category_name, keywords in data['categories'].items():
    print(f"  - {category_name}: {len(keywords)} keywords")
