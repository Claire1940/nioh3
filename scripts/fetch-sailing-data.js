/**
 * Fetch OSRS Sailing data from TempleOSRS API
 * Run: node scripts/fetch-sailing-data.js
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_BASE = 'https://templeosrs.com/api';
const PUBLIC_DATA = join(__dirname, '../public/data');

async function fetchHiscores() {
  console.log('Fetching Sailing hiscores (top 200)...');
  try {
    const url = `${API_BASE}/skill_hiscores.php?skill=sailing&count=200`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    data.last_updated = new Date().toISOString();
    
    const outputPath = join(PUBLIC_DATA, 'sailing_hiscores_top200.json');
    writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`✓ Hiscores saved to ${outputPath}`);
    return data;
  } catch (error) {
    console.error('✗ Error fetching hiscores:', error.message);
    return null;
  }
}

async function fetchDailyGains() {
  console.log('Fetching Sailing daily gains (top 50)...');
  try {
    const url = `${API_BASE}/current_top/day.php?skill=sailing&count=50`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    data.last_updated = new Date().toISOString();
    
    const outputPath = join(PUBLIC_DATA, 'sailing_daily_gains_top50.json');
    writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`✓ Daily gains saved to ${outputPath}`);
    return data;
  } catch (error) {
    console.error('✗ Error fetching daily gains:', error.message);
    return null;
  }
}

async function main() {
  console.log('Starting OSRS Sailing data fetch...\n');
  
  const [hiscores, dailyGains] = await Promise.all([
    fetchHiscores(),
    fetchDailyGains()
  ]);
  
  console.log('\nFetch complete!');
  if (hiscores && dailyGains) {
    console.log('✓ All data updated successfully');
  } else {
    console.log('⚠ Some data failed to update');
  }
}

main().catch(console.error);
