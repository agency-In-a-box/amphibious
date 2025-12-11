#!/usr/bin/env bun
/**
 * Audit and analyze !important declarations in CSS files
 * Generates a report for systematic removal strategy
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

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
      files.push(...await findCSSFiles(path));
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
  if (filePath.includes('/atoms/') || filePath.includes('/molecules/') || filePath.includes('/organisms/')) return 'component';
  return 'other';
}

function analyzeJustification(selector: string, property: string, category: ImportantDeclaration['category']): ImportantDeclaration['justification'] {
  // Utility classes often need !important to override component styles
  if (category === 'utility') {
    // Display utilities like .hide, .show typically need !important
    if (selector.includes('.hide') || selector.includes('.hidden') ||
        selector.includes('.show') || selector.includes('.visible')) {
      return 'needed';
    }
    // Position reset utilities might need it
    if (property === 'float' && selector.includes('.absolute') || selector.includes('.fixed')) {
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
          justification
        });
      }
    }
  }

  return declarations;
}

async function main() {
  console.log('🔍 Auditing !important declarations in Amphibious CSS...\n');

  const cssDir = join(process.cwd(), 'src/css');
  const files = await findCSSFiles(cssDir);

  const allDeclarations: ImportantDeclaration[] = [];

  for (const file of files) {
    const declarations = await analyzeFile(file);
    allDeclarations.push(...declarations);
  }

  // Generate summary statistics
  const total = allDeclarations.length;
  const byCategory = allDeclarations.reduce((acc, d) => {
    acc[d.category] = (acc[d.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byJustification = allDeclarations.reduce((acc, d) => {
    acc[d.justification] = (acc[d.justification] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byFile = allDeclarations.reduce((acc, d) => {
    acc[d.file] = (acc[d.file] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Print summary
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total !important declarations: ${total}`);
  console.log('\nBy Category:');
  Object.entries(byCategory).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} (${((count/total) * 100).toFixed(1)}%)`);
  });

  console.log('\nBy Justification:');
  Object.entries(byJustification).forEach(([just, count]) => {
    const emoji = just === 'needed' ? '✅' : just === 'questionable' ? '⚠️' : '❌';
    console.log(`  ${emoji} ${just}: ${count} (${((count/total) * 100).toFixed(1)}%)`);
  });

  console.log('\nTop Files:');
  Object.entries(byFile)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([file, count]) => {
      console.log(`  ${count.toString().padStart(3)} - ${file}`);
    });

  // List removable declarations
  console.log('\n❌ REMOVABLE DECLARATIONS');
  console.log('='.repeat(60));
  const removable = allDeclarations.filter(d => d.justification === 'removable');
  console.log(`Found ${removable.length} declarations that can be safely removed:\n`);

  removable.slice(0, 20).forEach(d => {
    console.log(`${d.file}:${d.line}`);
    console.log(`  Selector: ${d.selector}`);
    console.log(`  Property: ${d.property}: ${d.value} !important`);
    console.log('');
  });

  if (removable.length > 20) {
    console.log(`... and ${removable.length - 20} more\n`);
  }

  // List questionable declarations
  console.log('⚠️  QUESTIONABLE DECLARATIONS');
  console.log('='.repeat(60));
  const questionable = allDeclarations.filter(d => d.justification === 'questionable');
  console.log(`Found ${questionable.length} declarations that need review:\n`);

  questionable.slice(0, 10).forEach(d => {
    console.log(`${d.file}:${d.line}`);
    console.log(`  Selector: ${d.selector}`);
    console.log(`  Property: ${d.property}: ${d.value} !important`);
    console.log('');
  });

  // Save detailed report
  const report = {
    summary: {
      total,
      byCategory,
      byJustification,
      topFiles: Object.entries(byFile).sort((a, b) => b[1] - a[1]).slice(0, 10)
    },
    removable: removable.map(d => ({
      file: d.file,
      line: d.line,
      selector: d.selector,
      property: d.property,
      value: d.value
    })),
    questionable: questionable.map(d => ({
      file: d.file,
      line: d.line,
      selector: d.selector,
      property: d.property,
      value: d.value
    })),
    needed: allDeclarations.filter(d => d.justification === 'needed').length
  };

  await Bun.write('important-audit-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Detailed report saved to important-audit-report.json');

  // Provide action plan
  console.log('\n🎯 ACTION PLAN');
  console.log('='.repeat(60));
  console.log('1. Start by removing the "removable" declarations');
  console.log('2. Review and refactor "questionable" declarations');
  console.log('3. Document why "needed" declarations must remain');
  console.log('4. Consider using CSS layers or :where() for better specificity control');
  console.log(`\nEstimated improvement: Remove ${removable.length + Math.floor(questionable.length/2)} of ${total} declarations (${Math.round(((removable.length + Math.floor(questionable.length/2))/total) * 100)}%)`);
}

main().catch(console.error);