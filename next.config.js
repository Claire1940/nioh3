import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["*.preview.same-app.com"],
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Image optimization enabled (removed unoptimized: true)
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: [
      "source.unsplash.com",
      "images.unsplash.com",
      "ext.same-assets.com",
      "ugc.same-assets.com",
      "img.youtube.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ext.same-assets.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ugc.same-assets.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
    ],
  },
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  // URL redirects for old paths
  async redirects() {
    return [
      // English version redirects
      {
        source: '/guides/complete-guide',
        destination: '/guides/walkthrough',
        permanent: true,
      },
      {
        source: '/guides/all-endings',
        destination: '/lore/ending',
        permanent: true,
      },
      {
        source: '/guides/survival-guide',
        destination: '/guides/tips-tricks',
        permanent: true,
      },
      {
        source: '/world/all-monsters',
        destination: '/world/yokai',
        permanent: true,
      },
      {
        source: '/walkthrough/complete-guide',
        destination: '/guides/walkthrough',
        permanent: true,
      },
      {
        source: '/endings/all-endings',
        destination: '/lore/ending',
        permanent: true,
      },
      {
        source: '/survival/night-shift-guide',
        destination: '/guides/tips-tricks',
        permanent: true,
      },
      {
        source: '/game-info/overview',
        destination: '/community/wiki',
        permanent: true,
      },
      {
        source: '/collectibles/hidden-secrets',
        destination: '/guides/secrets',
        permanent: true,
      },
      {
        source: '/creatures/all-monsters',
        destination: '/world/yokai',
        permanent: true,
      },
      {
        source: '/survival/advanced-strategies',
        destination: '/combat/combat-guide',
        permanent: true,
      },
      {
        source: '/game-info/similar-games',
        destination: '/guides/comparison',
        permanent: true,
      },
      {
        source: '/walkthrough/beginner-guide',
        destination: '/guides/beginner-guide',
        permanent: true,
      },

      // Multi-language version redirects (ru, ja, es, pt, de, fr, ko)
      {
        source: '/:locale(ru|ja|es|pt|de|fr|ko)/guides/complete-guide',
        destination: '/:locale/guides/walkthrough',
        permanent: true,
      },
      {
        source: '/:locale(ru|ja|es|pt|de|fr|ko)/guides/all-endings',
        destination: '/:locale/lore/ending',
        permanent: true,
      },
      {
        source: '/:locale(ru|ja|es|pt|de|fr|ko)/guides/survival-guide',
        destination: '/:locale/guides/tips-tricks',
        permanent: true,
      },
      {
        source: '/:locale(ru|ja|es|pt|de|fr|ko)/world/all-monsters',
        destination: '/:locale/world/yokai',
        permanent: true,
      },
      {
        source: '/:locale(ru|ja|es|pt|de|fr|ko)/walkthrough/complete-guide',
        destination: '/:locale/guides/walkthrough',
        permanent: true,
      },
      {
        source: '/:locale(ru|ja|es|pt|de|fr|ko)/endings/all-endings',
        destination: '/:locale/lore/ending',
        permanent: true,
      },
      {
        source: '/:locale(ru|ja|es|pt|de|fr|ko)/survival/night-shift-guide',
        destination: '/:locale/guides/tips-tricks',
        permanent: true,
      },
      {
        source: '/:locale(ru|ja|es|pt|de|fr|ko)/game-info/overview',
        destination: '/:locale/community/wiki',
        permanent: true,
      },
      {
        source: '/:locale(ru|ja|es|pt|de|fr|ko)/collectibles/hidden-secrets',
        destination: '/:locale/guides/secrets',
        permanent: true,
      },
      {
        source: '/:locale(ru|ja|es|pt|de|fr|ko)/creatures/all-monsters',
        destination: '/:locale/world/yokai',
        permanent: true,
      },
      {
        source: '/:locale(ru|ja|es|pt|de|fr|ko)/survival/advanced-strategies',
        destination: '/:locale/combat/combat-guide',
        permanent: true,
      },
      {
        source: '/:locale(ru|ja|es|pt|de|fr|ko)/game-info/similar-games',
        destination: '/:locale/guides/comparison',
        permanent: true,
      },
      {
        source: '/:locale(ru|ja|es|pt|de|fr|ko)/walkthrough/beginner-guide',
        destination: '/:locale/guides/beginner-guide',
        permanent: true,
      },
    ];
  },
  // Cache headers for static assets
  async headers() {
    return [
      {
        // Cache images, fonts, and other static assets for 1 year
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache Next.js static chunks for 1 year
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache public directory assets
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
