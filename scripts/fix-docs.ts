#!/usr/bin/env bun

/**
 * Fix Documentation Build Issues
 * 
 * This script:
 * 1. Builds the Amphibious library
 * 2. Ensures amphibious.css is properly output
 * 3. Validates HTML files for errors
 * 4. Creates necessary documentation assets
 */

import { $ } from 'bun';
import { existsSync, copyFileSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

console.log('🐸 Fixing Amphibious Documentation Issues\n');

// Step 1: Clean and build
console.log('📦 Building Amphibious library...');
try {
  await $`bun run clean`;
  await $`bun run build`;
  console.log('✅ Build complete\n');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}

// Step 2: Check if amphibious.css was created
const cssPath = join(process.cwd(), 'dist', 'amphibious.css');
if (!existsSync(cssPath)) {
  console.log('⚠️  amphibious.css not found in dist/');
  
  // Look for hashed CSS files
  const distDir = join(process.cwd(), 'dist', 'assets');
  if (existsSync(distDir)) {
    const files = await $`ls ${distDir}`.text();
    const cssFile = files.split('\n').find(f => f.endsWith('.css'));
    
    if (cssFile) {
      const hashedPath = join(distDir, cssFile);
      console.log(`📋 Copying ${cssFile} to amphibious.css`);
      copyFileSync(hashedPath, cssPath);
      console.log('✅ amphibious.css created\n');
    }
  }
} else {
  console.log('✅ amphibious.css found\n');
}

// Step 3: Validate HTML files
console.log('🔍 Validating HTML files...');
const docsDir = join(process.cwd(), 'docs');
const htmlFiles = [
  'foundation.html',
  'form.html', 
  'function.html',
  'features.html'
];

let hasErrors = false;
for (const file of htmlFiles) {
  const filePath = join(docsDir, file);
  if (existsSync(filePath)) {
    const content = readFileSync(filePath, 'utf-8');
    
    // Basic validation checks
    const issues = [];
    
    // Check for unclosed tags
    const tagStack = [];
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
    let match;
    
    while ((match = tagRegex.exec(content)) !== null) {
      const isClosing = match[0].startsWith('</');
      const tagName = match[1].toLowerCase();
      
      // Skip self-closing tags
      if (['img', 'br', 'hr', 'input', 'meta', 'link'].includes(tagName)) {
        continue;
      }
      
      if (isClosing) {
        if (tagStack.length === 0 || tagStack[tagStack.length - 1] !== tagName) {
          issues.push(`Mismatched closing tag: </${tagName}>`);
        } else {
          tagStack.pop();
        }
      } else {
        tagStack.push(tagName);
      }
    }
    
    if (issues.length > 0 || tagStack.length > 0) {
      console.log(`⚠️  ${file}:`);
      issues.forEach(issue => console.log(`   - ${issue}`));
      if (tagStack.length > 0) {
        console.log(`   - Unclosed tags: ${tagStack.join(', ')}`);
      }
      hasErrors = true;
    } else {
      console.log(`✅ ${file} - OK`);
    }
  }
}

if (!hasErrors) {
  console.log('✅ All HTML files validated\n');
} else {
  console.log('⚠️  Some HTML files have issues\n');
}

// Step 4: Check if docs.css exists
const docsCssPath = join(docsDir, 'docs.css');
if (existsSync(docsCssPath)) {
  console.log('✅ docs.css exists\n');
} else {
  console.log('⚠️  docs.css not found\n');
}

console.log('🎉 Documentation fix complete!');
console.log('\nNext steps:');
console.log('1. Run: bun run dev');
console.log('2. Open: http://localhost:2960/docs/function.html');
console.log('3. Check that styles are loading correctly\n');
