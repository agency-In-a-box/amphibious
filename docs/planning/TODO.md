# Remaining Work - Amphibious 2.0

## Current Status
- **Tests:** 210 passing, 468 assertions, 10 test files ✅
- **Build:** 379 KB CSS (61 KB gzip), 114 KB JS (36 KB gzip) ✅
- **TypeScript:** Strict mode enabled ✅
- **Linting:** Biome with noExplicitAny enabled ✅
- **Namespace:** Full .aiab- isolation ✅
- **Exports:** All TS components exported from entry point ✅

## Completed (February 2026 Audit)

### P0 Fixes
- [x] Namespace isolation for helper utilities (helpers.css)
- [x] Namespace isolation for form QA fixes (forms-qa-fixes.css)
- [x] Test assertions updated for namespace changes
- [x] Tooltip regex bug fixed (position adjustment)
- [x] CI lockfile configuration fixed

### P1 Fixes
- [x] BEM modifier prefixing in 7 CSS files (tooltip, modal, avatar, sidebar, pagination, tabs, icons)
- [x] JS class reference updates (modal.ts, tooltip.ts)
- [x] Fix namespace script CSS property damage in 14 doc files (display: grid)
- [x] Fix namespace script JS variable damage in 8 doc files
- [x] Prefix utility classes in doc examples (features, icons, cards)
- [x] State class prefixing (is-visible → aiab-is-visible, is-open → aiab-is-open)

### P2 Fixes
- [x] Tooltip updatePosition now uses classList instead of regex
- [x] All `any` type casts replaced with proper union types
- [x] TypeScript strict mode enabled (strict: true)
- [x] Biome noExplicitAny rule enabled
- [x] Documentation updated (DEFICIENCY-LIST.md, TODO.md)

### P3 Fixes
- [x] Removed 13 dead legacy CSS files (2,033 lines)
- [x] Fixed CI audit step for Bun project
- [x] Prefixed Apple design system classes (.apple-* → .aiab-apple-*)
- [x] Prefixed .overlay and .drawer → .aiab-overlay, .aiab-drawer
- [x] Exported all TypeScript components from library entry point
- [x] Configured Vite resolve order (.ts before .js)

### P4 Fixes
- [x] Prefixed dark-mode utility classes (.bg-light, .text-muted, etc. → .aiab-*)
- [x] Prefixed .theme-transition and .dark-mode-toggle → .aiab-*
- [x] Prefixed .horizontal navigation class → .aiab-horizontal (48 CSS + 5 JS + 24 HTML)
- [x] Fixed dropdown.js base class 'dropdown' → 'aiab-dropdown'
- [x] Fixed dropdown.css .dropdown--multi → .aiab-dropdown--multi
- [x] Fixed navigation.js 'active' → 'aiab-active', 'menu-open' → 'aiab-menu-open'
- [x] Prefixed page-demo CSS classes (home.css, docs.css)

### P5 Fixes
- [x] Added missing CSS imports to main.css (foundation-fixes.css, updates-section-fix.css)
- [x] Fixed .updates-section namespace mismatch in updates-section-fix.css
- [x] Removed dead layers.css (abandoned @layer architecture)
- [x] Prefixed all pears.css component classes (.stats, .slats, .stat-card, .review-slats, etc.)
- [x] Updated 33 HTML files with prefixed pears class attributes and inline styles
- [x] Fixed print.css .col selector to target [class*="aiab-col-"]
- [x] Updated test assertions for prefixed class names

### P6 Fixes
- [x] Fixed accordion.js 'active' → 'aiab-active' class mismatch with CSS
- [x] Renamed footer .amp-footer → .aiab-footer (wrong namespace prefix, 85 selectors)
- [x] Prefixed file-upload.css base class and modifiers with .aiab-
- [x] Prefixed switch--*, dropdown--* BEM modifiers
- [x] Prefixed timeline filter/zoom, forms help-text/search-form, tables no-wrap/truncate
- [x] Prefixed form-builder toolbar/toolbox/canvas/field classes (41 selectors)
- [x] Updated JS class references in timeline.js, color-picker.js, form-builder.js
- [x] Updated 4 HTML files with P6 class attribute and inline style fixes

## Remaining Work

### Known Namespace Gaps (Low Risk)
- Plain JS component state classes (`open`, `selected`, `disabled`, `active`, `focused`, `expanded`) are unprefixed but used as compound selectors (e.g., `.aiab-dropdown.open`) — collision risk is low
- Affected files: accordion.js, color-picker.js, data-table.js, datepicker.js, dropdown.js, file-upload.js, form-builder.js, range-slider.js, search-bar.js, timeline.js, toast.js
- Page-demo classes in foundation-fixes.css (`.demo-col`, `.code-example`, `.doc-section`) remain unprefixed — consistent in both CSS and HTML, low collision risk

### High Priority
1. **Test coverage for JS modules** - 12+ modules without tests
   - accordion, dropdown, toast, color-picker, datepicker
   - data-table, file-upload, range-slider, search-bar
   - form-builder, timeline

### Medium Priority
2. **NPM package publishing** - Package configured but not published
3. **JSDoc documentation** - Add to all public TypeScript APIs

### Low Priority
4. **E-commerce components** - Cart, checkout, payment forms
5. **Performance optimization** - Critical CSS, tree shaking, externalize Splide
6. **Visual regression tests** - Screenshot comparison testing

## Build Configuration
- `vite.config.js` - Library build (default)
- `vite.config.app.js` - Application development
- `vite.config.docs.js` - Documentation site

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- No IE support

## Security
- XSS protection via DOMPurify (src/utils/sanitize.ts)
- All HTML content sanitized before DOM insertion
- No known vulnerabilities

---

Last Updated: February 2026
