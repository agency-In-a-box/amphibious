#!/usr/bin/env node

/**
 * Fix navigation by embedding it statically instead of dynamic loading
 * This resolves the issue where the homepage appears on all pages
 */

import fs from 'node:fs';
import path from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Read the navigation HTML
const navigationPath = path.join(rootDir, 'includes', 'navigation.html');
const navigationHTML = fs.readFileSync(navigationPath, 'utf8');

// Clean up the navigation HTML (remove the script tag that's already loaded)
const cleanNavHTML = navigationHTML.replace(/<script[^>]*navigation\.js[^>]*><\/script>\s*/gi, '');

// Files to update
const filesToUpdate = [
  'docs/foundation.html',
  'docs/form.html',
  'docs/function.html',
  'docs/features.html',
  'docs/index.html',
  'docs/getting-started.html',
  'docs/grid-system.html',
  'docs/api-reference.html',
  'docs/carousel.html',
  'examples/index.html',
  'examples/e-commerce-catalog.html',
  'examples/pears-patterns.html',
  'examples/navigation-showcase.html',
  'examples/atomic-design-demo.html',
  'index.html'
];

function updateFile(filePath) {
  const fullPath = path.join(rootDir, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // Replace the navigation-include div with actual navigation
  if (content.includes('<div id="navigation-include"></div>')) {
    content = content.replace(
      '<div id="navigation-include"></div>',
      cleanNavHTML
    );
    modified = true;
  }

  // Remove the dynamic loading script
  const loadIncludesPattern = /<!--\s*Load Navigation[^>]*-->[\s\S]*?loadIncludes\(\);\s*}\s*<\/script>/gi;
  if (loadIncludesPattern.test(content)) {
    content = content.replace(loadIncludesPattern, '');
    modified = true;
  }

  // Alternative pattern for the loading script
  const scriptPattern = /<script>\s*async function loadIncludes\(\)[\s\S]*?<\/script>/gi;
  if (scriptPattern.test(content)) {
    content = content.replace(scriptPattern, '');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  } else {
    console.log(`⚠️  No changes needed: ${filePath}`);
  }
}

console.log('🔧 Fixing navigation to use static HTML...\n');

filesToUpdate.forEach((file) => {
  updateFile(file);
});

console.log('\n✨ Navigation fixed! Pages should no longer show homepage content.');
console.log('📝 The navigation is now embedded statically in each page.');