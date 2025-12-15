#!/usr/bin/env bun

/**
 * Fix Documentation Navigation Script
 * Adds consistent navigation to all documentation pages
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join, basename } from 'path';

const DOCS_DIR = '/Users/clivemoore/Documents/GitHub/AIAB/amphibious/docs';
const BACKUP_DIR = join(DOCS_DIR, 'backups', `nav-fix-${Date.now()}`);

// Create backup directory
if (!existsSync(BACKUP_DIR)) {
  mkdirSync(BACKUP_DIR, { recursive: true });
}

// Navigation HTML to inject
const NAVIGATION_HTML = `  <!-- Site Navigation -->
  <nav class="site-nav" aria-label="Main navigation">
    <div class="container">
      <ul class="horizontal branded">
        <li><a href="/" class="site-logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-waves">
            <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
            <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
            <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
          </svg>
          Amphibious
        </a></li>
        <li{{FOUNDATION_ACTIVE}}><a href="/docs/foundation.html">Foundation</a>
          <ul>
            <li><a href="/docs/foundation.html#core">Core</a></li>
            <li><a href="/docs/foundation.html#grid">Semantic Grid</a></li>
            <li><a href="/docs/foundation.html#responsive_col">Responsive Columns</a></li>
            <li><a href="/docs/foundation.html#fluid_col">Fluid Columns</a></li>
            <li><a href="/docs/foundation.html#golden_section">Golden ratio grids</a></li>
            <li><a href="/docs/foundation.html#push_pull">Source Ordering</a></li>
            <li><a href="/docs/foundation.html#mediaQueries">Media Queries</a></li>
          </ul>
        </li>
        <li{{FORM_ACTIVE}}><a href="/docs/form.html">Form</a>
          <ul>
            <li><a href="/docs/form.html#typography">Typography</a></li>
            <li><a href="/docs/form.html#forms">Basic Forms</a></li>
            <li><a href="/docs/form.html#multi_forms">Multi Beside Forms</a></li>
            <li><a href="/docs/form.html#custom_checkbox_radios">Custom Checkboxes and Radios</a></li>
            <li><a href="/docs/form.html#append_prepend_icons">Prepend and Append Icons</a></li>
            <li><a href="/docs/form.html#datepicker_fields">Date Picker Fields</a></li>
            <li><a href="/docs/form.html#tables">Tables</a></li>
          </ul>
        </li>
        <li{{FUNCTION_ACTIVE}}><a href="/docs/function.html">Function</a>
          <ul>
            <li><a href="/docs/function.html#navigation">Horizontal Nav</a></li>
            <li><a href="/docs/function.html#horizcss">Horizontal Nav CSS</a></li>
            <li><a href="/docs/function.html#vertnav">Vertical Nav</a></li>
            <li><a href="/docs/function.html#breadcrumbs">Breadcrumbs</a></li>
            <li><a href="/docs/function.html#tabmagic">Tabs</a></li>
            <li><a href="/docs/function.html#pagination">Pagination nav</a></li>
          </ul>
        </li>
        <li{{FEATURES_ACTIVE}}><a href="/docs/features.html">Features</a>
          <ul>
            <li><a href="/docs/features.html#slides">Responsive Slide Shows</a></li>
            <li><a href="/docs/features.html#helpers">Layout Helpers</a></li>
            <li><a href="/docs/features.html#pears">Content Pea.rs</a></li>
            <li><a href="/docs/features.html#icons">Lucide Icons</a></li>
          </ul>
        </li>
        <li><a href="/examples/">Examples</a></li>
      </ul>
    </div>
  </nav>`;

// Navigation styles to inject
const NAVIGATION_STYLES = `    /* Navigation styles */
    .site-nav {
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 1rem 0;
      position: sticky;
      top: 0;
      z-index: 1000;
      margin-bottom: 2rem;
    }

    .horizontal.branded {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0;
      flex-wrap: wrap;
    }

    .horizontal.branded > li {
      position: relative;
    }

    .horizontal.branded > li > a {
      text-decoration: none;
      color: #2c3e50;
      font-weight: 500;
      padding: 0.75rem 1.5rem;
      display: block;
      transition: background-color 0.2s, color 0.2s;
      border-bottom: 3px solid transparent;
    }

    .horizontal.branded > li:hover > a,
    .horizontal.branded > li.active > a {
      background-color: #667eea;
      color: white;
      border-bottom-color: #4c63d2;
    }

    .site-logo {
      font-size: 1.25rem;
      font-weight: 700;
      color: #667eea !important;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .horizontal.branded > li.active > a.site-logo {
      color: white !important;
    }

    /* Dropdown Menus */
    .horizontal.branded ul {
      position: absolute;
      top: 100%;
      left: 0;
      background: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border-radius: 0 0 8px 8px;
      min-width: 280px;
      padding: 0;
      margin: 0;
      list-style: none;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.2s ease;
      z-index: 1001;
    }

    .horizontal.branded li:hover > ul {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .horizontal.branded ul li {
      border-bottom: 1px solid #f0f0f0;
    }

    .horizontal.branded ul li:last-child {
      border-bottom: none;
    }

    .horizontal.branded ul a {
      display: block;
      padding: 0.75rem 1.5rem;
      color: #2c3e50;
      text-decoration: none;
      transition: background-color 0.2s;
      font-size: 0.9rem;
    }

    .horizontal.branded ul a:hover {
      background-color: #f8f9fa;
      color: #667eea;
    }

`;

// Files to process
const FILES_TO_PROCESS = [
  'form.html',
  'function.html',
  'features.html',
  'getting-started.html',
  'grid-system.html',
  'api-reference.html',
  'carousel.html',
  'icons.html',
  'index.html'
];

let processedCount = 0;
let skippedCount = 0;

FILES_TO_PROCESS.forEach(filename => {
  const filepath = join(DOCS_DIR, filename);

  if (!existsSync(filepath)) {
    skippedCount++;
    return;
  }

  // Read the file
  let content = readFileSync(filepath, 'utf-8');

  // Backup the original
  const backupPath = join(BACKUP_DIR, filename);
  writeFileSync(backupPath, content);

  // Check if navigation already exists
  if (content.includes('site-nav')) {
    skippedCount++;
    return;
  }

  // Determine active state
  let navHtml = NAVIGATION_HTML;
  if (filename === 'foundation.html') {
    navHtml = navHtml.replace('{{FOUNDATION_ACTIVE}}', ' class="active"');
  } else if (filename === 'form.html') {
    navHtml = navHtml.replace('{{FORM_ACTIVE}}', ' class="active"');
  } else if (filename === 'function.html') {
    navHtml = navHtml.replace('{{FUNCTION_ACTIVE}}', ' class="active"');
  } else if (filename === 'features.html') {
    navHtml = navHtml.replace('{{FEATURES_ACTIVE}}', ' class="active"');
  }

  // Clean up placeholders
  navHtml = navHtml.replace(/{{[A-Z_]+}}/g, '');

  // Add navigation styles if not present
  if (!content.includes('Navigation styles')) {
    content = content.replace('  <style>', `  <style>\n${NAVIGATION_STYLES}`);
  }

  // Add navigation after <body> tag
  const bodyMatch = content.match(/<body[^>]*>/);
  if (bodyMatch) {
    const bodyTag = bodyMatch[0];
    const insertPosition = content.indexOf(bodyTag) + bodyTag.length;
    content = content.slice(0, insertPosition) + '\n' + navHtml + '\n' + content.slice(insertPosition);
  }

  // Fix semantic structure - wrap content in proper sections
  // Look for main content areas and ensure they use semantic tags
  content = content.replace(/<div class="container">/g, '<div class="container">');

  // If there's no main tag, add one
  if (!content.includes('<main')) {
    // Find the content after navigation and wrap it
    const contentStart = content.indexOf('</nav>') + 6;
    const footerStart = content.lastIndexOf('<footer') || content.lastIndexOf('</body>');

    if (contentStart > 0 && footerStart > contentStart) {
      const mainContent = content.slice(contentStart, footerStart);
      content = content.slice(0, contentStart) +
                '\n<main id="main-content">\n' +
                mainContent +
                '\n</main>\n' +
                content.slice(footerStart);
    }
  }

  // Write the updated file
  writeFileSync(filepath, content);
  processedCount++;
});


// Also update the foundation.html that was already modified
