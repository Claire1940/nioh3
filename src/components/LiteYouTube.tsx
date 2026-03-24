'use client';

import { useEffect } from 'react';
import 'lite-youtube-embed/src/lite-yt-embed.css';

interface LiteYouTubeProps {
  videoId: string;
  title: string;
  description?: string;
}

/**
 * 轻量级 YouTube 嵌入组件
 * - 首屏仅加载缩略图 (~20KB vs ~500KB iframe)
 * - 点击时才加载完整播放器
 * - 减少 TBT ~500ms
 */
export function LiteYouTube({ videoId, title, description }: LiteYouTubeProps) {
  useEffect(() => {
    // 动态加载 lite-youtube-embed JS
    if (!customElements.get('lite-youtube')) {
      import('lite-youtube-embed');
    }
  }, []);

  return (
    <div className="bg-gradient-to-br from-[#1C162D] to-[#0D0A16] rounded-lg overflow-hidden border border-gray-700 hover:border-red-500 transition-all">
      <div className="relative aspect-video bg-gray-800">
        {/* @ts-expect-error lite-youtube is a custom element */}
        <lite-youtube
          videoid={videoId}
          playlabel={`Play: ${title}`}
          style={{ backgroundImage: `url('https://i.ytimg.com/vi/${videoId}/hqdefault.jpg')` }}
        />
      </div>
      <div className="p-4">
        <h3 className="text-white font-semibold mb-2 line-clamp-2">
          {title}
        </h3>
        {description && (
          <p className="text-gray-400 text-sm line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
