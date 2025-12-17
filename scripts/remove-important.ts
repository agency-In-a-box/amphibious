#!/usr/bin/env bun
/**
 * Automated removal of unnecessary !important declarations
 * Based on audit-important.ts results
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

interface RemovalTarget {
  file: string;
  removals: number;
}

async function createBackup(filePath: string): Promise<void> {
  const backupDir = join(process.cwd(), 'backups', new Date().toISOString().split('T')[0]);
  const backupPath = join(backupDir, filePath.replace(process.cwd() + '/', ''));

  await mkdir(dirname(backupPath), { recursive: true });
  const content = await readFile(filePath, 'utf-8');
  await writeFile(backupPath, content);
}

async function removeImportantFromFile(
  filePath: string,
  preservePatterns: RegExp[],
): Promise<number> {
  let content = await readFile(filePath, 'utf-8');
  const originalContent = content;
  let removalCount = 0;

  // Split into lines for line-by-line processing
  const lines = content.split('\n');
  const processedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Check if line contains !important
    if (line.includes('!important')) {
      // Check if this line should be preserved
      let shouldPreserve = false;

      // Check against preserve patterns
      for (const pattern of preservePatterns) {
        if (pattern.test(line)) {
          shouldPreserve = true;
          break;
        }
      }

      // Also check context to determine if it should be preserved
      // Get the selector context (look backwards for selector)
      let selector = '';
      for (let j = i - 1; j >= Math.max(0, i - 20); j--) {
        if (lines[j].includes('{') && !lines[j].includes('}')) {
          selector = lines[j].trim();
          break;
        }
      }

      // Preserve certain utility classes that legitimately need !important
      if (
        selector.includes('.hide') ||
        selector.includes('.hidden') ||
        selector.includes('.show') ||
        selector.includes('.visible') ||
        selector.includes('.print-only') ||
        selector.includes('.assistive-text') ||
        selector.includes('@media print') ||
        (selector.includes('.absolute') && line.includes('float')) ||
        (selector.includes('.fixed') && line.includes('float'))
      ) {
        shouldPreserve = true;
      }

      // If not preserving, remove !important
      if (!shouldPreserve) {
        // Remove " !important" (with the space)
        const newLine = line.replace(/\s*!important/g, '');
        if (newLine !== line) {
          removalCount++;
          line = newLine;
        }
      }
    }

    processedLines.push(line);
  }

  const newContent = processedLines.join('\n');

  // Only write if changes were made
  if (newContent !== originalContent) {
    await createBackup(filePath);
    await writeFile(filePath, newContent);
  }

  return removalCount;
}

async function main() {
  // Define patterns for declarations we want to preserve
  const preservePatterns = [
    // Print media queries typically need !important
    /@media\s+print/,
    // Display utilities for hiding/showing elements
    /\.(hide|hidden|show|visible|print-only|assistive-text)/,
    // Specific float resets for positioned elements
    /\.(absolute|fixed).*float.*none/,
  ];

  // Target files based on audit results
  const targetFiles = [
    'src/css/helpers.css',
    'src/css/grid-responsive.css',
    'src/css/grid.css',
    'src/css/navigation-dropdown-fix.css',
    'src/css/tablet_sixteen.css',
    'src/css/mobile_l_sixteen.css',
    'src/css/mobile_p_sixteen.css',
    'src/css/grid_sixteen.css',
    'src/css/always_fluid.css',
    'src/css/append_prepend.css',
    'src/css/custom_form_elements.css',
    'src/css/float_labels.css',
    'src/css/forms.css',
    'src/css/navigation.css',
    'src/css/sitemap.css',
    'src/css/molecules/tooltip.css',
    'src/css/molecules/tags.css',
    'src/css/atoms/buttons.css',
    'src/css/atoms/icons.css',
    'src/css/organisms/responsive-tables.css',
    'src/css/organisms/breadcrumbs.css',
    'src/css/organisms/tabs.css',
    'src/css/organisms/sidebar.css',
    'src/css/organisms/modal.css',
    'src/css/organisms/forms.css',
    'src/css/organisms/navigation.css',
    'src/css/organisms/footer.css',
  ];

  const results: RemovalTarget[] = [];
  let totalRemoved = 0;

  for (const file of targetFiles) {
    const fullPath = join(process.cwd(), file);
    if (!existsSync(fullPath)) {
      continue;
    }

    try {
      const removed = await removeImportantFromFile(fullPath, preservePatterns);
      if (removed > 0) {
        results.push({ file, removals: removed });
        totalRemoved += removed;
      } else {
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
    }
  }

  // Print summary
  results.sort((a, b) => b.removals - a.removals).forEach(({ file, removals }) => {});

  // Save removal log
  const log = {
    timestamp: new Date().toISOString(),
    totalRemoved,
    filesSummary: results,
    preservedPatterns: preservePatterns.map((p) => p.toString()),
  };

  await writeFile('important-removal-log.json', JSON.stringify(log, null, 2));

  // Next steps
}

main().catch(console.error);
