# Amphibious 2.0 — Design Consistency Audit Report
**Date:** 2026-02-22
**Scope:** All HTML files in docs/, examples/, demos/, includes/, and project root

> **Remediation Status**: Majority of findings resolved as part of the v2.0.1 remediation sprint (February 25, 2026). See REMEDIATION-PLAN.md and AUDIT-REPORT-2026-02-25.md for the full technical audit.

## Executive Summary
- **Total files audited:** 115
- **Files missing explicit light theme:** ~~111/111~~ RESOLVED — head sections standardized across all pages
- **Files with duplicate navigation:** ~~2 actual duplicates + 1 include conflict + 3 nested-nav-in-nav~~ RESOLVED — nav links fixed
- **Files with inline color overrides:** 40+ files with hardcoded hex in `style=` attributes (partially addressed)
- **Brand color #ED8B00 hardcoded:** 286 times across 66 files — partially migrated to CSS variables
- **Shopping cart grid compliance:** ~~FAIL / FAIL / PARTIAL~~ RESOLVED — all 3 pages rewritten
- **Pages with no external CSS (inline-only):** ~~~25 files with 168–733 lines~~ RESOLVED — inline CSS extracted to external files
- **Favicon missing:** ~~On 110+ of 115 pages~~ RESOLVED — standardized head sections

---

## 1. Theme State Findings

### Critical Finding: Zero Pages Set `data-theme="light"` — RESOLVED

No file in the entire project set `data-theme="light"` on the `<html>` element. The dark mode CSS architecture uses:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { /* dark mode styles */ }
}
```

**Resolution:** Head sections standardized across all docs/, examples/, and demos/ pages with consistent theme handling.

### Three Tiers of Exposure — RESOLVED

| Tier | Risk | Count | Status |
|------|------|-------|--------|
| **HIGH** | Dark mode bleed-through | ~55 files | RESOLVED |
| **CONTROLLED** | JS-dependent | 3 files | RESOLVED |
| **UNAFFECTED** | No dark CSS | ~26 files | N/A |

---

## 2. Navigation Duplication Findings — RESOLVED

### Actual Duplicates — RESOLVED

| File | Issue | Status |
|------|-------|--------|
| **`docs/form.html`** | Two full-width navigation menus | RESOLVED — legacy nav removed |
| **`demos/test-cascade.html`** | Two `aiab-site-nav` blocks | RESOLVED |

### Include Conflict — RESOLVED

| File | Issue | Status |
|------|-------|--------|
| **`includes/page-template.html`** | Dual include mechanisms | RESOLVED |

### Nested Nav-in-Nav — RESOLVED

| File | Issue | Status |
|------|-------|--------|
| `examples/form-validation-demo.html` | `<nav>` nested inside `<nav>` | RESOLVED |
| `examples/accordion-demo.html` | Same pattern | RESOLVED |
| `examples/avatar-demo.html` | Same pattern | RESOLVED |

---

## 3. Color Consistency Findings

### 3.1 Brand Color #ED8B00 — Partially Addressed

The primary brand color appeared as a raw hex value 286 times across 66 files. Many instances have been migrated to CSS custom properties, but some hardcoded values remain in inline styles within docs/examples HTML.

**Status:** PARTIALLY RESOLVED — CSS custom properties (`var(--color-primary)`) used in framework CSS; some inline HTML instances remain.

### 3.2 Competing Color Systems — Partially Addressed

Two color palettes coexisted (Bootstrap-derived and Tailwind-derived grays). The framework design tokens now define a canonical palette, but some docs/examples pages still reference both.

**Status:** PARTIALLY RESOLVED — design tokens canonical; legacy references remain in some pages.

### 3.3 Top Hardcoded Colors — Partially Addressed

Framework CSS uses custom properties exclusively. Remaining hardcoded hex values are in docs/examples inline HTML `style=` attributes.

### 3.4 CSS Import Patterns — RESOLVED

Previously 8 distinct CSS loading patterns existed with no standard.

**Status:** RESOLVED — standardized CSS import patterns across all pages. Pages load either `src/css/main.css` (dev) or `dist/amphibious.css` (production) consistently.

### 3.5 Framework Banner — RESOLVED

The "Amphibious Framework Banner" appeared in 23 files with 100% inline styling.

**Status:** RESOLVED — extracted to `src/css/atoms/framework-banner.css` CSS class. All 23 files updated to use the class instead of inline styles.

---

## 4. Shopping Cart Layout Findings — RESOLVED

### Assessment Summary

| Criterion | e-commerce-cart | shopping-cart-modern | checkout-flow |
|-----------|----------------|---------------------|---------------|
| **Original Status** | FAIL | FAIL | PARTIAL |
| **Remediation Status** | RESOLVED | RESOLVED | RESOLVED |

**Resolution:**
- `shopping-cart-modern.html` — completely rewritten with framework grid, namespaced classes, external CSS
- `e-commerce-cart.html` — rewritten to use `.aiab-container` / `.aiab-row` / `.aiab-col-*` grid system
- `checkout-flow.html` — rewritten with proper framework integration, external CSS

All three pages now use the framework's 16-column grid system, `.aiab-` namespaced classes, and external CSS files.

---

## 5. Cross-Page Head Consistency — RESOLVED

### Key Inconsistencies — All Resolved

| Issue | Status |
|-------|--------|
| Favicon missing on 110+ pages | RESOLVED — standardized across all pages |
| Description meta missing on docs/index.html | RESOLVED |
| Theme-color meta inconsistent | RESOLVED — standardized |
| Title format inconsistent | RESOLVED — standardized format |
| Three different JS entry points | RESOLVED — canonical path established |
| Framework JS not loaded on 2 docs pages | RESOLVED |
| Navigation mismatch on e-commerce-cart | RESOLVED — page rewritten |

---

## Priority Fix List — Status

### P0 — Theme Consistency: RESOLVED
1. ~~Add `data-theme="light"` to `<html>` on every page~~ DONE
2. ~~Add dark-mode toggle JS to pages that load main.css~~ DONE

### P1 — Navigation Duplication: RESOLVED
3. ~~Remove legacy nav from `docs/form.html`~~ DONE
4. ~~Fix nested nav-in-nav on 3 files~~ DONE
5. ~~Resolve dual include mechanism~~ DONE

### P2 — Shopping Cart Layout: RESOLVED
6. ~~Refactor `shopping-cart-modern.html`~~ DONE — complete rewrite
7. ~~Refactor `e-commerce-cart.html`~~ DONE — complete rewrite
8. ~~Extract inline CSS from cart pages~~ DONE

### P3 — Color Token Migration: PARTIALLY RESOLVED
9. Replace 286 hardcoded `#ED8B00` instances — framework CSS uses tokens; some inline HTML instances remain
10. Standardize on one gray palette — design tokens canonical; some legacy references remain
11. ~~Create CSS class for framework banner~~ DONE

### P4 — Head Section Standardization: RESOLVED
12. ~~Add favicon to all pages~~ DONE
13. ~~Add description meta to `docs/index.html`~~ DONE
14. ~~Standardize title format~~ DONE
15. ~~Standardize JS entry point~~ DONE
16. ~~Add theme-color meta to all pages~~ DONE

### P5 — CSS Architecture: RESOLVED
17. ~~Establish standard CSS loading pattern~~ DONE
18. ~~Extract inline `<style>` blocks from ~25 pages~~ DONE — external CSS files created
19. Legacy pages loading `/css/a.mphibio.us.css` — left as-is (legacy/archived content)

### P6 — Namespace Compliance: RESOLVED
20. ~~Prefix non-namespaced classes across cart/checkout pages~~ DONE
21. ~~Remove `.visually-hidden` duplication~~ DONE
22. ~~Remove `.aiab-tooltip` redefinition~~ DONE

---

## Remaining Items (Low Priority)

The following items remain as low-priority technical debt:

1. **Hardcoded hex colors in inline `style=` attributes** — ~40 files still have some inline color values in HTML. These are in docs/examples demonstration markup, not framework CSS.
2. **Legacy pages** — 27 files under `examples/pea.rs/`, `examples/themes/green/`, `examples/themes/classic/` still load the legacy `/css/a.mphibio.us.css`. These are archived content and not part of the active framework.
3. **Competing gray palettes** — some docs/examples still reference both Bootstrap-derived and Tailwind-derived gray values in inline styles.
