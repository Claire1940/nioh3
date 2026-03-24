#!/usr/bin/env python3
"""修复 MDX 文件中的 YAML frontmatter 格式问题"""

import os
import re
from pathlib import Path

def fix_yaml_frontmatter(file_path):
    """修复单个文件的 YAML frontmatter"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 检查是否有 frontmatter
        if not content.startswith('---'):
            return False

        # 分离 frontmatter 和内容
        parts = content.split('---', 2)
        if len(parts) < 3:
            return False

        frontmatter = parts[1]
        body = parts[2]

        # 修复需要引号的字段
        fields_to_quote = ['title', 'description', 'canonical', 'date']
        modified = False

        for field in fields_to_quote:
            # 匹配没有引号的字段值（包含冒号的情况）
            pattern = rf'^({field}): ([^"\n].*)$'

            def replace_func(match):
                nonlocal modified
                field_name = match.group(1)
                value = match.group(2).strip()

                # 如果值不是以引号开头，添加引号
                if not value.startswith('"') and not value.startswith("'"):
                    modified = True
                    # 转义值中的双引号
                    value = value.replace('"', '\\"')
                    return f'{field_name}: "{value}"'
                return match.group(0)

            frontmatter = re.sub(pattern, replace_func, frontmatter, flags=re.MULTILINE)

        # 修复 keywords 字段（应该是数组格式）
        keywords_pattern = r'^keywords: ([^[\n].*)$'
        def fix_keywords(match):
            nonlocal modified
            value = match.group(1).strip()
            if not value.startswith('['):
                modified = True
                # 分割关键词并转换为数组格式
                keywords = [kw.strip() for kw in value.split(',')]
                keywords_str = ', '.join([f'"{kw}"' for kw in keywords])
                return f'keywords: [{keywords_str}]'
            return match.group(0)

        frontmatter = re.sub(keywords_pattern, fix_keywords, frontmatter, flags=re.MULTILINE)

        if modified:
            # 重新组合文件
            new_content = f'---{frontmatter}---{body}'
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True

        return False

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """批量修复所有 MDX 文件"""
    content_dir = Path('src/content/en')
    fixed_count = 0
    total_count = 0

    for mdx_file in content_dir.rglob('*.mdx'):
        total_count += 1
        if fix_yaml_frontmatter(mdx_file):
            fixed_count += 1
            print(f"Fixed: {mdx_file}")

    print(f"\n修复完成: {fixed_count}/{total_count} 个文件")

if __name__ == '__main__':
    main()
