#!/usr/bin/env node

/**
 * Build script to prepare site for Netlify deployment
 * Copies HTML files and assets to dist folder after Vite build
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy HTML files
const htmlFiles = ['index.html', 'sitemap.html', 'apple-redesign.html', 'test-cascade.html'];

console.log('📄 Copying HTML files...');
for (const file of htmlFiles) {
  const src = path.join(rootDir, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`  ✓ ${file}`);
  }
}

// Copy directories
const directories = [
  { src: 'src', dest: 'src' },
  { src: 'docs', dest: 'docs' },
  { src: 'examples', dest: 'examples' },
  { src: 'images', dest: 'images' },
];

console.log('\n📁 Copying directories...');
for (const dir of directories) {
  const srcPath = path.join(rootDir, dir.src);
  const destPath = path.join(distDir, dir.dest);

  if (fs.existsSync(srcPath)) {
    copyRecursive(srcPath, destPath);
    console.log(`  ✓ ${dir.src}/`);
  }
}

// Copy favicon if exists
const favicon = path.join(rootDir, 'favicon.ico');
if (fs.existsSync(favicon)) {
  fs.copyFileSync(favicon, path.join(distDir, 'favicon.ico'));
  console.log('\n✓ favicon.ico copied');
}

console.log('\n✅ Site build complete! Ready for deployment.');

// Helper function to copy directories recursively
function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules and other build directories
      if (!['node_modules', '.git', 'dist', 'coverage'].includes(entry.name)) {
        copyRecursive(srcPath, destPath);
      }
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
