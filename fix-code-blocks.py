#!/usr/bin/env python3
"""
修复 MDX 文件中错误的代码块标记
删除 frontmatter 后紧跟的单独 ``` 行
"""

import os
import re
from pathlib import Path

def fix_mdx_file(file_path):
    """修复单个 MDX 文件"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 检查是否有 frontmatter 后紧跟 ``` 的情况
    # Pattern: ---\n...\n---\n```\n
    pattern = r'^(---\n.*?\n---\n)```\n'

    if re.search(pattern, content, re.DOTALL):
        # 删除 frontmatter 后的 ```
        fixed_content = re.sub(pattern, r'\1', content, flags=re.DOTALL)

        # 写回文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(fixed_content)

        return True

    return False

def main():
    """主函数"""
    base_dir = Path('src/content/en')
    fixed_count = 0

    # 遍历所有 MDX 文件
    for mdx_file in base_dir.rglob('*.mdx'):
        if fix_mdx_file(mdx_file):
            print(f"Fixed: {mdx_file}")
            fixed_count += 1

    print(f"\nTotal fixed: {fixed_count} files")

if __name__ == '__main__':
    main()
