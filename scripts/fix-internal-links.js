#!/usr/bin/env node

/**
 * 修复所有断开的内部链接
 * 将 https://lorwyneclipsed.com/* 转换为相对路径 /*
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const CONTENT_DIR = path.join(__dirname, '../src/content/en');
const LINKS_REPORT_FILE = path.join(__dirname, '../links-validation-report.json');

const fixResults = {
  timestamp: new Date().toISOString(),
  totalFilesProcessed: 0,
  totalFixesApplied: 0,
  filesModified: [],
  errors: []
};

/**
 * 修复单个文件中的所有内部链接
 */
function fixLinksInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // 修复内部链接：将 https://lorwyneclipsed.com/xxx 转换为 /xxx
    // 匹配模式 1: markdown 链接
    content = content.replace(
      /\(https:\/\/lorwyneclipsed\.com(\/[^)]*)\)/g,
      '($1)'
    );

    // 匹配模式 2: 普通文本中的链接（less common）
    content = content.replace(
      /https:\/\/lorwyneclipsed\.com(\/[^\s<>"']+)/g,
      '$1'
    );

    // 检查是否有任何更改
    if (content !== originalContent) {
      const fixes = (originalContent.match(/https:\/\/lorwyneclipsed\.com/g) || []).length;
      fixResults.totalFixesApplied += fixes;
      fixResults.filesModified.push({
        file: path.relative(CONTENT_DIR, filePath),
        fixes: fixes
      });

      // 写回修改后的内容
      fs.writeFileSync(filePath, content, 'utf8');
      return fixes;
    }

    return 0;
  } catch (error) {
    fixResults.errors.push({
      file: path.relative(CONTENT_DIR, filePath),
      error: error.message
    });
    return 0;
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
      fixResults.totalFilesProcessed++;
      fixLinksInFile(fullPath);
    }
  }
}

/**
 * 主程序
 */
function main() {
  console.log('🔧 开始修复断开的内部链接...\n');

  // 检查报告文件是否存在
  if (!fs.existsSync(LINKS_REPORT_FILE)) {
    console.error('❌ 找不到链接验证报告文件。请先运行链接验证脚本。');
    process.exit(1);
  }

  // 处理所有文件
  processDirectory(CONTENT_DIR);

  // 输出结果
  console.log('📊 修复报告:');
  console.log('===========');
  console.log(`处理的文件总数: ${fixResults.totalFilesProcessed}`);
  console.log(`应用的修复总数: ${fixResults.totalFixesApplied}`);
  console.log(`修改的文件数: ${fixResults.filesModified.length}`);
  console.log('');

  if (fixResults.filesModified.length > 0) {
    console.log('✅ 修改的文件:');
    console.log('=============');
    fixResults.filesModified.forEach(item => {
      console.log(`${item.file}: ${item.fixes} 个链接已修复`);
    });
  } else {
    console.log('ℹ️  没有需要修复的链接');
  }

  if (fixResults.errors.length > 0) {
    console.log('\n❌ 处理过程中的错误:');
    console.log('==================');
    fixResults.errors.forEach(item => {
      console.log(`${item.file}: ${item.error}`);
    });
  }

  // 保存修复报告
  const reportFile = path.join(__dirname, '../link-fixes-report.json');
  fs.writeFileSync(reportFile, JSON.stringify(fixResults, null, 2), 'utf8');
  console.log(`\n✅ 修复报告已保存到: ${reportFile}`);

  return fixResults;
}

// 执行
main();
