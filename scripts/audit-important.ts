#!/usr/bin/env bun
/**
 * Audit and analyze !important declarations in CSS files
 * Generates a report for systematic removal strategy
 */

import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

interface ImportantDeclaration {
  file: string;
  line: number;
  selector: string;
  property: string;
  value: string;
  context: string;
  category: 'utility' | 'component' | 'grid' | 'print' | 'other';
  justification: 'needed' | 'questionable' | 'removable';
}

async function findCSSFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const items = await readdir(dir, { withFileTypes: true });

  for (const item of items) {
    const path = join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...(await findCSSFiles(path)));
    } else if (item.name.endsWith('.css')) {
      files.push(path);
    }
  }

  return files;
}

function categorizeFile(filePath: string): ImportantDeclaration['category'] {
  if (filePath.includes('helpers.css')) return 'utility';
  if (filePath.includes('grid')) return 'grid';
  if (filePath.includes('print.css')) return 'print';
  if (
    filePath.includes('/atoms/') ||
    filePath.includes('/molecules/') ||
    filePath.includes('/organisms/')
  )
    return 'component';
  return 'other';
}

function analyzeJustification(
  selector: string,
  property: string,
  category: ImportantDeclaration['category'],
): ImportantDeclaration['justification'] {
  // Utility classes often need !important to override component styles
  if (category === 'utility') {
    // Display utilities like .hide, .show typically need !important
    if (
      selector.includes('.hide') ||
      selector.includes('.hidden') ||
      selector.includes('.show') ||
      selector.includes('.visible')
    ) {
      return 'needed';
    }
    // Position reset utilities might need it
    if ((property === 'float' && selector.includes('.absolute')) || selector.includes('.fixed')) {
      return 'needed';
    }
    // Text alignment utilities usually need it
    if (selector.includes('.text-') || selector.includes('.align-')) {
      return 'questionable';
    }
  }

  // Print styles typically need !important to override screen styles
  if (category === 'print') {
    return 'needed';
  }

  // Grid responsive overrides might need !important
  if (category === 'grid' && selector.includes('@media')) {
    return 'questionable';
  }

  // Component styles generally shouldn't need !important
  if (category === 'component') {
    return 'removable';
  }

  return 'removable';
}

async function analyzeFile(filePath: string): Promise<ImportantDeclaration[]> {
  const content = await readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  const declarations: ImportantDeclaration[] = [];
  const category = categorizeFile(filePath);

  let currentSelector = '';
  let inRule = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Track current selector
    if (line.includes('{') && !line.includes('!important')) {
      currentSelector = line.split('{')[0].trim();
      inRule = true;
    } else if (line.includes('}')) {
      inRule = false;
      currentSelector = '';
    }

    // Find !important declarations
    if (line.includes('!important')) {
      const match = line.match(/([a-z-]+)\s*:\s*([^;]+)\s*!important/i);
      if (match) {
        const property = match[1];
        const value = match[2].trim();

        // Get context (surrounding lines)
        const contextStart = Math.max(0, i - 2);
        const contextEnd = Math.min(lines.length - 1, i + 2);
        const context = lines.slice(contextStart, contextEnd + 1).join('\n');

        // If we don't have a selector from tracking, try to find it
        if (!currentSelector) {
          for (let j = i - 1; j >= Math.max(0, i - 10); j--) {
            if (lines[j].includes('{') && !lines[j].includes('}')) {
              currentSelector = lines[j].split('{')[0].trim();
              break;
            }
          }
        }

        const justification = analyzeJustification(currentSelector, property, category);

        declarations.push({
          file: filePath.replace('/Users/clivemoore/Documents/GitHub/AIAB/amphibious/', ''),
          line: lineNum,
          selector: currentSelector || 'unknown',
          property,
          value,
          context,
          category,
          justification,
        });
      }
    }
  }

  return declarations;
}

async function main() {
  const cssDir = join(process.cwd(), 'src/css');
  const files = await findCSSFiles(cssDir);

  const allDeclarations: ImportantDeclaration[] = [];

  for (const file of files) {
    const declarations = await analyzeFile(file);
    allDeclarations.push(...declarations);
  }

  // Generate summary statistics
  const total = allDeclarations.length;
  const byCategory = allDeclarations.reduce(
    (acc, d) => {
      acc[d.category] = (acc[d.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const byJustification = allDeclarations.reduce(
    (acc, d) => {
      acc[d.justification] = (acc[d.justification] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const byFile = allDeclarations.reduce(
    (acc, d) => {
      acc[d.file] = (acc[d.file] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Print summary
  Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {});

  Object.entries(byJustification).forEach(([just, count]) => {
    const emoji = just === 'needed' ? '✅' : just === 'questionable' ? '⚠️' : '❌';
  });

  Object.entries(byFile)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([file, count]) => {});

  // List removable declarations
  const removable = allDeclarations.filter((d) => d.justification === 'removable');

  removable.slice(0, 20).forEach((d) => {});

  if (removable.length > 20) {
  }

  // List questionable declarations
  const questionable = allDeclarations.filter((d) => d.justification === 'questionable');

  questionable.slice(0, 10).forEach((d) => {});

  // Save detailed report
  const report = {
    summary: {
      total,
      byCategory,
      byJustification,
      topFiles: Object.entries(byFile)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
    },
    removable: removable.map((d) => ({
      file: d.file,
      line: d.line,
      selector: d.selector,
      property: d.property,
      value: d.value,
    })),
    questionable: questionable.map((d) => ({
      file: d.file,
      line: d.line,
      selector: d.selector,
      property: d.property,
      value: d.value,
    })),
    needed: allDeclarations.filter((d) => d.justification === 'needed').length,
  };

  await Bun.write('important-audit-report.json', JSON.stringify(report, null, 2));

  // Provide action plan
}

main().catch(console.error);
