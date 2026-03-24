import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read Excel file
const excelPath = path.join(__dirname, '内页.xlsx');
const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('='.repeat(60));
console.log('Excel File Analysis');
console.log('='.repeat(60));
console.log(`Total rows: ${data.length}`);
console.log(`\n`);

// Group URLs by category
const internal_links = {};

data.forEach((row) => {
  const urlPath = (row['URL Path'] || '').trim();

  if (urlPath && urlPath.startsWith('/')) {
    const parts = urlPath.replace(/^\/|\/$/g, '').split('/');
    if (parts.length >= 1) {
      const category = parts[0];
      if (!internal_links[category]) {
        internal_links[category] = [];
      }
      if (!internal_links[category].includes(urlPath)) {
        internal_links[category].push(urlPath);
      }
    }
  }
});

// Sort categories and URLs
const sortedLinks = {};
Object.keys(internal_links).sort().forEach(category => {
  sortedLinks[category] = internal_links[category].sort();
});

// Print statistics
console.log('URL Categories Found:');
console.log('-'.repeat(60));
let totalUrls = 0;
Object.entries(sortedLinks).forEach(([category, urls]) => {
  console.log(`${category.padEnd(20)}: ${urls.length} URLs`);
  totalUrls += urls.length;
});
console.log('-'.repeat(60));
console.log(`Total unique URLs: ${totalUrls}\n`);

// Print sample URLs
console.log('\nSample URLs by Category:');
console.log('='.repeat(60));
Object.entries(sortedLinks).forEach(([category, urls]) => {
  console.log(`\n${category}:`);
  urls.slice(0, 3).forEach(url => console.log(`  ${url}`));
  if (urls.length > 3) {
    console.log(`  ... and ${urls.length - 3} more`);
  }
});

// Output JSON format
console.log('\n\nJSON Format for config.json:');
console.log('='.repeat(60));
console.log(JSON.stringify(sortedLinks, null, 2));

// Save to file for easy access
const outputPath = path.join(__dirname, 'extracted_internal_links.json');
fs.writeFileSync(outputPath, JSON.stringify(sortedLinks, null, 2));
console.log(`\n\n✅ Internal links saved to: ${outputPath}`);
