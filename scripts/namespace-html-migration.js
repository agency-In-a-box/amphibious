#!/usr/bin/env node

/**
 * AIAB Namespace Migration for HTML Documentation Files
 *
 * Updates CSS class name references in HTML files to use the .aiab- prefix.
 * Handles class attributes, CSS selectors in code blocks, and JS references.
 *
 * Run: node scripts/namespace-html-migration.js [--dry-run]
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join, relative } from "node:path";

const DRY_RUN = process.argv.includes("--dry-run");

// Comprehensive class list — base + sub-component + modifiers
const CLASSES_TO_PREFIX = [
  // ---- BASE COMPONENT CLASSES ----
  "container",
  "row",
  "grid",
  "btn",
  "card",
  "badge",
  "alert",
  "modal",
  "tooltip",
  "toast",
  "tabs",
  "accordion",
  "dropdown",
  "sidebar",
  "spinner",
  "skeleton",
  "switch",
  "pagination",
  "breadcrumb",
  "steps",
  "progress",
  "nav",
  "form-control",

  // ---- GRID COLUMNS ----
  "col-1",
  "col-2",
  "col-3",
  "col-4",
  "col-5",
  "col-6",
  "col-7",
  "col-8",
  "col-9",
  "col-10",
  "col-11",
  "col-12",
  "col-13",
  "col-14",
  "col-15",
  "col-16",
  "col-mobile-1",
  "col-mobile-2",
  "col-mobile-3",
  "col-mobile-4",
  "col-mobile-5",
  "col-mobile-6",
  "col-mobile-7",
  "col-mobile-8",
  "col-mobile-9",
  "col-mobile-10",
  "col-mobile-11",
  "col-mobile-12",
  "col-mobile-13",
  "col-mobile-14",
  "col-mobile-15",
  "col-mobile-16",
  "col-tablet-1",
  "col-tablet-2",
  "col-tablet-3",
  "col-tablet-4",
  "col-tablet-5",
  "col-tablet-6",
  "col-tablet-7",
  "col-tablet-8",
  "col-tablet-9",
  "col-tablet-10",
  "col-tablet-11",
  "col-tablet-12",
  "col-tablet-13",
  "col-tablet-14",
  "col-tablet-15",
  "col-tablet-16",
  "col-offset-1",
  "col-offset-2",
  "col-offset-3",
  "col-offset-4",
  "col-offset-5",
  "col-offset-6",
  "col-offset-7",
  "col-offset-8",
  "col-offset-9",
  "col-offset-10",
  "col-offset-11",
  "col-offset-12",
  "col-offset-13",
  "col-offset-14",
  "col-offset-15",
  "col-offset-16",

  // ---- BUTTON VARIANTS ----
  "btn-primary",
  "btn-secondary",
  "btn-success",
  "btn-danger",
  "btn-warning",
  "btn-info",
  "btn-light",
  "btn-dark",
  "btn-link",
  "btn-outline-primary",
  "btn-outline-secondary",
  "btn-outline-success",
  "btn-outline-danger",
  "btn-outline-warning",
  "btn-outline-info",
  "btn-lg",
  "btn-sm",
  "btn-xs",
  "btn-block",
  "btn-pill",
  "btn-ghost",
  "btn-icon",
  "btn-fab",
  "btn-group",
  "btn-group-vertical",
  "btn-group-responsive",
  "btn-loading",
  "btn-premium",
  "btn-cancel",
  "btn-save",
  "btn--primary",
  "btn--secondary",
  "btn--success",
  "btn--danger",
  "btn--warning",
  "btn--info",
  "btn--outline",
  "btn--large",
  "btn--small",

  // ---- BADGE VARIANTS ----
  "badge-primary",
  "badge-secondary",
  "badge-success",
  "badge-danger",
  "badge-warning",
  "badge-info",
  "badge-neutral",
  "badge-small",
  "badge-large",
  "badge-pill",
  "badge-pulse",

  // ---- CARD SUB-COMPONENTS ----
  "card-hoverable",
  "card-interactive",
  "card-header",
  "card-title",
  "card-subtitle",
  "card-body",
  "card-content",
  "card-text",
  "card-footer",
  "card-media",
  "card-grid",
  "card-actions",
  "card-premium",

  // ---- ALERT VARIANTS ----
  "alert-success",
  "alert-info",
  "alert-warning",
  "alert-danger",
  "alert-primary",
  "alert__icon",
  "alert__title",
  "alert__message",
  "alert__content",
  "alert__dismiss",
  "alert__action",
  "alert__actions",
  "alert--solid",
  "alert--outline",
  "alert--minimal",
  "alert--dismissible",
  "alert--small",
  "alert--large",
  "alert--success",
  "alert--warning",
  "alert--danger",
  "alert--info",
  "alert--error",

  // ---- TABLE VARIANTS ----
  "table-wrapper",
  "table-striped",
  "table-hover",
  "table-bordered",
  "table-compact",
  "table-sortable",
  "table-responsive",

  // ---- FORM CLASSES ----
  "form-check",
  "form-check-input",
  "form-check-label",
  "form-check-inline",
  "form-row",
  "form-grid",
  "form-text",
  "form-inline",
  "form-floating",
  "form-error",
  "form-help",
  "form-label",
  "form-group",
  "form-field",
  "form-builder",
  "form-builder-toolbar",
  "form-builder-layout",
  "form-builder-toolbox",
  "form-builder-canvas-area",
  "form-builder-canvas",
  "form-builder-preview",
  "form-builder-properties",
  "form-builder-steps",

  // ---- DROPDOWN CLASSES ----
  "dropdown-select",
  "dropdown-placeholder",
  "dropdown-value",
  "dropdown-value-text",
  "dropdown-menu",
  "dropdown-menu--top",
  "dropdown-menu--bottom",
  "dropdown-item",
  "dropdown-item--disabled",
  "dropdown-item--selected",
  "dropdown-item--highlighted",
  "dropdown-item-icon",
  "dropdown-item-content",
  "dropdown-item-text",
  "dropdown-item-description",
  "dropdown-items",
  "dropdown-items--virtual",
  "dropdown-search",
  "dropdown-search-input",
  "dropdown-search-inline",
  "dropdown-group",
  "dropdown-group-label",
  "dropdown-group-header",
  "dropdown-tag",
  "dropdown-tag-remove",
  "dropdown-native",
  "dropdown-sr-only",
  "dropdown-icons",
  "dropdown-clear",
  "dropdown-arrow",
  "dropdown-no-results",
  "dropdown-loading",
  "dropdown-viewport",
  "dropdown-spacer",
  "dropdown-checkbox",
  "dropdown-enhanced",
  "dropdown-enhanced--multi",
  "dropdown-enhanced--open",
  "dropdown-enhanced--disabled",
  "dropdown--multi",

  // ---- MODAL CLASSES ----
  "modal-backdrop",
  "modal-open",
  "modal_overlay",
  "modal_opener",
  "modal_kill",
  "modal__dialog",
  "modal__body",
  "modal__header",
  "modal__footer",
  "modal__title",
  "modal--sm",
  "modal--lg",
  "modal--xl",
  "modal--fullscreen",
  "modal--drawer-left",
  "modal--drawer-right",
  "modal--slide-down",
  "modal--fade",

  // ---- STATE CLASSES ----
  "is-active",
  "is-expanded",
  "is-closing",
  "is-valid",
  "is-invalid",

  // ---- ACCESSIBILITY ----
  "sr-only",

  // ---- VISIBILITY ----
  "hide-mobile",
  "hide-desktop",

  // ---- NAVIGATION ----
  "nav-toggle",
  "nav--open",
  "nav__hamburger",
  "nav__dropdown",
  "nav-link",
  "nav-breadcrumb",
  "site-nav",
  "site-logo",
  "skip-link",

  // ---- ACCORDION ----
  "accordion-item",
  "accordion-header",
  "accordion-content",
  "accordion-body",
  "accordion-icon",
  "accordion-sr-only",

  // ---- TABS ----
  "tabs__list",
  "tabs__tab",
  "tabs__panel",
  "tabs__button",
  "tabs__item",

  // ---- TOOLTIP ----
  "tooltip--hidden",
  "tooltip--visible",
  "tooltip--top",
  "tooltip--bottom",
  "tooltip--left",
  "tooltip--right",

  // ---- TOAST ----
  "toast-container",
  "toast-container--top-right",
  "toast-container--top-left",
  "toast-container--top-center",
  "toast-container--bottom-right",
  "toast-container--bottom-left",
  "toast-container--bottom-center",
  "toast__progress",
  "toast__close",
  "toast__action",
  "toast--exiting",
  "toast--dark",

  // ---- FILE UPLOAD ----
  "file-upload-zone",
  "file-upload-zone--drag-active",
  "file-upload-icon",
  "file-upload-label",
  "file-upload-description",
  "file-upload-button",
  "file-upload-buttons",
  "file-upload-browse",
  "file-upload-camera",
  "file-upload-camera-modal",
  "file-upload-formats",
  "file-upload-input",
  "file-upload-list",
  "file-upload-item",
  "file-upload-preview",
  "file-upload-preview-icon",
  "file-upload-info",
  "file-upload-name",
  "file-upload-meta",
  "file-upload-size",
  "file-upload-status",
  "file-upload-remove",
  "file-upload-progress",
  "file-upload-progress-bar",
  "file-upload-enhanced",

  // ---- COLOR PICKER ----
  "color-picker",
  "color-picker-preview",

  // ---- SEARCH BAR ----
  "search-bar",
  "search-bar-input",
  "search-bar-button",
  "search-bar-results",
  "search-bar-result",
  "search-bar-result-icon",
  "search-bar-result-text",
  "search-bar-result-category",

  // ---- DATEPICKER ----
  "datepicker",
  "datepicker-input",
  "datepicker-calendar",
  "datepicker-header",
  "datepicker-nav",
  "datepicker-title",
  "datepicker-grid",
  "datepicker-day",
  "datepicker-day--today",
  "datepicker-day--selected",
  "datepicker-day--disabled",
  "datepicker-day--other-month",
  "datepicker-footer",
  "datepicker-weekdays",

  // ---- RANGE SLIDER ----
  "range-slider",
  "range-slider-track",
  "range-slider-fill",
  "range-slider-thumb",
  "range-slider-label",
  "range-slider-value",
  "range-slider-min",
  "range-slider-max",

  // ---- DATA TABLE ----
  "data-table",
  "data-table-header",
  "data-table-body",
  "data-table-footer",
  "data-table-toolbar",
  "data-table-search",
  "data-table-pagination",
  "data-table-sort",
  "data-table-filter",
  "data-table-empty",

  // ---- TIMELINE ----
  "timeline",
  "timeline-container",
  "timeline-wrapper",
  "timeline-track",
  "timeline-connector",
  "timeline-events",
  "timeline-group",
  "timeline-event",
  "event-dot",
  "event-content",
  "event-header",
  "event-title",
  "event-time",
  "event-body",
  "event-description",
  "event-details",
  "event-links",
  "event-actions",
  "timeline-date",
  "timeline-today",
  "today-line",
  "today-label",
  "timeline-branch",
  "branch-node",
  "node-date",
  "branch-events",
  "timeline-controls",
  "timeline-filters",
  "filter-label",
  "expand-btn",

  // ---- TEXT UTILITIES ----
  "text-center",
  "text-left",
  "text-right",
  "text-justify",
  "text-nowrap",
  "text-truncate",
  "text-uppercase",
  "text-lowercase",
  "text-capitalize",
  "text-muted",
  "text-primary",
  "text-success",
  "text-danger",
  "text-warning",
  "text-info",
  "text-balance",

  // ---- MISC ----
  "loading-indicator",
  "clearfix",
  "link-animated",
  "image-frame",
  "heading-hero",
  "img-hover",
  "gallery-item",
  "feature-card",

  // ---- SPINNER ----
  "spinner-overlay",

  // ---- PROGRESS ----
  "progress-bar",
  "progress-label",

  // ---- SKELETON ----
  "skeleton-text",
  "skeleton-avatar",
  "skeleton-card",

  // ---- SWITCH ----
  "switch-input",
  "switch-slider",
  "switch-wrapper",
  "switch-label",

  // ---- SIDEBAR ----
  "sidebar-header",
  "sidebar-content",
  "sidebar-footer",
  "sidebar-nav",
  "sidebar-item",
  "sidebar-link",

  // ---- STEPS ----
  "steps-item",
  "steps-marker",
  "steps-content",

  // ---- PAGINATION ----
  "pagination-item",
  "pagination-link",
  "pagination-prev",
  "pagination-next",

  // ---- BREADCRUMBS ----
  "breadcrumb-item",
  "breadcrumb-link",
];

// Sort longest first to prevent partial replacements
const SORTED = [...new Set(CLASSES_TO_PREFIX)].sort(
  (a, b) => b.length - a.length,
);

function transformHTMLContent(content) {
  let transformed = content;
  let changeCount = 0;

  for (const className of SORTED) {
    const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Match className in HTML contexts:
    // 1. In class="..." attributes: preceded by quote or space
    // 2. In CSS selectors: preceded by dot
    // 3. In JS strings: preceded by quote, backtick, or space
    // NOT preceded by 'aiab-' (prevent double prefix)
    // NOT followed by word characters (prevent partial match)
    const pattern = new RegExp(
      `(?<!aiab-)(?<=['"\`\\s.{])${escaped}(?![a-zA-Z0-9_])`,
      "g",
    );

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
  const content = readFileSync(filePath, "utf8");
  const { transformed, changeCount } = transformHTMLContent(content);

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
    if (entry.startsWith(".") || entry.includes("backup")) continue;

    const fullPath = join(dirPath, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      const sub = processDirectory(fullPath, rootDir);
      totalFiles += sub.totalFiles;
      totalReplacements += sub.totalReplacements;
    } else if (extname(entry) === ".html") {
      const result = processFile(fullPath, rootDir);
      if (result.changed) {
        totalFiles++;
        totalReplacements += result.count;
      }
    }
  }

  return { totalFiles, totalReplacements };
}

// Main
const docsPath = join(process.cwd(), "docs");
console.log(`\n🔧 AIAB HTML Namespace Migration`);
console.log(`   Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}`);
console.log(`   Classes: ${SORTED.length}`);
console.log(`   Source: ${docsPath}\n`);

const { totalFiles, totalReplacements } = processDirectory(
  docsPath,
  process.cwd(),
);

console.log(`\n📊 Summary:`);
console.log(`   Files modified: ${totalFiles}`);
console.log(`   Total replacements: ${totalReplacements}`);

if (DRY_RUN) {
  console.log(`\n💡 Run without --dry-run to apply changes`);
}
