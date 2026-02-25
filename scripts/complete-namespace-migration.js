#!/usr/bin/env node

/**
 * Complete AIAB Namespace Migration Script
 *
 * Adds .aiab- prefix to all remaining non-prefixed CSS class selectors
 * that collide with Bootstrap, Tailwind, or other popular CSS frameworks.
 *
 * Run: node scripts/complete-namespace-migration.js [--dry-run]
 *
 * CRITICAL RULES:
 * - Only processes .css files in src/css/
 * - Never touches JS DOM properties (.focus(), .disabled, .input, .select(), .container)
 * - Skips already-prefixed classes (.aiab-*, .apple-*)
 * - Skips CSS custom properties (--*)
 * - Skips element selectors (h1, p, div, etc.)
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const DRY_RUN = process.argv.includes('--dry-run');

// ============================================================================
// COMPREHENSIVE CLASS LIST — all non-prefixed classes that need .aiab- prefix
// Organized by category for maintainability
// ============================================================================

const CLASSES_TO_PREFIX = [
  // ---- BUTTON VARIANTS (Bootstrap collision) ----
  'btn-primary',
  'btn-secondary',
  'btn-success',
  'btn-danger',
  'btn-warning',
  'btn-info',
  'btn-light',
  'btn-dark',
  'btn-link',
  'btn-outline-primary',
  'btn-outline-secondary',
  'btn-outline-success',
  'btn-outline-danger',
  'btn-outline-warning',
  'btn-outline-info',
  'btn-lg',
  'btn-sm',
  'btn-xs',
  'btn-block',
  'btn-pill',
  'btn-ghost',
  'btn-icon',
  'btn-fab',
  'btn-group',
  'btn-group-vertical',
  'btn-group-responsive',
  'btn-loading',
  'btn-premium',
  'btn-cancel',
  'btn-save',

  // ---- BADGE VARIANTS (Bootstrap collision) ----
  'badge-primary',
  'badge-secondary',
  'badge-success',
  'badge-danger',
  'badge-warning',
  'badge-info',
  'badge-neutral',
  'badge-outline-primary',
  'badge-outline-secondary',
  'badge-outline-success',
  'badge-outline-danger',
  'badge-outline-warning',
  'badge-outline-info',
  'badge-outline-neutral',
  'badge-small',
  'badge-large',
  'badge-pill',
  'badge-pulse',

  // ---- CARD SUB-COMPONENTS (Bootstrap collision) ----
  'card-hoverable',
  'card-interactive',
  'card-header',
  'card-title',
  'card-subtitle',
  'card-body',
  'card-content',
  'card-text',
  'card-footer',
  'card-media',
  'card-grid',
  'card-actions',
  'card-premium',

  // ---- ALERT VARIANTS (Bootstrap collision) ----
  'alert-success',
  'alert-info',
  'alert-warning',
  'alert-danger',
  // BEM-style alert sub-components
  'alert__icon',
  'alert__title',
  'alert__message',
  'alert__content',
  'alert__dismiss',
  'alert__action',
  'alert__actions',
  'alert--solid',
  'alert--outline',
  'alert--minimal',
  'alert--accent',
  'alert--dismissible',
  'alert--small',
  'alert--large',
  'alert--success',
  'alert--warning',
  'alert--danger',
  'alert--info',
  'alert--error',

  // ---- TABLE VARIANTS (Bootstrap collision) ----
  'table-wrapper',
  'table-striped',
  'table-hover',
  'table-bordered',
  'table-borderless',
  'table-compact',
  'table-rounded',
  'table-success',
  'table-warning',
  'table-error',
  'table-danger',
  'table-info',
  'table-sortable',
  'table-responsive',
  'table-fixed-column',

  // ---- FORM CLASSES (Bootstrap collision) ----
  'form-check',
  'form-check-input',
  'form-check-label',
  'form-check-inline',
  'form-row',
  'form-grid',
  'form-grid-2',
  'form-grid-3',
  'form-control-sm',
  'form-control-lg',
  'form-text',
  'form-inline',
  'form-floating',
  'form-error',
  'form-help',
  'form-label',
  'form-success',
  'form-warning',

  // ---- DROPDOWN CLASSES (Bootstrap collision) ----
  'dropdown-select',
  'dropdown-placeholder',
  'dropdown-value',
  'dropdown-menu',
  'dropdown-item',
  'dropdown-items',
  'dropdown-item-icon',
  'dropdown-item-content',
  'dropdown-item-text',
  'dropdown-item-description',
  'dropdown-search',
  'dropdown-search-input',
  'dropdown-group',
  'dropdown-group-label',
  'dropdown-tag',
  'dropdown-tag-remove',
  'dropdown-native',
  'dropdown-sr-only',

  // ---- MODAL CLASSES (Bootstrap collision) ----
  'modal-backdrop',
  'modal_overlay',

  // ---- TEXT UTILITIES (Bootstrap/Tailwind collision) ----
  'text-left',
  'text-center',
  'text-right',
  'text-justify',
  'text-primary',
  'text-secondary',
  'text-success',
  'text-danger',
  'text-warning',
  'text-info',
  'text-balance',
  'text-primary-light',

  // ---- BACKGROUND UTILITIES (Bootstrap/Tailwind collision) ----
  'bg-primary',
  'bg-secondary',
  'bg-success',
  'bg-danger',
  'bg-warning',
  'bg-info',
  'bg-primary-dark',

  // ---- ACCESSIBILITY (Bootstrap collision) ----
  'sr-only',
  'sr-only-focusable',

  // ---- VISIBILITY (common collision) ----
  'hide',
  'show',
  'hide-mobile',
  'hide-desktop',
  'hide-print',
  'show-print',
  'hide-on-print',
  'show-on-print',

  // ---- STATE CLASSES (Bootstrap collision) ----
  'is-active',
  'is-expanded',
  'is-closing',
  'is-valid',
  'is-invalid',

  // ---- VALIDATION (Bootstrap collision) ----
  'valid-feedback',
  'invalid-feedback',
  'required',
  'optional',
  'error-message',
  'success-message',
  'warning-message',
  'validation-error',
  'validation-success',
  'validation-warning',
  'helper-text',
  'helper-text--icon',
  'character-count',
  'field-counter',
  'inline-validation',
  'validation-indicator',
  'validation-summary',
  'validation-summary-title',
  'floating-label',

  // ---- LAYOUT (common collision) ----
  'clearfix',
  'clear',
  'fixed',

  // ---- TYPOGRAPHY (collision) ----
  'intro',
  'lead',
  'subheader',

  // ---- NAVIGATION (Bootstrap collision) ----
  'site-nav',
  'nav-toggle',
  'nav-toggle-icon',
  'site-logo',
  'skip-link',
  'nav-link',

  // ---- SWITCH COMPONENT ----
  'switch-input',
  'switch-slider',
  'switch-wrapper',
  'switch-label',
  'switch-label--left',
  'switch-group',
  'switch-group-item',
  'switch-group-label',
  'switch-group-title',
  'switch-group-description',
  'switch--sm',
  'switch--lg',
  'switch--primary',
  'switch--success',
  'switch--danger',
  'switch--warning',
  'switch--info',
  'switch--disabled',
  'switch--ios',
  'switch--labeled',

  // ---- ICON VARIANTS ----
  'icon--xs',
  'icon--sm',
  'icon--md',
  'icon--lg',
  'icon--xl',
  'icon--muted',
  'icon--primary',
  'icon--success',
  'icon--warning',
  'icon--danger',
  'icon--info',
  'icon--filled',
  'icon--spin',
  'icon--pulse',
  'icon--bounce',
  'icon-button',
  'icon-button--primary',
  'icon-button--success',
  'icon-button--danger',
  'icon-button--sm',
  'icon-button--lg',
  'icon-text',
  'icon-text--vertical',
  'icon-text--reverse',
  'icon-badge',
  'icon-badge__count',
  'icon-badge__count--lg',
  'icon-badge__count--sm',
  'icon-loading',

  // ---- SPINNER VARIANTS ----
  'spinner-small',
  'spinner-medium',
  'spinner-large',
  'spinner-xl',
  'spinner-primary',
  'spinner-secondary',
  'spinner-success',
  'spinner-danger',
  'spinner-warning',
  'spinner-info',
  'spinner-dots',
  'spinner-pulse',
  'spinner-wave',
  'spinner-with-text',
  'spinner-overlay',

  // ---- SKELETON VARIANTS ----
  'skeleton--static',
  'skeleton-text',
  'skeleton-heading',
  'skeleton-heading--lg',
  'skeleton-paragraph',
  'skeleton-avatar',
  'skeleton-avatar--sm',
  'skeleton-avatar--lg',
  'skeleton-avatar--xl',
  'skeleton-avatar--square',
  'skeleton-image',
  'skeleton-thumbnail',
  'skeleton-button',
  'skeleton-button--full',
  'skeleton-input',
  'skeleton-badge',
  'skeleton-card',
  'skeleton-card-image',
  'skeleton-card-header',
  'skeleton-card-body',
  'skeleton-card-footer',
  'skeleton-list-item',
  'skeleton-list-content',
  'skeleton-table',
  'skeleton-table-header',
  'skeleton-table-cell',
  'skeleton-table-row',
  'skeleton-form',
  'skeleton-form-group',
  'skeleton-label',
  'skeleton-nav',
  'skeleton-nav-item',
  'skeleton-comment',
  'skeleton-comment-content',
  'skeleton-comment-meta',
  'skeleton--pulse',
  'skeleton--wave',
  'skeleton--fast',
  'skeleton--slow',
  'skeleton--light',
  'skeleton--dark',
  'skeleton--primary',
  'skeleton-w-full',
  'skeleton-h-4',
  'skeleton-h-6',
  'skeleton-h-8',
  'skeleton-h-10',
  'skeleton-h-12',
  'skeleton-h-16',
  'skeleton-h-20',
  'skeleton-h-24',
  'skeleton-h-32',
  'skeleton-h-40',
  'skeleton-h-48',
  'skeleton-h-64',
  'skeleton-mb-2',
  'skeleton-mb-3',
  'skeleton-mb-4',
  'skeleton-mb-6',

  // ---- ACCORDION VARIANTS ----
  'accordion--flush',
  'accordion--bordered',
  'accordion--shadow',
  'accordion--compact',
  'accordion--large',
  'accordion--primary',
  'accordion--success',
  'accordion--info',
  'accordion--warning',
  'accordion--danger',
  'accordion--plus-minus',
  'accordion--separated',
  'accordion--no-animation',
  'accordion-item',
  'accordion-header',
  'accordion-icon',
  'accordion-content',
  'accordion-body',
  'accordion-sr-only',

  // ---- TAB VARIANTS ----
  'tabs__list',
  'tabs__item',
  'tabs__button',
  'tabs__panel',
  'tabs--underline',
  'tabs--pills',
  'tabs--boxed',
  'tabs--vertical',
  'tabs--centered',
  'tabs--right',
  'tabs--full-width',
  'tabs--small',
  'tabs--large',

  // ---- TOOLTIP VARIANTS ----
  'tooltip--top',
  'tooltip--bottom',
  'tooltip--left',
  'tooltip--right',
  'tooltip--dark',
  'tooltip--light',
  'tooltip--error',
  'tooltip--warning',
  'tooltip--success',
  'tooltip--info',
  'tooltip--sm',
  'tooltip--lg',

  // ---- TOAST VARIANTS ----
  'toast-container',
  'toast-wrapper',
  'toast-content',
  'toast-icon',
  'toast-message',
  'toast-close',
  'toast-progress',
  'toast--success',
  'toast--error',
  'toast--warning',
  'toast--info',
  'toast--top-right',
  'toast--top-left',
  'toast--top-center',
  'toast--bottom-right',
  'toast--bottom-left',
  'toast--bottom-center',

  // ---- PROGRESS BAR ----
  'progress-bar',
  'progress-label',
  'progress-text',
  'progress--success',
  'progress--warning',
  'progress--danger',
  'progress--info',
  'progress--striped',
  'progress--animated',

  // ---- PAGINATION ----
  'pagination-item',
  'pagination-link',
  'pagination-prev',
  'pagination-next',
  'pagination-ellipsis',
  'pagination--sm',
  'pagination--lg',

  // ---- BREADCRUMBS ----
  'breadcrumb-item',
  'breadcrumb-link',
  'breadcrumb-separator',

  // ---- STEPS ----
  'steps-item',
  'steps-marker',
  'steps-content',
  'steps--vertical',
  'steps--small',

  // ---- TIMELINE ----
  'timeline',
  'timeline-container',
  'timeline-wrapper',
  'timeline-track',
  'timeline-connector',
  'timeline-events',
  'timeline-group',
  'timeline-event',
  'event-dot',
  'event-content',
  'event-header',
  'event-title',
  'event-time',
  'event-body',
  'event-description',
  'event-details',
  'event-links',
  'event-actions',
  'timeline-date',
  'timeline-today',
  'today-line',
  'today-label',
  'timeline-branch',
  'branch-node',
  'node-date',
  'branch-events',
  'timeline-controls',
  'timeline-filters',
  'filter-label',
  'expand-btn',

  // ---- FILE UPLOAD ----
  'file-upload-zone',
  'file-upload-icon',
  'file-upload-label',
  'file-upload-description',
  'file-upload-button',
  'file-upload-formats',
  'file-upload-input',
  'file-upload-list',
  'file-upload-item',
  'file-upload-preview',
  'file-upload-preview-icon',
  'file-upload-info',
  'file-upload-name',
  'file-upload-meta',
  'file-upload-size',
  'file-upload-status',
  'file-upload-status--pending',
  'file-upload-status--uploading',
  'file-upload-status--success',
  'file-upload-status--error',
  'file-upload-status--cancelled',
  'file-upload-remove',
  'file-upload-progress',
  'file-upload-progress-bar',
  'file-upload-zone--drag-active',
  'file-type-video',
  'file-type-audio',
  'file-type-pdf',
  'file-type-zip',
  'file-type-doc',
  'file-type-xls',

  // ---- SEARCH BAR ----
  'search-bar',
  'search-bar-input',
  'search-bar-button',
  'search-bar-results',
  'search-bar-result',
  'search-bar-result-icon',
  'search-bar-result-text',
  'search-bar-result-category',

  // ---- COLOR PICKER ----
  'color-picker',
  'color-picker-preview',
  'color-picker-input',
  'color-picker-palette',
  'color-picker-slider',
  'color-picker-value',
  'color-picker-swatch',

  // ---- DATEPICKER ----
  'datepicker',
  'datepicker-input',
  'datepicker-calendar',
  'datepicker-header',
  'datepicker-nav',
  'datepicker-title',
  'datepicker-grid',
  'datepicker-day',
  'datepicker-day--today',
  'datepicker-day--selected',
  'datepicker-day--disabled',
  'datepicker-day--other-month',
  'datepicker-footer',
  'datepicker-weekdays',

  // ---- RANGE SLIDER ----
  'range-slider',
  'range-slider-track',
  'range-slider-fill',
  'range-slider-thumb',
  'range-slider-label',
  'range-slider-value',
  'range-slider-min',
  'range-slider-max',

  // ---- DATA TABLE ----
  'data-table',
  'data-table-header',
  'data-table-body',
  'data-table-footer',
  'data-table-row',
  'data-table-cell',
  'data-table-toolbar',
  'data-table-search',
  'data-table-pagination',
  'data-table-sort',
  'data-table-filter',
  'data-table-empty',

  // ---- FORM BUILDER ----
  'form-builder',
  'form-builder-toolbar',
  'form-builder-layout',
  'form-builder-toolbox',
  'form-builder-canvas-area',
  'form-builder-canvas',
  'form-builder-preview',
  'form-builder-properties',
  'form-builder-steps',
  'form-field',

  // ---- SIDEBAR ----
  'sidebar-header',
  'sidebar-content',
  'sidebar-footer',
  'sidebar-nav',
  'sidebar-item',
  'sidebar-link',
  'sidebar--collapsed',
  'sidebar--right',

  // ---- PREMIUM DESIGN SYSTEM ----
  'card-premium',
  'heading-hero',
  'text-balance',
  'image-frame',
  'link-animated',

  // ---- MISC (Bootstrap collision) ----
  'col-auto',
  'col-min',
  'col-25',
  'col-50',
  'col-75',
  'col-mobile-half',
  'col-mobile-third',
  'col-mobile-quarter',

  // ---- STATUS/SOCIAL ICONS ----
  'status-icon',
  'status-icon--success',
  'status-icon--warning',
  'status-icon--danger',
  'status-icon--info',
  'social-icons',
  'social-icon',
  'social-icon--facebook',
  'social-icon--twitter',
  'social-icon--instagram',
  'social-icon--linkedin',
  'status-pulse',
  'health-pulse',
  'pulse-container',
  'rating',
  'price-icon',

  // ---- LOADING ----
  'btn-loading',
  'loading-indicator',
  'img-hover',
  'gallery-item',
];

// Sort by length descending so longer class names are replaced first
// (prevents `.btn` from matching inside `.btn-primary` before it's renamed)
const SORTED_CLASSES = [...new Set(CLASSES_TO_PREFIX)].sort((a, b) => b.length - a.length);

// ============================================================================
// TRANSFORMATION ENGINE
// ============================================================================

function transformCSSContent(content, _filePath) {
  let transformed = content;
  let changeCount = 0;

  for (const className of SORTED_CLASSES) {
    // Escape special regex chars in class name
    const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Match .className that:
    // 1. Is preceded by start-of-string, whitespace, comma, or another selector char
    // 2. Is NOT already prefixed with .aiab-
    // 3. Is NOT followed by more word chars (to avoid partial matches)
    const pattern = new RegExp(`(?<!\\.aiab-)(?<=\\.)${escaped}(?![a-zA-Z0-9_-])`, 'g');

    const before = transformed;
    transformed = transformed.replace(pattern, `aiab-${className}`);

    if (transformed !== before) {
      const matches = (before.match(pattern) || []).length;
      changeCount += matches;
    }
  }

  return { transformed, changeCount };
}

function processFile(filePath, rootDir) {
  const content = readFileSync(filePath, 'utf8');
  const { transformed, changeCount } = transformCSSContent(content, filePath);

  if (changeCount > 0) {
    const relPath = relative(rootDir, filePath);
    if (DRY_RUN) {
      console.log(`  [DRY RUN] ${relPath}: ${changeCount} replacements`);
    } else {
      writeFileSync(filePath, transformed);
      console.log(`  ✅ ${relPath}: ${changeCount} replacements`);
    }
    return { changed: true, count: changeCount };
  }
  return { changed: false, count: 0 };
}

function processDirectory(dirPath, rootDir) {
  let totalFiles = 0;
  let totalReplacements = 0;

  for (const entry of readdirSync(dirPath)) {
    const fullPath = join(dirPath, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      const sub = processDirectory(fullPath, rootDir);
      totalFiles += sub.totalFiles;
      totalReplacements += sub.totalReplacements;
    } else if (extname(entry) === '.css') {
      const result = processFile(fullPath, rootDir);
      if (result.changed) {
        totalFiles++;
        totalReplacements += result.count;
      }
    }
  }

  return { totalFiles, totalReplacements };
}

// ============================================================================
// MAIN
// ============================================================================

const srcCssPath = join(process.cwd(), 'src', 'css');

console.log(`\n🔧 AIAB Complete Namespace Migration`);
console.log(`   Mode: ${DRY_RUN ? 'DRY RUN (no files modified)' : 'LIVE'}`);
console.log(`   Classes to prefix: ${SORTED_CLASSES.length}`);
console.log(`   Source: ${srcCssPath}\n`);

const { totalFiles, totalReplacements } = processDirectory(srcCssPath, process.cwd());

console.log(`\n📊 Summary:`);
console.log(`   Files modified: ${totalFiles}`);
console.log(`   Total replacements: ${totalReplacements}`);
console.log(`   Classes processed: ${SORTED_CLASSES.length}`);

if (DRY_RUN) {
  console.log(`\n💡 Run without --dry-run to apply changes`);
}
