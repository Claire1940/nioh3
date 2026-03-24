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

def extract_english_keywords(title):
    """从标题中提取英文关键词短语"""
    # 只保留英文部分
    title_lower = title.lower()

    # 如果标题主要不是英文，返回空
    english_chars = sum(1 for c in title if c.isascii() and c.isalpha())
    total_chars = sum(1 for c in title if c.isalpha())
    if total_chars > 0 and english_chars / total_chars < 0.5:
        return []

    keywords = []

    # 定义关键词短语模式
    patterns = [
        # 指南类
        ('ultimate guide', r'ultimate\s+guide'),
        ('complete guide', r'complete\s+guide'),
        ('beginner guide', r'beginner[\'s]?\s+guide'),
        ('full guide', r'full\s+guide'),
        ('basic guide', r'basic\s+guide'),
        ('stat guide', r'stats?\s+guide'),
        ('meta stats guide', r'meta\s+stats?\s+guide'),
        ('build guide', r'build\s+guide'),

        # 代码类
        ('all working codes', r'all\s+working\s+codes?'),
        ('working codes', r'working\s+codes?'),
        ('all codes', r'all\s+codes?'),
        ('new codes', r'new\s+codes?'),
        ('codes', r'\bcodes?\b'),
        ('how to redeem codes', r'how\s+to\s+redeem\s+codes?'),

        # 职业/构建
        ('best class', r'best\s+class(?:es)?'),
        ('best build', r'best\s+build'),
        ('meta build', r'meta\s+build'),
        ('pro build', r'pro\s+build'),
        ('tank build', r'tank\s+build'),

        # 能力
        ('best beginner power', r'best\s+beginner\s+power'),
        ('best power', r'best\s+power'),

        # 游戏机制
        ('how to enchant', r'how\s+to\s+enchant'),
        ('enchanting explained', r'enchanting\s+explained'),
        ('enchanting', r'\benchanting\b'),
        ('reset stats', r'reset\s+stats?'),
        ('upgrade stats', r'upgrade\s+stats?'),
        ('wasting stats', r'wasting\s+stats?'),
        ('reroll', r'\breroll\b'),

        # 进度
        ('fast progression', r'fast\s+progression'),
        ('level up fast', r'level\s+up\s+fast'),
        ('noob to pro', r'noob\s+to\s+pro'),

        # 内容
        ('showcase', r'\bshowcase\b'),
        ('gameplay', r'\bgameplay\b'),
        ('titles', r'\btitles?\b'),
        ('classes', r'\bclasses?\b'),
        ('weapons', r'\bweapons?\b'),

        # 测试
        ('open beta', r'open\s+beta'),
        ('beta testing', r'beta\s+testing'),
        ('beta', r'\bbeta\b'),

        # 脚本
        ('auto farm', r'auto\s+farm'),
        ('script', r'\bscript\b'),

        # 技巧
        ('pro tips', r'pro\s+tips'),
        ('tips', r'\btips\b'),
        ('beginners tips', r'beginners?\s+tips'),

        # 其他
        ('getting started', r'getting\s+started'),
        ('how to play', r'how\s+to\s+play'),
        ('tier list', r'tier\s+list'),
        ('free gems', r'free\s+gems'),
        ('tutorial', r'\btutorial\b'),
        ('new map', r'new\s+map'),
        ('just released', r'just\s+released'),
    ]

    for keyword, pattern in patterns:
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

# 筛选 Solo Hunters 相关视频
solo_hunters_videos = []
for video in all_videos:
    title_lower = video['title'].lower()
    if ('solo hunters' in title_lower or 'solo hunter' in title_lower):
        if 'kpop' not in title_lower and 'demon hunters' not in title_lower:
            solo_hunters_videos.append(video)

# 按观看次数排序
solo_hunters_videos.sort(key=lambda x: x['views'], reverse=True)

print(f"Solo Hunters 相关视频总数: {len(solo_hunters_videos)}")

# 提取关键词
keyword_stats = defaultdict(lambda: {'max_views': 0, 'count': 0, 'titles': []})

output_lines = []
output_lines.append(f"Solo Hunters 视频关键词提取")
output_lines.append("=" * 100)
output_lines.append(f"视频总数: {len(solo_hunters_videos)}")
output_lines.append("=" * 100)
output_lines.append("")

for i, video in enumerate(solo_hunters_videos, 1):
    title = video['title']
    views = video['views']
    keywords = extract_english_keywords(title)

    output_lines.append(f"{i}. [{views:,} views] {title}")
    if keywords:
        output_lines.append(f"   关键词: {', '.join(keywords)}")
        for kw in keywords:
            keyword_stats[kw]['max_views'] = max(keyword_stats[kw]['max_views'], views)
            keyword_stats[kw]['count'] += 1
            if len(keyword_stats[kw]['titles']) < 3:
                keyword_stats[kw]['titles'].append(title[:100])
    else:
        output_lines.append(f"   关键词: (无英文关键词)")
    output_lines.append("")

# 按最高观看次数排序
sorted_keywords = sorted(keyword_stats.items(), key=lambda x: x[1]['max_views'], reverse=True)

output_lines.append("\n" + "=" * 100)
output_lines.append("关键词统计 (按最高观看次数排序):")
output_lines.append("=" * 100)
output_lines.append(f"总计: {len(sorted_keywords)} 个")
output_lines.append("")

for kw, data in sorted_keywords:
    output_lines.append(f"{kw}")
    output_lines.append(f"  最高观看: {data['max_views']:,}")
    output_lines.append(f"  出现次数: {data['count']}")
    output_lines.append(f"  示例标题:")
    for title in data['titles']:
        output_lines.append(f"    - {title}")
    output_lines.append("")

# 同义词合并
merge_groups = {
    'codes': ['codes', 'all codes', 'new codes', 'working codes', 'all working codes'],
    'guide': ['guide', 'ultimate guide', 'complete guide', 'full guide', 'basic guide'],
    'beginner guide': ['beginner guide'],
    'stats': ['stat guide', 'meta stats guide', 'wasting stats', 'upgrade stats', 'reset stats'],
    'enchanting': ['enchanting', 'how to enchant', 'enchanting explained'],
    'build': ['build guide', 'best build', 'meta build', 'pro build', 'tank build'],
    'tips': ['tips', 'pro tips', 'beginners tips'],
    'beta': ['beta', 'open beta', 'beta testing'],
    'gameplay': ['gameplay', 'showcase'],
    'script': ['script', 'auto farm'],
}

merged_keywords = {}
used = set()

for main_kw, synonyms in merge_groups.items():
    max_views = 0
    total_count = 0
    merged_from = []

    for syn in synonyms:
        if syn in keyword_stats:
            max_views = max(max_views, keyword_stats[syn]['max_views'])
            total_count += keyword_stats[syn]['count']
            merged_from.append(f"{syn} ({keyword_stats[syn]['max_views']:,})")
            used.add(syn)

    if merged_from:
        merged_keywords[main_kw] = {
            'max_views': max_views,
            'count': total_count,
            'merged_from': merged_from
        }

# 添加未合并的关键词
for kw, data in sorted_keywords:
    if kw not in used:
        merged_keywords[kw] = {
            'max_views': data['max_views'],
            'count': data['count'],
            'merged_from': [f"{kw} ({data['max_views']:,})"]
        }

# 排序
final_sorted = sorted(merged_keywords.items(), key=lambda x: x[1]['max_views'], reverse=True)

output_lines.append("\n" + "=" * 100)
output_lines.append("合并后的关键词:")
output_lines.append("=" * 100)
output_lines.append(f"总计: {len(final_sorted)} 个")
output_lines.append("")

for kw, data in final_sorted:
    if len(data['merged_from']) > 1:
        output_lines.append(f"{kw} (合并自 {len(data['merged_from'])} 个)")
        output_lines.append(f"  最高观看: {data['max_views']:,}")
        output_lines.append(f"  总出现: {data['count']} 次")
        output_lines.append(f"  合并自: {', '.join(data['merged_from'])}")
    else:
        output_lines.append(f"{kw}")
        output_lines.append(f"  观看: {data['max_views']:,}")
        output_lines.append(f"  出现: {data['count']} 次")
    output_lines.append("")

# 生成最终列表
output_lines.append("\n" + "=" * 100)
output_lines.append("最终关键词列表 (添加到 tools/demand/关键词分类.md, Priority 2):")
output_lines.append("=" * 100)
output_lines.append("")

for i, (kw, data) in enumerate(final_sorted, 1):
    output_lines.append(f"{i}. solo hunters {kw} ({data['max_views']:,}) - Priority 2")

# 保存
with open(r'D:\web\0125solo hunters\tools\solo_hunters_final_keywords.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output_lines))

print(f"提取原始关键词: {len(sorted_keywords)} 个")
print(f"合并后关键词: {len(final_sorted)} 个")
print(f"结果已保存到: tools/solo_hunters_final_keywords.txt")
