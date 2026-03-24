#!/usr/bin/env python3
"""
全面重建文章结构
- 修复frontmatter位置
- 移除视频标题中的非英文字符
- 确保格式正确
"""

import os
import re
import json
from pathlib import Path

def load_article_mapping():
    """加载内页.json"""
    json_path = Path("tools/articles/modules/generation/内页.json")
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    mapping = {}
    for item in data:
        url_path = item['URL Path'].strip('/')
        mapping[url_path] = {
            'title': item['Article Title'],
            'keyword': item['Keyword'],
        }
    return mapping

def remove_non_english(text):
    """移除非英文字符"""
    # 移除中文字符
    text = re.sub(r'[\u4e00-\u9fff]+', '', text)
    # 移除其他非ASCII字符
    text = re.sub(r'[^\x00-\x7F]+', '', text)
    # 清理多余空格和特殊字符
    text = re.sub(r'\s+', ' ', text).strip()
    text = re.sub(r'\s*-\s*$', '', text)  # 移除末尾的 " -"
    return text

def rebuild_article(filepath, mapping):
    """完全重建文章结构"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 获取URL路径
    rel_path = filepath.relative_to(Path("src/content/en"))
    url_path = str(rel_path.with_suffix('')).replace('\\', '/')

    if url_path not in mapping:
        print(f"[WARN] No mapping found for {url_path}")
        return False

    article_info = mapping[url_path]

    # 提取所有可能的元数据
    title_match = re.search(r'title:\s*"([^"]+)"', content)
    desc_match = re.search(r'description:\s*"([^"]+)"', content)
    keywords_match = re.search(r'keywords:\s*(\[.*?\])', content)
    canonical_match = re.search(r'canonical:\s*"([^"]+)"', content)
    date_match = re.search(r'date:\s*"([^"]+)"', content)

    # 提取video信息
    video_enabled = re.search(r'enabled:\s*(true|false)', content)
    video_id = re.search(r'youtubeId:\s*"([^"]+)"', content)
    video_title = re.search(r'title:\s*"([^"]+)"', content, re.MULTILINE)
    video_desc = re.search(r'description:\s*"([^"]+)"', content, re.MULTILINE)
    video_duration = re.search(r'duration:\s*"([^"]+)"', content)
    video_upload = re.search(r'uploadDate:\s*"([^"]+)"', content)

    # 提取正文内容（移除所有frontmatter相关内容）
    body = content
    # 移除所有frontmatter标记
    body = re.sub(r'^---\n.*?---\n', '', body, flags=re.DOTALL)
    body = re.sub(r'---\n.*?---$', '', body, flags=re.DOTALL)
    # 移除所有元数据行
    body = re.sub(r'^(title|description|keywords|canonical|date|video|enabled|youtubeId|duration|uploadDate):\s*.*$', '', body, flags=re.MULTILINE)
    # 清理多余空行
    body = re.sub(r'\n{3,}', '\n\n', body).strip()

    # 构建新的frontmatter
    new_frontmatter = "---\n"
    new_frontmatter += f'title: "{article_info["title"]}"\n'
    new_frontmatter += f'description: "Discover everything about {article_info["keyword"]} in Nioh 3. Expert tips, strategies, and complete guide updated February 2026."\n'

    if keywords_match:
        keywords = keywords_match.group(1)
    else:
        keywords = f'["{article_info["keyword"]}", "nioh 3", "nioh 3 guide"]'
    new_frontmatter += f'keywords: {keywords}\n'

    if canonical_match:
        new_frontmatter += f'canonical: "{canonical_match.group(1)}"\n'
    else:
        new_frontmatter += f'canonical: "/{url_path}/"\n'

    if date_match:
        new_frontmatter += f'date: "{date_match.group(1)}"\n'
    else:
        new_frontmatter += 'date: "2026-02-01"\n'

    # 添加video信息（如果存在）
    if video_id:
        new_frontmatter += 'video:\n'
        new_frontmatter += '  enabled: true\n'
        new_frontmatter += f'  youtubeId: "{video_id.group(1)}"\n'

        # 清理video标题和描述中的非英文字符
        if video_title:
            clean_title = remove_non_english(video_title.group(1))
            if not clean_title:
                clean_title = "Nioh 3 Gameplay Walkthrough"
            new_frontmatter += f'  title: "{clean_title}"\n'

        if video_desc:
            clean_desc = remove_non_english(video_desc.group(1))
            if not clean_desc:
                clean_desc = "Complete Nioh 3 gameplay guide and walkthrough"
            new_frontmatter += f'  description: "{clean_desc}"\n'

        if video_duration:
            new_frontmatter += f'  duration: "{video_duration.group(1)}"\n'
        else:
            new_frontmatter += '  duration: "PT10M30S"\n'

        if video_upload:
            new_frontmatter += f'  uploadDate: "{video_upload.group(1)}"\n'
        else:
            new_frontmatter += '  uploadDate: "2026-01-30"\n'

    new_frontmatter += "---\n"

    # 重建完整文章
    new_content = new_frontmatter + '\n' + body + '\n'

    # 写回文件
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    return True

def main():
    """主函数"""
    print("[INFO] Loading article mapping...")
    mapping = load_article_mapping()
    print(f"[INFO] Loaded {len(mapping)} article mappings")

    content_dir = Path("src/content/en")
    print("[INFO] Rebuilding all articles...")

    fixed_count = 0
    total_count = 0

    for mdx_file in content_dir.rglob("*.mdx"):
        total_count += 1
        try:
            if rebuild_article(mdx_file, mapping):
                fixed_count += 1
                print(f"[FIXED] {mdx_file.relative_to(content_dir)}")
        except Exception as e:
            print(f"[ERROR] {mdx_file.relative_to(content_dir)} - {e}")

    print(f"\n[SUMMARY] Rebuild completed:")
    print(f"   Total articles: {total_count}")
    print(f"   Fixed: {fixed_count}")

if __name__ == "__main__":
    main()
