#!/usr/bin/env node

/**
 * AIAB Namespace Addition Script
 *
 * This script adds the .aiab- prefix to all CSS classes in Amphibious
 * to prevent conflicts with external CSS frameworks like Bootstrap, Tailwind, etc.
 *
 * Usage: node scripts/add-aiab-namespace.js
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// Classes that should be prefixed with .aiab-
const CLASSES_TO_PREFIX = [
  // Grid system
  'container', 'container-fluid', 'grid', 'row',

  // Column classes
  'col-1', 'col-2', 'col-3', 'col-4', 'col-5', 'col-6', 'col-7', 'col-8',
  'col-9', 'col-10', 'col-11', 'col-12', 'col-13', 'col-14', 'col-15', 'col-16',

  // Responsive columns
  'col-tablet-1', 'col-tablet-2', 'col-tablet-3', 'col-tablet-4', 'col-tablet-5',
  'col-tablet-6', 'col-tablet-7', 'col-tablet-8', 'col-tablet-9', 'col-tablet-10',
  'col-tablet-11', 'col-tablet-12', 'col-tablet-13', 'col-tablet-14', 'col-tablet-15', 'col-tablet-16',

  'col-mobile-1', 'col-mobile-2', 'col-mobile-3', 'col-mobile-4', 'col-mobile-5',
  'col-mobile-6', 'col-mobile-7', 'col-mobile-8', 'col-mobile-9', 'col-mobile-10',
  'col-mobile-11', 'col-mobile-12', 'col-mobile-13', 'col-mobile-14', 'col-mobile-15', 'col-mobile-16',

  // Grid spans
  'span-1', 'span-2', 'span-3', 'span-4', 'span-5', 'span-6', 'span-7', 'span-8',
  'span-9', 'span-10', 'span-11', 'span-12', 'span-13', 'span-14', 'span-15', 'span-16',

  // Offsets
  'offset-1', 'offset-2', 'offset-3', 'offset-4', 'offset-5', 'offset-6', 'offset-7', 'offset-8',
  'offset-9', 'offset-10', 'offset-11', 'offset-12', 'offset-13', 'offset-14', 'offset-15',

  // Push/Pull
  'push-1', 'push-2', 'push-3', 'push-4', 'push-5', 'push-6', 'push-7', 'push-8',
  'pull-1', 'pull-2', 'pull-3', 'pull-4', 'pull-5', 'pull-6', 'pull-7', 'pull-8',

  // Components
  'btn', 'button', 'badge', 'card', 'modal', 'alert', 'tooltip', 'dropdown',
  'nav', 'navbar', 'sidebar', 'accordion', 'tab', 'tabs', 'carousel', 'slider',
  'form', 'form-group', 'form-control', 'input', 'textarea', 'select',
  'table', 'thead', 'tbody', 'tr', 'td', 'th',
  'icon', 'spinner', 'avatar', 'switch', 'skeleton',
  'progress', 'toast', 'breadcrumb', 'pagination', 'steps',

  // Variants and modifiers (common patterns)
  'primary', 'secondary', 'success', 'warning', 'danger', 'info', 'light', 'dark',
  'small', 'large', 'block', 'inline', 'outline', 'ghost', 'pill', 'loading',
  'active', 'disabled', 'hover', 'focus', 'valid', 'invalid'
];

// Create regex patterns for class detection
const CLASS_PATTERNS = CLASSES_TO_PREFIX.map(className =>
  new RegExp(`\\.${className}(?![a-zA-Z0-9_-])`, 'g')
);

function transformCSSContent(content) {
  let transformedContent = content;

  // Transform each class pattern
  CLASSES_TO_PREFIX.forEach(className => {
    const pattern = new RegExp(`\\.${className}(?![a-zA-Z0-9_-])`, 'g');
    transformedContent = transformedContent.replace(pattern, `.aiab-${className}`);
  });

  return transformedContent;
}

function processFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const transformedContent = transformCSSContent(content);

    // Only write if content changed
    if (content !== transformedContent) {
      writeFileSync(filePath, transformedContent);
      console.log(`✅ Transformed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  let filesChanged = 0;

  const entries = readdirSync(dirPath);

  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Recursively process subdirectories
      filesChanged += processDirectory(fullPath);
    } else if (extname(entry) === '.css') {
      // Process CSS files
      if (processFile(fullPath)) {
        filesChanged++;
      }
    }
  }

  return filesChanged;
}

// Main execution
console.log('🚀 Starting AIAB namespace transformation...\n');

const srcCssPath = join(process.cwd(), 'src', 'css');
console.log(`Processing CSS files in: ${srcCssPath}\n`);

const totalFilesChanged = processDirectory(srcCssPath);

console.log(`\n✨ Transformation complete!`);
console.log(`📊 Files changed: ${totalFilesChanged}`);
console.log(`🎯 All CSS classes now use .aiab- prefix to prevent framework conflicts`);