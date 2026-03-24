#!/usr/bin/env python3
"""
文章质量检查脚本
检查所有文章是否符合质量标准
"""

import os
import re
from pathlib import Path

def check_article_quality(filepath):
    """检查单个文章的质量"""
    issues = []

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 检查frontmatter格式
    frontmatter_match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
    if not frontmatter_match:
        issues.append("Missing or invalid frontmatter")
        return issues

    frontmatter = frontmatter_match.group(1)
    body = frontmatter_match.group(2).strip()

    # 检查title
    title_match = re.search(r'title:\s*"([^"]+)"', frontmatter)
    if not title_match:
        issues.append("Missing title")
    else:
        title = title_match.group(1)
        if len(title) < 20:
            issues.append(f"Title too short ({len(title)} chars)")
        elif len(title) > 150:
            issues.append(f"Title too long ({len(title)} chars)")

    # 检查description
    desc_match = re.search(r'description:\s*"([^"]+)"', frontmatter)
    if not desc_match:
        issues.append("Missing description")
    else:
        desc = desc_match.group(1)
        if len(desc) < 50:
            issues.append(f"Description too short ({len(desc)} chars)")

    # 检查keywords
    if 'keywords:' not in frontmatter:
        issues.append("Missing keywords")

    # 检查video字段
    if 'video:' in frontmatter:
        # 检查video是否在frontmatter内
        if 'video:' in body:
            issues.append("Video field in body (should be in frontmatter)")

        # 检查video标题是否包含非英文字符
        video_title_match = re.search(r'video:.*?title:\s*"([^"]+)"', frontmatter, re.DOTALL)
        if video_title_match:
            video_title = video_title_match.group(1)
            if re.search(r'[\u4e00-\u9fff]', video_title):
                issues.append("Video title contains Chinese characters")

    # 检查正文是否包含非英文字符
    if re.search(r'[\u4e00-\u9fff]', body):
        issues.append("Body contains Chinese characters")

    # 检查正文长度
    if len(body) < 100:
        issues.append(f"Body too short ({len(body)} chars)")

    # 检查是否有"Related Video:"文本
    if 'Related Video:' in content:
        issues.append("Contains 'Related Video:' text")

    return issues

def main():
    """主函数"""
    content_dir = Path("src/content/en")

    print("[INFO] Starting quality check...")
    print(f"[INFO] Scanning directory: {content_dir}\n")

    total_count = 0
    passed_count = 0
    failed_count = 0
    issues_summary = {}

    for mdx_file in content_dir.rglob("*.mdx"):
        total_count += 1
        issues = check_article_quality(mdx_file)

        if issues:
            failed_count += 1
            rel_path = mdx_file.relative_to(content_dir)
            print(f"[FAIL] {rel_path}")
            for issue in issues:
                print(f"       - {issue}")
                issues_summary[issue] = issues_summary.get(issue, 0) + 1
        else:
            passed_count += 1

    print(f"\n[SUMMARY] Quality check completed:")
    print(f"   Total articles: {total_count}")
    print(f"   Passed: {passed_count}")
    print(f"   Failed: {failed_count}")

    if issues_summary:
        print(f"\n[ISSUES] Common issues:")
        for issue, count in sorted(issues_summary.items(), key=lambda x: x[1], reverse=True):
            print(f"   {count}x - {issue}")

if __name__ == "__main__":
    main()
