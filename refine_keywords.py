#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import re
from pathlib import Path

def normalize_keyword(kw):
    """规范化关键词"""
    return kw.lower().strip()

def has_containment(kw1, kw2):
    """检查是否存在包含关系: kw1 是否包含 kw2"""
    if len(kw1) <= len(kw2):
        return False
    # 检查kw2是否完全包含在kw1中
    words1 = set(kw1.split())
    words2 = set(kw2.split())
    return words2 < words1  # words2 是 words1 的真子集

def is_garbage_keyword(kw):
    """检查是否是垃圾数据"""
    # 包含管道符
    if '|' in kw:
        return True
    # 包含反斜杠
    if '\\' in kw:
        return True
    # 仅为游戏名
    if kw.lower().strip() == '2xko':
        return True
    # 包含多余的markdown或特殊字符
    if kw.count('|') > 0 or kw.count('[') > 0 or kw.count(']') > 0:
        return True
    return False

def refine_keywords(data):
    """精简关键词"""
    print("开始精简关键词...")

    refined_data = {
        "total": 0,
        "categories": {}
    }

    total_removed = 0

    for category_name, keywords in data['categories'].items():
        print(f"\n处理分类: {category_name} ({len(keywords)} 个关键词)")

        # 1. 移除垃圾数据
        clean_keywords = []
        garbage_count = 0

        for item in keywords:
            kw = item['keyword']
            if is_garbage_keyword(kw):
                garbage_count += 1
            else:
                clean_keywords.append(item)

        print(f"  - 移除垃圾数据: {garbage_count} 个 -> {len(clean_keywords)} 个")
        total_removed += garbage_count

        # 2. 移除包含关系
        filtered = []
        skip_indices = set()

        for i, item1 in enumerate(clean_keywords):
            if i in skip_indices:
                continue

            kw1 = normalize_keyword(item1['keyword'])
            should_skip = False

            for j, item2 in enumerate(clean_keywords):
                if i == j or j in skip_indices:
                    continue

                kw2 = normalize_keyword(item2['keyword'])

                # 如果kw2包含kw1，则kw1是冗余的
                if has_containment(kw2, kw1):
                    should_skip = True
                    break

            if not should_skip:
                filtered.append(item1)
            else:
                skip_indices.add(i)

        containment_removed = len(clean_keywords) - len(filtered)
        print(f"  - 移除包含关系: {containment_removed} 个 -> {len(filtered)} 个")
        total_removed += containment_removed

        # 3. 按搜索量排序（保留高频词）
        filtered.sort(key=lambda x: float(x['volume'].replace('K', '000').replace('M', '000000')), reverse=True)

        # 4. 限制单个分类的关键词数量（按MECE原则，保留高频词）
        # 每个分类的限制数量
        category_limits = {
            "Characters & Cosmetics": 30,
            "Competitive & Esports": 12,
            "Download & Platforms": 15,
            "Game Info & Technical": 15,
            "Gameplay & Strategy": 12,
            "Media & Community": 12,
            "Other": 20,  # Other类别要大幅削减
            "Q&A & Support": 14
        }

        max_per_category = category_limits.get(category_name, 20)
        if len(filtered) > max_per_category:
            filtered = filtered[:max_per_category]
            print(f"  - 限制数量到: {max_per_category} 个")

        refined_data['categories'][category_name] = filtered

    # 计算总数
    total_keywords = sum(len(keywords) for keywords in refined_data['categories'].values())
    refined_data['total'] = total_keywords

    print(f"\n=== 精简结果 ===")
    print(f"原始: {data['total']} 个")
    print(f"移除: {total_removed} 个")
    print(f"精简后: {total_keywords} 个")

    # 显示各分类统计
    print(f"\n=== 各分类统计 ===")
    for category_name, keywords in refined_data['categories'].items():
        print(f"{category_name}: {len(keywords)} 个")

    return refined_data

# 加载原始数据
with open('keywords_optimized.json', 'r', encoding='utf-8') as f:
    original_data = json.load(f)

# 精简
refined_data = refine_keywords(original_data)

# 保存精简后的数据
with open('keywords_refined.json', 'w', encoding='utf-8') as f:
    json.dump(refined_data, f, ensure_ascii=False, indent=2)

print(f"\nKeywords saved to keywords_refined.json")
