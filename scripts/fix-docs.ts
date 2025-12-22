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

import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { $ } from 'bun';

// Step 1: Clean and build
try {
  await $`bun run clean`;
  await $`bun run build`;
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}

// Step 2: Check if amphibious.css was created
const cssPath = join(process.cwd(), 'dist', 'amphibious.css');
if (!existsSync(cssPath)) {
  // Look for hashed CSS files
  const distDir = join(process.cwd(), 'dist', 'assets');
  if (existsSync(distDir)) {
    const files = await $`ls ${distDir}`.text();
    const cssFile = files.split('\n').find((f) => f.endsWith('.css'));

    if (cssFile) {
      const hashedPath = join(distDir, cssFile);
      copyFileSync(hashedPath, cssPath);
    }
  }
} else {
}

// Step 3: Validate HTML files
const docsDir = join(process.cwd(), 'docs');
const htmlFiles = ['foundation.html', 'form.html', 'function.html', 'features.html'];

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
    let match: RegExpExecArray | null = null;

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
      if (tagStack.length > 0) {
      }
      hasErrors = true;
    } else {
    }
  }
}

if (!hasErrors) {
} else {
}

// Step 4: Check if docs.css exists
const docsCssPath = join(docsDir, 'docs.css');
if (existsSync(docsCssPath)) {
} else {
}
