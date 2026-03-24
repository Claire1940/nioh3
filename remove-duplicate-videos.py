#!/usr/bin/env python3
"""
删除 MDX 文件中手动嵌入的 YouTube 视频 iframe
保留 frontmatter 中的 video 配置
"""

import os
import re
from pathlib import Path

def remove_video_embeds(content: str) -> tuple[str, int]:
    """
    删除内容中的视频嵌入代码
    返回: (处理后的内容, 删除的视频数量)
    """
    # 匹配视频嵌入的正则表达式
    # 匹配 <div style="..."> ... <iframe ... youtube.com/embed ... </iframe> ... </div>
    video_pattern = r'<div\s+style="[^"]*position:\s*relative[^"]*"[^>]*>.*?<iframe[^>]*youtube\.com/embed[^>]*>.*?</iframe>.*?</div>'

    # 计算删除的视频数量
    matches = re.findall(video_pattern, content, re.DOTALL | re.IGNORECASE)
    count = len(matches)

    # 删除视频嵌入
    cleaned_content = re.sub(video_pattern, '', content, flags=re.DOTALL | re.IGNORECASE)

    # 清理多余的空行（超过2个连续空行的情况）
    cleaned_content = re.sub(r'\n{3,}', '\n\n', cleaned_content)

    return cleaned_content, count

def process_mdx_file(file_path: Path) -> bool:
    """
    处理单个 MDX 文件
    返回: 是否进行了修改
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 删除视频嵌入
        cleaned_content, removed_count = remove_video_embeds(content)

        if removed_count > 0:
            # 写回文件
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(cleaned_content)
            print(f"[OK] {file_path.name}: removed {removed_count} video(s)")
            return True

        return False

    except Exception as e:
        print(f"[ERROR] {file_path.name}: {e}")
        return False

def main():
    """主函数"""
    content_dir = Path('src/content/en')

    if not content_dir.exists():
        print(f"ERROR: Directory {content_dir} not found")
        return

    # 查找所有 MDX 文件
    mdx_files = list(content_dir.rglob('*.mdx'))

    print(f"Found {len(mdx_files)} MDX files")
    print("Processing...\n")

    modified_count = 0

    for mdx_file in mdx_files:
        if process_mdx_file(mdx_file):
            modified_count += 1

    print(f"\nDone! Modified {modified_count} files")

if __name__ == '__main__':
    main()
