#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Create better video assignment with improved keyword matching
"""
import json
import sys
import io
import re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Load data
with open('tools/articles/modules/generation/approved_2xko_videos.json', 'r', encoding='utf-8') as f:
    approved_videos = json.load(f)

with open('tools/articles/modules/generation/内页.json', 'r', encoding='utf-8') as f:
    articles_data = json.load(f)

# Filter Priority 1 and 2 articles
priority_articles = [item for item in articles_data if item.get('Priority') in [1, 2]]

print("")
print("=== Creating Better Video Assignment ===")
print("")

# Define keyword categories for videos
def categorize_video(video_id, video_data):
    title = (video_data.get('title', '') + ' ' + video_data.get('description', '')).lower()

    categories = {
        'combo': 'combo' in title or 'link' in title or 'sequence' in title,
        'frame_data': 'frame' in title or 'data' in title or 'startup' in title,
        'tutorial': 'tutorial' in title or 'learn' in title or 'guide' in title or 'beginner' in title or 'how to' in title,
        'tier_list': 'tier' in title or 'ranking' in title or 'meta' in title,
        'character': 'character' in title or 'guide' in title or 'breakdown' in title,
        'gameplay': 'gameplay' in title or 'fundamentals' in title,
        'console': 'console' in title or 'ps5' in title or 'xbox' in title or 'launch' in title,
        'competitive': 'competitive' in title or 'ranked' in title or 'tournament' in title,
        'trailer': 'trailer' in title or 'reveal' in title or 'reaction' in title,
        'general': True  # Everything is at least general 2xko content
    }

    return categories

# Build video category index
video_categories = {}
for video_id, video_data in approved_videos.items():
    video_categories[video_id] = categorize_video(video_id, video_data)

# Define keyword categories for articles
def categorize_article(article):
    keyword = (article.get('Keyword', '') + ' ' +
               article.get('Article Title', '') + ' ' +
               article.get('URL Path', '')).lower()

    categories = {
        'combo': 'combo' in keyword,
        'frame_data': 'frame' in keyword,
        'tutorial': 'guide' in keyword or 'tutorial' in keyword or 'getting' in keyword or 'beginner' in keyword,
        'tier_list': 'tier' in keyword or 'ranking' in keyword or 'meta' in keyword,
        'character': 'character' in keyword or 'roster' in keyword or 'champion' in keyword or 'blitz' in keyword or 'darius' in keyword or 'ekko' in keyword,
        'gameplay': 'gameplay' in keyword or 'fundamentals' in keyword or 'mechanic' in keyword,
        'console': 'console' in keyword or 'ps5' in keyword or 'xbox' in keyword or 'download' in keyword or 'steam' in keyword,
        'competitive': 'competitive' in keyword or 'ranked' in keyword or 'tournament' in keyword or 'esports' in keyword,
        'trailer': 'trailer' in keyword or 'review' in keyword,
    }

    return categories

# Find best matching video for article
def find_best_video(article):
    article_categories = categorize_article(article)

    best_score = 0
    best_video_id = None

    for video_id, video_cats in video_categories.items():
        score = 0

        # Match on specific categories
        for category in ['combo', 'frame_data', 'tier_list', 'competitive', 'console']:
            if article_categories.get(category) and video_cats.get(category):
                score += 3  # Higher weight for specific matches

        # Match on general categories
        for category in ['tutorial', 'character', 'gameplay', 'trailer']:
            if article_categories.get(category) and video_cats.get(category):
                score += 2

        # If no specific match, all 2xko videos are valid
        if score == 0 and video_cats.get('general'):
            score = 1

        if score > best_score:
            best_score = score
            best_video_id = video_id

    # Fallback (shouldn't happen with 254 videos)
    if best_video_id is None:
        best_video_id = list(approved_videos.keys())[0]

    return best_video_id

# Create assignments
assignment = {}
for article in priority_articles:
    url_path = article.get('URL Path', '').lstrip('/')
    video_id = find_best_video(article)
    assignment[f"/{url_path}"] = video_id

# Save assignment
with open('tools/articles/modules/generation/video_assignment_improved.json', 'w', encoding='utf-8') as f:
    json.dump(assignment, f, indent=2)

print(f"Created {len(assignment)} video assignments")
print(f"Saved to: video_assignment_improved.json")
print("")

# Show sample assignments with video titles
print("=== Sample Assignments (with video titles) ===")
sample_count = 0
for path, video_id in sorted(assignment.items())[:10]:
    video_title = approved_videos[video_id].get('title', 'N/A')[:55]
    print(f"  {path}")
    print(f"    -> {video_title}")
    sample_count += 1

print("")

# Check distribution of video usage
video_usage = {}
for video_id in assignment.values():
    video_usage[video_id] = video_usage.get(video_id, 0) + 1

print(f"=== Video Usage Distribution ===")
print(f"Total unique videos used: {len(video_usage)}")
print(f"Most used video: {max(video_usage, key=video_usage.get)} ({max(video_usage.values())} uses)")
print(f"Least used video: {min(video_usage, key=video_usage.get)} ({min(video_usage.values())} uses)")
