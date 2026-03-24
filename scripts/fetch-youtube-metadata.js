#!/usr/bin/env node

/**
 * YouTube 视频元数据获取工具
 * 用法：node scripts/fetch-youtube-metadata.js VIDEO_ID
 *
 * 注意：需要 YouTube Data API v3 密钥
 * 获取方式：https://console.cloud.google.com/apis/credentials
 */

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

if (!YOUTUBE_API_KEY) {
  console.error('❌ 错误: 未设置 YOUTUBE_API_KEY 环境变量')
  console.error('\n请设置环境变量:')
  console.error('export YOUTUBE_API_KEY="your_api_key_here"')
  console.error('\n或在 .env.local 中添加:')
  console.error('YOUTUBE_API_KEY=your_api_key_here')
  console.error('\n获取 API Key: https://console.cloud.google.com/apis/credentials')
  process.exit(1)
}

const videoId = process.argv[2]

if (!videoId) {
  console.error('❌ 用法: node scripts/fetch-youtube-metadata.js VIDEO_ID')
  console.error('示例: node scripts/fetch-youtube-metadata.js L093XqyLGrw')
  process.exit(1)
}

/**
 * 将秒数转换为 ISO 8601 时长格式
 */
function secondsToISO8601(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  let duration = 'PT'
  if (hours > 0) duration += `${hours}H`
  if (minutes > 0) duration += `${minutes}M`
  if (secs > 0 || (hours === 0 && minutes === 0)) duration += `${secs}S`

  return duration
}

/**
 * 将 ISO 8601 时长转换为秒数
 */
function parseDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0

  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseInt(match[3] || '0', 10)

  return hours * 3600 + minutes * 60 + seconds
}

/**
 * 格式化时长为人类可读格式
 */
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

async function fetchYouTubeMetadata(videoId) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`

  console.log(`\n🔍 正在获取视频信息: ${videoId}...\n`)

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || '请求失败')
    }

    if (!data.items || data.items.length === 0) {
      throw new Error('未找到视频')
    }

    const video = data.items[0]
    const snippet = video.snippet
    const contentDetails = video.contentDetails

    const durationSeconds = parseDuration(contentDetails.duration)
    const uploadDate = snippet.publishedAt.split('T')[0]

    console.log('✅ 获取成功!\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📹 视频信息')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log(`标题: ${snippet.title}`)
    console.log(`描述: ${snippet.description.split('\n')[0]}...`)
    console.log(`频道: ${snippet.channelTitle}`)
    console.log(`上传日期: ${uploadDate}`)
    console.log(`时长: ${formatDuration(durationSeconds)} (${contentDetails.duration})`)
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log('📝 MDX Frontmatter 格式')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('video:')
    console.log('  enabled: true')
    console.log(`  youtubeId: "${videoId}"`)
    console.log(`  title: "${snippet.title}"`)
    console.log(`  description: "${snippet.description.split('\n')[0]}"`)
    console.log(`  duration: "${contentDetails.duration}"`)
    console.log(`  uploadDate: "${uploadDate}"`)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    return {
      youtubeId: videoId,
      title: snippet.title,
      description: snippet.description.split('\n')[0],
      duration: contentDetails.duration,
      uploadDate,
      channelTitle: snippet.channelTitle,
      thumbnails: snippet.thumbnails
    }
  } catch (error) {
    console.error('❌ 获取失败:', error.message)
    process.exit(1)
  }
}

// 执行
fetchYouTubeMetadata(videoId)
