import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // 匹配所有路径,除了以下这些：
  matcher: [
    // 排除所有内部路径 (_next)、API路由、静态文件
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // 包含根路径
    '/',
    // 包含所有带语言前缀的路径 (8 languages: en, ru, ja, es, pt, de, fr, ko)
    '/(en|ru|ja|es|pt|de|fr|ko)/:path*'
  ]
};
