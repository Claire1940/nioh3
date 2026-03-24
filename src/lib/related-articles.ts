import { getArticlesList } from './content'

interface RelatedArticle {
  title: string
  href: string
  category: string
}

/**
 * 动态获取同类目下的相关文章
 * @param category 文章分类
 * @param currentSlug 当前文章的完整 slug（包含分类）
 * @param locale 语言代码
 * @param limit 返回数量限制
 * @returns 相关文章列表
 */
export async function getRelatedArticles(
  category: string,
  currentSlug: string,
  locale: string = 'en',
  limit: number = 5
): Promise<RelatedArticle[]> {
  // 动态获取同类目下的所有文章
  const categoryArticles = await getArticlesList(category, locale)

  // 过滤掉当前文章
  const filtered = categoryArticles.filter(
    article => {
      const fullSlug = `${category}/${article.slug}`
      return fullSlug !== currentSlug
    }
  )

  // 转换为 RelatedArticle 格式并限制数量
  // 注意：不要在 href 中包含 locale，因为 Link 组件会自动处理
  return filtered.slice(0, limit).map(article => ({
    title: article.title,
    href: `/${category}/${article.slug}`,
    category: category.charAt(0).toUpperCase() + category.slice(1),
  }))
}
