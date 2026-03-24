'use client';

import { useEffect, useRef, useState } from 'react';

interface SocialBarProps {
  className?: string;
  /**
   * 广告位 ID，用于区分不同页面的不同广告位
   * 每个广告位需要从 Adsterra 后台单独申请
   */
  adKey?: string;
}

/**
 * Social Bar 广告组件
 *
 * 核心特点：
 * - 使用 JavaScript 脚本动态生成 DOM
 * - Adsterra 脚本自动检测容器并生成适配的广告内容
 * - 客户端专用渲染，避免 SSR Hydration 问题
 *
 * 工作流程：
 * 1. React 渲染组件 → 提供容器
 * 2. useEffect 执行 → 创建并插入 Adsterra 脚本
 * 3. Adsterra 脚本加载 → 检测容器
 * 4. 动态生成 DOM → 广告内容插入到容器中
 */
export function SocialBar({ className = '', adKey }: SocialBarProps) {
  // 客户端渲染标志
  const [isClient, setIsClient] = useState(false);

  // 从环境变量读取默认 Key
  const defaultKey = process.env.NEXT_PUBLIC_ADSTERRA_SOCIAL_BAR_KEY;
  const effectiveKey = adKey || defaultKey;

  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  // 第一步：确保只在客户端渲染
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 第二步：在客户端加载广告脚本
  useEffect(() => {
    // 只在客户端执行
    if (!isClient || !effectiveKey || scriptLoadedRef.current) return;

    // 保存 ref 到局部变量，避免 cleanup 函数中的警告
    const container = containerRef.current;
    if (!container) return;

    // 调试日志
    console.log('[SocialBar] Loading ad script...');
    console.log('[SocialBar] effectiveKey:', effectiveKey);

    // 使用真实的 Adsterra 脚本 URL
    const scriptUrl = `https://pl28481201.effectivegatecpm.com/${effectiveKey}/invoke.js`;

    // 创建 script 标签
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.setAttribute('data-cfasync', 'false');

    // 添加错误处理
    script.onerror = () => {
      console.error('[SocialBar] Failed to load ad script:', scriptUrl);
    };

    script.onload = () => {
      console.log('[SocialBar] Ad script loaded successfully');
    };

    // 插入 script 到容器中
    container.appendChild(script);
    scriptLoadedRef.current = true;

    // 清理函数
    return () => {
      if (container && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      scriptLoadedRef.current = false;
    };
  }, [isClient, effectiveKey]);

  // 如果没有 Key 或不在客户端，不渲染
  if (!isClient || !effectiveKey) {
    return null;
  }

  return (
    <div className={className} ref={containerRef}>
      {/* Adsterra 脚本会在这个容器中动态生成广告内容 */}
      <div id={`container-${effectiveKey}`} />
    </div>
  );
}
