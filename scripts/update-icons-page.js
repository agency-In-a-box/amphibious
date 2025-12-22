#!/usr/bin/env node

/**
 * Update icons documentation page to use lightweight icon set
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// List of available icons in our lightweight set
const availableIcons = [
  'shopping-cart',
  'heart',
  'star',
  'check',
  'x',
  'search',
  'menu',
  'chevron-down',
  'chevron-up',
  'chevron-left',
  'chevron-right',
  'arrow-right',
  'arrow-up',
  'check-circle',
  'alert-circle',
  'info',
  'help-circle',
  'github',
  'twitter',
  'moon',
  'sun',
  'lock',
  'truck',
  'package',
  'credit-card',
  'file-text',
  'message-circle',
  'users',
  'waves',
  'filter',
  'link',
];

// Categorize icons for display
const iconCategories = {
  Navigation: [
    'chevron-down',
    'chevron-up',
    'chevron-left',
    'chevron-right',
    'arrow-right',
    'arrow-up',
    'menu',
  ],
  Actions: ['check', 'x', 'search', 'filter', 'link'],
  Commerce: ['shopping-cart', 'credit-card', 'package', 'truck'],
  Social: ['heart', 'star', 'github', 'twitter', 'message-circle', 'users'],
  Alerts: ['check-circle', 'alert-circle', 'info', 'help-circle'],
  Interface: ['moon', 'sun', 'lock', 'file-text', 'waves'],
};

function generateIconsHTML() {
  let html = '';

  Object.entries(iconCategories).forEach(([category, icons]) => {
    html += `
      <div class="icon-category">
        <h3>${category}</h3>
        <div class="icon-grid">`;

    icons.forEach((icon) => {
      html += `
          <div class="icon-item" onclick="copyIconCode('${icon}', this)">
            <i data-lucide="${icon}" class="icon--lg"></i>
            <span class="icon-name">${icon}</span>
          </div>`;
    });

    html += `
        </div>
      </div>`;
  });

  return html;
}

// Update the icons page
const iconsPagePath = path.join(__dirname, '..', 'docs', 'icons.html');
let content = fs.readFileSync(iconsPagePath, 'utf-8');

// Find and replace the icon container section
const startMarker = '<!-- ICONS_START -->';
const endMarker = '<!-- ICONS_END -->';

if (!content.includes(startMarker)) {
  // Add markers if they don't exist
  const iconContainerPattern = /<div id="iconContainer"[^>]*>[\s\S]*?<\/div>(?=\s*<\/section>)/;

  if (iconContainerPattern.test(content)) {
    content = content.replace(
      iconContainerPattern,
      `<!-- ICONS_START -->
      <div id="iconContainer" class="icons-container">
        ${generateIconsHTML()}
      </div>
      <!-- ICONS_END -->`,
    );
  }
} else {
  // Replace between markers
  const pattern = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`, 'g');
  content = content.replace(
    pattern,
    `${startMarker}
      <div id="iconContainer" class="icons-container">
        ${generateIconsHTML()}
      </div>
      ${endMarker}`,
  );
}

// Also update the title and description to reflect lightweight system
content = content.replace(
  'Complete documentation for all 1,641+ Lucide icons',
  'Complete documentation for all lightweight icons',
);

content = content.replace(
  'Complete collection of 1,641+ beautiful, consistently crafted icons',
  `${availableIcons.length} lightweight, optimized icons for fast performance`,
);

// Update the script to initialize icons after dynamic content
content = content.replace(
  'window.copyToClipboard = copyToClipboard;',
  `window.copyToClipboard = copyToClipboard;

    // Initialize icons after page load
    setTimeout(() => {
      if (window.amp && window.amp.modules.icon && window.amp.modules.icon.init) {
        window.amp.modules.icon.init();
      }
    }, 100);`,
);

fs.writeFileSync(iconsPagePath, content);

console.log(`✅ Updated icons page with ${availableIcons.length} lightweight icons`);
console.log(`📦 Categories: ${Object.keys(iconCategories).join(', ')}`);
