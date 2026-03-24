#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Create video assignment mapping using ONLY approved 2xko videos
"""
import json
import sys
import io
from collections import defaultdict

# Set UTF-8 output
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Load data
with open('tools/articles/modules/generation/approved_2xko_videos.json', 'r', encoding='utf-8') as f:
    approved_videos = json.load(f)

with open('tools/articles/modules/generation/内页.json', 'r', encoding='utf-8') as f:
    articles_data = json.load(f)

# Filter Priority 1 and 2 articles
priority_articles = [item for item in articles_data if item.get('Priority') in [1, 2]]

print("")
print("=== Creating 2xko Video Assignment ===")
print(f"Approved 2xko videos: {len(approved_videos)}")
print(f"Target articles (Priority 1 & 2): {len(priority_articles)}")
print("")

# Video assignment mapping
assignment = {}

# Create keyword index for videos
video_keywords = defaultdict(list)
for video_id, video_data in approved_videos.items():
    title_lower = video_data.get('title', '').lower()
    description_lower = video_data.get('description', '').lower()
    full_text = f"{title_lower} {description_lower}"

    # Extract keywords from video
    keywords = []
    if 'combo' in full_text:
        keywords.append('combo')
    if 'frame' in full_text or 'frame data' in full_text:
        keywords.append('frame data')
    if 'beginner' in full_text or 'guide' in full_text or 'tutorial' in full_text:
        keywords.append('tutorial')
    if 'tier' in full_text or 'ranking' in full_text:
        keywords.append('tier')
    if 'character' in full_text or 'champion' in full_text:
        keywords.append('character')
    if 'console' in full_text or 'ps5' in full_text or 'xbox' in full_text:
        keywords.append('platform')
    if 'download' in full_text or 'install' in full_text:
        keywords.append('download')
    if 'gameplay' in full_text or 'fundamentals' in full_text:
        keywords.append('gameplay')
    if 'training' in full_text or 'practice' in full_text:
        keywords.append('training')
    if 'skin' in full_text or 'costume' in full_text:
        keywords.append('skin')
    if 'competitive' in full_text or 'ranked' in full_text or 'tournament' in full_text:
        keywords.append('competitive')

    # Store video with its keywords
    video_keywords[video_id] = {
        'keywords': keywords,
        'title': video_data.get('title', ''),
        'data': video_data
    }

# Function to find best matching video for an article
def find_best_video(article):
    keyword = article.get('Keyword', '').lower()
    title = article.get('Article Title', '').lower()
    url_path = article.get('URL Path', '')

    # Determine what type of content this article is about
    article_type = []

    if 'combo' in keyword or 'combo' in title:
        article_type.append('combo')
    if 'frame' in keyword or 'frame data' in title:
        article_type.append('frame data')
    if 'beginner' in keyword or 'tutorial' in title or 'guide' in title or 'getting-started' in url_path:
        article_type.append('tutorial')
    if 'tier' in keyword or 'ranking' in title or 'tier' in url_path:
        article_type.append('tier')
    if 'character' in keyword or 'roster' in url_path or 'skin' in keyword:
        article_type.append('character')
    if 'console' in keyword or 'ps5' in keyword or 'xbox' in keyword or 'download' in url_path:
        article_type.append('platform')
    if 'download' in keyword or 'file size' in keyword:
        article_type.append('download')
    if 'gameplay' in keyword or 'fundamentals' in keyword:
        article_type.append('gameplay')
    if 'training' in keyword or 'practice' in keyword:
        article_type.append('training')
    if 'competitive' in keyword or 'ranked' in keyword or 'tournament' in keyword:
        article_type.append('competitive')

    # Find video with matching keywords
    best_match = None
    best_score = 0

    for video_id, video_info in video_keywords.items():
        video_keywords_set = set(video_info['keywords'])
        article_type_set = set(article_type)

        # Calculate match score
        score = len(video_keywords_set & article_type_set)

        if score > best_score:
            best_score = score
            best_match = (video_id, score)

    # If no keyword match, just pick the first video
    if best_match is None:
        best_match = (list(approved_videos.keys())[0], 0)

    return best_match[0]

# Create assignments
assigned_count = 0
for article in priority_articles:
    url_path = article.get('URL Path', '').lstrip('/')
    video_id = find_best_video(article)
    assignment[f"/{url_path}"] = video_id
    assigned_count += 1

print(f"Created assignments for {assigned_count} articles")
print("")

# Save assignment
with open('tools/articles/modules/generation/video_assignment_2xko_only.json', 'w', encoding='utf-8') as f:
    json.dump(assignment, f, indent=2)

print(f"Saved to: video_assignment_2xko_only.json")
print("")

# Show sample assignments
print("=== Sample Assignments ===")
for i, (path, video_id) in enumerate(list(assignment.items())[:5]):
    video_title = approved_videos[video_id].get('title', 'N/A')[:60]
    print(f"  {path} -> {video_id}")
    print(f"     Video: {video_title}")
