#!/usr/bin/env node

/**
 * 验证所有外部链接的可访问性
 * 使用并发请求检查每个链接的HTTP状态
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const CONTENT_DIR = path.join(__dirname, '../src/content/en');
const LINKS_REPORT_FILE = path.join(__dirname, '../links-validation-report.json');
const MAX_CONCURRENT_REQUESTS = 5;
const REQUEST_TIMEOUT = 10000; // 10秒

// 验证结果存储
const validationResults = {
  timestamp: new Date().toISOString(),
  totalLinks: 0,
  checkedLinks: 0,
  workingLinks: 0,
  brokenLinks: 0,
  redirects: 0,
  errors: [],
  linkDetails: {}
};

/**
 * 使用fetch检查URL的可访问性
 */
async function checkUrl(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    clearTimeout(timeout);

    const statusCode = response.status;
    const finalUrl = response.url;

    if (statusCode >= 200 && statusCode < 300) {
      return {
        status: 'working',
        statusCode,
        finalUrl
      };
    } else if (statusCode >= 300 && statusCode < 400) {
      return {
        status: 'redirect',
        statusCode,
        finalUrl
      };
    } else if (statusCode >= 400) {
      return {
        status: 'broken',
        statusCode,
        finalUrl
      };
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        status: 'timeout',
        error: 'Request timeout'
      };
    }

    return {
      status: 'error',
      error: error.message
    };
  }
}

/**
 * 提取MDX文件中的所有外部链接
 */
function extractExternalLinks(content) {
  const links = new Set();

  // 匹配markdown链接 [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = markdownLinkRegex.exec(content)) !== null) {
    const url = match[2];
    if (url.startsWith('http')) {
      links.add(url);
    }
  }

  // 匹配iframe src
  const iframeRegex = /src=["'](https?:\/\/[^"']+)["']/g;
  while ((match = iframeRegex.exec(content)) !== null) {
    links.add(match[1]);
  }

  return Array.from(links);
}

/**
 * 处理单个MDX文件
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter } = matter(content);

    const links = extractExternalLinks(content);

    return {
      file: path.relative(CONTENT_DIR, filePath),
      title: frontmatter.title,
      links
    };
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
    return null;
  }
}

/**
 * 递归处理目录中的所有MDX文件
 */
function processDirectory(dir) {
  const allLinks = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      allLinks.push(...processDirectory(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      const result = processFile(fullPath);
      if (result) {
        allLinks.push(result);
      }
    }
  }

  return allLinks;
}

/**
 * 异步池：限制并发请求数
 */
async function asyncPool(poolLimit, array, iteratorFn) {
  const results = [];
  const executing = [];

  for (const [index, item] of array.entries()) {
    const p = Promise.resolve().then(() => iteratorFn(item, index));
    results.push(p);

    if (poolLimit <= array.length) {
      executing.push(p);
      p.then(() => executing.splice(executing.indexOf(p), 1));

      if (executing.length >= poolLimit) {
        await Promise.race(executing);
      }
    }
  }

  return Promise.all(results);
}

/**
 * 验证所有链接
 */
async function validateAllLinks(fileResults) {
  // 收集所有唯一的链接
  const uniqueLinks = new Map();

  for (const fileResult of fileResults) {
    for (const link of fileResult.links) {
      if (!uniqueLinks.has(link)) {
        uniqueLinks.set(link, []);
      }
      uniqueLinks.get(link).push({
        file: fileResult.file,
        title: fileResult.title
      });
    }
  }

  validationResults.totalLinks = uniqueLinks.size;

  console.log(`\n📡 开始验证 ${uniqueLinks.size} 个唯一链接...`);
  console.log(`⚙️  并发数: ${MAX_CONCURRENT_REQUESTS}\n`);

  // 验证所有链接
  let processed = 0;
  const results = await asyncPool(
    MAX_CONCURRENT_REQUESTS,
    Array.from(uniqueLinks.entries()),
    async ([url, sources]) => {
      const result = await checkUrl(url);
      processed++;

      // 进度指示
      if (processed % 10 === 0 || processed === uniqueLinks.size) {
        console.log(`✓ 已验证 ${processed}/${uniqueLinks.size} 个链接`);
      }

      validationResults.checkedLinks++;

      // 统计结果
      if (result.status === 'working') {
        validationResults.workingLinks++;
      } else if (result.status === 'redirect') {
        validationResults.redirects++;
      } else if (result.status === 'broken' || result.status === 'error' || result.status === 'timeout') {
        validationResults.brokenLinks++;
        validationResults.errors.push({
          url,
          status: result.status,
          statusCode: result.statusCode,
          error: result.error,
          sources: sources.slice(0, 3) // 只保存前3个源
        });
      }

      // 保存详细信息
      validationResults.linkDetails[url] = {
        status: result.status,
        statusCode: result.statusCode,
        error: result.error,
        finalUrl: result.finalUrl,
        sources: sources
      };

      return { url, result };
    }
  );

  return results;
}

/**
 * 生成报告摘要
 */
function generateSummary() {
  const workingPercentage =
    validationResults.totalLinks > 0
      ? ((validationResults.workingLinks / validationResults.totalLinks) * 100).toFixed(2)
      : 0;

  return {
    summary: {
      totalUniqueLinks: validationResults.totalLinks,
      checkedLinks: validationResults.checkedLinks,
      workingLinks: validationResults.workingLinks,
      brokenLinks: validationResults.brokenLinks,
      redirects: validationResults.redirects,
      workingPercentage: workingPercentage + '%'
    },
    brokenLinks: validationResults.errors
  };
}

/**
 * 主程序
 */
async function main() {
  console.log('🔗 开始提取所有外部链接...\n');

  const fileResults = processDirectory(CONTENT_DIR);

  console.log(`✅ 已提取 ${fileResults.length} 个文件的链接\n`);

  // 验证所有链接
  await validateAllLinks(fileResults);

  const summary = generateSummary();

  // 输出到控制台
  console.log('\n📊 链接验证报告摘要:');
  console.log('====================');
  console.log(`总唯一链接数: ${summary.summary.totalUniqueLinks}`);
  console.log(`已检查链接: ${summary.summary.checkedLinks}`);
  console.log(`正常链接: ${summary.summary.workingLinks}`);
  console.log(`断开链接: ${summary.summary.brokenLinks}`);
  console.log(`重定向: ${summary.summary.redirects}`);
  console.log(`正常率: ${summary.summary.workingPercentage}`);
  console.log('');

  if (summary.brokenLinks.length > 0) {
    console.log('❌ 发现的断开链接:');
    console.log('===================');
    summary.brokenLinks.forEach((link, index) => {
      console.log(`\n${index + 1}. ${link.url}`);
      console.log(`   状态: ${link.status} (${link.statusCode || 'N/A'})`);
      if (link.error) {
        console.log(`   错误: ${link.error}`);
      }
      if (link.sources && link.sources.length > 0) {
        console.log(`   出现在文件:`);
        link.sources.forEach(source => {
          console.log(`   - ${source.file} (${source.title})`);
        });
      }
    });
  } else {
    console.log('✅ 所有链接都正常!');
  }

  // 保存完整报告到JSON文件
  const fullReport = {
    ...validationResults,
    summary,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(LINKS_REPORT_FILE, JSON.stringify(fullReport, null, 2), 'utf8');
  console.log(`\n✅ 完整报告已保存到: ${LINKS_REPORT_FILE}`);

  return validationResults;
}

// 执行
main().catch(error => {
  console.error('❌ 验证过程出错:', error);
  process.exit(1);
});
