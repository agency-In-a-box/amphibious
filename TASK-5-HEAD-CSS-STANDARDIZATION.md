# Task 5: P4+P5 — Head Section & CSS Loading Standardization

## Objective

Establish a canonical `<head>` template and a standard CSS loading pattern across all ~110 HTML pages. This is the infrastructure task that prevents future inconsistency.

**Read `AUDIT-REPORT.md` and `CLAUDE.md` before starting.**

---

## Phase 1: Define the Canonical `<head>` Template

Before modifying any files, establish what the standard `<head>` should look like. Use `index.html` as the reference since it's the most complete.

### Standard Head for Documentation Pages (`docs/`)

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#ffffff">
  <meta name="description" content="[PAGE-SPECIFIC DESCRIPTION]">
  <title>[Page Name] — Amphibious 2.0</title>
  <link rel="icon" href="/favicon.ico" type="image/x-icon">
  <link rel="stylesheet" href="/src/css/main.css">
</head>
```

### Standard Head for Example Pages (`examples/`)

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#ffffff">
  <meta name="description" content="[PAGE-SPECIFIC DESCRIPTION]">
  <title>[Page Name] — Amphibious 2.0</title>
  <link rel="icon" href="/favicon.ico" type="image/x-icon">
  <link rel="stylesheet" href="/src/css/main.css">
  <!-- Page-specific CSS (if any) -->
  <link rel="stylesheet" href="css/[page-name].css">
</head>
```

### Standard Head for Legacy/Theme Pages

**Do NOT modify** the head section of legacy pages. These include:
- `examples/pea.rs/*`
- `examples/themes/green/*`
- `examples/themes/classic/*`
- `examples/themes/classic/fonts/*`
- `examples/themes/modern-saas/*`

They have their own CSS systems. Adding `main.css` would break them. Leave them alone.

---

## Phase 2: Favicon Deployment

### Step 1: Confirm favicon exists

```bash
ls -la favicon.ico
ls -la assets/favicon* docs/assets/favicon*
```

If no favicon exists at the project root, check where `index.html` points to and verify that path works.

### Step 2: Add to all non-legacy pages

For every HTML file that currently lacks a favicon link:

```bash
# Find pages missing favicon
for f in $(find docs/ examples/ demos/ -name "*.html" ! -path "*/pea.rs/*" ! -path "*/themes/green/*" ! -path "*/themes/classic/*" ! -path "*/themes/modern-saas/*"); do
  if ! grep -q "favicon" "$f" 2>/dev/null; then
    echo "MISSING FAVICON: $f"
  fi
done
```

Add `<link rel="icon" href="/favicon.ico" type="image/x-icon">` inside the `<head>` of each.

**Path note:** Use absolute path `/favicon.ico` for docs/ and root pages. For examples/ pages, verify the correct relative path based on how the dev server resolves paths. If the dev server serves from project root, `/favicon.ico` works everywhere.

---

## Phase 3: Meta Tag Standardization

### Title Format

Standardize all titles to: `[Page Name] — Amphibious 2.0`

```bash
# Audit current titles
grep -rn "<title>" docs/ examples/ demos/ --include="*.html" | grep -v "pea.rs\|themes/green\|themes/classic\|themes/modern-saas"
```

Fix inconsistencies:
- `"2.0.1 - Modern CSS Framework"` → `"Amphibious 2.0"` (root index)
- `"Amphibious 2.0 E-commerce"` → `"E-Commerce Cart — Amphibious 2.0"`
- Pages with just `"Amphibious 2.0"` → add page-specific prefix, e.g., `"Forms — Amphibious 2.0"`, `"Grid System — Amphibious 2.0"`

**Important:** Every title should be unique and descriptive for the page it's on. Don't just stamp the same title everywhere.

### Description Meta

Add a `<meta name="description">` to any page missing one. Keep descriptions under 160 characters, specific to the page content:

- `docs/index.html`: `"Documentation hub for Amphibious 2.0, a modern CSS framework built with Atomic Design principles."`
- `docs/form.html`: `"Form components documentation for Amphibious 2.0 — inputs, validation, file uploads, and accessibility patterns."`
- `examples/e-commerce-cart.html`: `"Shopping cart example built with the Amphibious 2.0 CSS framework grid system."`

Write real descriptions. Don't template them generically.

### Theme-Color Meta

Add `<meta name="theme-color" content="#ffffff">` to every page that doesn't have it. This controls the browser chrome color on mobile.

---

## Phase 4: CSS Loading Standardization

### The Problem

The audit found 8 different CSS loading patterns across the site. Pages load one of:
- `/src/css/main.css` (modern entry point)
- `/dist/amphibious.css` (compiled distribution)
- `/css/a.mphibio.us.css` (legacy pre-namespace)
- `./docs.css` (docs-specific)
- Cherry-picked individual component files
- Nothing (all inline `<style>`)

### The Standard

All non-legacy pages should load **one** CSS entry point: `/src/css/main.css`

For pages that currently load `/dist/amphibious.css`, check if there's a meaningful difference. If `dist/` is just a compiled version of `src/css/main.css`, switch to the source. If they diverge, flag it but don't change it — that's a build pipeline issue for a separate task.

### Step-by-Step

1. **List every page's current CSS loading strategy:**

```bash
for f in $(find docs/ examples/ demos/ -name "*.html" ! -path "*/pea.rs/*" ! -path "*/themes/green/*" ! -path "*/themes/classic/*" ! -path "*/themes/modern-saas/*"); do
  echo "=== $f ==="
  # External stylesheets
  grep -oP 'href="[^"]*\.css"' "$f" 2>/dev/null || echo "  (no external CSS)"
  # Inline style block count and line count
  style_count=$(grep -c "<style" "$f" 2>/dev/null)
  if [ "$style_count" -gt 0 ]; then
    echo "  Inline <style> blocks: $style_count"
  fi
done
```

2. **For pages loading NO external CSS** (inline-only): Add `<link rel="stylesheet" href="/src/css/main.css">` to the `<head>`. The inline styles may still be needed for page-specific overrides, but the framework CSS should load first.

3. **For pages loading cherry-picked component files** (e.g., just `buttons.css` and `forms.css`): Replace with single `main.css` import. The individual files are all imported by `main.css` anyway.

4. **For pages loading `./docs.css`**: Keep this AS WELL AS adding `main.css` — `docs.css` likely has documentation-specific styles that supplement the framework.

5. **For pages loading `/css/a.mphibio.us.css`** (legacy): This is the pre-namespace CSS. These pages likely also use non-namespaced classes. **Flag these files in a separate list** but do NOT change their CSS import — switching them to `main.css` would break them because their HTML uses `.container` not `.aiab-container`, etc. This is a separate migration task.

### JS Entry Point Standardization

The audit found three different JS paths. Determine the canonical one:

```bash
# What paths are used?
grep -rn 'src=.*index\.\(js\|ts\)' docs/ examples/ --include="*.html" | grep -v "pea.rs\|themes/" | sort -u
```

Pick the one that resolves correctly from all page locations and standardize. Likely `/src/index.ts` or `/src/js/index.js` depending on Vite config.

---

## Phase 5: Verification

### Head Completeness Check
```bash
for f in $(find docs/ examples/ demos/ -name "*.html" ! -path "*/pea.rs/*" ! -path "*/themes/green/*" ! -path "*/themes/classic/*" ! -path "*/themes/modern-saas/*"); do
  missing=""
  grep -q "favicon" "$f" || missing="$missing favicon"
  grep -q 'meta.*description' "$f" || missing="$missing description"
  grep -q 'meta.*theme-color' "$f" || missing="$missing theme-color"
  grep -q 'data-theme="light"' "$f" || missing="$missing data-theme"
  grep -q "main\.css\|amphibious\.css" "$f" || missing="$missing framework-css"
  if [ -n "$missing" ]; then
    echo "INCOMPLETE: $f — missing:$missing"
  fi
done
```

### Expected Results
- Zero non-legacy pages missing favicon
- Zero non-legacy pages missing description meta
- Zero non-legacy pages missing theme-color meta
- All non-legacy pages load framework CSS
- All titles follow `[Page Name] — Amphibious 2.0` format

### Title Uniqueness Check
```bash
grep -rh "<title>" docs/ examples/ demos/ --include="*.html" | sort | uniq -d
# Expected: no duplicates (every page has a unique title)
```

---

## Output

In addition to the file modifications, produce a summary file `HEAD-STANDARDIZATION-REPORT.md` in the project root:

```markdown
# Head Standardization Report

## Pages Modified: X
## Pages Skipped (legacy): Y

## Changes by Category
- Favicon added: X files
- Description meta added: X files
- Theme-color meta added: X files
- Title standardized: X files
- CSS loading standardized: X files

## Legacy Pages Flagged for Future Migration
[List of files still loading /css/a.mphibio.us.css that need separate HTML class migration]

## JS Entry Point
Canonical path: [path chosen]
Files updated: X
```

---

## Commit Strategy

Two commits:

### Commit 1: Head section standardization
```
Standardize head sections across 110+ documentation pages

Add favicon, description meta, and theme-color meta to all
non-legacy pages. Standardize title format to
"[Page Name] — Amphibious 2.0" with unique titles per page.
```

### Commit 2: CSS loading pattern
```
Standardize CSS loading to use /src/css/main.css entry point

Replace cherry-picked component imports and inline-only pages
with standard main.css import. Flag 27 legacy pages still on
a.mphibio.us.css for separate migration task.
```

---

## Constraints

- **Do NOT modify legacy/theme pages** (pea.rs, green, classic, modern-saas, font specimens). They have their own systems.
- **Do NOT remove inline `<style>` blocks** in this task — just ensure the framework CSS also loads. Inline extraction is Task 3's job for cart pages and a future task for other pages.
- **Do NOT change pages loading `/css/a.mphibio.us.css`** to load `main.css` — their HTML markup uses un-namespaced classes and would break.
- **Write real, unique descriptions** for each page — don't use a template string.
- **Verify favicon path resolves** from both `docs/` and `examples/` subdirectories before mass-applying.
