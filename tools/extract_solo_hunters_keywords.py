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

def clean_title(title):
    """清理标题,提取关键短语"""
    # 转换为小写
    title_lower = title.lower()

    # 移除常见的噪音词
    noise_patterns = [
        r'\[roblox\]',
        r'\(roblox\)',
        r'roblox',
        r'#roblox',
        r'#solohunters',
        r'#sololeveling',
        r'🔥',
        r'💀',
        r'😱',
        r'😮',
        r'😎',
        r'\[open beta\]',
        r'\(open beta\)',
    ]

    for pattern in noise_patterns:
        title_lower = re.sub(pattern, '', title_lower, flags=re.IGNORECASE)

    # 清理多余空格
    title_lower = ' '.join(title_lower.split())

    return title_lower

def extract_keywords(title):
    """从标题中提取关键词短语"""
    title_clean = clean_title(title)

    keywords = []

    # 定义关键词模式 (更宽松的匹配)
    patterns = {
        # 指南类
        'beginner guide': r'beginner[\'s]?\s+guide',
        'complete guide': r'complete\s+guide',
        'ultimate guide': r'ultimate\s+guide',
        'full guide': r'full\s+guide',
        'guide': r'\bguide\b',

        # 代码类
        'codes': r'\bcodes?\b',
        'all codes': r'all\s+(?:working\s+)?codes?',
        'new codes': r'new\s+codes?',
        'working codes': r'working\s+codes?',

        # 职业/构建类
        'best class': r'best\s+class(?:es)?',
        'best build': r'best\s+build',
        'meta build': r'meta\s+build',
        'tank build': r'tank\s+build',
        'melee build': r'melee\s+(?:tank\s+)?build',

        # 游戏机制
        'enchanting': r'enchant(?:ing)?',
        'how to enchant': r'how\s+to\s+enchant',
        'stats': r'\bstats?\b',
        'stat guide': r'stats?\s+guide',
        'upgrade stats': r'upgrade\s+stats?',
        'reroll': r'reroll',

        # 进度类
        'fast progression': r'fast\s+progression',
        'level up fast': r'level(?:\s+up)?\s+fast',
        'leveling': r'leveling',
        'noob to pro': r'noob\s+to\s+pro',

        # 内容类
        'best power': r'best\s+(?:beginner\s+)?power',
        'weapons': r'weapons?',
        'classes': r'classes?',
        'bosses': r'boss(?:es)?',
        'titles': r'titles?',

        # 游戏模式
        'open beta': r'open\s+beta',
        'beta': r'\bbeta\b',
        'gameplay': r'gameplay',
        'showcase': r'showcase',

        # 脚本/作弊
        'script': r'\bscript\b',
        'auto farm': r'auto\s+farm',

        # 其他
        'tips': r'\btips\b',
        'tricks': r'tricks',
        'how to play': r'how\s+to\s+play',
        'getting started': r'getting\s+started',
        'tier list': r'tier\s+list',
    }

    for keyword, pattern in patterns.items():
        if re.search(pattern, title_clean):
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

# 筛选出包含 "solo hunters" 的视频
solo_hunters_videos = []
for video in all_videos:
    title_lower = video['title'].lower()
    if 'solo hunters' in title_lower or 'solo hunter' in title_lower:
        # 排除 KPop Demon Hunters
        if 'kpop' not in title_lower and 'demon hunters' not in title_lower:
            solo_hunters_videos.append(video)

# 按观看次数排序
solo_hunters_videos.sort(key=lambda x: x['views'], reverse=True)

# 选取前80名 (如果不足80个就全部选取)
top_videos = solo_hunters_videos[:min(80, len(solo_hunters_videos))]

# 提取关键词
keyword_stats = defaultdict(lambda: {'count': 0, 'max_views': 0, 'titles': []})

output_lines = []
output_lines.append(f"Solo Hunters 相关视频总数: {len(solo_hunters_videos)}")
output_lines.append(f"选取前 {len(top_videos)} 个视频")
output_lines.append("=" * 100)
output_lines.append("")

for i, video in enumerate(top_videos, 1):
    title = video['title']
    views = video['views']
    keywords = extract_keywords(title)

    output_lines.append(f"{i}. [{views:,} views] {title}")
    if keywords:
        output_lines.append(f"   关键词: {', '.join(keywords)}")
        for kw in keywords:
            keyword_stats[kw]['count'] += 1
            keyword_stats[kw]['max_views'] = max(keyword_stats[kw]['max_views'], views)
            if len(keyword_stats[kw]['titles']) < 3:
                keyword_stats[kw]['titles'].append(title[:100])
    output_lines.append("")

# 按最高观看次数排序关键词
sorted_keywords = sorted(keyword_stats.items(), key=lambda x: x[1]['max_views'], reverse=True)

output_lines.append("\n" + "=" * 100)
output_lines.append("关键词统计 (按最高观看次数排序):")
output_lines.append("=" * 100)
output_lines.append("")

for kw, data in sorted_keywords:
    output_lines.append(f"{kw}")
    output_lines.append(f"  出现次数: {data['count']}")
    output_lines.append(f"  最高观看: {data['max_views']:,}")
    output_lines.append(f"  示例标题:")
    for title in data['titles']:
        output_lines.append(f"    - {title}")
    output_lines.append("")

# 保存结果
with open(r'D:\web\0125solo hunters\tools\solo_hunters_keywords.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output_lines))

# 生成用于添加到关键词分类的列表
output_lines.append("\n" + "=" * 100)
output_lines.append("用于添加到关键词分类.md的关键词列表 (Priority 2):")
output_lines.append("=" * 100)
output_lines.append("")

unique_keywords = []
for kw, data in sorted_keywords:
    # 合并同义词
    if kw not in unique_keywords:
        unique_keywords.append(f"solo hunters {kw}")

output_lines.append(f"总计 {len(unique_keywords)} 个关键词:")
output_lines.append("")
for i, kw in enumerate(unique_keywords, 1):
    output_lines.append(f"{i}. {kw} - Priority 2")

# 更新文件
with open(r'D:\web\0125solo hunters\tools\solo_hunters_keywords.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output_lines))

print(f"分析完成!")
print(f"Solo Hunters 相关视频: {len(solo_hunters_videos)} 个")
print(f"选取前 {len(top_videos)} 个视频")
print(f"提取关键词: {len(unique_keywords)} 个")
print(f"结果已保存到: tools/solo_hunters_keywords.txt")
