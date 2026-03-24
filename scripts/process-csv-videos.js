#!/usr/bin/env node

/**
 * CSV 视频数据批量处理脚本
 * 功能：
 * 1. 读取 CSV 文件
 * 2. 提取 YouTube Video ID
 * 3. 调用 YouTube API 获取描述
 * 4. 转换时长和日期格式
 * 5. 生成 MDX frontmatter
 */

import fs from 'node:fs/promises'
import path from 'node:path'

const CSV_FILE = process.argv[2] || 'tools/articles/youtube_data.csv'
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

if (!YOUTUBE_API_KEY) {
  console.error('❌ 错误: 未设置 YOUTUBE_API_KEY 环境变量')
  console.error('\n获取 API Key: https://console.cloud.google.com/apis/credentials')
  process.exit(1)
}

/**
 * 从 YouTube URL 提取视频 ID
 */
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
    /youtube\.com\/embed\/([^&\s]+)/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

/**
 * 将分钟数转换为 ISO 8601 时长格式
 * 8.59 -> PT8M35S
 */
function minutesToISO8601(minutes) {
  const totalSeconds = Math.round(parseFloat(minutes) * 60)
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60

  return `PT${mins}M${secs}S`
}

/**
 * 解析相对日期为具体日期
 */
function parseRelativeDate(relativeDate) {
  const now = new Date()

  // 匹配 "X天前", "X小时前", "X周前", "X个月前"
  const dayMatch = relativeDate.match(/(\d+)\s*天前/)
  const hourMatch = relativeDate.match(/(\d+)\s*小时前/)
  const weekMatch = relativeDate.match(/(\d+)\s*周前/)
  const monthMatch = relativeDate.match(/(\d+)\s*个月前/)

  if (dayMatch) {
    now.setDate(now.getDate() - parseInt(dayMatch[1]))
  } else if (hourMatch) {
    // 小于1天，算作今天
  } else if (weekMatch) {
    now.setDate(now.getDate() - (parseInt(weekMatch[1]) * 7))
  } else if (monthMatch) {
    now.setMonth(now.getMonth() - parseInt(monthMatch[1]))
  }

  return now.toISOString().split('T')[0]
}

/**
 * 从 YouTube API 获取视频详情
 */
async function fetchVideoDetails(videoId) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return null
    }

    const video = data.items[0]
    return {
      description: video.snippet.description.split('\n')[0], // 取第一行
      uploadDate: video.snippet.publishedAt.split('T')[0],
      duration: video.contentDetails.duration
    }
  } catch (error) {
    console.error(`获取 ${videoId} 失败:`, error.message)
    return null
  }
}

/**
 * 解析 CSV 文件
 */
async function parseCSV(filePath) {
  const content = await fs.readFile(filePath, 'utf8')
  const lines = content.split('\n').filter(line => line.trim())

  // 跳过表头
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  const rows = []

  for (let i = 1; i < lines.length; i++) {
    const values = []
    let current = ''
    let inQuotes = false

    // 处理 CSV 中的引号
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())

    if (values.length >= headers.length) {
      const row = {}
      headers.forEach((header, index) => {
        row[header] = values[index]
      })
      rows.push(row)
    }
  }

  return rows
}

/**
 * 主函数
 */
async function main() {
  console.log('📊 开始处理 CSV 文件...\n')

  // 解析 CSV
  const rows = await parseCSV(CSV_FILE)
  console.log(`找到 ${rows.length} 个视频\n`)

  // 处理前 5 个视频作为示例
  const results = []

  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const row = rows[i]
    const videoUrl = row['Video URL']

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`处理视频 ${i + 1}/${Math.min(5, rows.length)}`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

    // 提取 Video ID
    const videoId = extractVideoId(videoUrl)
    if (!videoId) {
      console.log(`⚠️  跳过: 无法提取 Video ID`)
      continue
    }

    console.log(`Video ID: ${videoId}`)

    // 获取 API 数据
    console.log(`正在获取视频详情...`)
    const apiData = await fetchVideoDetails(videoId)

    if (!apiData) {
      console.log(`⚠️  跳过: API 获取失败`)
      continue
    }

    // 生成 frontmatter
    const frontmatter = {
      enabled: true,
      youtubeId: videoId,
      title: row['Title'].replace(/"/g, ''),
      description: apiData.description || row['Title'].replace(/"/g, ''),
      duration: apiData.duration,
      uploadDate: apiData.uploadDate
    }

    results.push(frontmatter)

    console.log('\n✅ 生成的 frontmatter:\n')
    console.log('video:')
    console.log(`  enabled: true`)
    console.log(`  youtubeId: "${frontmatter.youtubeId}"`)
    console.log(`  title: "${frontmatter.title}"`)
    console.log(`  description: "${frontmatter.description}"`)
    console.log(`  duration: "${frontmatter.duration}"`)
    console.log(`  uploadDate: "${frontmatter.uploadDate}"`)

    // 避免超过 API 限制
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`✅ 处理完成！共处理 ${results.length} 个视频`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  // 保存结果
  const outputFile = 'tools/articles/youtube_metadata_output.json'
  await fs.writeFile(outputFile, JSON.stringify(results, null, 2))
  console.log(`📝 结果已保存到: ${outputFile}\n`)
}

main().catch(error => {
  console.error('❌ 错误:', error)
  process.exit(1)
})
