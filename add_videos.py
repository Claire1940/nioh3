import json
import os
import re
from pathlib import Path

# Read articles and videos
with open('tools/articles/modules/generation/内页.json', 'r', encoding='utf-8') as f:
    articles = json.load(f)

with open('tools/articles/modules/generation/video_metadata_cache.json', 'r', encoding='utf-8') as f:
    videos = json.load(f)

# Convert videos to list
video_list = list(videos.values())

# Get Priority 1 and 2 articles
priority_articles = [a for a in articles if a['Priority'] in [1, 2]]

print("Found {} Priority 1 and 2 articles".format(len(priority_articles)))
print("Found {} videos".format(len(video_list)))

# Create mapping
article_video_mapping = {}

for article in priority_articles:
    keyword = article['Keyword'].lower()
    title = article['Article Title'].lower()
    url_path = article['URL Path'].lower()
    
    search_terms = [
        keyword,
        article['Keyword'].split()[0],
        article['Article Title'].split(':')[0].strip(),
    ]
    
    best_match = None
    best_score = 0
    
    for video in video_list:
        video_title = video.get('title', '').lower()
        video_desc = video.get('description', '').lower()
        
        score = 0
        
        for term in search_terms:
            if term and len(term) > 2:
                if term in video_title:
                    score += 10
                if term in video_desc:
                    score += 5
        
        # Filter out music/audio only videos unless context is music
        if any(music_word in video_title for music_word in ['music', 'theme', 'ost', 'soundtrack']):
            if not any(context in title for context in ['combo', 'guide', 'tutorial', 'training', 'gameplay']):
                score -= 30
        
        if score > best_score:
            best_score = score
            best_match = video
    
    # Default video if no good match
    if not best_match or best_score < 0:
        # Use gameplay or guide videos by default
        for v in video_list:
            v_title = v.get('title', '').lower()
            if any(word in v_title for word in ['gameplay', 'guide', 'tutorial', 'beginner']):
                best_match = v
                best_score = -1
                break
        if not best_match:
            best_match = video_list[0]
    
    article_video_mapping[article['URL Path']] = {
        'article': article,
        'video': best_match,
        'match_score': best_score
    }
    
    print("[{}] {} -> {}".format(best_score, article['Keyword'], best_match.get('title', 'N/A')[:70]))

# Save mapping
output = {}
for url, data in article_video_mapping.items():
    output[url] = {
        'keyword': data['article']['Keyword'],
        'title': data['article']['Article Title'],
        'youtubeId': data['video'].get('youtubeId') if data['video'] else None,
        'videoTitle': data['video'].get('title') if data['video'] else None,
        'match_score': data['match_score']
    }

with open('article_video_mapping.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print("\nMapping saved to article_video_mapping.json")
