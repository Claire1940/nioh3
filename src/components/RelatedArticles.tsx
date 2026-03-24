import { Link } from '@/i18n/navigation'
import { getRelatedArticles } from '@/lib/related-articles'
import { getTranslations } from 'next-intl/server'

interface RelatedArticlesProps {
  category: string
  currentSlug: string
  locale: string
}

export async function RelatedArticles({ category, currentSlug, locale }: RelatedArticlesProps) {
  const t = await getTranslations('article')

  // 动态获取相关文章
  const articles = await getRelatedArticles(category, currentSlug, locale)

  // 如果没有相关文章，不显示
  if (articles.length === 0) return null

  return (
    <div className="bg-gradient-to-br from-[#1C162D] to-[#0D0A16] rounded-lg p-6 border border-gray-700">
      <h4 className="text-sm font-semibold text-[#F4B860] mb-4 uppercase tracking-wide flex items-center gap-2">
        <span>📚</span>
        {t('relatedArticles')}
      </h4>
      <div className="space-y-3">
        {articles.map((article, index) => (
          <Link
            key={index}
            href={article.href}
            className="block p-3 rounded-md border border-gray-700 hover:border-[#F4B860] transition-all hover:bg-[#F4B860]/5"
          >
            <span className="text-xs text-[#F4B860] font-semibold uppercase tracking-wide block mb-1">
              {article.category}
            </span>
            <h4 className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              {article.title}
            </h4>
          </Link>
        ))}
      </div>
    </div>
  )
}