#!/usr/bin/env python3
"""
删除MDX文件中重复的iframe代码块
保留frontmatter中的video配置，删除内容中手写的iframe
"""

import os
import re
from pathlib import Path

def remove_iframe_blocks(content):
    """
    删除MDX内容中的iframe代码块
    匹配模式：
    1. 可能有前导文本（如 "This video demonstrates..."）
    2. <div style="..."> 包裹的iframe
    3. </div> 结束标签
    """

    # 匹配整个iframe块（包括可能的前导文本和div包裹）
    # 模式1: 匹配带有div包裹的iframe
    pattern1 = r'(?:This video[^\n]*\n\n)?<div[^>]*style="[^"]*position:\s*relative[^"]*"[^>]*>[\s\S]*?<iframe[\s\S]*?</iframe>[\s\S]*?</div>\n*'

    # 模式2: 匹配单独的iframe（没有div包裹）
    pattern2 = r'(?:This video[^\n]*\n\n)?<iframe[\s\S]*?</iframe>\n*'

    # 先尝试删除带div的iframe
    content = re.sub(pattern1, '', content, flags=re.MULTILINE)

    # 再删除单独的iframe
    content = re.sub(pattern2, '', content, flags=re.MULTILINE)

    return content

def process_mdx_file(file_path):
    """处理单个MDX文件"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 检查是否包含iframe
        if '<iframe' not in content:
            return False

        # 分离frontmatter和内容
        parts = content.split('---', 2)
        if len(parts) < 3:
            print(f"WARNING {file_path}: Cannot parse frontmatter")
            return False

        frontmatter = parts[1]
        body = parts[2]

        # 删除body中的iframe
        new_body = remove_iframe_blocks(body)

        # 检查是否有变化
        if new_body == body:
            print(f"INFO {file_path}: No iframe to remove")
            return False

        # 重新组合内容
        new_content = f"---{frontmatter}---{new_body}"

        # 写回文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f"SUCCESS {file_path}: Removed iframe")
        return True

    except Exception as e:
        print(f"ERROR {file_path}: {e}")
        return False

def main():
    """主函数"""
    # 获取src/content目录
    content_dir = Path('src/content')

    if not content_dir.exists():
        print("Error: src/content directory not found")
        return

    # 查找所有MDX文件
    mdx_files = list(content_dir.rglob('*.mdx'))

    print(f"Found {len(mdx_files)} MDX files")
    print("=" * 60)

    # 处理每个文件
    processed_count = 0
    for mdx_file in mdx_files:
        if process_mdx_file(mdx_file):
            processed_count += 1

    print("=" * 60)
    print(f"Done! Processed {processed_count} files")

if __name__ == '__main__':
    main()
