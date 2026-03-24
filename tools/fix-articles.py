#!/usr/bin/env python3
"""
批量修复 Nioh 3 文章质量问题
- 删除文章底部的 "Related Video:" 文本
- 修复 frontmatter 格式
- 移除非英文内容
"""

import os
import re
import json
from pathlib import Path

def fix_article(filepath):
    """修复单个文章文件"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 1. 提取 frontmatter
    frontmatter_match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
    if not frontmatter_match:
        print(f"[WARN] {filepath}: Cannot parse frontmatter")
        return False

    frontmatter_text = frontmatter_match.group(1)
    body = frontmatter_match.group(2)

    # 2. 检查正文中是否有 video 字段（错误位置）
    video_in_body_match = re.search(
        r'---\n\n\*\*Related Video:\*\*\n\n<!-- VIDEO_ID: (.*?) -->\n(.*?)\nvideo:\n  enabled: (.*?)\n  youtubeId: "(.*?)"\n  title: "(.*?)"\n  description: "(.*?)"\n  duration: "(.*?)"\n  uploadDate: "(.*?)"',
        body,
        re.DOTALL
    )

    if video_in_body_match:
        # 提取 video 信息
        video_id = video_in_body_match.group(4)
        video_title = video_in_body_match.group(5)
        video_desc = video_in_body_match.group(6)
        video_duration = video_in_body_match.group(7)
        video_upload = video_in_body_match.group(8)

        # 移除视频标题和描述中的非英文字符
        video_title = remove_non_english(video_title)
        video_desc = remove_non_english(video_desc)

        # 将 video 字段添加到 frontmatter
        if 'video:' not in frontmatter_text:
            video_yaml = f'''video:
  enabled: true
  youtubeId: "{video_id}"
  title: "{video_title}"
  description: "{video_desc}"
  duration: "{video_duration}"
  uploadDate: "{video_upload}"'''
            frontmatter_text += '\n' + video_yaml

        # 从正文中删除整个 video 部分
        body = re.sub(
            r'---\n\n\*\*Related Video:\*\*\n\n<!-- VIDEO_ID:.*?-->\n.*?video:\n  enabled:.*?uploadDate: ".*?"',
            '',
            body,
            flags=re.DOTALL
        )
    else:
        # 3. 删除正文中的 "Related Video:" 文本（如果存在）
        body = re.sub(
            r'\*\*Related Video:\*\*\n\n<!-- VIDEO_ID:.*?-->\n.*?(?=\n\n|\Z)',
            '',
            body,
            flags=re.DOTALL
        )

    # 4. 清理多余的分隔线和空行
    body = re.sub(r'\n---\n\n+', '\n\n', body)
    body = re.sub(r'\n{3,}', '\n\n', body)
    body = body.strip()

    # 5. 重新组合文章
    new_content = f"---\n{frontmatter_text}\n---\n\n{body}\n"

    # 6. 写回文件
    if new_content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True

    return False

def remove_non_english(text):
    """移除文本中的非英文字符"""
    # 移除中文字符
    text = re.sub(r'[\u4e00-\u9fff]+', '', text)
    # 移除其他非 ASCII 字符（保留基本标点）
    text = re.sub(r'[^\x00-\x7F]+', '', text)
    # 清理多余空格
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def main():
    """主函数"""
    content_dir = Path("src/content/en")

    if not content_dir.exists():
        print(f"[ERROR] Directory not found: {content_dir}")
        return

    print("[INFO] Starting batch article fix...")
    print(f"[INFO] Scanning directory: {content_dir}")

    fixed_count = 0
    total_count = 0

    for mdx_file in content_dir.rglob("*.mdx"):
        total_count += 1
        try:
            if fix_article(mdx_file):
                fixed_count += 1
                print(f"[FIXED] {mdx_file.relative_to(content_dir)}")
            else:
                print(f"[SKIP] {mdx_file.relative_to(content_dir)}")
        except Exception as e:
            print(f"[ERROR] {mdx_file.relative_to(content_dir)} - {e}")

    print(f"\n[SUMMARY] Fix completed:")
    print(f"   Total articles: {total_count}")
    print(f"   Fixed: {fixed_count}")
    print(f"   Skipped: {total_count - fixed_count}")

if __name__ == "__main__":
    main()
