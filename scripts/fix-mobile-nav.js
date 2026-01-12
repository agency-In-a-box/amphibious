#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of files that need fixing
const filesToFix = [
  'alerts-demo.html',
  'buttons-input-groups-broken.html',
  'buttons-input-groups.html',
  'carousel-showcase.html',
  'checkout-flow.html',
  'dashboard-template.html',
  'e-commerce-cart.html',
  'e-commerce-product.html',
  'icons-enhanced.html',
  'icons.html',
  'modal-enhanced.html',
  'modal.html',
  'modern-filter-system.html',
  'modern-responsive-tables.html',
  'navigation-demo.html',
  'shopping-cart-modern.html',
  'sidebar-demo.html',
  'tabs-pagination-steps-demo.html',
  'tooltip-enhanced.html',
  'tooltip.html',
  'user-dashboard.html',
  'workilo-filter-system.html',
];

const examplesDir = path.join(__dirname, '..', 'examples');

function fixFile(filename) {
  const filepath = path.join(examplesDir, filename);

  if (!fs.existsSync(filepath)) {
    console.log(`⚠️  File not found: ${filename}`);
    return false;
  }

  let content = fs.readFileSync(filepath, 'utf-8');
  let modified = false;

  // Check if nav-toggle already exists
  if (content.includes('nav-toggle')) {
    console.log(`✓ ${filename} already has mobile toggle`);
    return false;
  }

  // Add mobile toggle button after <div class="container"> in nav
  const navPattern =
    /<nav[^>]*class="[^"]*site-nav[^"]*"[^>]*>[\s\S]*?<div[^>]*class="[^"]*container[^"]*"[^>]*>/;
  if (navPattern.test(content)) {
    content = content.replace(navPattern, (match) => {
      return `${match}
      <button class="nav-toggle hide-desktop" aria-expanded="false" aria-controls="main-nav">
        <span class="nav-toggle-icon" aria-hidden="true"></span>
        <span class="sr-only">Toggle navigation</span>
      </button>
`;
    });
    modified = true;
  }

  // Add id="main-nav" to the ul.horizontal if it doesn't have it
  const ulPattern = /<ul\s+class="([^"]*horizontal[^"]*)"\s*>/;
  if (ulPattern.test(content) && !content.includes('id="main-nav"')) {
    content = content.replace(ulPattern, '<ul id="main-nav" class="$1">');
    modified = true;
  }

  // Add JavaScript import before closing </body> if not present
  if (!content.includes('src/js/index.js') && !content.includes('src/index.js')) {
    const bodyClosePattern = /<\/body>/;
    if (bodyClosePattern.test(content)) {
      const scriptTag = `
    <!-- Import main JavaScript for navigation -->
    <script type="module" src="../src/js/index.js"></script>

</body>`;
      content = content.replace(bodyClosePattern, scriptTag);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filepath, content);
    console.log(`✅ Fixed ${filename}`);
    return true;
  }
  console.log(`ℹ️  No changes needed for ${filename}`);
  return false;
}

console.log('🔧 Fixing mobile navigation in example files...\n');

let fixedCount = 0;
let errorCount = 0;

for (const file of filesToFix) {
  try {
    if (fixFile(file)) {
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
    errorCount++;
  }
}

console.log('\n📊 Summary:');
console.log(`   Fixed: ${fixedCount} files`);
console.log(`   Errors: ${errorCount} files`);
console.log(`   Total: ${filesToFix.length} files`);
