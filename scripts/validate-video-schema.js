#!/usr/bin/env node

/**
 * 视频元数据验证脚本
 * 扫描所有 MDX 文件并验证视频元数据的完整性
 *
 * 用法：node scripts/validate-video-schema.js
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 验证 ISO 8601 时长格式
function isValidISO8601Duration(duration) {
  const regex = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/
  return regex.test(duration)
}

// 验证 ISO 8601 日期格式
function isValidISO8601Date(date) {
  const regex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/
  return regex.test(date)
}

// 验证视频元数据
function validateVideoMetadata(video, filePath) {
  const errors = []

  if (!video.youtubeId) {
    errors.push(`缺少 youtubeId`)
  }

  if (!video.title) {
    errors.push(`缺少 title`)
  }

  if (!video.description) {
    errors.push(`缺少 description`)
  }

  if (!video.duration) {
    errors.push(`缺少 duration`)
  } else if (!isValidISO8601Duration(video.duration)) {
    errors.push(`duration 格式不正确：${video.duration}，应为 ISO 8601 格式（如 PT1M30S）`)
  }

  if (!video.uploadDate) {
    errors.push(`缺少 uploadDate`)
  } else if (!isValidISO8601Date(video.uploadDate)) {
    errors.push(`uploadDate 格式不正确：${video.uploadDate}，应为 ISO 8601 日期格式（YYYY-MM-DD）`)
  }

  return {
    filePath,
    valid: errors.length === 0,
    errors
  }
}

// 扫描目录
async function scanDirectory(dir, basePath = [], results = []) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        await scanDirectory(fullPath, [...basePath, entry.name], results)
      } else if (entry.name.endsWith('.mdx')) {
        const fileContent = await fs.readFile(fullPath, 'utf8')
        const { data } = matter(fileContent)

        // 检查是否有视频元数据且已启用
        if (data.video && data.video.enabled) {
          const relativePath = [...basePath, entry.name].join('/')
          const validation = validateVideoMetadata(data.video, relativePath)
          results.push(validation)
        }
      }
    }
  } catch (error) {
    console.error(`扫描目录 ${dir} 时出错:`, error.message)
  }

  return results
}

// 主函数
async function main() {
  console.log('🔍 开始验证视频元数据...\n')

  const contentDir = path.join(__dirname, '../src/content')
  const results = await scanDirectory(contentDir)

  if (results.length === 0) {
    console.log('⚠️  未找到包含视频元数据的文件\n')
    return
  }

  const validFiles = results.filter(r => r.valid)
  const invalidFiles = results.filter(r => !r.valid)

  console.log(`📊 验证结果：`)
  console.log(`   总计: ${results.length} 个文件`)
  console.log(`   ✅ 有效: ${validFiles.length}`)
  console.log(`   ❌ 无效: ${invalidFiles.length}\n`)

  if (validFiles.length > 0) {
    console.log('✅ 有效的视频元数据文件：')
    validFiles.forEach(({ filePath }) => {
      console.log(`   - ${filePath}`)
    })
    console.log('')
  }

  if (invalidFiles.length > 0) {
    console.log('❌ 无效的视频元数据文件：\n')
    invalidFiles.forEach(({ filePath, errors }) => {
      console.log(`   📄 ${filePath}`)
      errors.forEach(error => {
        console.log(`      - ${error}`)
      })
      console.log('')
    })

    process.exit(1)
  } else {
    console.log('🎉 所有视频元数据验证通过！\n')
  }
}

main().catch(error => {
  console.error('❌ 验证过程中发生错误:', error)
  process.exit(1)
})
