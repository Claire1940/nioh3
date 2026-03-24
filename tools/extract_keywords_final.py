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

def extract_title_phrases(title):
    """从标题中提取关键短语作为关键词"""
    # 只处理包含 solo hunters 的标题
    title_lower = title.lower()
    if 'solo hunters' not in title_lower and 'solo hunter' not in title_lower:
        return []

    # 排除 KPop Demon Hunters
    if 'kpop' in title_lower or 'demon hunters' in title_lower:
        return []

    keywords = []

    # 提取完整的短语模式
    patterns = [
        # 指南类
        (r'complete\s+beginner[\'s]?\s+guide', 'complete beginner guide'),
        (r'ultimate\s+beginner[\'s]?\s+guide', 'ultimate beginner guide'),
        (r'beginner[\'s]?\s+guide', 'beginner guide'),
        (r'complete\s+guide', 'complete guide'),
        (r'ultimate\s+guide', 'ultimate guide'),
        (r'full\s+guide', 'full guide'),
        (r'basic\s+guide', 'basic guide'),
        (r'meta\s+stats\s+guide', 'meta stats guide'),
        (r'stats?\s+guide', 'stat guide'),
        (r'build\s+guide', 'build guide'),

        # 代码类
        (r'all\s+working\s+codes?', 'all working codes'),
        (r'working\s+codes?', 'working codes'),
        (r'all\s+codes?', 'all codes'),
        (r'new\s+codes?', 'new codes'),
        (r'codes?\s+(?:&|and)\s+tutorial', 'codes and tutorial'),
        (r'\bcodes?\b', 'codes'),

        # 职业/构建类
        (r'best\s+class(?:es)?', 'best class'),
        (r'best\s+build', 'best build'),
        (r'meta\s+build', 'meta build'),
        (r'tank\s+build', 'tank build'),
        (r'melee\s+tank\s+build', 'melee tank build'),
        (r'pro\s+build', 'pro build'),

        # 能力/技能
        (r'best\s+beginner\s+power', 'best beginner power'),
        (r'best\s+power', 'best power'),

        # 游戏机制
        (r'how\s+to\s+enchant', 'how to enchant'),
        (r'enchanting\s+explained', 'enchanting explained'),
        (r'enchanting', 'enchanting'),
        (r'how\s+to\s+redeem\s+codes?', 'how to redeem codes'),
        (r'reset\s+stats?', 'reset stats'),
        (r'upgrade\s+stats?', 'upgrade stats'),
        (r'reroll', 'reroll'),
        (r'what\s+stat\s+should\s+i\s+upgrade', 'what stat should i upgrade'),

        # 进度类
        (r'fast\s+progression', 'fast progression'),
        (r'level\s+up\s+fast', 'level up fast'),
        (r'how\s+to\s+level\s+fast', 'how to level fast'),
        (r'leveling', 'leveling'),
        (r'noob\s+to\s+pro', 'noob to pro'),

        # 内容展示
        (r'showcase', 'showcase'),
        (r'gameplay', 'gameplay'),
        (r'walkthrough', 'walkthrough'),

        # 游戏内容
        (r'weapons?', 'weapons'),
        (r'classes?', 'classes'),
        (r'titles?', 'titles'),
        (r'boss(?:es)?', 'bosses'),
        (r'dungeons?', 'dungeons'),
        (r'powers?', 'powers'),

        # 测试版本
        (r'open\s+beta', 'open beta'),
        (r'\bbeta\s+testing', 'beta testing'),
        (r'\bbeta\b', 'beta'),

        # 脚本/工具
        (r'auto\s+farm', 'auto farm'),
        (r'\bscript\b', 'script'),

        # 技巧
        (r'pro\s+tips', 'pro tips'),
        (r'\btips\s+(?:&|and)\s+tricks', 'tips and tricks'),
        (r'\btips\b', 'tips'),
        (r'\btricks\b', 'tricks'),

        # 其他
        (r'getting\s+started', 'getting started'),
        (r'how\s+to\s+play', 'how to play'),
        (r'tier\s+list', 'tier list'),
        (r'free\s+gems', 'free gems'),
    ]

    for pattern, keyword in patterns:
        if re.search(pattern, title_lower):
            keywords.append(keyword)

    return keywords

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

# 按观看次数排序
all_videos.sort(key=lambda x: x['views'], reverse=True)

# 选取前80名
top_80 = all_videos[:80]

# 提取关键词
keyword_stats = defaultdict(lambda: {'count': 0, 'max_views': 0, 'total_views': 0, 'titles': []})
solo_hunters_videos = []

output_lines = []
output_lines.append(f"流量前80名视频分析")
output_lines.append("=" * 100)
output_lines.append("")

for i, video in enumerate(top_80, 1):
    title = video['title']
    views = video['views']
    keywords = extract_title_phrases(title)

    if keywords:  # 只记录包含 Solo Hunters 的视频
        solo_hunters_videos.append(video)
        output_lines.append(f"{i}. [{views:,} views] {title}")
        output_lines.append(f"   提取关键词: {', '.join(keywords)}")

        for kw in keywords:
            keyword_stats[kw]['count'] += 1
            keyword_stats[kw]['max_views'] = max(keyword_stats[kw]['max_views'], views)
            keyword_stats[kw]['total_views'] += views
            if len(keyword_stats[kw]['titles']) < 3:
                keyword_stats[kw]['titles'].append(title[:100])
        output_lines.append("")

# 按最高观看次数排序关键词
sorted_keywords = sorted(keyword_stats.items(), key=lambda x: x[1]['max_views'], reverse=True)

output_lines.append("\n" + "=" * 100)
output_lines.append(f"Solo Hunters 相关视频统计:")
output_lines.append(f"  - 前80名中包含 Solo Hunters 的视频: {len(solo_hunters_videos)} 个")
output_lines.append(f"  - 提取的关键词数量: {len(sorted_keywords)} 个")
output_lines.append("=" * 100)
output_lines.append("")

output_lines.append("关键词统计 (按最高观看次数排序):")
output_lines.append("=" * 100)
output_lines.append("")

for kw, data in sorted_keywords:
    output_lines.append(f"{kw}")
    output_lines.append(f"  出现次数: {data['count']}")
    output_lines.append(f"  最高观看: {data['max_views']:,}")
    output_lines.append(f"  总观看: {data['total_views']:,}")
    output_lines.append(f"  示例标题:")
    for title in data['titles']:
        output_lines.append(f"    - {title}")
    output_lines.append("")

# 合并同义词
output_lines.append("\n" + "=" * 100)
output_lines.append("同义词合并建议:")
output_lines.append("=" * 100)
output_lines.append("")

# 定义同义词组
synonym_groups = {
    'codes': ['codes', 'all codes', 'new codes', 'working codes', 'all working codes'],
    'beginner guide': ['beginner guide', 'complete beginner guide', 'ultimate beginner guide'],
    'guide': ['guide', 'complete guide', 'ultimate guide', 'full guide', 'basic guide'],
    'stats': ['stat guide', 'meta stats guide', 'stats', 'upgrade stats', 'reset stats', 'what stat should i upgrade'],
    'enchanting': ['enchanting', 'how to enchant', 'enchanting explained'],
    'tips': ['tips', 'pro tips', 'tips and tricks', 'tricks'],
    'build': ['build guide', 'best build', 'meta build', 'tank build', 'melee tank build', 'pro build'],
    'beta': ['beta', 'open beta', 'beta testing'],
}

merged_keywords = {}
for main_kw, synonyms in synonym_groups.items():
    max_views = 0
    total_count = 0
    all_titles = []

    for syn in synonyms:
        if syn in keyword_stats:
            max_views = max(max_views, keyword_stats[syn]['max_views'])
            total_count += keyword_stats[syn]['count']
            all_titles.extend(keyword_stats[syn]['titles'])

    if max_views > 0:
        merged_keywords[main_kw] = {
            'max_views': max_views,
            'count': total_count,
            'synonyms': [s for s in synonyms if s in keyword_stats],
            'titles': list(set(all_titles))[:3]
        }

output_lines.append("合并后的关键词:")
output_lines.append("")

merged_sorted = sorted(merged_keywords.items(), key=lambda x: x[1]['max_views'], reverse=True)
for main_kw, data in merged_sorted:
    output_lines.append(f"{main_kw}")
    output_lines.append(f"  合并自: {', '.join(data['synonyms'])}")
    output_lines.append(f"  最高观看: {data['max_views']:,}")
    output_lines.append(f"  总出现次数: {data['count']}")
    output_lines.append("")

# 生成最终关键词列表
output_lines.append("\n" + "=" * 100)
output_lines.append("最终关键词列表 (用于添加到关键词分类.md):")
output_lines.append("=" * 100)
output_lines.append("")

# 合并后的关键词
final_keywords = []
for main_kw in merged_keywords.keys():
    final_keywords.append(f"solo hunters {main_kw}")

# 添加未被合并的独立关键词
for kw, data in sorted_keywords:
    is_merged = False
    for synonyms in synonym_groups.values():
        if kw in synonyms:
            is_merged = True
            break
    if not is_merged:
        final_keywords.append(f"solo hunters {kw}")

# 去重并排序
final_keywords = sorted(list(set(final_keywords)))

output_lines.append(f"总计 {len(final_keywords)} 个关键词 (已合并同义词):")
output_lines.append("")
for i, kw in enumerate(final_keywords, 1):
    output_lines.append(f"{i}. {kw} - Priority 2")

# 保存结果
with open(r'D:\web\0125solo hunters\tools\solo_hunters_keywords_final.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output_lines))

print(f"分析完成!")
print(f"前80名视频中包含 Solo Hunters 的: {len(solo_hunters_videos)} 个")
print(f"提取原始关键词: {len(sorted_keywords)} 个")
print(f"合并后关键词: {len(final_keywords)} 个")
print(f"结果已保存到: tools/solo_hunters_keywords_final.txt")
