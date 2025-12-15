#!/usr/bin/env node

/**
 * Script to update all HTML files with centralized navigation includes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.join(__dirname, '..');

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
  'examples/showcase.html',
  'examples/e-commerce-catalog.html',
  'examples/shopping-cart.html',
  'examples/checkout.html',
  'examples/pears-patterns.html',
  'examples/navigation-showcase.html',
  'examples/atomic-design-demo.html'
];

const includeScript = `
  <!-- Load Navigation and Footer Includes -->
  <script>
    async function loadIncludes() {
      // Load navigation
      const navPlaceholder = document.getElementById('navigation-include');
      if (navPlaceholder) {
        try {
          const response = await fetch('/includes/navigation.html');
          const html = await response.text();
          navPlaceholder.outerHTML = html;
        } catch (error) {
          console.error('Failed to load navigation:', error);
        }
      }

      // Load footer
      const footerPlaceholder = document.getElementById('footer-include');
      if (footerPlaceholder) {
        try {
          const response = await fetch('/includes/footer.html');
          const html = await response.text();
          footerPlaceholder.outerHTML = html;
        } catch (error) {
          console.error('Failed to load footer:', error);
        }
      }

      // Re-initialize navigation component after loading
      if (window.amphibiousNav) {
        window.amphibiousNav.setActiveStates();
      }
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadIncludes);
    } else {
      loadIncludes();
    }
  </script>
</body>`;

function updateFile(filePath) {
  const fullPath = path.join(rootDir, filePath);

  if (!fs.existsSync(fullPath)) {
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // Check if already updated
  if (content.includes('navigation-include')) {
    return;
  }

  // Replace navigation
  // Match various navigation patterns
  const navPatterns = [
    /<nav\s+class=["']site-nav["'][\s\S]*?<\/nav>\s*(?:<!--[^>]*?-->\s*)?/gi,
    /<!--\s*Site Navigation\s*-->[\s\S]*?<\/nav>/gi,
    /<ul\s+class=["']horizontal\s+branded["'][\s\S]*?<\/ul>\s*<\/div>\s*<\/nav>/gi
  ];

  for (const pattern of navPatterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, '  <!-- Navigation Include -->\n  <div id="navigation-include"></div>\n');
      modified = true;
      break;
    }
  }

  // Replace footer if exists
  const footerPattern = /<footer[\s\S]*?<\/footer>/gi;
  if (footerPattern.test(content)) {
    content = content.replace(footerPattern, '  <!-- Footer Include -->\n  <div id="footer-include"></div>');
    modified = true;
  }

  // Add include script before closing body tag if not present
  if (modified && !content.includes('loadIncludes')) {
    content = content.replace(/<\/body>/i, includeScript);
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
  } else {
  }
}


filesToUpdate.forEach(file => {
  updateFile(file);
});

