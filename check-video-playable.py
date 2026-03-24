#!/usr/bin/env python3
"""检查 MDX 文件中的 YouTube 视频是否可以播放"""

import os
import re
import requests
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

def extract_youtube_id(content):
    """从 frontmatter 中提取 youtubeId"""
    match = re.search(r'youtubeId:\s*["\']?([a-zA-Z0-9_-]+)["\']?', content)
    return match.group(1) if match else None

def check_video_exists(video_id):
    """检查 YouTube 视频是否存在且可播放"""
    try:
        # 使用 YouTube oEmbed API 检查视频
        url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
        response = requests.get(url, timeout=10)

        if response.status_code == 200:
            return True, "OK"
        elif response.status_code == 404:
            return False, "视频不存在或已被删除"
        else:
            return False, f"HTTP {response.status_code}"
    except requests.exceptions.Timeout:
        return False, "请求超时"
    except requests.exceptions.RequestException as e:
        return False, f"网络错误: {str(e)}"

def check_mdx_file(file_path):
    """检查单个 MDX 文件中的视频"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        video_id = extract_youtube_id(content)
        if not video_id:
            return None

        is_playable, message = check_video_exists(video_id)

        # 使用简单的字符串替换来获取相对路径
        file_str = str(file_path).replace(str(Path.cwd()) + os.sep, '')

        return {
            'file': file_str,
            'video_id': video_id,
            'playable': is_playable,
            'message': message
        }
    except Exception as e:
        file_str = str(file_path).replace(str(Path.cwd()) + os.sep, '')
        return {
            'file': file_str,
            'video_id': 'N/A',
            'playable': False,
            'message': f"文件读取错误: {str(e)}"
        }

def main():
    content_dir = Path('src/content/en')

    if not content_dir.exists():
        print(f"错误: 目录 {content_dir} 不存在")
        return

    mdx_files = list(content_dir.rglob('*.mdx'))
    print(f"找到 {len(mdx_files)} 个 MDX 文件，开始检查视频...\n")

    results = []
    unplayable_videos = []

    # 使用线程池并发检查视频
    with ThreadPoolExecutor(max_workers=5) as executor:
        future_to_file = {executor.submit(check_mdx_file, f): f for f in mdx_files}

        for i, future in enumerate(as_completed(future_to_file), 1):
            result = future.result()
            if result:
                results.append(result)
                if not result['playable']:
                    unplayable_videos.append(result)

                # 显示进度
                status = "OK" if result['playable'] else "FAIL"
                print(f"[{i}/{len(mdx_files)}] {status} {result['file']}")

            # 避免请求过快
            time.sleep(0.2)

    # 输出统计
    print(f"\n{'='*80}")
    print(f"检查完成！")
    print(f"总共检查: {len(results)} 个视频")
    print(f"可播放: {len(results) - len(unplayable_videos)} 个")
    print(f"不可播放: {len(unplayable_videos)} 个")
    print(f"{'='*80}\n")

    # 输出不可播放的视频详情
    if unplayable_videos:
        print("以下视频无法播放：\n")
        for video in unplayable_videos:
            print(f"文件: {video['file']}")
            print(f"  视频ID: {video['video_id']}")
            print(f"  原因: {video['message']}")
            print(f"  YouTube链接: https://www.youtube.com/watch?v={video['video_id']}")
            print()
    else:
        print("OK - All videos are playable!")

if __name__ == '__main__':
    main()
