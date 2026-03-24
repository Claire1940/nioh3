#!/usr/bin/env node

/**
 * Remove duplicate H1 titles from MDX files
 * If the first line after frontmatter is "# Title" matching frontmatter.title,
 * remove it to avoid double titles in the rendered page.
 */

const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');

const contentDir = path.join(__dirname, '../src/content');

function getAllMdxFiles(dir) {
  const files = [];

  function walkDir(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.name.endsWith('.mdx')) {
        files.push(fullPath);
      }
    }
  }

  walkDir(dir);
  return files;
}

function removeDuplicateH1(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data: frontmatter, content } = matter(fileContent);

  // Split content into lines
  const lines = content.split('\n');

  // Find first non-empty line
  let firstContentLineIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim()) {
      firstContentLineIndex = i;
      break;
    }
  }

  if (firstContentLineIndex === -1) {
    return false; // No content
  }

  const firstLine = lines[firstContentLineIndex].trim();

  // Check if first line is H1 (starts with # but not ##)
  if (firstLine.startsWith('# ') && !firstLine.startsWith('## ')) {
    const h1Title = firstLine.substring(2).trim();

    // Check if it matches frontmatter title
    if (frontmatter.title && h1Title === frontmatter.title) {
      console.log(`✓ Removing duplicate H1 from: ${path.relative(contentDir, filePath)}`);
      console.log(`  Title: "${h1Title}"`);

      // Remove the H1 line
      lines.splice(firstContentLineIndex, 1);

      // Rebuild file content
      const newContent = lines.join('\n');
      const newFileContent = matter.stringify(newContent, frontmatter);

      fs.writeFileSync(filePath, newFileContent, 'utf8');
      return true;
    }
  }

  return false;
}

// Main execution
const files = getAllMdxFiles(contentDir);
console.log(`Found ${files.length} MDX files\n`);

let modifiedCount = 0;

for (const file of files) {
  try {
    if (removeDuplicateH1(file)) {
      modifiedCount++;
    }
  } catch (error) {
    console.error(`✗ Error processing ${file}:`, error.message);
  }
}

console.log(`\n✓ Done! Modified ${modifiedCount} out of ${files.length} files.`);
