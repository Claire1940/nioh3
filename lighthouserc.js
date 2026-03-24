module.exports = {
  ci: {
    collect: {
      // 测试页面列表
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/codes',
        'http://localhost:3000/tools/codes-tracker',
      ],
      numberOfRuns: 3,
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'Ready in',
      startServerReadyTimeout: 30000,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // 性能分数 ≥ 80 (核心目标)
        'categories:performance': ['error', { minScore: 0.8 }],
        // 可访问性分数 ≥ 90
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        // SEO 分数 ≥ 90
        'categories:seo': ['warn', { minScore: 0.9 }],
        // 最佳实践 ≥ 85
        'categories:best-practices': ['warn', { minScore: 0.85 }],

        // 核心 Web Vitals 阈值
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // LCP ≤ 2.5s
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }], // FCP ≤ 1.8s
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }], // CLS ≤ 0.1
        'total-blocking-time': ['warn', { maxNumericValue: 500 }], // TBT ≤ 500ms

        // 放宽一些常见警告
        'unsized-images': 'off',
        'uses-responsive-images': 'warn',
        'render-blocking-resources': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
