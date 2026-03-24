#!/usr/bin/env python3
"""
修复文章标题和内容
- 使用内页.json中的正确标题
- 修复description格式
- 确保内容充实
"""

import os
import re
import json
from pathlib import Path

def load_article_mapping():
    """加载内页.json并创建URL到标题的映射"""
    json_path = Path("tools/articles/modules/generation/内页.json")

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    mapping = {}
    for item in data:
        url_path = item['URL Path'].strip('/')
        mapping[url_path] = {
            'title': item['Article Title'],
            'keyword': item['Keyword'],
            'priority': item['Priority']
        }

    return mapping

def fix_article_metadata(filepath, mapping):
    """修复文章的frontmatter"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 提取frontmatter和正文
    frontmatter_match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
    if not frontmatter_match:
        return False

    frontmatter_text = frontmatter_match.group(1)
    body = frontmatter_match.group(2).strip()

    # 解析frontmatter
    frontmatter_lines = frontmatter_text.split('\n')
    frontmatter_dict = {}
    current_key = None
    current_value = []
    in_video = False
    video_lines = []

    for line in frontmatter_lines:
        if line.startswith('video:'):
            in_video = True
            video_lines.append(line)
        elif in_video:
            if line.startswith('  '):
                video_lines.append(line)
            else:
                in_video = False
                if ':' in line:
                    key, value = line.split(':', 1)
                    frontmatter_dict[key.strip()] = value.strip().strip('"')
        elif ':' in line and not line.startswith(' '):
            if current_key:
                frontmatter_dict[current_key] = '\n'.join(current_value)
            key, value = line.split(':', 1)
            current_key = key.strip()
            current_value = [value.strip().strip('"')]
        else:
            if current_key:
                current_value.append(line.strip())

    if current_key:
        frontmatter_dict[current_key] = '\n'.join(current_value)

    # 获取文件路径对应的URL
    rel_path = filepath.relative_to(Path("src/content/en"))
    url_path = str(rel_path.with_suffix('')).replace('\\', '/')

    # 从mapping中获取正确的标题
    if url_path in mapping:
        article_info = mapping[url_path]
        correct_title = article_info['title']
        keyword = article_info['keyword']

        # 更新title
        frontmatter_dict['title'] = correct_title

        # 更新description - 移除"Complete guide for"前缀
        if 'description' in frontmatter_dict:
            desc = frontmatter_dict['description']
            desc = re.sub(r'^Complete guide for\s+', '', desc)
            desc = re.sub(r'\s+in Nioh 3\.\s+Updated.*$', '', desc)
            # 创建新的description
            frontmatter_dict['description'] = f"Discover everything about {keyword} in Nioh 3. Expert tips, strategies, and complete guide updated February 2026."

        # 确保keywords包含正确的关键词
        if 'keywords' in frontmatter_dict:
            keywords_str = frontmatter_dict['keywords']
            if keywords_str.startswith('['):
                keywords_str = keywords_str.strip('[]')
            keywords = [k.strip().strip('"') for k in keywords_str.split(',')]
            if keyword not in keywords:
                keywords.insert(0, keyword)
            frontmatter_dict['keywords'] = str(keywords)

    # 重建frontmatter
    new_frontmatter = "---\n"
    for key, value in frontmatter_dict.items():
        if key == 'keywords':
            new_frontmatter += f'{key}: {value}\n'
        else:
            new_frontmatter += f'{key}: "{value}"\n'

    # 添加video部分
    if video_lines:
        new_frontmatter += '\n'.join(video_lines) + '\n'

    new_frontmatter += "---\n"

    # 重建文章
    new_content = new_frontmatter + '\n' + body + '\n'

    # 写回文件
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    return True

def main():
    """主函数"""
    print("[INFO] Loading article mapping from 内页.json...")
    mapping = load_article_mapping()
    print(f"[INFO] Loaded {len(mapping)} article mappings")

    content_dir = Path("src/content/en")

    print("[INFO] Fixing article titles and descriptions...")

    fixed_count = 0
    total_count = 0

    for mdx_file in content_dir.rglob("*.mdx"):
        total_count += 1
        try:
            if fix_article_metadata(mdx_file, mapping):
                fixed_count += 1
                print(f"[FIXED] {mdx_file.relative_to(content_dir)}")
        except Exception as e:
            print(f"[ERROR] {mdx_file.relative_to(content_dir)} - {e}")

    print(f"\n[SUMMARY] Fix completed:")
    print(f"   Total articles: {total_count}")
    print(f"   Fixed: {fixed_count}")

if __name__ == "__main__":
    main()
