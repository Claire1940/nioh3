// scripts/csv-to-json.js
import fs from 'node:fs/promises'
import csv from 'csv-parser'
import { Readable } from 'node:stream'

async function convertCSVToJSON() {
  const results = []
  const csvContent = await fs.readFile('tools/demand/rue_valley_seo_matrix.csv', 'utf8')

  const stream = Readable.from(csvContent)

  stream
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      // 按类别分组
      const grouped = results.reduce((acc, item) => {
        const category = item.url.split('/')[1]
        if (!acc[category]) acc[category] = []
        acc[category].push(item)
        return acc
      }, {})

      // 创建目录
      await fs.mkdir('public/data', { recursive: true })

      // 保存分组数据
      await fs.writeFile(
        'public/data/seo-matrix.json',
        JSON.stringify(grouped, null, 2)
      )

      // 保存完整数据
      await fs.writeFile(
        'public/data/seo-matrix-full.json',
        JSON.stringify(results, null, 2)
      )

      console.log('✅ SEO矩阵数据已转换为JSON')
      console.log(`   - 总条目: ${results.length}`)
      console.log(`   - 类别数: ${Object.keys(grouped).length}`)
      console.log(`   - 类别: ${Object.keys(grouped).join(', ')}`)
    })
}

convertCSVToJSON()
