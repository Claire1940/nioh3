import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { marked } from 'marked'
import { ReadingProgress } from '@/components/ReadingProgress'
import { RelatedArticles } from '@/components/RelatedArticles'
import { ArticleCTA } from '@/components/ArticleCTA'
import { AdBanner } from '@/components/AdBanner'
import { VideoEmbed } from '@/components/VideoEmbed'
import { getLocalizedContent, getAllContentPaths } from '@/lib/content'
import { generateVideoSchema } from '@/lib/video-utils'
import { routing } from '@/i18n/routing'
import type { Metadata } from 'next'
import { NativeBannerWrapper } from '@/components/NativeBannerWrapper'

// SSG 配置：构建时预渲染所有页面
// 允许访问未预渲染的页面（开发模式下动态生成）
export const dynamicParams = true

interface PageProps {
  params: Promise<{
    locale: string
    slug: string[]
  }>
}

export async function generateStaticParams() {
  // SSG: 预渲染所有文章详情页
  const allContentSlugs = await getAllContentPaths()

  return allContentSlugs.flatMap((slug) =>
    routing.locales.map((locale) => ({ locale, slug }))
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const baseUrl = 'https://nioh3.org'
  // 英语使用无前缀路径，其他语言带前缀
  const fullPath = locale === 'en' ? `/${slug.join('/')}` : `/${locale}/${slug.join('/')}`

  // 获取内容以提取标题和描述
  const category = slug[0]
  const contentSlug = slug.slice(1)
  const result = await getLocalizedContent(category, locale, contentSlug)

  const title = result?.frontmatter?.title || slug[slug.length - 1].replace(/-/g, ' ')
  const description = result?.frontmatter?.description || ''

  return {
    title,
    description,
    alternates: {
      canonical: fullPath,
      languages: {
        'en': `/${slug.join('/')}`,
        'ru': `/ru/${slug.join('/')}`,
        'ja': `/ja/${slug.join('/')}`,
        'es': `/es/${slug.join('/')}`,
        'pt': `/pt/${slug.join('/')}`,
        'de': `/de/${slug.join('/')}`,
        'fr': `/fr/${slug.join('/')}`,
        'ko': `/ko/${slug.join('/')}`,
        'x-default': `/${slug.join('/')}`
      }
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}${fullPath}`,
      type: 'article'
    }
  }
}

export default async function ContentPage({ params }: PageProps) {
  const { locale, slug } = await params
  const t = await getTranslations('article')
  const tCommon = await getTranslations('common')

  // 获取分类（slug 的第一部分）
  const category = slug[0]
  const contentSlug = slug.slice(1)

  // 使用工具函数读取内容（支持 fallback）
  const result = await getLocalizedContent(category, locale, contentSlug)

  if (!result) {
    notFound()
  }

  const { frontmatter, content } = result

  // Configure marked to add IDs to headings and disable strikethrough
  marked.use({
    gfm: true,
    breaks: false,
    renderer: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      heading({ tokens, depth }: { tokens: any[]; depth: number }) {
        // Parse tokens to get the text content
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const text = (this as any).parser.parseInline(tokens)

        // Generate ID from text (without HTML tags)
        const id = String(text)
          .toLowerCase()
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/[^\w\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .trim()

        return `<h${depth} id="${id}">${text}</h${depth}>`
      },
      // Disable strikethrough rendering
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      del(token: any) {
        return token.text
      }
    }
  })

  // Parse Markdown to HTML
  let htmlContent = await marked(content)

  // Remove the first H1 from content to avoid duplication
  htmlContent = htmlContent.replace(/<h1[^>]*>.*?<\/h1>/, '')

  // Function to insert ads in content at 33% and 66% positions
  function insertAdsInContent(html: string): string {
    const segments = html.split(/(<\/p>|<\/h[2-6]>|<\/ul>|<\/ol>|<\/blockquote>)/)

    if (segments.length < 12) {
      return html
    }

    const firstAdPosition = Math.floor(segments.length * 0.33)
    const secondAdPosition = Math.floor(segments.length * 0.66)

    const adKey728 = process.env.NEXT_PUBLIC_ADSTERRA_BANNER_728X90_KEY || ''
    const adKey320 = process.env.NEXT_PUBLIC_ADSTERRA_BANNER_320X50_KEY || ''

    const adHtml = `
      <div class="my-8 flex justify-center">
        <div class="hidden md:block w-full max-w-[728px]">
          <iframe src="/ads/banner-728x90.html?key=${adKey728}"
                  width="728" height="90"
                  style="border:none;max-width:100%;display:block;"
                  scrolling="no"
                  title="Adsterra 728x90 Banner">
          </iframe>
        </div>
        <div class="block md:hidden w-full max-w-[320px]">
          <iframe src="/ads/banner-320x50.html?key=${adKey320}"
                  width="320" height="50"
                  style="border:none;max-width:100%;display:block;"
                  scrolling="no"
                  title="Adsterra 320x50 Banner">
          </iframe>
        </div>
      </div>
    `

    const result: string[] = []
    for (let i = 0; i < segments.length; i++) {
      result.push(segments[i])
      if (i === firstAdPosition || i === secondAdPosition) {
        result.push(adHtml)
      }
    }

    return result.join('')
  }

  // Insert ads in content
  htmlContent = insertAdsInContent(htmlContent)

  // Insert video after first H2 heading if video exists
  let videoEmbedHtml = ''
  if (frontmatter.video?.enabled && frontmatter.video?.youtubeId) {
    videoEmbedHtml = `
      <div class="my-8 not-prose">
        <div class="relative w-full" style="padding-bottom: 56.25%;">
          <iframe
            src="https://www.youtube.com/embed/${frontmatter.video.youtubeId}"
            title="${frontmatter.video.title || frontmatter.title}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            class="absolute top-0 left-0 w-full h-full rounded-lg"
          ></iframe>
        </div>
        ${frontmatter.video.title ? `
          <div class="mt-4 p-4 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
            <h3 class="text-lg font-semibold text-[#F4B860] mb-2">📺 ${frontmatter.video.title}</h3>
            ${frontmatter.video.description ? `<p class="text-sm text-gray-300">${frontmatter.video.description}</p>` : ''}
          </div>
        ` : ''}
      </div>
    `

    // Find the first H2 tag and insert video after it
    const h2Match = htmlContent.match(/<h2[^>]*>.*?<\/h2>/)
    if (h2Match && h2Match.index !== undefined) {
      const insertPosition = h2Match.index + h2Match[0].length
      htmlContent = htmlContent.slice(0, insertPosition) + videoEmbedHtml + htmlContent.slice(insertPosition)
    } else {
      // If no H2 found, insert at 1/3 of content
      const contentLength = htmlContent.length
      const insertPosition = Math.floor(contentLength / 3)
      htmlContent = htmlContent.slice(0, insertPosition) + videoEmbedHtml + htmlContent.slice(insertPosition)
    }
  }

  // Structured data for SEO
  const baseUrl = 'https://nioh3.org'
  const articleUrl = locale === 'en' ? `${baseUrl}/${slug.join('/')}` : `${baseUrl}/${locale}/${slug.join('/')}`

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: frontmatter.title,
    description: frontmatter.description || '',
    author: {
      '@type': 'Organization',
      name: 'nioh3.org Team'
    },
    publisher: {
      '@type': 'Organization',
      name: 'nioh3.org',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/logo.png`
      }
    },
    datePublished: frontmatter.date || new Date().toISOString(),
    dateModified: frontmatter.date || new Date().toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl
    },
    articleSection: frontmatter.category || 'Guide',
    keywords: frontmatter.keywords || []
  }

  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl
      },
      ...slug.map((segment, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        item: `${baseUrl}/${locale}/${slug.slice(0, index + 1).join('/')}`
      }))
    ]
  }

  // Generate VideoObject Schema if video metadata exists
  const videoStructuredData = frontmatter.video?.enabled
    ? generateVideoSchema(frontmatter.video, articleUrl)
    : null

  return (
    <>
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      {videoStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoStructuredData) }}
        />
      )}
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Ad Position 1: 文章页顶部 - Native Banner（横跨整个宽度） */}
          <NativeBannerWrapper className="my-8" />

          {/* Ad Position 2: 文章标题前 - 728x90 Banner */}
          <AdBanner type="banner-728x90" className="my-8" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <article className="lg:col-span-8">
              {/* Breadcrumb */}
              <nav className="text-sm text-gray-400 mb-6">
                <Link href="/" className="hover:text-[#F4B860]">{t('breadcrumbHome')}</Link>
                {slug.map((segment, index) => {
                  const isLast = index === slug.length - 1
                  const segmentPath = '/' + slug.slice(0, index + 1).join('/')

                  // For last segment (article title), use frontmatter title
                  // For middle segments (category), use translation from common
                  let displayText: string
                  if (isLast) {
                    displayText = frontmatter.title
                  } else {
                    // Try to get category translation from common namespace
                    try {
                      displayText = tCommon(segment as never)
                    } catch {
                      // Fallback to formatted segment if translation not found
                      displayText = segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                    }
                  }

                  return (
                    <span key={index}>
                      {' › '}
                      {isLast ? (
                        <span className="text-white">{displayText}</span>
                      ) : (
                        <Link href={segmentPath} className="hover:text-[#F4B860]">
                          {displayText}
                        </Link>
                      )}
                    </span>
                  )
                })}
              </nav>

              {/* Article Header */}
              <header className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-[#F4B860]/20 text-[#F4B860] px-3 py-1 rounded-full text-sm font-semibold">
                    {frontmatter.category || t('categoryGuide')}
                  </span>
                  {frontmatter.priority && frontmatter.priority <= 10 && (
                    <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                      {t('highPriority')}
                    </span>
                  )}
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  {frontmatter.title}
                </h1>
                {frontmatter.description && (
                  <p className="text-xl text-gray-300 leading-relaxed">
                    {frontmatter.description}
                  </p>
                )}
                {frontmatter.date && (
                  <p className="text-sm text-gray-400 mt-4">
                    {t('lastUpdated')}: {String(frontmatter.date)}
                  </p>
                )}
              </header>

              {/* Ad Position 3: 文章标题下粘性 - 320x50 Banner */}
              <div className="sticky top-0 z-10 mb-6">
                <AdBanner type="banner-320x50" />
              </div>

              {/* Ad Position 4: 文章内容前 - 728x90 Banner */}
              <AdBanner type="banner-728x90" className="mb-8" />

              {/* Article Content */}
              <div className="prose prose-invert prose-lg max-w-none">
                <div
                  className="text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              </div>

              {/* Ad Position 7: 文章内容下方 - 728x90 Banner */}
              <AdBanner type="banner-728x90" className="my-8" />

              {/* External Reference */}
              {frontmatter.reference && (
                <div className="mt-12 p-6 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-2">{t('externalReference')}</h3>
                  <a
                    href={frontmatter.reference}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#F4B860] hover:underline break-all"
                  >
                    {frontmatter.reference}
                  </a>
                </div>
              )}

              {/* Newsletter CTA */}
              <ArticleCTA />
            </article>

            {/* Sidebar - Related Articles */}
            <aside className="lg:col-span-4">
              <div className="hidden lg:block space-y-6">
                {/* Ad Position 8: 右侧边栏粘性 - 160x600 Banner */}
                <div className="sticky top-4 z-10 mb-8">
                  <AdBanner type="banner-160x600" />
                </div>

                {/* Ad Position 9: 右侧边栏固定 - 160x300 Banner */}
                <div className="mb-8">
                  <AdBanner type="banner-160x300" />
                </div>

                <RelatedArticles category={slug[0]} currentSlug={slug.join('/')} locale={locale} />

                {/* Homepage CTA */}
                <Link
                  href="/"
                  className="flex flex-col items-center gap-2 bg-gradient-to-br from-[#F4B860] to-[#D99B3C] text-black px-8 py-4 rounded-lg shadow-2xl hover:shadow-[#F4B860]/50 transition-all hover:scale-105 w-fit mx-auto"
                >
                  <span className="text-3xl">🏠</span>
                  <span className="font-bold text-sm text-center leading-tight whitespace-nowrap">
                    {t('backToHome')}
                  </span>
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}
