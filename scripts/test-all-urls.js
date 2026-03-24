#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = 'http://localhost:3000'
const locales = ['en', 'es', 'th']
const categories = ['anomalies', 'controls', 'customers', 'download', 'endings', 'events', 'guide', 'inspector']

// Pages to test
const pages = [
  '/',
  '/privacy',
  '/terms',
  '/guides',
  '/anomalies',
  '/controls',
  '/customers',
  '/download',
  '/endings',
  '/events',
  '/inspector',
  '/tools/anomaly-radar',
  '/tools/serve-or-shut'
]

async function getAllArticleUrls() {
  const urls = []
  const contentDir = path.join(process.cwd(), 'src/content')

  for (const locale of locales) {
    for (const category of categories) {
      const categoryPath = path.join(contentDir, locale, category)

      try {
        const files = await fs.readdir(categoryPath)

        for (const file of files) {
          if (file.endsWith('.mdx')) {
            const slug = file.replace('.mdx', '')
            const url = locale === 'en'
              ? `/${category}/${slug}`
              : `/${locale}/${category}/${slug}`
            urls.push(url)
          }
        }
      } catch (error) {
        // Category doesn't exist for this locale, skip
      }
    }
  }

  return urls
}

async function generateAllUrls() {
  const urls = []

  // Add static pages for each locale
  for (const locale of locales) {
    for (const page of pages) {
      const url = locale === 'en' ? page : `/${locale}${page}`
      urls.push(`${BASE_URL}${url}`)
    }
  }

  // Add all article URLs
  const articleUrls = await getAllArticleUrls()
  for (const url of articleUrls) {
    urls.push(`${BASE_URL}${url}`)
  }

  return [...new Set(urls)].sort()
}

async function main() {
  const urls = await generateAllUrls()

  console.log('Total URLs to test:', urls.length)
  console.log('\n--- URLs ---')
  urls.forEach(url => console.log(url))

  // Save to file
  await fs.writeFile(
    path.join(process.cwd(), 'test-urls.txt'),
    urls.join('\n'),
    'utf8'
  )

  console.log('\n✅ URLs saved to test-urls.txt')
}

main().catch(console.error)
