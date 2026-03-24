#!/usr/bin/env node

/**
 * 验证所有文章中的代码有效性
 * - YouTube视频ID
 * - 外部链接
 * - 内部引用链接
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const CONTENT_DIR = path.join(__dirname, '../src/content/en');
const REPORT_FILE = path.join(__dirname, '../validation-report.json');

// 验证结果存储
const validationResults = {
  timestamp: new Date().toISOString(),
  totalFiles: 0,
  filesWithErrors: 0,
  errors: [],
  warnings: [],
  youtubeStats: {
    total: 0,
    valid: 0,
    invalid: 0,
    videos: {}
  },
  linkStats: {
    total: 0,
    internal: 0,
    external: 0,
    checked: 0
  }
};

/**
 * 验证YouTube视频ID格式
 */
function validateYoutubeId(id) {
  // YouTube ID通常是11个字符，包含字母、数字、-和_
  const youtubeIdRegex = /^[a-zA-Z0-9_-]{11}$/;
  return youtubeIdRegex.test(id);
}

/**
 * 提取MDX文件中的所有链接
 */
function extractLinks(content) {
  const links = {
    internal: [],
    external: [],
    youtube: []
  };

  // 匹配markdown链接 [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = markdownLinkRegex.exec(content)) !== null) {
    const url = match[2];
    if (url.startsWith('http')) {
      links.external.push(url);
    } else if (url.startsWith('/')) {
      links.internal.push(url);
    }
  }

  // 匹配YouTube嵌入
  const youtubeRegex = /youtubeId:\s*["']?([a-zA-Z0-9_-]+)["']?/g;
  while ((match = youtubeRegex.exec(content)) !== null) {
    links.youtube.push(match[1]);
  }

  // 匹配iframe src
  const iframeRegex = /src=["'](https?:\/\/[^"']+)["']/g;
  while ((match = iframeRegex.exec(content)) !== null) {
    links.external.push(match[1]);
  }

  return links;
}

/**
 * 处理单个MDX文件
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content: markdown } = matter(content);

    const fileErrors = [];

    // 检查YouTube视频ID
    if (frontmatter.video && frontmatter.video.youtubeId) {
      const youtubeId = frontmatter.video.youtubeId;
      validationResults.youtubeStats.total++;

      if (validateYoutubeId(youtubeId)) {
        validationResults.youtubeStats.valid++;
        validationResults.youtubeStats.videos[youtubeId] = {
          status: 'valid',
          file: path.relative(CONTENT_DIR, filePath),
          title: frontmatter.title
        };
      } else {
        validationResults.youtubeStats.invalid++;
        fileErrors.push({
          type: 'INVALID_YOUTUBE_ID',
          youtubeId,
          title: frontmatter.title,
          file: path.relative(CONTENT_DIR, filePath)
        });
        validationResults.youtubeStats.videos[youtubeId] = {
          status: 'invalid',
          file: path.relative(CONTENT_DIR, filePath),
          title: frontmatter.title
        };
      }
    }

    // 提取并统计链接
    const links = extractLinks(content);
    validationResults.linkStats.internal += links.internal.length;
    validationResults.linkStats.external += links.external.length;
    validationResults.linkStats.total +=
      links.internal.length + links.external.length + links.youtube.length;

    // 检查frontmatter字段完整性
    const requiredFields = ['title', 'description', 'keywords', 'canonical'];
    const missingFields = requiredFields.filter(field => !frontmatter[field]);

    if (missingFields.length > 0) {
      fileErrors.push({
        type: 'MISSING_FRONTMATTER',
        fields: missingFields,
        file: path.relative(CONTENT_DIR, filePath),
        title: frontmatter.title
      });
    }

    // 记录错误
    if (fileErrors.length > 0) {
      validationResults.filesWithErrors++;
      validationResults.errors.push(...fileErrors);
    }

    return {
      success: true,
      errors: fileErrors,
      links: links
    };
  } catch (error) {
    validationResults.errors.push({
      type: 'FILE_ERROR',
      message: error.message,
      file: path.relative(CONTENT_DIR, filePath)
    });
    validationResults.filesWithErrors++;
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 递归处理目录中的所有MDX文件
 */
function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      validationResults.totalFiles++;
      processFile(fullPath);
    }
  }
}

/**
 * 生成报告摘要
 */
function generateSummary() {
  return {
    summary: {
      totalFiles: validationResults.totalFiles,
      filesWithErrors: validationResults.filesWithErrors,
      errorRate: ((validationResults.filesWithErrors / validationResults.totalFiles) * 100).toFixed(2) + '%',
      totalErrors: validationResults.errors.length,
      totalWarnings: validationResults.warnings.length
    },
    youtubeValidation: {
      total: validationResults.youtubeStats.total,
      valid: validationResults.youtubeStats.valid,
      invalid: validationResults.youtubeStats.invalid,
      validationRate: validationResults.youtubeStats.total > 0
        ? ((validationResults.youtubeStats.valid / validationResults.youtubeStats.total) * 100).toFixed(2) + '%'
        : 'N/A'
    },
    linkStats: validationResults.linkStats,
    errorsByType: groupErrorsByType(validationResults.errors)
  };
}

/**
 * 按类型分组错误
 */
function groupErrorsByType(errors) {
  const grouped = {};

  for (const error of errors) {
    const type = error.type || 'UNKNOWN';
    if (!grouped[type]) {
      grouped[type] = [];
    }
    grouped[type].push(error);
  }

  return grouped;
}

/**
 * 主程序
 */
async function main() {
  console.log('🔍 开始验证所有文章...\n');

  processDirectory(CONTENT_DIR);

  const summary = generateSummary();

  // 输出到控制台
  console.log('📊 验证报告摘要:');
  console.log('================');
  console.log(`总文件数: ${summary.summary.totalFiles}`);
  console.log(`有错误的文件: ${summary.summary.filesWithErrors}`);
  console.log(`错误率: ${summary.summary.errorRate}`);
  console.log(`总错误数: ${summary.summary.totalErrors}`);
  console.log('');

  console.log('🎥 YouTube视频验证:');
  console.log('==================');
  console.log(`总视频数: ${summary.youtubeValidation.total}`);
  console.log(`有效视频: ${summary.youtubeValidation.valid}`);
  console.log(`无效视频: ${summary.youtubeValidation.invalid}`);
  console.log(`有效率: ${summary.youtubeValidation.validationRate}`);
  console.log('');

  console.log('🔗 链接统计:');
  console.log('===========');
  console.log(`总链接数: ${summary.linkStats.total}`);
  console.log(`内部链接: ${summary.linkStats.internal}`);
  console.log(`外部链接: ${summary.linkStats.external}`);
  console.log('');

  if (Object.keys(summary.errorsByType).length > 0) {
    console.log('❌ 按类型分类的错误:');
    console.log('===================');
    for (const [type, errors] of Object.entries(summary.errorsByType)) {
      console.log(`${type}: ${errors.length} 个错误`);
      errors.slice(0, 3).forEach(error => {
        console.log(`  - ${error.file}: ${error.message || error.youtubeId || error.fields?.join(', ')}`);
      });
      if (errors.length > 3) {
        console.log(`  ... 还有 ${errors.length - 3} 个错误`);
      }
    }
  }

  // 保存完整报告到JSON文件
  const fullReport = {
    ...validationResults,
    summary,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(fullReport, null, 2), 'utf8');
  console.log(`\n✅ 完整报告已保存到: ${REPORT_FILE}`);

  return validationResults;
}

// 执行
main().catch(error => {
  console.error('❌ 验证过程出错:', error);
  process.exit(1);
});
