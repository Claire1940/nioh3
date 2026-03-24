#!/usr/bin/env node

/**
 * Preview the Excel content matrix structure
 */

import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const XLSX_PATH = path.join(__dirname, '../tools/demand/winter_burrow_content_matrix.xlsx');

console.log('📖 Reading Excel file:', XLSX_PATH);
const workbook = XLSX.readFile(XLSX_PATH);

console.log('\n📋 Available sheets:', workbook.SheetNames);

// Read the first sheet
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log(`\n📊 Total rows: ${data.length}`);

if (data.length > 0) {
  console.log('\n🔑 Column headers:');
  const headers = Object.keys(data[0]);
  headers.forEach((header, index) => {
    console.log(`   ${index + 1}. ${header}`);
  });

  console.log('\n📄 First 3 rows sample:');
  data.slice(0, 3).forEach((row, index) => {
    console.log(`\n--- Row ${index + 1} ---`);
    console.log(JSON.stringify(row, null, 2));
  });
}
