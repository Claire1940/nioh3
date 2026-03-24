const XLSX = require('xlsx');
const path = require('path');

const EXCEL_PATH = path.join(__dirname, '..', 'tools', 'articles', '内页.xlsx');
const wb = XLSX.readFile(EXCEL_PATH);
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws);

const categories = {};
data.forEach(row => {
  const urlPath = row['URL Path'];
  const cat = urlPath.split('/')[1];
  if (cat && !categories[cat]) categories[cat] = [];
  if (cat) categories[cat].push({
    path: urlPath,
    title: row['Article Title']
  });
});

console.log('Categories and article counts:');
Object.keys(categories).sort().forEach(cat => {
  console.log(`  ${cat}: ${categories[cat].length} articles`);
});

console.log('\nAll categories:', JSON.stringify(Object.keys(categories).sort()));
