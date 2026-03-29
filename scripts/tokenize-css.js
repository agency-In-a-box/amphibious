#!/usr/bin/env node
/**
 * CSS-4: Replace hardcoded hex values with design token references.
 * Only replaces in NON-dark-mode sections (outside @media (prefers-color-scheme: dark) blocks).
 * Dark mode sections are left as-is since their values are intentional overrides.
 *
 * Usage: node scripts/tokenize-css.js [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DRY_RUN = process.argv.includes('--dry-run');

// Substitution map: hex → token
// Only for values that appear frequently across multiple files
const SUBSTITUTIONS = [
  // Accent blue (order matters — longer/more specific first)
  ['#2563eb', 'var(--color-accent)'],
  ['#1d4ed8', 'var(--color-accent-hover)'],
  ['#dbeafe', 'var(--color-accent-light)'],
  ['#1e40af', 'var(--color-accent-dark)'],

  // Extended grays (Tailwind-adjacent)
  ['#f9fafb', 'var(--color-gray-50)'],
  ['#f3f4f6', 'var(--color-gray-150)'],
  ['#d1d5db', 'var(--color-gray-350)'],
  ['#9ca3af', 'var(--color-gray-450)'],
  ['#6b7280', 'var(--color-gray-550)'],
  ['#4b5563', 'var(--color-gray-650)'],
  ['#374151', 'var(--color-gray-750)'],
  ['#1f2937', 'var(--color-gray-850)'],
  ['#111827', 'var(--color-gray-950)'],

  // Status colors (existing tokens)
  ['#28a745', 'var(--color-success)'],
  ['#dc3545', 'var(--color-danger)'],
  ['#ffc107', 'var(--color-warning)'],
  ['#17a2b8', 'var(--color-info)'],

  // Status hover variants
  ['#218838', 'var(--color-success-hover)'],
  ['#d4edda', 'var(--color-success-light)'],
  ['#c82333', 'var(--color-danger-hover)'],
  ['#f8d7da', 'var(--color-danger-light)'],
  ['#e0a800', 'var(--color-warning-hover)'],
  ['#fff3cd', 'var(--color-warning-light)'],
  ['#138496', 'var(--color-info-hover)'],
  ['#d1ecf1', 'var(--color-info-light)'],

  // Data-table uses #3b82f6 (Tailwind blue-500) as accent
  ['#3b82f6', 'var(--color-accent)'],

  // #eff6ff is accent-light-ish (blue-50 in Tailwind)
  ['#eff6ff', 'var(--color-accent-light)'],

  // Bootstrap grays (exact matches to existing tokens)
  ['#f8f9fa', 'var(--color-gray-100)'],
  ['#e9ecef', 'var(--color-gray-200)'],
  ['#dee2e6', 'var(--color-gray-300)'],
  ['#ced4da', 'var(--color-gray-400)'],
  ['#adb5bd', 'var(--color-gray-500)'],
  ['#6c757d', 'var(--color-gray-600)'],
  ['#495057', 'var(--color-gray-700)'],
  ['#343a40', 'var(--color-gray-800)'],
  ['#212529', 'var(--color-gray-900)'],

  // Primary brand colors (exact matches to existing tokens)
  ['#a65e00', 'var(--color-primary-text)'],
  ['#c97400', 'var(--color-primary-dark)'],
  ['#d87a00', 'var(--color-primary-active)'],
  ['#8a4e00', 'var(--color-link-visited)'],

  // Shorthand hex → existing tokens (exact matches)
  ['#dedede', 'var(--color-border)'],
  ['#fafafa', 'var(--color-code-bg)'],

  // Apple blue used in form-builder/timeline/range-slider
  ['#007aff', 'var(--color-accent)'],
];

// Process ALL library CSS files, excluding token definitions, dark-mode, and pages/
const CSS_DIR = resolve(import.meta.dirname, '../src/css');

const SKIP = new Set(['dark-mode.css', 'main.css', 'main-lib.css', 'pages.css']);
const SKIP_DIRS = new Set(['pages', 'tokens']);

import { readdirSync, statSync } from 'node:fs';

function collectFiles(dir, base = '') {
  const entries = readdirSync(dir);
  const result = [];
  for (const entry of entries) {
    const rel = base ? `${base}/${entry}` : entry;
    const full = resolve(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (!SKIP_DIRS.has(entry)) {
        result.push(...collectFiles(full, rel));
      }
    } else if (entry.endsWith('.css') && !SKIP.has(entry)) {
      result.push(rel);
    }
  }
  return result;
}

const FILES = collectFiles(CSS_DIR).sort();

/**
 * Determine if a line is inside a dark mode block.
 * We track nested brace depth after encountering `@media (prefers-color-scheme: dark)`.
 */
function splitLightAndDark(content) {
  const lines = content.split('\n');
  const isInDarkMode = new Array(lines.length).fill(false);
  let inDarkMedia = false;
  let braceDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if this line starts a dark mode media query
    if (!inDarkMedia && line.includes('prefers-color-scheme: dark') && line.includes('@media')) {
      inDarkMedia = true;
      braceDepth = 0;
      // Count braces on this line
      for (const ch of line) {
        if (ch === '{') braceDepth++;
        if (ch === '}') braceDepth--;
      }
      isInDarkMode[i] = true;
      if (braceDepth <= 0) {
        inDarkMedia = false;
      }
      continue;
    }

    if (inDarkMedia) {
      isInDarkMode[i] = true;
      for (const ch of line) {
        if (ch === '{') braceDepth++;
        if (ch === '}') braceDepth--;
      }
      if (braceDepth <= 0) {
        inDarkMedia = false;
      }
    }
  }

  return { lines, isInDarkMode };
}

let totalReplacements = 0;
const fileStats = [];

for (const relPath of FILES) {
  const fullPath = resolve(CSS_DIR, relPath);
  let content;
  try {
    content = readFileSync(fullPath, 'utf-8');
  } catch {
    console.warn(`  SKIP: ${relPath} (file not found)`);
    continue;
  }

  const { lines, isInDarkMode } = splitLightAndDark(content);
  let fileReplacements = 0;

  for (let i = 0; i < lines.length; i++) {
    if (isInDarkMode[i]) continue;

    let line = lines[i];

    // Skip lines that are inside :root blocks (token definitions)
    if (line.trimStart().startsWith('--')) continue;

    // Skip lines that already use var()
    // (but a line could have both var() and hardcoded — handle per-value)

    for (const [hex, token] of SUBSTITUTIONS) {
      // Case-insensitive match for the hex value
      const regex = new RegExp(hex.replace('#', '#'), 'gi');
      const matches = line.match(regex);
      if (matches) {
        line = line.replace(regex, token);
        fileReplacements += matches.length;
      }
    }

    lines[i] = line;
  }

  if (fileReplacements > 0) {
    const newContent = lines.join('\n');
    if (!DRY_RUN) {
      writeFileSync(fullPath, newContent);
    }
    fileStats.push({ file: relPath, replacements: fileReplacements });
    totalReplacements += fileReplacements;
    console.log(`  ${DRY_RUN ? '[DRY] ' : ''}${relPath}: ${fileReplacements} replacements`);
  } else {
    console.log(`  ${relPath}: no changes`);
  }
}

console.log(
  `\n${DRY_RUN ? '[DRY RUN] ' : ''}Total: ${totalReplacements} replacements across ${fileStats.length} files`,
);

if (DRY_RUN) {
  console.log('\nRun without --dry-run to apply changes.');
}
