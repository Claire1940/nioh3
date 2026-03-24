/**
 * Extract internal links from Excel file and categorize them
 */
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const EXCEL_PATH = path.join(__dirname, '..', 'tools', 'articles', '内页.xlsx');

// Read Excel file
const workbook = XLSX.readFile(EXCEL_PATH);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log(`Total articles: ${data.length}\n`);

// Categorize URLs by their path prefix
const categories = {};

data.forEach(row => {
  const urlPath = row['URL Path'];
  if (!urlPath) return;

  // Extract category from path (e.g., /guides/... -> guides)
  const match = urlPath.match(/^\/([^/]+)\//);
  if (match) {
    const category = match[1];
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(urlPath);
  }
});

// Sort categories and URLs
const sortedCategories = Object.keys(categories).sort();

console.log('Categories found:');
sortedCategories.forEach(cat => {
  console.log(`  ${cat}: ${categories[cat].length} articles`);
});

console.log('\n---\nFormatted for config.json:\n');
console.log('"internal_links": {');
sortedCategories.forEach((cat, idx) => {
  const urls = categories[cat].sort();
  const isLast = idx === sortedCategories.length - 1;
  console.log(`  "${cat}": [`);
  urls.forEach((url, urlIdx) => {
    const comma = urlIdx < urls.length - 1 ? ',' : '';
    console.log(`    "${url}"${comma}`);
  });
  console.log(`  ]${isLast ? '' : ','}`);
});
console.log('}');

// Write to a JSON file for easy import
const outputPath = path.join(__dirname, '..', 'tools', 'articles', 'internal-links.json');
fs.writeFileSync(outputPath, JSON.stringify(categories, null, 2));
console.log(`\n✓ Internal links saved to: ${outputPath}`);
