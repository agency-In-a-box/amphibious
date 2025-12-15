#!/usr/bin/env bun
/**
 * Amphibious Image Placeholder Update Script
 * Replaces broken/outdated image references with modern placeholders
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

interface ImageReplacement {
  pattern: RegExp;
  replacement: string;
  description: string;
  fileTypes: string[];
}

// Amphibious brand colors
const COLORS = {
  primary: '667eea',
  secondary: '764ba2',
  warning: 'f59e0b',
  success: '10b981',
  info: '3b82f6',
  danger: 'ef4444',
  neutral: '6c757d',
  light: 'e9ecef'
};

const replacements: ImageReplacement[] = [
  // Update via.placeholder.com to placehold.co
  {
    pattern: /https:\/\/via\.placeholder\.com\//g,
    replacement: 'https://placehold.co/',
    description: 'Update via.placeholder.com to placehold.co',
    fileTypes: ['html', 'md']
  },

  // Documentation example images
  {
    pattern: /src="image(\d+)\.jpg"/g,
    replacement: 'src="https://picsum.photos/800/600?random=$1"',
    description: 'Gallery/generic images with realistic photos',
    fileTypes: ['html']
  },

  {
    pattern: /src="product(\d+)\.jpg"/g,
    replacement: `src="https://placehold.co/600x600/${COLORS.primary}/FFF?text=Product+$1"`,
    description: 'Product images with brand colors',
    fileTypes: ['html']
  },

  {
    pattern: /src="thumb(\d+)\.jpg"/g,
    replacement: 'src="https://picsum.photos/300/200?random=$1"',
    description: 'Thumbnail images with realistic photos',
    fileTypes: ['html']
  },

  {
    pattern: /src="avatar\.jpg"/g,
    replacement: `src="https://placehold.co/200x200/${COLORS.secondary}/FFF?text=User"`,
    description: 'Avatar placeholder',
    fileTypes: ['html']
  },

  {
    pattern: /src="image\.jpg"/g,
    replacement: 'src="https://picsum.photos/600/400"',
    description: 'Generic image placeholder',
    fileTypes: ['html']
  },

  // External GitHub ribbon (broken S3 link)
  {
    pattern: /src="http:\/\/s3\.amazonaws\.com\/github\/ribbons\/[^"]+"/g,
    replacement: `src="https://placehold.co/149x149/${COLORS.danger}/FFF?text=GitHub"`,
    description: 'GitHub fork ribbon placeholder',
    fileTypes: ['html']
  }
];

async function createBackup(filePath: string): Promise<void> {
  const backupPath = `${filePath}.backup-${Date.now()}`;
  const content = readFileSync(filePath, 'utf-8');
  writeFileSync(backupPath, content, 'utf-8');
}

function findFiles(dir: string, extensions: string[], ignore: string[] = []): string[] {
  const files: string[] = [];

  function walkDir(currentDir: string, relativePath: string = '') {
    try {
      const entries = readdirSync(currentDir);

      for (const entry of entries) {
        const fullPath = join(currentDir, entry);
        const relativeFilePath = relativePath ? join(relativePath, entry) : entry;

        // Skip ignored directories/files
        if (ignore.some(pattern => relativeFilePath.includes(pattern))) {
          continue;
        }

        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          walkDir(fullPath, relativeFilePath);
        } else if (stat.isFile()) {
          const ext = extname(entry).slice(1).toLowerCase();
          if (extensions.includes(ext)) {
            files.push(relativeFilePath);
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  walkDir(dir);
  return files;
}

async function updateImagePlaceholders(): Promise<void> {

  // Create log file
  const logFile = 'image-replacement-log.txt';
  const logEntries: string[] = [
    `Amphibious Image Replacement Log - ${new Date().toISOString()}`,
    '='.repeat(60),
    ''
  ];

  let totalReplacements = 0;
  let filesModified = 0;

  // Find files to process
  const files = findFiles('.', ['html', 'md'], ['node_modules', 'dist', '.backup-', logFile]);


  for (const file of files) {
    if (!existsSync(file)) continue;

    let content = readFileSync(file, 'utf-8');
    let fileModified = false;
    let fileReplacements = 0;

    // Apply each replacement pattern
    for (const { pattern, replacement, description, fileTypes } of replacements) {
      const fileExt = file.split('.').pop()?.toLowerCase();
      if (!fileTypes.includes(fileExt || '')) continue;

      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        if (!fileModified) {
          await createBackup(file);
          fileModified = true;
        }

        content = content.replace(pattern, replacement);
        const count = matches.length;
        fileReplacements += count;

        logEntries.push(`${file}: ${description} - ${count} replacement(s)`);
      }
    }

    if (fileModified) {
      writeFileSync(file, content, 'utf-8');
      filesModified++;
      totalReplacements += fileReplacements;
    }
  }

  // Add loading="lazy" to img tags that don't have it

  for (const file of files.filter(f => f.endsWith('.html'))) {
    if (!existsSync(file)) continue;

    let content = readFileSync(file, 'utf-8');

    // Add loading="lazy" to img tags that don't already have it
    const imgPattern = /<img(?![^>]*loading=)[^>]*>/g;
    const matches = content.match(imgPattern);

    if (matches && matches.length > 0) {
      content = content.replace(imgPattern, (match) => {
        // Insert loading="lazy" before the closing >
        return match.replace('>', ' loading="lazy">');
      });

      writeFileSync(file, content, 'utf-8');
      logEntries.push(`${file}: Added loading="lazy" to ${matches.length} images`);
    }
  }

  // Write log file
  logEntries.push('', `Total files modified: ${filesModified}`);
  logEntries.push(`Total replacements: ${totalReplacements}`);
  logEntries.push('', 'Replacement completed at: ' + new Date().toISOString());

  writeFileSync(logFile, logEntries.join('\n'), 'utf-8');

  // Summary

  if (filesModified > 0) {
  } else {
  }
}

// Run the script
updateImagePlaceholders().catch(console.error);