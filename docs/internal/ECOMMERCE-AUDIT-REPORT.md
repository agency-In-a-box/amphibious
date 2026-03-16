# E-Commerce Templates Audit Report

**Date:** 2026-03-06
**Auditor Roles:** Senior Developer Persona + Design Excellence Audit
**Overall Score: 4.5/10**

---

## Executive Summary

The e-commerce templates are in rough shape. The core problem isn't any single bug — it's architectural rot. There are **two competing cart implementations**, **six CSS "fix" files** layered on top of each other, **179 inline onclick handlers** across the example files, widespread namespace violations, hardcoded values everywhere, and no dark mode support. The code reads like it was built iteratively without ever stepping back to consolidate.

The good news: the semantic HTML in the cart (`e-commerce-cart.html`) and checkout (`checkout-flow.html`) pages is genuinely solid. The bad news: it's buried under layers of band-aids.

---

## File Inventory

### HTML Templates (5 pages)
| File | Lines | Purpose |
|------|-------|---------|
| `e-commerce-catalog.html` | 904 | Product listing with filters, sorting, pagination |
| `e-commerce-product.html` | 814 | Product detail with gallery, reviews, tabs |
| `e-commerce-cart.html` | 799 | Shopping cart (semantic HTML version) |
| `shopping-cart-modern.html` | 585 | Shopping cart (modern layout version) |
| `checkout-flow.html` | 467 | Multi-step checkout with shipping form |

### CSS Files (11 files, ~6,600 lines total)
| File | Lines | Purpose |
|------|-------|---------|
| `e-commerce-catalog.css` | 623 | Catalog page styles |
| `e-commerce-product.css` | 609 | Product detail styles |
| `e-commerce-cart.css` | 789 | Semantic cart styles |
| `shopping-cart-modern.css` | 817 | Modern cart styles |
| `checkout-flow.css` | 368 | Checkout flow styles |
| `e-commerce-fix.css` | 478 | Fix layer 1 |
| `e-commerce-final-fix.css` | 656 | Fix layer 2 |
| `e-commerce-proper-fix.css` | 591 | Fix layer 3 |
| `e-commerce-qa-fixes.css` | 572 | Fix layer 4 (QA pass) |
| `e-commerce-sort-fix.css` | 222 | Fix layer 5 (sort controls) |
| `e-commerce-modern.css` | 841 | Fix layer 6 (modern catalog) |

### Theme Variants (3 themes)
| Theme | Files | Lines |
|-------|-------|-------|
| `themes/classic/` | 3 HTML + classic.css (1,067 lines) | Legacy teal theme |
| `themes/green/` | 3 HTML + green.css (857 lines) | Green accent theme |
| `themes/modern-saas/` | theme.css (908 lines) | Best-practice token system |

---

## CRITICAL Issues (Must Fix)

### 1. Two Competing Cart Implementations
`e-commerce-cart.html` and `shopping-cart-modern.html` are two completely separate cart pages with different markup structures, different CSS files, and different JS approaches. Neither references the other. This is confusing for anyone trying to use the framework.

**Decision needed:** Pick one, delete the other. The semantic version (`e-commerce-cart.html`) has better HTML structure. The modern version has cleaner visual layout but worse accessibility.

### 2. Six Layers of CSS Fixes (3,360 lines of band-aids)
The fix files represent accumulated technical debt:
```
e-commerce-fix.css        → 478 lines
e-commerce-final-fix.css  → 656 lines
e-commerce-proper-fix.css → 591 lines
e-commerce-qa-fixes.css   → 572 lines
e-commerce-sort-fix.css   → 222 lines
e-commerce-modern.css     → 841 lines
```
These should be consolidated into the base CSS files and deleted. The naming alone (`fix` → `final-fix` → `proper-fix`) tells the story.

### 3. Namespace Violations
`e-commerce-catalog.css` uses bare class names: `.header`, `.nav-categories`, `.filters`, `.product-card`, `.product-image`. These will collide with any other framework on the page. The CLAUDE.md explicitly mandates `.aiab-` prefix for all classes.

**Affected files:** catalog CSS and HTML are the worst offenders, but the product page also has unnamespaced classes in its inline styles and tab implementations.

### 4. Inline onclick Handlers (36 total across e-commerce pages)
| File | onclick count |
|------|--------------|
| `e-commerce-cart.html` | 22 |
| `e-commerce-product.html` | 11 |
| `e-commerce-catalog.html` | 3 |

These violate separation of concerns and CSP policies. Every `onclick="functionName()"` should be replaced with `addEventListener` in a module script.

---

## HIGH Issues

### 5. No Dark Mode Support
None of the e-commerce CSS files implement dark mode. The framework has a well-defined dark mode system (`data-theme="dark"`, CSS custom properties, `prefers-color-scheme` media query) but the e-commerce pages completely ignore it. Every hardcoded color (#2c3e50, #6c757d, #dee2e6, #28a745, #dc3545, #ffc107) will look wrong in dark mode.

### 6. Hardcoded Colors Throughout
Rough count of hardcoded hex colors across the 11 CSS files:
- `#2c3e50` (dark slate) — 15+ occurrences
- `#6c757d` (gray) — 20+ occurrences
- `#28a745` (green/success) — 10+ occurrences
- `#dc3545` (red/danger) — 8+ occurrences
- `#ffc107` (yellow/warning/stars) — 6+ occurrences
- `#ff6900` (Pantone 144 orange) — 12+ occurrences
- `#667eea` (blue/primary) — 8+ occurrences

These should all reference `var(--color-*)` design tokens.

### 7. Hardcoded Breakpoints
Every responsive CSS file uses `@media (max-width: 768px)` instead of the framework's `@custom-media` tokens (`--bp-md-down`, `--bp-sm-down`, etc.). This makes breakpoint changes impossible to propagate.

### 8. Excessive !important Usage
`e-commerce-qa-fixes.css` alone has 18 `!important` declarations. `e-commerce-sort-fix.css` adds more. This is a direct symptom of the fix-layering problem — each fix has to escalate specificity to override the previous fix.

### 9. Tab Accessibility (Product Page)
The product page tabs (Description, Details, Reviews, Shipping) are implemented with bare `<div>` elements and `onclick` handlers. They lack:
- `role="tablist"` on the container
- `role="tab"` on each tab button
- `role="tabpanel"` on each panel
- `aria-selected` state management
- `aria-controls` / `aria-labelledby` associations
- Keyboard navigation (Arrow keys)

The framework has a proper tabs component (`src/js/tabs.ts`, `src/css/organisms/tabs.css`) that should be used instead.

### 10. Inline SVG Duplication (shopping-cart-modern.html)
The modern cart embeds raw SVG markup for every icon instance instead of using the framework's Lucide icon system (`data-lucide` attributes). This adds ~200 lines of redundant SVG code.

---

## MEDIUM Issues

### 11. Grid Column Math
The 16-column grid math is correct across all pages (columns sum to 16), but the column ratios are inconsistent between similar layouts:
- Cart pages: 10 + 6
- Checkout: 10 + 6
- Catalog: 4 (sidebar) + 12 (main), but products use `aiab-col-4` inside the 12-col main = 25% of 75% = 18.75% actual width
- Product: 7 + 9

This isn't wrong, but there should be a documented rationale for different ratios across pages that are part of the same flow.

### 12. Inconsistent Semantic HTML Quality
The cart page (`e-commerce-cart.html`) uses proper `<article>`, `<section>`, `<figure>`, `<dl>` semantics. The product page uses `<div>` soup for similar structures. The catalog mixes both approaches. There should be one standard.

### 13. `<form onsubmit="return false;">` Wrappers
The cart page wraps quantity controls in `<form onsubmit="return false;">` elements. This is semantically wrong — these aren't forms, they're UI controls. Use `<div role="group">` instead.

### 14. Placeholder Images from placehold.co
All product images reference `placehold.co` external URLs. For a framework example, these should be local SVG placeholders that work offline and don't depend on a third-party service.

### 15. Legacy Theme Files
The classic and green themes use @font-face declarations with EOT/WOFF/TTF/SVG format stacks from ~2013 web font era. They reference font files that may not exist in the repo. The modern-saas theme is the only one following current practices.

---

## LOW Issues

### 16. Missing `loading="lazy"` consistency
Most images have `loading="lazy"`, but some don't (inconsistent across pages).

### 17. Print styles absent
No `@media print` rules in any e-commerce CSS file.

### 18. Reduced motion support absent
No `@media (prefers-reduced-motion: reduce)` rules despite the framework supporting it.

### 19. High contrast support absent
No `@media (prefers-contrast: high)` rules.

### 20. `shopping-cart-modern.js` referenced but not audited
The modern cart references an external JS file that wasn't part of this audit.

---

## Recommended Action Plan

### Phase 1: Consolidation (Eliminate Confusion)
1. **Choose one cart implementation** and archive the other
2. **Merge all 6 fix CSS files** into their base stylesheets, then delete the fix files
3. **Decide on one color palette** — the orange (#ff6900) vs blue (#667eea) conflict appears throughout

### Phase 2: Namespace & Standards Compliance
4. **Add `aiab-` prefix** to all unnamespaced classes in catalog CSS/HTML
5. **Replace all `onclick` handlers** with `addEventListener` in module scripts
6. **Replace hardcoded breakpoints** with `@custom-media` tokens
7. **Replace hardcoded colors** with `var(--color-*)` design tokens

### Phase 3: Accessibility
8. **Implement proper ARIA tabs** on product page using framework's tab component
9. **Add keyboard navigation** to size/color selectors on product page
10. **Replace `<form onsubmit="return false;">` wrappers** with appropriate ARIA roles

### Phase 4: Dark Mode & Resilience
11. **Add dark mode CSS** using the framework's `[data-theme="dark"]` pattern
12. **Add reduced motion, high contrast, and print styles**
13. **Replace placehold.co URLs** with local SVG placeholders
14. **Replace inline SVGs** (modern cart) with Lucide `data-lucide` attributes

### Phase 5: Theme Modernization
15. **Deprecate classic and green themes** or rebuild them using CSS custom properties
16. **Promote modern-saas theme** as the reference implementation

---

## Files to Delete After Consolidation
```
examples/e-commerce-fix.css
examples/e-commerce-final-fix.css
examples/e-commerce-proper-fix.css
examples/e-commerce-qa-fixes.css
examples/e-commerce-sort-fix.css
examples/shopping-cart-modern.html (or e-commerce-cart.html — pick one)
examples/shopping-cart-modern.css (if above is deleted)
examples/shopping-cart-modern.js (if above is deleted)
```

Estimated savings: ~3,400 lines of CSS, ~585 lines of HTML.
