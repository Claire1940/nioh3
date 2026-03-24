import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { getArticlesList } from '@/lib/content'
import { AdBanner } from '@/components/AdBanner'
import { routing } from '@/i18n/routing'
import type { Metadata } from 'next'
import { NativeBannerWrapper } from '@/components/NativeBannerWrapper'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'community' })

  const path = locale === 'en' ? '/community' : `/${locale}/community`

  // 动态生成所有语言的 alternates
  const languages: Record<string, string> = {
    'x-default': '/community'
  }

  routing.locales.forEach(loc => {
    languages[loc] = loc === 'en' ? '/community' : `/${loc}/community`
  })

  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: {
      canonical: path,
      languages
    }
  }
}

export default async function CommunityPage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations('community')
  const tp = await getTranslations('pages')
  const articles = await getArticlesList('community', locale)

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Ad Position 1: Page Top - Native Banner */}
        <NativeBannerWrapper className="mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 左侧：主内容区 */}
          <div className="lg:col-span-8">
            <nav className="text-sm text-gray-400 mb-6">
              <Link href="/" className="hover:text-[#F4B860]">{t('breadcrumbHome')}</Link>
              {' › '}
              <span className="text-white">{t('breadcrumbCommunity')}</span>
            </nav>

            <div className="flex flex-col justify-between items-center mb-6">
              <h1 className="mx-auto max-w-3xl text-3xl font-bold lg:text-5xl tracking-tight text-white drop-shadow-lg">
                <span className="pt-10">{t('title')}</span>
              </h1>
              <h2 className="mx-auto max-w-[700px] md:text-xl my-6 text-gray-200 drop-shadow-md">
                {t('subtitle')}
              </h2>
            </div>

            {/* Ad Position 2: Below page title - 728x90 Banner */}
            <AdBanner type="banner-728x90" className="my-8" />

            <section>
              <div className="space-y-6">
                {articles.length > 0 ? (
                  articles.map((article, index) => (
                    <div
                      key={index}
                      className="rounded-lg border text-card-foreground shadow-sm bg-black/50 backdrop-blur-md border-gray-700 hover:border-[#F4B860] hover:shadow-2xl hover:shadow-[#F4B860]/20 transition-all"
                    >
                      <div className="flex flex-col space-y-1.5 p-6">
                        <Link
                          href={`/community/${article.slug}`}
                          className="text-[#F4B860] hover:text-[#D99B3C] transition-colors inline-flex items-center gap-1"
                        >
                          <h3 className="text-2xl font-semibold leading-none tracking-tight mr-1 text-gray-100">
                            {article.title}
                          </h3>
                          →
                        </Link>
                        <div className="text-sm text-gray-300">
                          {article.description}
                        </div>
                        {article.date && (
                          <div className="text-xs text-gray-500 mt-2">
                            {t('updated')}: {article.date}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700 text-center">
                    <p className="text-gray-300">{tp('noContentYet')}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Ad Position 3: Bottom of page - 728x90 Banner */}
            <AdBanner type="banner-728x90" className="my-8" />
          </div>

          {/* 右侧：侧边栏 */}
          <aside className="lg:col-span-4">
            <div className="hidden lg:block">
              {/* Ad Position 4: Right sidebar sticky - 160x600 Banner */}
              <div className="sticky top-4 z-30 mb-8">
                <AdBanner type="banner-160x600" />
              </div>

              {/* Ad Position 5: Right sidebar fixed - 160x300 Banner */}
              <div className="mb-8">
                <AdBanner type="banner-160x300" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
