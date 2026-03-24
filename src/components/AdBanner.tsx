"use client";

import { useState, useEffect } from "react";

interface AdBannerProps {
  type: "banner-468x60" | "banner-300x250" | "banner-728x90" | "banner-160x600" | "banner-320x50" | "banner-160x300" | "banner-300x600";
  className?: string;
}

const AD_CONFIGS = {
  "banner-468x60": { width: 468, height: 60 },
  "banner-300x250": { width: 300, height: 250 },
  "banner-728x90": { width: 728, height: 90 },
  "banner-160x600": { width: 160, height: 600 },
  "banner-320x50": { width: 320, height: 50 },
  "banner-160x300": { width: 160, height: 300 },
  "banner-300x600": { width: 300, height: 600 },
};

// 环境变量映射
const AD_KEY_MAP = {
  "banner-300x250": process.env.NEXT_PUBLIC_ADSTERRA_BANNER_300X250_KEY,
  "banner-468x60": process.env.NEXT_PUBLIC_ADSTERRA_BANNER_468X60_KEY,
  "banner-728x90": process.env.NEXT_PUBLIC_ADSTERRA_BANNER_728X90_KEY,
  "banner-160x600": process.env.NEXT_PUBLIC_ADSTERRA_BANNER_160X600_KEY,
  "banner-320x50": process.env.NEXT_PUBLIC_ADSTERRA_BANNER_320X50_KEY,
  "banner-160x300": process.env.NEXT_PUBLIC_ADSTERRA_BANNER_160X300_KEY,
  "banner-300x600": process.env.NEXT_PUBLIC_ADSTERRA_BANNER_300X600_KEY,
};

/**
 * iframe 横幅广告组件
 *
 * 核心特点：
 * - 使用固定尺寸（width 和 height）
 * - 添加 maxWidth: '100%' 防止小屏幕溢出
 * - 设置 scrolling="no" 禁用滚动条
 * - 使用 flex justify-center 居中对齐
 * - 从环境变量读取广告 Key，Key 为空时不显示
 * - 客户端专用渲染，避免 SSR Hydration 问题
 *
 * 注意事项：
 * - 不要使用 padding-bottom 响应式技巧
 * - 必须使用固定尺寸 + maxWidth 方案
 * - 确保 iframe 内容不会出现滚动条
 */
export function AdBanner({ type, className = "" }: AdBannerProps) {
  // 客户端渲染标志
  const [isClient, setIsClient] = useState(false);

  const config = AD_CONFIGS[type];
  const adKey = AD_KEY_MAP[type];
  const isDev = process.env.NODE_ENV === 'development';

  // 确保只在客户端渲染
  useEffect(() => {
    setIsClient(true);
    console.log(`[AdBanner] ${type}:`, {
      isClient: true,
      hasKey: !!adKey,
      isDev,
      key: adKey ? `${adKey.substring(0, 8)}...` : 'undefined'
    });
  }, [type, adKey, isDev]);

  // 如果不在客户端或没有配置广告 Key，不渲染。
  if (!isClient || !adKey) {
    if (isClient) {
      console.log(`[AdBanner] ${type}: Not rendering (isClient=${isClient}, hasKey=${!!adKey})`);
    }
    return null;
  }

  // 开发模式：显示占位符，避免广告加载阻塞页面
  if (isDev) {
    return (
      <div className={`flex justify-center ${className}`}>
        <div
          style={{
            width: config.width,
            height: config.height,
            maxWidth: "100%",
            border: "2px dashed #666",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#1a1a1a",
            color: "#888",
            fontSize: "12px",
            textAlign: "center",
            padding: "10px",
          }}
        >
          <div>
            <div style={{ marginBottom: "5px" }}>📢 广告位</div>
            <div style={{ fontSize: "10px" }}>{config.width}x{config.height}</div>
            <div style={{ fontSize: "10px", marginTop: "5px", color: "#666" }}>
              (生产环境显示)
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 生产模式：加载真实广告
  const src = `/ads/${type}.html?key=${encodeURIComponent(adKey)}`;

  return (
    <div className={`flex justify-center ${className}`}>
      <iframe
        src={src}
        width={config.width}
        height={config.height}
        style={{
          border: "none",
          maxWidth: "100%",
          display: "block",
        }}
        scrolling="no"
        title={`Adsterra ${type} Banner`}
      />
    </div>
  );
}
