#!/usr/bin/env node

/**
 * Fix asset paths in docs HTML files
 * Updates paths to work correctly from the docs subdirectory
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsDir = path.resolve(__dirname, '..', 'docs');

// Get all HTML files in docs directory
const htmlFiles = fs.readdirSync(docsDir).filter(file => file.endsWith('.html'));

console.log('🔧 Fixing paths in docs HTML files...\n');

let totalFixed = 0;

for (const file of htmlFiles) {
  const filePath = path.join(docsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let fixedCount = 0;

  // Fix CSS paths
  const cssPattern = /href="\/src\/css\/main\.css"/g;
  if (cssPattern.test(content)) {
    content = content.replace(cssPattern, 'href="../src/css/main.css"');
    fixedCount++;
  }

  // Fix JavaScript paths - point to the source index.ts for dev mode
  const jsPattern = /src="(\/dist\/amphibious\.es\.js|\.\.\/dist\/amphibious\.es\.js)"/g;
  if (jsPattern.test(content)) {
    content = content.replace(jsPattern, 'src="../src/index.ts"');
    fixedCount++;
  }

  // Also fix any old index.js references
  const oldJsPattern = /src="\/src\/index\.js"/g;
  if (oldJsPattern.test(content)) {
    content = content.replace(oldJsPattern, 'src="../src/index.ts"');
    fixedCount++;
  }

  // Fix favicon paths
  const faviconPattern = /href="\/favicon\.ico"/g;
  if (faviconPattern.test(content)) {
    content = content.replace(faviconPattern, 'href="../favicon.ico"');
    fixedCount++;
  }

  // Fix image paths that start with /images/
  const imagePattern = /src="\/images\//g;
  if (imagePattern.test(content)) {
    content = content.replace(imagePattern, 'src="../images/');
    fixedCount++;
  }

  // Fix navigation links to docs pages
  const navPattern = /href="\/docs\//g;
  if (navPattern.test(content)) {
    content = content.replace(navPattern, 'href="./');
    fixedCount++;
  }

  // Fix links to examples
  const examplesPattern = /href="\/examples\//g;
  if (examplesPattern.test(content)) {
    content = content.replace(examplesPattern, 'href="../examples/');
    fixedCount++;
  }

  // Fix root links
  const rootPattern = /href="\/index\.html"/g;
  if (rootPattern.test(content)) {
    content = content.replace(rootPattern, 'href="../index.html"');
    fixedCount++;
  }

  if (fixedCount > 0) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  ✓ ${file} - Fixed ${fixedCount} path reference(s)`);
    totalFixed += fixedCount;
  }
}

console.log(`\n✅ Fixed ${totalFixed} total path references across ${htmlFiles.length} files`);
console.log('📝 Docs pages should now load assets correctly!');