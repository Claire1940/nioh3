#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Update all MDX files with corrected 2xko-only videos
"""
import json
import os
import re
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Load data
with open('tools/articles/modules/generation/video_assignment_improved.json', 'r', encoding='utf-8') as f:
    assignment = json.load(f)

with open('tools/articles/modules/generation/approved_2xko_videos.json', 'r', encoding='utf-8') as f:
    approved_videos = json.load(f)

# Path to content directory
content_dir = 'src/content/en'

# Collect all .mdx files that need updating
mdx_files_to_update = []
updated_files = 0
error_files = 0

print("")
print("=== Updating MDX Files with 2xko-Only Videos ===")
print("")

# Find all unique paths in assignment
unique_paths = set(assignment.keys())

for mdx_file in os.walk(content_dir):
    for filename in mdx_file[2]:
        if not filename.endswith('.mdx'):
            continue

        filepath = os.path.join(mdx_file[0], filename)

        # Check if this file matches any assignment path
        for path, video_id in assignment.items():
            # Normalize path for matching
            # Path like "/guides/combos" should match file like "src/content/en/guides/combos.mdx"
            path_parts = path.strip('/').split('/')
            expected_relative_path = os.path.join(*path_parts) + '.mdx'
            file_relative_path = os.path.relpath(filepath, content_dir)

            if file_relative_path == expected_relative_path:
                # This file needs updating
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # Get video data
                    video_data = approved_videos[video_id]

                    # Create new frontmatter with video
                    new_video_section = f"""  enabled: true
  youtubeId: "{video_id}"
  title: "{video_data.get('title', '')}"
  description: "{video_data.get('description', '')}"
  duration: "{video_data.get('duration', 'PT0M0S')}"
  uploadDate: "{video_data.get('uploadDate', '2026-01-22')}\""""

                    # Find and replace frontmatter
                    # Pattern to find frontmatter (with potential blockquotes before it)
                    pattern = r'(^>.*?\n)*^---\s*\n(.*?)\n---\s*\n'

                    def replace_frontmatter(match):
                        blockquotes = match.group(1) or ''
                        frontmatter_content = match.group(2)

                        # Parse YAML-like content
                        lines = frontmatter_content.split('\n')
                        new_lines = []
                        video_added = False

                        for line in lines:
                            if line.startswith('video:'):
                                # Replace entire video section
                                video_added = True
                                new_lines.append('video:')
                                new_lines.append(new_video_section)
                            elif video_added and (line.startswith('  enabled:') or
                                                 line.startswith('  youtubeId:') or
                                                 line.startswith('  title:') or
                                                 line.startswith('  description:') or
                                                 line.startswith('  duration:') or
                                                 line.startswith('  uploadDate:')):
                                # Skip old video lines
                                continue
                            elif video_added and line and not line.startswith(' '):
                                # We've reached next property
                                video_added = False
                                new_lines.append(line)
                            elif not video_added or not line.startswith('  '):
                                new_lines.append(line)

                        # If no video section found, add one before last property
                        if 'video:' not in frontmatter_content:
                            new_lines.insert(-1, 'video:')
                            new_lines.insert(-1, new_video_section)

                        new_frontmatter = '\n'.join(new_lines)
                        return f"{blockquotes}---\n{new_frontmatter}\n---\n"

                    # Apply replacement
                    new_content, count = re.subn(pattern, replace_frontmatter, content, count=1, flags=re.MULTILINE | re.DOTALL)

                    if count > 0:
                        # Write updated content
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(new_content)

                        print(f"[OK] {file_relative_path}")
                        print(f"     Video: {video_data.get('title', '')[:50]}")
                        updated_files += 1
                    else:
                        print(f"[WARN] {file_relative_path} - No frontmatter found")
                        error_files += 1

                except Exception as e:
                    print(f"[ERROR] {file_relative_path} - {str(e)}")
                    error_files += 1

                break

print("")
print(f"=== Update Summary ===")
print(f"Updated: {updated_files} files")
print(f"Errors: {error_files} files")
print(f"Total assignment paths: {len(assignment)}")
