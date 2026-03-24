#!/usr/bin/env python3
"""
批量更新分类页面，使用响应式广告组件
"""

import os
import re
from pathlib import Path

# 需要更新的分类目录
categories = [
    'survival', 'creatures', 'endings', 'game-info',
    'collectibles', 'technical', 'sales', 'walkthrough'
]

def update_category_page(file_path):
    """更新单个分类页面"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 检查是否已经导入了 ResponsiveAdBanner
        if 'ResponsiveAdBanner' in content:
            return False

        # 1. 添加 ResponsiveAdBanner 导入
        import_pattern = r"(import { AdBanner } from '@/components/AdBanner')"
        import_replacement = r"import { AdBanner } from '@/components/AdBanner'\nimport { ResponsiveAdBanner } from '@/components/ResponsiveAdBanner'"
        content = re.sub(import_pattern, import_replacement, content)

        # 2. 替换第一个 728x90 广告为响应式广告
        first_ad_pattern = r'<AdBanner type="banner-728x90" className="my-8" />'
        first_ad_replacement = '<ResponsiveAdBanner className="my-8" />'

        # 只替换第一个出现的位置
        content = content.replace(first_ad_pattern, first_ad_replacement, 1)

        # 3. 替换第二个 728x90 广告为响应式广告
        content = content.replace(first_ad_pattern, first_ad_replacement, 1)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

        return True

    except Exception as e:
        return False

def main():
    """批量更新所有分类页面"""
    import sys
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    base_dir = Path('src/app/[locale]')
    updated_count = 0

    for category in categories:
        page_file = base_dir / category / 'page.tsx'
        if page_file.exists():
            if update_category_page(page_file):
                updated_count += 1
                print(f"Updated: {category}/page.tsx")

    print(f"\nTotal updated: {updated_count} files")

if __name__ == '__main__':
    main()
