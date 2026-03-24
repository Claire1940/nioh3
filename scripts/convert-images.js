import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertToWebP() {
  console.log('Starting image conversion to WebP...\n');

  const conversions = [
    {
      input: 'tools/demand/hero.png',
      output: 'public/images/hero.webp',
      quality: 85
    },
    {
      input: 'tools/demand/backend.png',
      output: 'public/images/backgrounds/backend.webp',
      quality: 80
    }
  ];

  for (const conversion of conversions) {
    try {
      const inputPath = path.join(process.cwd(), conversion.input);
      const outputPath = path.join(process.cwd(), conversion.output);

      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Get input file size
      const inputStats = fs.statSync(inputPath);
      const inputSizeKB = (inputStats.size / 1024).toFixed(2);

      // Convert to WebP
      await sharp(inputPath)
        .webp({ quality: conversion.quality, effort: 6 })
        .toFile(outputPath);

      // Get output file size
      const outputStats = fs.statSync(outputPath);
      const outputSizeKB = (outputStats.size / 1024).toFixed(2);
      const savings = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

      console.log(`✅ ${conversion.input}`);
      console.log(`   → ${conversion.output}`);
      console.log(`   📊 ${inputSizeKB} KB → ${outputSizeKB} KB (${savings}% reduction)\n`);
    } catch (error) {
      console.error(`❌ Failed to convert ${conversion.input}:`, error.message);
    }
  }

  console.log('✨ Image conversion complete!');
}

convertToWebP();
