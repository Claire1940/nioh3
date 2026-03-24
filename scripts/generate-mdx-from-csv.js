import fs from 'node:fs/promises'
import path from 'node:path'
import csvParser from 'csv-parser'
import { createReadStream } from 'node:fs'

// Capitalize title
function capitalizeTitle(keyword) {
  return keyword
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Extract category from URL
function getCategoryFromUrl(url) {
  const parts = url.split('/').filter(Boolean)
  return parts[0] || 'general'
}

// Generate MDX frontmatter and content
function generateMDX(row) {
  const title = capitalizeTitle(row.keyword)
  const category = getCategoryFromUrl(row.url)
  const date = new Date().toISOString().split('T')[0]

  return `---
title: "${title}"
description: "Comprehensive guide about ${row.keyword}"
keywords: "${row.keyword}, Rue Valley, time loop RPG"
canonical: "${row.url}"
date: "${date}"
reference: "${row.reference}"
priority: ${row.priority}
category: "${category}"
---

# ${title}

Welcome to our comprehensive guide on **${row.keyword}**. This page covers everything you need to know about this aspect of Rue Valley.

## Overview

Rue Valley is a time loop narrative RPG where you play as Eugene Harlow, trapped in a 47-minute cycle. This guide will help you understand ${row.keyword} in detail.

## Key Information

*Content will be added soon. This page is part of our comprehensive Rue Valley guide network.*

## Related Guides

- [Rue Valley Gameplay Overview](/guide/gameplay-overview)
- [Complete Walkthrough](/guide/full-walkthrough)
- [Character Guide](/info/characters)

## External References

For additional information, check out this external resource: [${row.keyword}](${row.reference})

---

*Last updated: ${date}*
`
}

// Main function
async function generateAllMDX() {
  const csvPath = path.join(process.cwd(), 'tools/demand/rue_valley_seo_matrix.csv')
  const contentDir = path.join(process.cwd(), 'src/content')

  // Ensure content directory exists
  await fs.mkdir(contentDir, { recursive: true })

  const rows = []

  // Read CSV
  await new Promise((resolve, reject) => {
    createReadStream(csvPath)
      .pipe(csvParser())
      .on('data', (row) => {
        rows.push(row)
      })
      .on('end', resolve)
      .on('error', reject)
  })

  console.log(`📊 Found ${rows.length} entries in CSV`)

  // Generate MDX for each row
  let created = 0
  let skipped = 0

  for (const row of rows) {
    try {
      // Parse URL to file path
      const urlPath = row.url.replace(/^\//, '') // Remove leading slash
      const filePath = path.join(contentDir, `${urlPath}.mdx`)
      const dir = path.dirname(filePath)

      // Create directory if it doesn't exist
      await fs.mkdir(dir, { recursive: true })

      // Generate and write MDX content
      const mdxContent = generateMDX(row)
      await fs.writeFile(filePath, mdxContent, 'utf8')

      created++
      console.log(`✅ Created: ${urlPath}.mdx`)
    } catch (error) {
      console.error(`❌ Error creating ${row.url}:`, error.message)
      skipped++
    }
  }

  console.log(`\n🎉 MDX generation complete!`)
  console.log(`   Created: ${created} files`)
  console.log(`   Skipped: ${skipped} files`)
}

// Run the script
generateAllMDX().catch(console.error)
