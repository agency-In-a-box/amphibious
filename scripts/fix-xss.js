#!/usr/bin/env node

/**
 * Script to fix XSS vulnerabilities by replacing innerHTML with safe alternatives
 * This script updates all JS/TS files to use DOMPurify sanitization
 */

const fs = require('node:fs');
const path = require('node:path');

// Files to update (from our earlier search)
const filesToUpdate = [
  '../src/js/data-table.js',
  '../src/js/dark-mode-toggle.js',
  '../src/js/search-bar.js',
  '../src/js/modal.ts',
  '../src/js/datepicker-enhanced.js',
  '../src/js/dropdown-enhanced.js',
  '../src/js/form-builder.js',
  '../src/js/carousel.ts',
  '../src/js/file-upload-enhanced.js',
  '../src/js/forms.ts',
  '../src/js/timeline.js',
  '../src/js/file-upload.js',
  '../src/js/dropdown.js',
  '../src/js/tooltip.ts',
  '../src/js/search-bar-enhanced.js',
  '../src/js/icons-lightweight.ts',
  '../src/js/toast.js',
  '../src/js/color-picker.js',
  '../src/js/datepicker.js',
];

function updateFile(filePath) {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;

  // Check if file uses innerHTML
  if (!content.includes('innerHTML')) {
    console.log(`✓  No innerHTML found in: ${filePath}`);
    return;
  }

  // Add import statement if not already present
  const hasImport = content.includes('sanitize.ts') || content.includes('sanitize.js');

  if (!hasImport) {
    // Determine if it's TypeScript or JavaScript
    const isTypeScript = filePath.endsWith('.ts');
    const importStatement = isTypeScript
      ? "import { setInnerHTML, escapeHTML } from '../utils/sanitize';\n"
      : "import { setInnerHTML, escapeHTML } from '../utils/sanitize.js';\n";

    // Find the right place to add import
    const firstImportMatch = content.match(/^import .* from/m);
    if (firstImportMatch) {
      // Add after existing imports
      const insertPos = content.indexOf(firstImportMatch[0]);
      content = content.slice(0, insertPos) + importStatement + content.slice(insertPos);
    } else {
      // Add at the beginning of file
      content = `${importStatement}\n${content}`;
    }
  }

  // Replace innerHTML assignments
  // Pattern 1: element.innerHTML = 'string'
  content = content.replace(/(\w+)\.innerHTML\s*=\s*(['"`])/g, 'setInnerHTML($1, $2');

  // Pattern 2: element.innerHTML = variable
  content = content.replace(/(\w+)\.innerHTML\s*=\s*([^'"`\s][^;]*)/g, 'setInnerHTML($1, $2)');

  // Pattern 3: this.element.innerHTML =
  content = content.replace(/this\.(\w+)\.innerHTML\s*=\s*(['"`])/g, 'setInnerHTML(this.$1, $2');

  // Pattern 4: querySelector result
  content = content.replace(/\(([^)]+)\)\.innerHTML\s*=\s*/g, 'setInnerHTML($1, ');

  // Special case for template literals with user data
  // Look for patterns like ${variable} and wrap with escapeHTML
  content = content.replace(/\$\{([^}]+)\}/g, (match, variable) => {
    // Skip if already wrapped with escapeHTML
    if (variable.includes('escapeHTML')) {
      return match;
    }
    // Skip if it's a template literal marker
    if (variable.includes('`')) {
      return match;
    }
    // Only wrap if it looks like a variable that could contain user data
    if (variable.match(/^(query|search|input|value|text|name|email|message|data|user|comment)/i)) {
      return `\${escapeHTML(${variable})}`;
    }
    return match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅  Updated: ${filePath}`);

    // Show what changed
    const addedImport = !hasImport;
    const replacements = (originalContent.match(/innerHTML/g) || []).length;
    console.log(`    - ${addedImport ? 'Added import statement' : 'Import already present'}`);
    console.log(`    - Replaced ${replacements} innerHTML usage(s)`);
  } else {
    console.log(`✓  No changes needed: ${filePath}`);
  }
}

console.log('🔒 XSS Prevention Script');
console.log('========================\n');

filesToUpdate.forEach(updateFile);

console.log('\n✨ XSS prevention updates complete!');
console.log('\nNext steps:');
console.log('1. Review the changes in each file');
console.log('2. Run tests to ensure functionality is preserved');
console.log('3. Build the project: bun run build');
