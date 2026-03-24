#!/usr/bin/env python3
"""
为空文章添加基本内容
"""

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

def add_basic_content(filepath, mapping):
    """为空文章添加基本内容"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 检查正文是否为空
    lines = content.split('\n')
    frontmatter_end = 0
    for i, line in enumerate(lines):
        if i > 0 and line.strip() == '---':
            frontmatter_end = i
            break

    body = '\n'.join(lines[frontmatter_end+1:]).strip()

    if len(body) > 50:  # 如果正文不为空，跳过
        return False

    # 获取URL路径
    rel_path = filepath.relative_to(Path("src/content/en"))
    url_path = str(rel_path.with_suffix('')).replace('\\', '/')

    if url_path not in mapping:
        return False

    article_info = mapping[url_path]
    keyword = article_info['keyword']
    title = article_info['title']

    # 生成基本内容
    basic_content = f"""## Introduction to {title}

Welcome to our comprehensive guide on **{keyword}** in Nioh 3. This guide will help you understand everything you need to know about this important aspect of the game.

## Key Features

{title.replace('!', '').replace('?', '')} offers several important features that every player should understand:

- **Essential Information**: Learn the core mechanics and systems
- **Expert Strategies**: Discover proven tactics from experienced players
- **Complete Coverage**: Everything you need in one comprehensive guide
- **Updated Content**: Latest information for the current version of Nioh 3

## Getting Started

Whether you're a beginner or an experienced player, understanding **{keyword}** is crucial for success in Nioh 3. This guide breaks down complex concepts into easy-to-follow steps.

### What You Need to Know

The most important aspects of **{keyword}** include:

1. **Understanding the Basics**: Master the fundamental concepts
2. **Advanced Techniques**: Learn pro-level strategies
3. **Common Mistakes**: Avoid pitfalls that trip up new players
4. **Optimization Tips**: Get the most out of your gameplay

## Detailed Guide

### Core Mechanics

{keyword.title()} in Nioh 3 works through a combination of player skill, game knowledge, and strategic planning. Understanding how these elements work together is key to mastering this aspect of the game.

### Best Practices

To get the most out of **{keyword}**, follow these proven strategies:

- Focus on learning the fundamentals first
- Practice regularly to build muscle memory
- Study successful players and their techniques
- Experiment with different approaches to find what works for you

### Tips and Tricks

Here are some expert tips for **{keyword}** in Nioh 3:

- **Tip 1**: Start with the basics and build from there
- **Tip 2**: Don't rush - take time to understand each concept
- **Tip 3**: Practice in safe environments before challenging content
- **Tip 4**: Learn from your mistakes and adjust your strategy

## Advanced Strategies

Once you've mastered the basics of **{keyword}**, you can move on to more advanced techniques:

### Expert Techniques

Advanced players use these strategies to maximize their effectiveness:

1. Combine multiple techniques for greater impact
2. Adapt your approach based on the situation
3. Optimize your setup for maximum efficiency
4. Stay updated with the latest meta and strategies

### Common Challenges

Players often face these challenges with **{keyword}**:

- **Challenge 1**: Understanding complex mechanics
- **Challenge 2**: Applying knowledge in practice
- **Challenge 3**: Adapting to different situations
- **Challenge 4**: Staying consistent under pressure

## Conclusion

Mastering **{keyword}** in Nioh 3 takes time and practice, but with this guide, you have all the information you need to succeed. Remember to start with the basics, practice regularly, and don't be afraid to experiment with different approaches.

For more Nioh 3 guides and tips, check out our other articles on [builds](/builds), [combat strategies](/combat), and [world exploration](/world).
"""

    # 重建文章
    frontmatter = '\n'.join(lines[:frontmatter_end+1])
    new_content = frontmatter + '\n\n' + basic_content + '\n'

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    return True

def main():
    """主函数"""
    print("[INFO] Loading article mapping...")
    mapping = load_article_mapping()

    empty_articles = [
        "src/content/en/builds/best-armor.mdx",
        "src/content/en/community/discord.mdx",
        "src/content/en/community/gameplay.mdx",
        "src/content/en/community/metacritic.mdx",
        "src/content/en/guides/character-creation.mdx",
        "src/content/en/guides/comparison.mdx",
        "src/content/en/guides/leveling.mdx",
        "src/content/en/guides/new-game-plus.mdx",
        "src/content/en/guides/trophy-guide.mdx",
        "src/content/en/guides/vs-elden-ring.mdx",
        "src/content/en/guides/walkthrough.mdx",
        "src/content/en/lore/characters.mdx",
        "src/content/en/lore/ending.mdx",
        "src/content/en/lore/timeline.mdx",
        "src/content/en/news/deluxe-edition.mdx",
        "src/content/en/news/steelbook.mdx",
        "src/content/en/platforms/demo-review.mdx",
        "src/content/en/platforms/graphics-comparison.mdx",
        "src/content/en/platforms/ps5-pro.mdx",
        "src/content/en/world/all-bosses.mdx",
        "src/content/en/world/all-regions.mdx",
        "src/content/en/world/boss-tier-list.mdx",
        "src/content/en/world/hardest-boss.mdx",
    ]

    print("[INFO] Adding basic content to empty articles...")

    fixed_count = 0
    for filepath in empty_articles:
        path = Path(filepath)
        if path.exists():
            if add_basic_content(path, mapping):
                fixed_count += 1
                print(f"[FIXED] {filepath}")
        else:
            print(f"[SKIP] {filepath} not found")

    print(f"\n[SUMMARY] Added content to {fixed_count} articles")

if __name__ == "__main__":
    main()
