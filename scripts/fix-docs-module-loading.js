#!/usr/bin/env node

/**
 * Fix documentation pages to properly load CSS and JS modules in Vite dev server
 * This updates all HTML files to use module imports instead of direct CSS links
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsDir = path.join(__dirname, '..', 'docs');
const examplesDir = path.join(__dirname, '..', 'examples');

function fixHTMLFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);
  let modified = false;

  // Remove old CSS link tag
  const cssLinkPattern = /<link\s+rel="stylesheet"\s+href="[^"]*\/src\/css\/main\.css"[^>]*>/g;
  if (cssLinkPattern.test(content)) {
    content = content.replace(cssLinkPattern, '  <!-- CSS loaded via JavaScript module -->');
    modified = true;
  }

  // Update or add proper module script
  const oldScriptPattern = /<script\s+type="module"\s+src="[^"]*\/src\/index\.ts"[^>]*><\/script>/g;

  if (oldScriptPattern.test(content)) {
    content = content.replace(
      oldScriptPattern,
      `  <script type="module">
    import '../src/css/main.css';
    import amp from '../src/index.ts';
    // Amphibious auto-initializes when the module loads
  </script>`,
    );
    modified = true;
  } else if (!content.includes('import amp from')) {
    // Add module script before closing body if not present
    const bodyClosePattern = /<\/body>/;
    if (bodyClosePattern.test(content)) {
      content = content.replace(
        bodyClosePattern,
        `  <script type="module">
    import '../src/css/main.css';
    import amp from '../src/index.ts';
    // Amphibious auto-initializes when the module loads
  </script>
</body>`,
      );
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${fileName}`);
    return 1;
  }

  console.log(`⏭️  Skipped: ${fileName} (already fixed)`);
  return 0;
}

function processDirectory(dir, label) {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  ${label} directory not found: ${dir}`);
    return 0;
  }

  console.log(`\n📁 Processing ${label}...`);
  const files = fs.readdirSync(dir);
  let fixedCount = 0;

  files.forEach((file) => {
    if (file.endsWith('.html')) {
      const filePath = path.join(dir, file);
      fixedCount += fixHTMLFile(filePath);
    }
  });

  return fixedCount;
}

console.log('🔧 Fixing Documentation Module Loading for Vite Dev Server\n');

let totalFixed = 0;

// Process docs directory
totalFixed += processDirectory(docsDir, 'docs');

// Process examples directory
totalFixed += processDirectory(examplesDir, 'examples');

// Also fix root HTML files
const rootDir = path.join(__dirname, '..');
const rootFiles = ['index.html', 'sitemap.html', 'apple-redesign.html', 'test-cascade.html'];

console.log('\n📁 Processing root files...');
rootFiles.forEach((file) => {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    totalFixed += fixHTMLFile(filePath);
  }
});

console.log(`\n✨ Done! Fixed ${totalFixed} files for proper module loading.`);
console.log(
  '\n💡 Note: The dev server at http://localhost:2961/ should now properly load all styles and scripts.',
);
