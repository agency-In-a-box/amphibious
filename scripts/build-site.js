#!/usr/bin/env node

/**
 * Build script to prepare site for Netlify deployment
 * 1. Copies HTML files and assets to dist/ folder
 * 2. Rewrites Vite dev-mode imports to production paths
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// Ensure dist directory exists (bun run build creates it with library artifacts)
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy HTML files from root
const htmlFiles = ['index.html', 'sitemap.html', 'apple-redesign.html', 'test-cascade.html'];

console.log('Copying HTML files...');
for (const file of htmlFiles) {
  const src = path.join(rootDir, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`  ${file}`);
  }
}

// Copy directories
const directories = [
  { src: 'src', dest: 'src' },
  { src: 'docs', dest: 'docs' },
  { src: 'examples', dest: 'examples' },
  { src: 'demos', dest: 'demos' },
  { src: 'images', dest: 'images' },
];

console.log('\nCopying directories...');
for (const dir of directories) {
  const srcPath = path.join(rootDir, dir.src);
  const destPath = path.join(distDir, dir.dest);

  if (fs.existsSync(srcPath)) {
    copyRecursive(srcPath, destPath);
    console.log(`  ${dir.src}/`);
  }
}

// Copy favicon if exists
const faviconSvg = path.join(rootDir, 'favicon.svg');
const faviconIco = path.join(rootDir, 'favicon.ico');
if (fs.existsSync(faviconSvg)) {
  fs.copyFileSync(faviconSvg, path.join(distDir, 'favicon.svg'));
  console.log('\nfavicon.svg copied');
}
if (fs.existsSync(faviconIco)) {
  fs.copyFileSync(faviconIco, path.join(distDir, 'favicon.ico'));
  console.log('favicon.ico copied');
}

// Rewrite Vite dev-mode imports to production paths in all HTML files
console.log('\nRewriting Vite imports for production...');
let rewriteCount = 0;
rewriteHtmlFiles(distDir);
console.log(`  ${rewriteCount} files rewritten`);

console.log('\nSite build complete! Ready for deployment.');

// --- Helper functions ---

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'dist-site', 'dist-docs', 'coverage'].includes(entry.name)) {
        copyRecursive(srcPath, destPath);
      }
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function rewriteHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!['node_modules', '.git', 'src', 'images'].includes(entry.name)) {
        rewriteHtmlFiles(fullPath);
      }
    } else if (entry.name.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      const original = content;

      // Calculate relative path to dist root
      const relDir = path.relative(distDir, dir);
      const depth = relDir ? relDir.split(path.sep).length : 0;
      const prefix = depth > 0 ? '../'.repeat(depth) : './';

      // --- Combined block: both CSS + JS imports (with optional comments) ---
      // <script type="module">
      //   import '../src/css/main.css';
      //   import amp from '../src/index.ts';
      //   // comment
      // </script>
      content = content.replace(
        /<script type="module">\s*\n\s*import\s+['"][./]*src\/css\/main\.css['"];\s*\n\s*import\s+\w+\s+from\s+['"][./]*src\/index\.ts['"];\s*\n(?:\s*\/\/[^\n]*\n)*\s*<\/script>/g,
        `<link rel="stylesheet" href="${prefix}amphibious.css">\n    <script type="module" src="${prefix}amphibious.es.js"></script>`
      );

      // --- CSS-only import (single-line) ---
      content = content.replace(
        /<script type="module">\s*import\s+['"][./]*src\/css\/main\.css['"];\s*<\/script>/g,
        `<link rel="stylesheet" href="${prefix}amphibious.css">`
      );

      // --- CSS-only import (multi-line with optional comments) ---
      content = content.replace(
        /<script type="module">\s*\n\s*import\s+['"][./]*src\/css\/main\.css['"];\s*\n(?:\s*\/\/[^\n]*\n)*\s*<\/script>/g,
        `<link rel="stylesheet" href="${prefix}amphibious.css">`
      );

      // --- JS-only import (single-line) ---
      content = content.replace(
        /<script type="module">\s*import\s+\w+\s+from\s+['"][./]*src\/index\.ts['"];\s*<\/script>/g,
        `<script type="module" src="${prefix}amphibious.es.js"></script>`
      );

      // --- JS-only import (multi-line with optional comments) ---
      content = content.replace(
        /<script type="module">\s*\n\s*import\s+\w+\s+from\s+['"][./]*src\/index\.ts['"];\s*\n(?:\s*\/\/[^\n]*\n)*\s*<\/script>/g,
        `<script type="module" src="${prefix}amphibious.es.js"></script>`
      );

      // --- Remove .ts script references (compiled bundle includes all modules) ---
      // e.g. <script src="../src/js/navigation.ts"></script> — not valid without Vite
      content = content.replace(
        /\s*<script[^>]*\ssrc=["'][^"']*\/src\/js\/\w+\.ts["'][^>]*><\/script>/g,
        ''
      );

      // --- Remove src/js/index.js references (imports .ts modules, needs Vite) ---
      content = content.replace(
        /\s*<script[^>]*\ssrc=["'][^"']*\/src\/js\/index\.js["'][^>]*><\/script>/g,
        ''
      );

      // --- Replace src/index.js references with compiled bundle ---
      // src/index.js doesn't exist (only src/index.ts), compiled bundle replaces it
      content = content.replace(
        /<script([^>]*)\ssrc=["'][^"']*src\/index\.js["']([^>]*)><\/script>/g,
        `<script$1 src="${prefix}amphibious.es.js"$2></script>`
      );

      // --- Replace <link> to src/css/main.css with compiled CSS ---
      // In production, use the compiled amphibious.css instead of raw source
      content = content.replace(
        /<link\s+rel=["']stylesheet["']\s+href=["'][^"']*src\/css\/main\.css["'][^>]*>/g,
        `<link rel="stylesheet" href="${prefix}amphibious.css">`
      );

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        rewriteCount++;
      }
    }
  }
}
