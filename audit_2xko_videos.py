#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import sys
import io

# Set UTF-8 output
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Read video metadata cache
with open('tools/articles/modules/generation/video_metadata_cache.json', 'r', encoding='utf-8') as f:
    video_cache = json.load(f)

# Classification results
xko_videos = {}
non_xko_videos = {}
music_videos = {}
unclear_videos = {}

# Keywords to exclude
exclude_keywords = [
    'apogea', 'APOGEA', 'Apogea',
    'fatal fury', 'FATAL FURY',
    'gbvsr',
    'brawlhalla',
]

# Keywords indicating 2xko content
xko_keywords = ['2xko', '2XKO', '2X', 'caitlyn']

# Keywords indicating music/theme videos
music_keywords = ['theme', 'Theme', 'ost', 'OST', 'music', 'Music', 'soundtrack']

for video_id, video_data in video_cache.items():
    title = video_data.get('title', '')
    description = video_data.get('description', '')
    full_text = f"{title} {description}"

    # Check if non-2xko content
    is_non_xko = any(keyword.lower() in full_text.lower() for keyword in exclude_keywords)

    if is_non_xko:
        non_xko_videos[video_id] = video_data
        continue

    # Check if contains 2xko keywords
    has_xko_keyword = any(kw.lower() in full_text.lower() for kw in xko_keywords)

    # Check if music video
    is_music = any(mk.lower() in full_text.lower() for mk in music_keywords)

    if has_xko_keyword:
        if is_music:
            music_videos[video_id] = video_data
        else:
            xko_videos[video_id] = video_data
    else:
        # Check if mentions 2xko characters
        xko_characters = ['warwick', 'ekko', 'yasuo', 'vi', 'jinx', 'braum',
                          'blitzcrank', 'ahri', 'illaoi', 'teemo', 'darius']
        has_character = any(char.lower() in full_text.lower() for char in xko_characters)

        if has_character and not is_music:
            unclear_videos[video_id] = video_data
        else:
            non_xko_videos[video_id] = video_data

# Print results
print("")
print("=== 2XKO Video Audit Results ===")
print("")
print(f"Confirmed 2xko videos: {len(xko_videos)}")
print(f"2xko music/theme videos: {len(music_videos)}")
print(f"Unclear videos (characters but no 2xko keyword): {len(unclear_videos)}")
print(f"Non-2xko videos: {len(non_xko_videos)}")
print(f"Total: {len(video_cache)}")
print("")

# Show non-2xko videos
print("=== Non-2xko Videos (Must Remove) ===")
non_xko_list = sorted(list(non_xko_videos.items()), key=lambda x: x[1].get('title', ''))
for vid_id, vid_data in non_xko_list:
    title_safe = vid_data.get('title', 'N/A')[:60]
    print(f"  {vid_id}: {title_safe}")

# Show unclear videos (sample)
print("")
print(f"=== Unclear Videos (Sample, First 10 of {len(unclear_videos)}) ===")
for vid_id, vid_data in list(unclear_videos.items())[:10]:
    title_safe = vid_data.get('title', 'N/A')[:60]
    print(f"  {vid_id}: {title_safe}")

# Show music videos
print("")
print(f"=== 2xko Music/Theme Videos ===")
for vid_id, vid_data in music_videos.items():
    title_safe = vid_data.get('title', 'N/A')[:60]
    print(f"  {vid_id}: {title_safe}")

# Save approved 2xko videos (explicit + unclear)
approved_videos = {**xko_videos, **unclear_videos}

with open('tools/articles/modules/generation/approved_2xko_videos.json', 'w', encoding='utf-8') as f:
    json.dump(approved_videos, f, ensure_ascii=False, indent=2)

with open('tools/articles/modules/generation/non_2xko_videos.json', 'w', encoding='utf-8') as f:
    json.dump(non_xko_videos, f, ensure_ascii=False, indent=2)

with open('tools/articles/modules/generation/2xko_music_videos.json', 'w', encoding='utf-8') as f:
    json.dump(music_videos, f, ensure_ascii=False, indent=2)

print("")
print(f"Saved {len(approved_videos)} approved 2xko videos")
print(f"Saved {len(non_xko_videos)} non-2xko videos")
print(f"Saved {len(music_videos)} music/theme videos")
