import os
import re

def fix_mdx_file(filepath):
    """修复 MDX 文件中错位的 video frontmatter"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 分割 frontmatter 和正文
    parts = content.split('---', 2)
    if len(parts) < 3:
        return False

    frontmatter = parts[1]
    body = parts[2]

    # 检查正文中是否有 video 字段
    if 'video:' not in body:
        return False

    # 提取正文中的 video 字段
    video_pattern = r'\nvideo:\s*\n(?:  .+\n)*'
    video_match = re.search(video_pattern, body)

    if not video_match:
        return False

    video_content = video_match.group(0).strip()

    # 从正文中移除 video 字段和末尾的 ---
    body_cleaned = body[:video_match.start()] + body[video_match.end():]
    body_cleaned = body_cleaned.rstrip()
    body_cleaned = re.sub(r'\n---\s*$', '', body_cleaned)

    # 将 video 字段添加到 frontmatter
    frontmatter_with_video = frontmatter.rstrip() + '\n' + video_content + '\n'

    # 重新组合文件
    new_content = '---\n' + frontmatter_with_video + '---' + body_cleaned

    # 写回文件
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    return True

# 查找并修复所有错误的文件
fixed_count = 0
for root, dirs, files in os.walk('src/content/en'):
    for file in files:
        if file.endswith('.mdx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # 检查是否有 video: 在正文中
            parts = content.split('---', 2)
            if len(parts) >= 3 and 'video:' in parts[2]:
                if fix_mdx_file(filepath):
                    fixed_count += 1
                    print(f'已修复: {filepath}')

print(f'\n总共修复了 {fixed_count} 个文件')
