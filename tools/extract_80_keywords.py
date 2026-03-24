import csv
import re
from collections import defaultdict

def parse_views(views_str):
    """将观看次数字符串转换为数字"""
    if not views_str or views_str == '无人观看':
        return 0
    views_str = views_str.replace('次观看', '').strip()
    if '万' in views_str:
        num = float(views_str.replace('万', ''))
        return int(num * 10000)
    views_str = views_str.replace(',', '')
    try:
        return int(views_str)
    except:
        return 0

def clean_keyword(title):
    """从标题中提取干净的关键词"""
    # 转换为小写
    title_lower = title.lower()

    # 移除常见噪音
    noise_patterns = [
        r'\[roblox\]', r'\(roblox\)', r'roblox', r'#roblox', r'#solohunters',
        r'#sololeveling', r'🔥', r'💀', r'😱', r'😮', r'😎', r'✅', r'❌',
        r'\[open beta\]', r'\(open beta\)', r'cc 全字幕', r'\*new\*',
        r'solo leveling rpg', r'solo leveling', r'elemental dungeons 2',
    ]

    for pattern in noise_patterns:
        title_lower = re.sub(pattern, '', title_lower, flags=re.IGNORECASE)

    # 移除 "solo hunters" 本身
    title_lower = re.sub(r'\bsolo hunters?\b', '', title_lower)

    # 清理多余空格和标点
    title_lower = re.sub(r'[!?。！？…]+', '', title_lower)
    title_lower = re.sub(r'\s+', ' ', title_lower).strip()

    # 移除前后的连接词
    title_lower = re.sub(r'^(the|a|an|is|are|in|on|at|to|for|of|with)\s+', '', title_lower)
    title_lower = re.sub(r'\s+(the|a|an|is|are|in|on|at|to|for|of|with)$', '', title_lower)

    return title_lower

# 读取 CSV
csv_file = r'D:\web\0125solo hunters\tools\articles\modules\generation\youtube_data.csv'
all_videos = []

with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        views = parse_views(row['Views Number'])
        all_videos.append({
            'title': row['Title'],
            'views': views,
            'url': row['Video URL']
        })

# 筛选 Solo Hunters 相关视频
solo_hunters_videos = []
for video in all_videos:
    title_lower = video['title'].lower()
    # 包含 solo hunters 但排除 kpop demon hunters
    if ('solo hunters' in title_lower or 'solo hunter' in title_lower):
        if 'kpop' not in title_lower and 'demon hunters' not in title_lower:
            solo_hunters_videos.append(video)

# 按观看次数排序
solo_hunters_videos.sort(key=lambda x: x['views'], reverse=True)

# 选取前80个（如果不足80个就全部选取）
top_videos = solo_hunters_videos[:min(80, len(solo_hunters_videos))]

print(f"Solo Hunters 相关视频总数: {len(solo_hunters_videos)}")
print(f"选取视频数量: {len(top_videos)}")

# 提取关键词
keywords_data = {}
output_lines = []

output_lines.append(f"Solo Hunters 相关视频 (按流量从大到小)")
output_lines.append("=" * 100)
output_lines.append(f"总数: {len(solo_hunters_videos)} 个")
output_lines.append(f"选取: {len(top_videos)} 个")
output_lines.append("=" * 100)
output_lines.append("")

for i, video in enumerate(top_videos, 1):
    title = video['title']
    views = video['views']
    keyword = clean_keyword(title)

    if keyword and len(keyword) > 3:  # 至少4个字符
        if keyword not in keywords_data:
            keywords_data[keyword] = {
                'views': views,
                'count': 1,
                'original_titles': [title]
            }
        else:
            keywords_data[keyword]['count'] += 1
            keywords_data[keyword]['views'] = max(keywords_data[keyword]['views'], views)
            if len(keywords_data[keyword]['original_titles']) < 3:
                keywords_data[keyword]['original_titles'].append(title)

    output_lines.append(f"{i}. [{views:,} views] {title}")
    output_lines.append(f"   关键词: {keyword if keyword else '(无法提取)'}")
    output_lines.append("")

# 按观看次数排序关键词
sorted_keywords = sorted(keywords_data.items(), key=lambda x: x[1]['views'], reverse=True)

output_lines.append("\n" + "=" * 100)
output_lines.append("提取的关键词列表 (按流量排序):")
output_lines.append("=" * 100)
output_lines.append(f"总计: {len(sorted_keywords)} 个关键词")
output_lines.append("")

for i, (kw, data) in enumerate(sorted_keywords, 1):
    output_lines.append(f"{i}. {kw}")
    output_lines.append(f"   最高观看: {data['views']:,}")
    output_lines.append(f"   出现次数: {data['count']}")
    output_lines.append(f"   原始标题:")
    for title in data['original_titles']:
        output_lines.append(f"     - {title[:100]}")
    output_lines.append("")

# 同义词合并
output_lines.append("\n" + "=" * 100)
output_lines.append("同义词合并:")
output_lines.append("=" * 100)
output_lines.append("")

# 定义合并规则
merge_rules = [
    (['ultimate guide', 'complete guide', 'full guide', 'guide'], 'guide'),
    (['beginner guide', 'beginners guide', 'beginner\'s guide'], 'beginner guide'),
    (['all working codes', 'working codes', 'all codes', 'codes', 'new codes'], 'codes'),
    (['best class', 'best classes'], 'best class'),
    (['how to enchant', 'enchanting explained', 'enchanting'], 'enchanting'),
    (['stat guide', 'stats guide', 'meta stats guide'], 'stats guide'),
    (['fast progression', 'level up fast', 'how to level fast'], 'fast progression'),
    (['noob to pro', 'noob to pro'], 'noob to pro'),
    (['auto farm', 'script'], 'script'),
    (['open beta', 'beta testing', 'beta'], 'beta'),
    (['gameplay', 'showcase'], 'gameplay'),
]

merged_keywords = {}
used_keywords = set()

for synonyms, main_kw in merge_rules:
    max_views = 0
    total_count = 0
    all_titles = []
    found_synonyms = []

    for kw, data in sorted_keywords:
        for syn in synonyms:
            if syn in kw and kw not in used_keywords:
                max_views = max(max_views, data['views'])
                total_count += data['count']
                all_titles.extend(data['original_titles'])
                found_synonyms.append(kw)
                used_keywords.add(kw)
                break

    if found_synonyms:
        merged_keywords[main_kw] = {
            'views': max_views,
            'count': total_count,
            'merged_from': found_synonyms,
            'titles': list(set(all_titles))[:3]
        }

# 添加未被合并的关键词
for kw, data in sorted_keywords:
    if kw not in used_keywords:
        merged_keywords[kw] = {
            'views': data['views'],
            'count': data['count'],
            'merged_from': [kw],
            'titles': data['original_titles'][:3]
        }

# 按观看次数排序合并后的关键词
final_sorted = sorted(merged_keywords.items(), key=lambda x: x[1]['views'], reverse=True)

for kw, data in final_sorted:
    if len(data['merged_from']) > 1:
        output_lines.append(f"{kw} (合并自 {len(data['merged_from'])} 个)")
        output_lines.append(f"  最高观看: {data['views']:,}")
        output_lines.append(f"  合并自: {', '.join(data['merged_from'][:5])}")
    else:
        output_lines.append(f"{kw}")
        output_lines.append(f"  观看: {data['views']:,}")
    output_lines.append("")

# 生成最终列表
output_lines.append("\n" + "=" * 100)
output_lines.append("最终关键词列表 (添加到关键词分类.md, Priority 2):")
output_lines.append("=" * 100)
output_lines.append(f"总计: {len(final_sorted)} 个")
output_lines.append("")

for i, (kw, data) in enumerate(final_sorted, 1):
    output_lines.append(f"{i}. solo hunters {kw} ({data['views']:,}) - Priority 2")

# 保存结果
with open(r'D:\web\0125solo hunters\tools\solo_hunters_keywords_80.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output_lines))

print(f"提取原始关键词: {len(sorted_keywords)} 个")
print(f"合并后关键词: {len(final_sorted)} 个")
print(f"结果已保存到: tools/solo_hunters_keywords_80.txt")
