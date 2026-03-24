import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import type { VideoMetadata } from '@/lib/content'
import { getYouTubeThumbnail, getVideoEmbedUrl } from '@/lib/video-utils'

interface VideoSitemapEntry {
  url: string
  video: {
    thumbnailUrl: string
    title: string
    description: string
    playerUrl: string
    duration: string
    publicationDate: string
  }
}

/**
 * 扫描所有 MDX 文件并提取包含视频元数据的页面
 */
async function getVideoPages(): Promise<VideoSitemapEntry[]> {
  const contentDir = path.join(process.cwd(), 'src/content')
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nioh3.org'
  const videoPages: VideoSitemapEntry[] = []

  // 只扫描英文内容（避免重复）
  const enDir = path.join(contentDir, 'en')

  async function scanDirectory(dir: string, basePath: string[] = []): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
          await scanDirectory(fullPath, [...basePath, entry.name])
        } else if (entry.name.endsWith('.mdx')) {
          const fileContent = await fs.readFile(fullPath, 'utf8')
          const { data } = matter(fileContent)

          // 检查是否有视频元数据且已启用
          if (data.video && data.video.enabled) {
            const video = data.video as VideoMetadata
            const fileName = entry.name.replace('.mdx', '')
            const slug = [...basePath, fileName].join('/')
            const pageUrl = `${baseUrl}/en/${slug}`

            // 获取缩略图 URL
            const thumbnailUrl = video.thumbnailUrl || getYouTubeThumbnail(video.youtubeId)

            videoPages.push({
              url: pageUrl,
              video: {
                thumbnailUrl,
                title: video.title,
                description: video.description,
                playerUrl: getVideoEmbedUrl(video.youtubeId),
                duration: convertISO8601ToSeconds(video.duration).toString(),
                publicationDate: video.uploadDate
              }
            })
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error)
    }
  }

  await scanDirectory(enDir)
  return videoPages
}

/**
 * 将 ISO 8601 时长格式转换为秒数
 */
function convertISO8601ToSeconds(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0

  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseInt(match[3] || '0', 10)

  return hours * 3600 + minutes * 60 + seconds
}

/**
 * 生成视频站点地图 XML
 */
function generateVideoSitemapXML(videoPages: VideoSitemapEntry[]): string {
  const entries = videoPages.map(({ url, video }) => `
  <url>
    <loc>${escapeXml(url)}</loc>
    <video:video>
      <video:thumbnail_loc>${escapeXml(video.thumbnailUrl)}</video:thumbnail_loc>
      <video:title>${escapeXml(video.title)}</video:title>
      <video:description>${escapeXml(video.description)}</video:description>
      <video:player_loc>${escapeXml(video.playerUrl)}</video:player_loc>
      <video:duration>${video.duration}</video:duration>
      <video:publication_date>${video.publicationDate}</video:publication_date>
    </video:video>
  </url>`).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">${entries}
</urlset>`
}

/**
 * 转义 XML 特殊字符
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Next.js Route Handler - GET 方法
 */
export async function GET() {
  const videoPages = await getVideoPages()
  const xml = generateVideoSitemapXML(videoPages)

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}

// 静态生成配置
export const dynamic = 'force-static'
