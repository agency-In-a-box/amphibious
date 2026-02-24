# Amphibious 2.0 — Design Consistency Audit Report
**Date:** 2026-02-22
**Scope:** All HTML files in docs/, examples/, demos/, includes/, and project root

## Executive Summary
- **Total files audited:** 115
- **Files missing explicit light theme:** 111/111 full HTML pages (0 set `data-theme="light"`)
- **Files with duplicate navigation:** 2 actual duplicates + 1 include conflict + 3 nested-nav-in-nav
- **Files with inline color overrides:** 40+ files with hardcoded hex in `style=` attributes
- **Brand color #ED8B00 hardcoded:** 286 times across 66 files (not using CSS variables)
- **Shopping cart grid compliance:** FAIL (e-commerce-cart), FAIL (shopping-cart-modern), PARTIAL (checkout-flow)
- **Pages with no external CSS (inline-only):** ~25 files with 168–733 lines of inline `<style>`
- **Favicon missing:** On 110+ of 115 pages (only index.html declares one)

---

## 1. Theme State Findings

### Critical Finding: Zero Pages Set `data-theme="light"`

No file in the entire project sets `data-theme="light"` on the `<html>` element. The dark mode CSS architecture uses:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { /* dark mode styles */ }
}
```

This means **every page that loads `main.css`** (which `@import`s `dark-mode.css`) will flip to dark mode on systems with dark OS preference — with no user override possible on most pages.

### Three Tiers of Exposure

| Tier | Risk | Count | Description |
|------|------|-------|-------------|
| **HIGH** | Dark mode bleed-through | ~55 files | Load `main.css` (includes `dark-mode.css`) but have NO `data-theme` attribute and NO toggle JS |
| **CONTROLLED** | JS-dependent | 3 files | Have dark-mode-toggle JS (`index.html`, `docs/foundation.html`, `examples/dark-mode-demo.html`) but still no default `data-theme="light"` in source HTML |
| **UNAFFECTED** | No dark CSS | ~26 files | Legacy pages (pea.rs, green/classic themes, font demos) that never load `main.css` |

### Dark Mode Toggle Distribution

| File | has data-theme | has toggle button | imports dark-mode CSS | imports toggle JS |
|------|---------------|------------------|----------------------|------------------|
| `index.html` | Via JS only | Yes (`#dark-mode-toggle`) | Yes (home-dark-mode.css + via main.css) | Yes |
| `docs/foundation.html` | No (body has `data-dark-mode-toggle`) | Yes (body attr + JS init) | Yes (explicit dark-mode.css + via main.css) | Yes |
| `examples/dark-mode-demo.html` | No (body has `data-dark-mode-toggle`) | Yes (body attr + JS init) | Yes (via main.css) | Yes |
| **All other 108 pages** | **No** | **No** | Varies (55 via main.css, rest none) | **No** |

### Complete File Inventory (Summary by Group)

| Group | Files | Loads main.css | Dark mode exposure |
|-------|-------|---------------|-------------------|
| docs/ (main) | 13 | Yes (most) | HIGH — vulnerable to OS dark mode |
| docs/components/ | 9 | Yes | HIGH |
| examples/ (main) | 36 | Mixed | HIGH (main.css loaders) or UNAFFECTED (standalone) |
| examples/pea.rs/ | 9 | No (legacy) | UNAFFECTED |
| examples/themes/green/ | 7 | No (legacy) | UNAFFECTED |
| examples/themes/classic/ | 8 | No (legacy) | UNAFFECTED |
| examples/themes/classic/fonts/ | 11 | No | UNAFFECTED |
| examples/themes/modern-saas/ | 2 | No (own CSS) | UNAFFECTED |
| demos/ | 10 | Yes (most) | HIGH |
| includes/ | 3 | Partial | Varies |
| root | 2 | Yes (index) | HIGH (index.html, sitemap.html) |
| src/ | 1 | No | UNAFFECTED |

---

## 2. Navigation Duplication Findings

### Actual Duplicates (2 files — requires fix)

| File | Issue | Details |
|------|-------|---------|
| **`docs/form.html`** | Two full-width navigation menus | Line 426: modern `<nav class="aiab-site-nav">` with full menu. Line 1374: legacy nav with old-style naming ("Symantic Grid", "E.volution"). **Both render on page.** |
| **`demos/test-cascade.html`** | Two `aiab-site-nav` blocks | Line 68 and line 108: both use `class="aiab-site-nav"`. Test page, lower priority. |

### Include Conflict (1 file — potential double-inject)

| File | Issue |
|------|-------|
| **`includes/page-template.html`** | Has TWO include mechanisms: SSI comment (`<!--#include virtual="..."-->`) AND JS-based loader (`<div id="navigation-include">`). If both fire, navigation appears twice. |

### Nested Nav-in-Nav (3 files — structural concern)

| File | Lines | Issue |
|------|-------|-------|
| `examples/form-validation-demo.html` | 35, 43 | `<nav class="main-nav">` nested inside `<nav class="aiab-site-nav">` |
| `examples/accordion-demo.html` | 31, 39 | Same pattern |
| `examples/avatar-demo.html` | 42, 50 | Same pattern |

These have a `<nav id="main-nav" class="main-nav">` nested inside an outer `<nav class="aiab-site-nav">`. Valid HTML but semantically questionable — the inner element should be a `<div>`.

### Legitimate Multi-Nav (33 files — no action needed)

Files with `aiab-site-nav` plus breadcrumbs, sidebar navs, pagination navs, docs-nav, or component demos. These are structurally correct:
- 16 `<nav>` elements in `examples/navigation-showcase.html` (all are demos)
- 12 in `docs/components/pagination.html` (pagination examples)
- 9 in `docs/function.html` and `docs/components/navigation.html` (component demos)
- 2–4 in most other docs/example pages (site nav + breadcrumb/sidebar)

### No Nav Element (30 files)

- `examples/advanced-components-demo.html`, `examples/shopping-cart-modern.html`, `examples/apple-refinements-showcase.html`
- All 8 pea.rs files, 10 font demo files
- Several demo test files

### Navigation Include Partials

Two separate include files exist with slightly different names:
- `includes/navigation.html` — main include
- `docs/navigation-include.html` — docs-specific include

No page references both simultaneously, but the duplication itself is a maintenance concern.

---

## 3. Color Consistency Findings

### 3.1 Brand Color #ED8B00 — Hardcoded 286 Times

The primary brand color appears as a raw hex value 286 times across 66 files. Only 1 file (`examples/dark-mode-demo.html`) uses a CSS custom property: `var(--color-primary, #ED8B00)`. A brand color change would require updating all 66 files manually.

**Worst offenders:**
| File | #ED8B00 occurrences |
|------|-------------------|
| `examples/e-commerce-product.html` | 24 |
| `examples/e-commerce-catalog.html` | 19 |
| `examples/e-commerce-cart.html` | 12 |
| `examples/modal-enhanced.html` | 11 |
| `examples/dashboard-template.html` | 10 |
| `docs/features-original.html` | 11 (uses #667eea instead — different accent!) |

### 3.2 Competing Color Systems

Two color palettes coexist across the project with no systematic distinction:

| Purpose | Bootstrap Palette | Tailwind Palette | Occurrences |
|---------|------------------|-----------------|------------|
| **Blue accent** | `#007bff` (22 uses, 3 files) | `#3b82f6` (29 uses, 14 files) | Mixed |
| **Gray border** | `#dee2e6` (147 uses, 23 files) | `#e5e7eb` (28 uses, 14 files) | Mixed |
| **Light border** | `#e9ecef` (42 uses, 22 files) | `#e2e8f0` (23 uses, 8 files) | Mixed |
| **Muted text** | `#6c757d` (116 uses, 22 files) | `#718096` (13 uses, 4 files) | Mixed |
| **Success green** | `#28a745` (38 uses, 13 files) | `#10b981` (few uses) | Bootstrap dominant |
| **Danger red** | `#dc3545` (28 uses, 12 files) | — | Bootstrap only |

### 3.3 Top Hardcoded Colors (by frequency)

| Hex Color | Occurrences | Files | Semantic Role |
|-----------|------------|-------|---------------|
| `#ED8B00` | 286 | 66 | Brand orange (PRIMARY) |
| `#f8f9fa` | 160 | 35 | Light gray background |
| `#dee2e6` | 147 | 23 | Border/divider gray |
| `#2c3e50` | 134 | 29 | Dark slate (headings, nav bg) |
| `#6c757d` | 116 | 22 | Muted text gray |
| `#c97400` | 64 | 33 | Dark orange (gradient endpoint) |
| `#e9ecef` | 42 | 22 | Light border/bg |
| `#28a745` | 38 | 13 | Success green |
| `#3b82f6` | 29 | 14 | Blue accent (Tailwind) |
| `#dc3545` | 28 | 12 | Danger red |
| `#007bff` | 22 | 3 | Link blue (Bootstrap) |
| `#667eea` | 15 | 3 | Purple/blue accent (old) |

### 3.4 CSS Import Patterns (8 Distinct Groups)

| Pattern | Files | CSS Strategy |
|---------|-------|-------------|
| **A: `/src/css/main.css`** | ~15 | Modern framework entry point |
| **B: `/dist/amphibious.css`** | ~10 | Compiled distribution CSS |
| **C: `/css/a.mphibio.us.css`** | ~27 | Legacy pre-namespace CSS |
| **D: `./docs.css`** | 5 | Docs-specific shared stylesheet |
| **E: Page-specific CSS** | 7 | Standalone pages with own CSS |
| **F: Cherry-picked atoms** | 6 | Individual component CSS files |
| **G: Font specimens** | 11 | Third-party font demo CSS |
| **H: No external CSS** | ~25 | Inline `<style>` only (168–733 lines) |

**Key issue:** No standard CSS loading pattern exists. Pages range from 5 linked stylesheets to zero links with 733 lines of inline styles.

### 3.5 Framework Banner — 23 Identical Inline-Styled Instances

The "Amphibious Framework Banner" appears in 23 files (all pea.rs + green theme + classic theme) with 100% inline styling:

```html
<div style="background: #ED8B00; padding: 8px 16px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px;">
    <a href="..." style="color: white; text-decoration: none;">← Back to Examples</a>
    <span style="color: rgba(255,255,255,0.6); margin: 0 8px;">|</span>
    <a href="/" style="color: white; text-decoration: none;">Amphibious Framework</a>
</div>
```

A single CSS class would eliminate this repetition.

---

## 4. Shopping Cart Layout Findings

### Assessment Summary

| Criterion | e-commerce-cart.html | shopping-cart-modern.html | checkout-flow.html |
|-----------|---------------------|--------------------------|-------------------|
| **Uses `.aiab-container`** | Yes (3x) | **No** | Yes (3x) |
| **Uses `.aiab-row`** | Once (hidden) | **No** | Yes (primary layout) |
| **Uses `.aiab-col-*`** | Once (hidden) | **No** | Yes (`col-10` + `col-6`) |
| **Inline `<style>` lines** | **733** | 0 (914-line external CSS) | **323** |
| **Inline `style=""` attrs** | ~16 | 0 | ~23 |
| **Non-namespaced classes** | **~70+** | **~65+** | **~30+** |
| **Custom grid bypasses** | Main layout | **Entire page** | Form rows only |
| **Mobile breakpoint (480px)** | Missing | Missing | Missing |
| **Grid Compliance** | **FAIL** | **FAIL** | **PARTIAL** |

### e-commerce-cart.html — FAIL

- **Primary layout** uses `grid-template-columns: 1fr 380px` instead of `.aiab-row` with `.aiab-col-*`
- **733 lines** of inline CSS with ~90 custom selectors
- **~70+ non-namespaced classes** (e.g., `cart-item`, `quantity-selector`, `checkout-button`)
- `.visually-hidden` duplicates framework's `.aiab-sr-only`
- Hardcoded `380px` sidebar incompatible with 16-column system

### shopping-cart-modern.html — FAIL

- **Zero framework grid usage** — no `.aiab-container`, `.aiab-row`, or `.aiab-col-*`
- **914-line external CSS** (`shopping-cart-modern.css`) with its own `:root` variables using different naming convention (`--primary-color` vs framework's `--color-primary`)
- Custom container at `max-width: 1400px` (framework uses 1200px)
- **~65+ non-namespaced classes**, many dangerously generic: `save`, `remove`, `free`, `feature`, `price`, `step`
- Redefines `.aiab-tooltip` with completely different styles
- No site navigation at all

### checkout-flow.html — PARTIAL (Best of the three)

- **Correctly uses framework grid**: `.aiab-container` > `.aiab-row` > `.aiab-col-10` + `.aiab-col-6` (= 16 columns)
- Uses `.aiab-form-group`, `.aiab-radio-group`, `.aiab-btn` from framework
- **But:** 323 lines of inline CSS, redefines `.aiab-btn` and `.aiab-form-group` locally
- **~30+ non-namespaced classes** including Bootstrap-conflicting names: `btn-primary`, `btn-secondary`
- Missing 480px mobile breakpoint

---

## 5. Cross-Page Head Consistency

### Comparison Table

| Element | index.html | docs/index.html | docs/form.html | docs/foundation.html | e-commerce-catalog | e-commerce-cart | navigation-showcase |
|---------|-----------|----------------|----------------|---------------------|-------------------|----------------|-------------------|
| **charset** | UTF-8 | UTF-8 | UTF-8 | UTF-8 | UTF-8 | UTF-8 | UTF-8 |
| **viewport** | Standard | Standard | Standard | Standard | Standard | Standard | Standard |
| **theme-color** | `#ffffff` | **MISSING** | **MISSING** | `#ffffff` | **MISSING** | **MISSING** | **MISSING** |
| **description** | Yes | **MISSING** | Yes | Yes | Yes | Yes | Yes |
| **keywords** | Yes | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING |
| **favicon** | Yes | **MISSING** | **MISSING** | **MISSING** | **MISSING** | **MISSING** | **MISSING** |
| **title format** | "2.0.1 - Modern CSS Framework" | "Amphibious 2.0" | "Amphibious 2.0" | "Amphibious 2.0" | "Amphibious 2.0" | "Amphibious 2.0 E-commerce" | "Amphibious 2.0" |
| **CSS `<link>` count** | 5 | 0 | 1 | 4 | 0 | 0 | 0 |
| **Inline `<style>` lines** | 0 | ~168 | ~406 | ~117 | ~624 | ~733 | ~239 |
| **Framework JS loaded** | Yes | **No** | Yes | **No** (toggle only) | Yes | Yes | Yes |
| **Dark mode toggle JS** | Yes | No | No | Yes | No | No | No |
| **Lucide CDN** | Yes | No | No | No | No | No | No |
| **Font loading** | None | None | None | None | None | None | None |

### Key Inconsistencies

1. **Favicon:** Only `index.html` declares one. All 110+ other pages are missing it.
2. **Description meta:** Missing on `docs/index.html` — the documentation hub.
3. **Theme-color meta:** Only 2 of 7 sampled pages include it.
4. **Title format:** `index.html` says "2.0.1", all others say "2.0". Cart page appends "E-commerce".
5. **Three different JS entry points:** `/src/js/index.js`, `../src/js/index.js`, `/src/index.js` — which is canonical?
6. **Framework JS not loaded on 2 docs pages:** `docs/index.html` and `docs/foundation.html` skip the main framework JS.
7. **Navigation mismatch on `e-commerce-cart.html`:** Different submenu items, different anchor targets than all other pages.

---

## Priority Fix List

Ordered by impact:

### P0 — Theme Consistency (affects ALL users on dark OS)
1. **Add `data-theme="light"` to `<html>` on every page** that doesn't explicitly support dark mode. This is a one-line change per file that prevents uncontrolled dark mode bleed-through for ~55 pages.
2. **Add dark-mode toggle JS** to pages that load `main.css` (or at minimum, set the default theme attribute).

### P1 — Navigation Duplication (user-visible bug)
3. **Remove legacy nav from `docs/form.html`** (line 1374) — currently renders two full navigations.
4. **Fix nested nav-in-nav** on 3 files — change inner `<nav>` to `<div>`.
5. **Resolve dual include mechanism** in `includes/page-template.html`.

### P2 — Shopping Cart Layout (broken pages)
6. **Refactor `shopping-cart-modern.html`** — zero framework integration, parallel design system.
7. **Refactor `e-commerce-cart.html`** — replace `1fr 380px` grid with `.aiab-col-*` system.
8. **Extract inline CSS** from both cart pages into external stylesheets.

### P3 — Color Token Migration (DRY violation, maintainability)
9. **Replace 286 hardcoded `#ED8B00` instances** with `var(--aiab-color-primary)`.
10. **Standardize on one gray palette** — pick Bootstrap OR Tailwind grays, not both.
11. **Create CSS class for framework banner** — eliminate 23 identical inline-styled instances.

### P4 — Head Section Standardization
12. **Add favicon to all pages** — `<link rel="icon" href="/favicon.ico">`.
13. **Add description meta to `docs/index.html`**.
14. **Standardize title format** — `"[Page] — Amphibious 2.0"` consistently.
15. **Standardize JS entry point** — use one canonical path.
16. **Add theme-color meta to all pages**.

### P5 — CSS Architecture (long-term maintainability)
17. **Establish standard CSS loading pattern** — all pages should load `main.css` (or `dist/amphibious.css`) consistently.
18. **Extract inline `<style>` blocks** from ~25 pages into external stylesheets.
19. **Migrate legacy pages** loading `/css/a.mphibio.us.css` to modern framework (27 files).

### P6 — Namespace Compliance (shopping cart pages)
20. **Prefix ~165+ non-namespaced classes** across the three cart/checkout pages.
21. **Remove `.visually-hidden` duplication** — use `.aiab-sr-only`.
22. **Remove `.aiab-tooltip` redefinition** in `shopping-cart-modern.css`.
