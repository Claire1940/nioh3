"use client";

import { useState, useEffect } from "react";
import { AdBanner } from "./AdBanner";

interface ResponsiveAdBannerProps {
  mobileType?: "banner-320x50" | "banner-468x60";
  desktopType?: "banner-728x90" | "banner-468x60";
  className?: string;
}

/**
 * 响应式广告横幅组件
 *
 * 根据屏幕宽度自动切换广告尺寸：
 * - 移动端（< 768px）：显示 320x50 或 468x60
 * - 桌面端（>= 768px）：显示 728x90 或 468x60
 *
 * 使用示例：
 * <ResponsiveAdBanner /> // 默认：移动端 320x50，桌面端 728x90
 * <ResponsiveAdBanner mobileType="banner-468x60" desktopType="banner-468x60" />
 */
export function ResponsiveAdBanner({
  mobileType = "banner-320x50",
  desktopType = "banner-728x90",
  className = ""
}: ResponsiveAdBannerProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // 初始检查
    checkMobile();

    // 监听窗口大小变化
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 服务端渲染时不显示，避免 hydration 问题
  if (!isClient) {
    return null;
  }

  return (
    <AdBanner
      type={isMobile ? mobileType : desktopType}
      className={className}
    />
  );
}
