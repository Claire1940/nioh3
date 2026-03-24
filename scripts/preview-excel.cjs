/**
 * Preview Excel file structure
 */
const XLSX = require('xlsx');
const path = require('path');

const EXCEL_PATH = path.join(__dirname, '..', 'tools', 'articles', '内页.xlsx');

const workbook = XLSX.readFile(EXCEL_PATH);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('Sheet name:', sheetName);
console.log('Total rows:', data.length);
console.log('\nFirst row (column names):');
console.log(Object.keys(data[0]));
console.log('\nFirst 3 rows sample:');
console.log(JSON.stringify(data.slice(0, 3), null, 2));
