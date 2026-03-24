import csv
import re
import json

def parse_views(views_str):
    """将观看次数字符串转换为数字"""
    if not views_str or views_str == '无人观看':
        return 0

    # 移除"次观看"
    views_str = views_str.replace('次观看', '').strip()

    # 处理万
    if '万' in views_str:
        num = float(views_str.replace('万', ''))
        return int(num * 10000)

    # 处理逗号
    views_str = views_str.replace(',', '')

    try:
        return int(views_str)
    except:
        return 0

def extract_keywords_from_title(title):
    """从标题中提取关键词"""
    # 转换为小写
    title_lower = title.lower()

    # 如果不包含 solo hunters,跳过
    if 'solo hunters' not in title_lower and 'solo hunter' not in title_lower:
        return None

    # 提取关键短语
    keywords = []

    # 常见的关键词模式
    patterns = [
        r'beginner[\'s]?\s+guide',
        r'complete\s+guide',
        r'ultimate\s+guide',
        r'best\s+class(?:es)?',
        r'best\s+build',
        r'best\s+power',
        r'best\s+beginner\s+power',
        r'meta\s+stats',
        r'meta\s+build',
        r'codes?',
        r'all\s+(?:working\s+)?codes?',
        r'new\s+codes?',
        r'how\s+to\s+enchant',
        r'enchanting',
        r'fast\s+progression',
        r'level(?:ing)?\s+guide',
        r'stat(?:s)?\s+guide',
        r'script',
        r'auto\s+farm',
        r'open\s+beta',
        r'gameplay',
        r'showcase',
        r'tier\s+list',
        r'weapons?',
        r'powers?',
        r'classes?',
        r'boss(?:es)?',
        r'raid',
        r'dungeon',
        r'tips',
        r'tricks',
        r'progression',
        r'how\s+to\s+play',
        r'getting\s+started',
        r'noob\s+to\s+pro',
        r'melee\s+tank\s+build',
        r'tank\s+build',
    ]

    for pattern in patterns:
        if re.search(pattern, title_lower):
            match = re.search(pattern, title_lower)
            keywords.append(match.group(0))

    return keywords if keywords else None

# 读取 CSV
csv_file = r'D:\web\0125solo hunters\tools\articles\modules\generation\youtube_data.csv'
videos = []

with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        views = parse_views(row['Views Number'])
        videos.append({
            'title': row['Title'],
            'views': views,
            'url': row['Video URL']
        })

# 按观看次数排序
videos.sort(key=lambda x: x['views'], reverse=True)

# 选取前80名
top_80 = videos[:80]

# 提取关键词
all_keywords = {}
output_lines = []

output_lines.append(f"总视频数: {len(videos)}")
output_lines.append(f"前80名视频:")
output_lines.append("=" * 100)

for i, video in enumerate(top_80, 1):
    title = video['title']
    views = video['views']
    keywords = extract_keywords_from_title(title)

    output_lines.append(f"{i}. [{views:,} views] {title}")
    if keywords:
        output_lines.append(f"   关键词: {', '.join(keywords)}")
        for kw in keywords:
            if kw not in all_keywords:
                all_keywords[kw] = {'count': 0, 'max_views': 0, 'titles': []}
            all_keywords[kw]['count'] += 1
            all_keywords[kw]['max_views'] = max(all_keywords[kw]['max_views'], views)
            if len(all_keywords[kw]['titles']) < 3:
                all_keywords[kw]['titles'].append(title[:80])
    output_lines.append("")

output_lines.append("\n" + "=" * 100)
output_lines.append("关键词统计 (按最高观看次数排序):")
output_lines.append("=" * 100)

# 按最高观看次数排序
sorted_keywords = sorted(all_keywords.items(), key=lambda x: x[1]['max_views'], reverse=True)

for kw, data in sorted_keywords:
    output_lines.append(f"\n{kw}")
    output_lines.append(f"  出现次数: {data['count']}")
    output_lines.append(f"  最高观看: {data['max_views']:,}")
    output_lines.append(f"  示例标题:")
    for title in data['titles']:
        output_lines.append(f"    - {title}")

# 保存到文本文件
with open(r'D:\web\0125solo hunters\tools\youtube_keywords_analysis.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output_lines))

# 保存到 JSON 文件
output = {
    'total_videos': len(videos),
    'top_80_videos': top_80,
    'keywords': {kw: data for kw, data in sorted_keywords}
}

with open(r'D:\web\0125solo hunters\tools\youtube_keywords_analysis.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

output_lines.append("\n" + "=" * 100)
output_lines.append("分析结果已保存到: tools/youtube_keywords_analysis.json 和 tools/youtube_keywords_analysis.txt")

print("分析完成! 结果已保存到文件。")
