#!/usr/bin/env python3
"""
修复 MDX 文件中 frontmatter 格式问题
将 ---title: 修复为 ---\ntitle:
"""

import os
import re
from pathlib import Path

def fix_frontmatter(file_path):
    """修复单个文件的 frontmatter"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 检查是否以 ---[字母] 开头
        if re.match(r'^---[a-z]', content):
            # 在 --- 后添加换行符
            fixed_content = re.sub(r'^---([a-z])', r'---\n\1', content)

            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(fixed_content)

            return True
        return False
    except Exception as e:
        print(f"错误处理 {file_path}: {e}")
        return False

def main():
    """批量修复所有 MDX 文件"""
    import sys
    import io

    # 设置 stdout 为 UTF-8
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    content_dir = Path('src/content')
    fixed_count = 0

    # 遍历所有 .mdx 文件
    for mdx_file in content_dir.rglob('*.mdx'):
        if fix_frontmatter(mdx_file):
            print(f"Fixed: {mdx_file}")
            fixed_count += 1

    print(f"\nTotal fixed: {fixed_count} files")

if __name__ == '__main__':
    main()
