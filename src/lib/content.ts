import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { routing } from '@/i18n/routing'

export interface VideoClip {
  name: string
  startOffset: number
  endOffset: number
  url?: string
}

export interface VideoMetadata {
  enabled: boolean
  youtubeId: string
  title: string
  description: string
  duration: string // ISO 8601 格式，如 "PT1M30S"
  uploadDate: string // ISO 8601 日期格式
  thumbnailUrl?: string // 可选，默认使用 YouTube 缩略图
  clips?: VideoClip[] // 可选，用于关键时刻
}

export interface Frontmatter {
  title: string
  description: string
  keywords?: string[]
  canonical?: string
  date?: string
  category?: string
  priority?: number
  video?: VideoMetadata
  reference?: string
}

export interface ContentData {
  frontmatter: Frontmatter
  content: string
}

export interface Article {
  slug: string
  title: string
  description: string
  priority?: number
  date?: string
}

/**
 * 读取多语言内容，支持 fallback 到英文
 * @param category 内容分类（如 guides, classes 等）
 * @param locale 语言代码（en, es, th）
 * @param slug 文件路径片段（不含扩展名）
 * @returns 内容数据或 null
 */
export async function getLocalizedContent(
  category: string,
  locale: string,
  slug: string[]
): Promise<ContentData | null> {
  const fileName = slug[slug.length - 1]
  const subPath = slug.slice(0, -1)

  // 尝试读取指定语言版本
  let filePath = path.join(
    process.cwd(),
    'src/content',
    locale,
    category,
    ...subPath,
    `${fileName}.mdx`
  )

  try {
    const fileContent = await fs.readFile(filePath, 'utf8')
    const { data, content } = matter(fileContent)
    return { frontmatter: data as Frontmatter, content }
  } catch {
    // 如果不是英文且读取失败，尝试 fallback 到英文
    if (locale !== 'en') {
      filePath = path.join(
        process.cwd(),
        'src/content',
        'en',
        category,
        ...subPath,
        `${fileName}.mdx`
      )

      try {
        const fileContent = await fs.readFile(filePath, 'utf8')
        const { data, content } = matter(fileContent)
        return { frontmatter: data as Frontmatter, content }
      } catch {
        return null
      }
    }
    return null
  }
}

/**
 * 获取指定分类下的所有文章列表
 * @param category 内容分类
 * @param locale 语言代码
 * @returns 文章列表
 */
export async function getArticlesList(
  category: string,
  locale: string
): Promise<Article[]> {
  const articles: Article[] = []

  // 读取指定语言目录
  const localizedDir = path.join(process.cwd(), 'src/content', locale, category)

  // 递归读取目录
  async function readDirectory(dir: string, basePath: string[] = []): Promise<void> {
    let entries
    try {
      entries = await fs.readdir(dir, { withFileTypes: true })
    } catch (error) {
      // 如果指定语言目录不存在且不是英文，尝试读取英文目录
      if (locale !== 'en' && basePath.length === 0) {
        const enDir = path.join(process.cwd(), 'src/content', 'en', category)
        try {
          await readDirectory(enDir, basePath)
        } catch {
          console.error(`Failed to read directory: ${dir}`)
        }
      }
      return
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        await readDirectory(fullPath, [...basePath, entry.name])
      } else if (entry.name.endsWith('.mdx')) {
        try {
          const fileContent = await fs.readFile(fullPath, 'utf8')
          const { data } = matter(fileContent)

          const fileName = entry.name.replace('.mdx', '')
          const slug = [...basePath, fileName].join('/')

          articles.push({
            slug,
            title: data.title || fileName,
            description: data.description || '',
            priority: data.priority,
            date: data.date instanceof Date
              ? data.date.toISOString().split('T')[0]
              : data.date
          })
        } catch (error) {
          // 单个文件读取失败不应影响其他文件
          console.error(`Failed to read file: ${fullPath}`, error)
        }
      }
    }
  }

  await readDirectory(localizedDir)

  // 排序
  return articles.sort((a, b) => {
    if (a.priority && b.priority) return a.priority - b.priority
    if (a.priority) return -1
    if (b.priority) return 1
    return a.title.localeCompare(b.title)
  })
}

/**
 * 获取所有 MDX 文件路径（用于 generateStaticParams）
 * @returns 文件路径数组
 */
export async function getAllContentPaths(): Promise<string[][]> {
  const contentDir = path.join(process.cwd(), 'src/content')
  const paths: string[][] = []

  async function scanDirectory(dir: string, basePath: string[] = []): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        // 跳过语言目录层级，只记录实际内容路径
        const isLocaleDir = routing.locales.some(locale => locale === entry.name)
        if (!isLocaleDir || basePath.length > 0) {
          await scanDirectory(fullPath, [...basePath, entry.name])
        } else {
          await scanDirectory(fullPath, basePath)
        }
      } else if (entry.name.endsWith('.mdx')) {
        const fileName = entry.name.replace('.mdx', '')
        paths.push([...basePath, fileName])
      }
    }
  }

  await scanDirectory(contentDir)
  return paths
}

/**
 * 获取核心页面路径（用于 SSG）
 *
 * 新策略：零详情页 SSG
 * - 列表页在其他路由中处理（/[locale]/guides、/[locale]/activities 等）
 * - 所有详情页（[...slug]）全部走 ISR，不预渲染
 *
 * @returns 空数组 - 不预渲染任何详情页
 */
export async function getCoreContentPaths(): Promise<string[][]> {
  // 返回空数组：所有详情页全部走 ISR
  return []
}
