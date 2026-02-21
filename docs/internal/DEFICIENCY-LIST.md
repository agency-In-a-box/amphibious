# Amphibious 2.0 - Deficiency List

**Created**: November 2, 2025
**Last Updated**: February 2026
**Status**: Post-audit remediation complete
**Version**: 2.0.0

This document tracks known issues, missing features, and areas for improvement.

## 1. Component Status

### Implemented Components
- [x] **Modal/Dialog Component** - Full lifecycle, focus trapping, ARIA, ModalManager
- [x] **Tooltip Component** - Smart positioning, variants, keyboard support, EcommerceTooltips
- [x] **Icon System** - Lucide SVG icons via CDN with lightweight inline fallback
- [x] **Accordion Component** - With AbortController cleanup
- [x] **Progress Bar Component** - CSS-based with variants
- [x] **Badge Component** - Multiple variants and sizes
- [x] **Avatar Component** - Full variant/size system with groups
- [x] **Dropdown Menu Component** - With enhanced search variant
- [x] **Toast Notifications** - Configurable position and auto-dismiss
- [x] **Tabs Component** - ARIA-compliant with keyboard navigation
- [x] **Carousel Component** - Splide.js integration with variants
- [x] **Forms Validation** - Custom rules, ARIA, character counters
- [x] **Navigation** - Mobile responsive with dropdowns
- [x] **Smooth Scroll** - Anchor scrolling with focus management
- [x] **Data Table** - Sorting, pagination, filtering
- [x] **Color Picker** - Full-featured with presets
- [x] **Date Picker** - Calendar interface with enhanced variant
- [x] **File Upload** - Drag-and-drop with progress
- [x] **Range Slider** - Configurable min/max/step
- [x] **Search Bar** - With suggestions and enhanced variant
- [x] **Form Builder** - Drag-and-drop field creation
- [x] **Timeline** - Vertical/horizontal layouts
- [x] **Sidebar** - Collapsible with overlay
- [x] **Pagination** - Multiple variants (pills, rounded, compact)
- [x] **Dark Mode** - CSS custom properties with localStorage persistence

### E-Commerce Components (Partial)
- [x] **Product Card** - Via card component variants
- [x] **Product Rating** - Star rating in icons CSS
- [x] **Product Badges** - Via badge component
- [ ] **Shopping Cart** - Cart dropdown/sidebar
- [ ] **Product Gallery** - Image carousel with zoom
- [ ] **Checkout Steps** - Multi-step checkout progress
- [ ] **Payment Forms** - Credit card input with validation
- [ ] **Product Comparison** - Side-by-side comparison

## 2. Code Quality

### Resolved
- [x] **Namespace Isolation** - All CSS classes use `.aiab-` prefix across CSS, JS, and HTML
- [x] **TypeScript Strict Mode** - `strict: true` enabled in tsconfig.json
- [x] **No `any` Types** - All replaced with proper union types
- [x] **Biome Linting** - `noExplicitAny` rule enabled
- [x] **XSS Protection** - DOMPurify sanitization throughout
- [x] **Tooltip Regex Bug** - Fixed to use classList.remove/add instead of regex
- [x] **Event Listener Cleanup** - Core modules use AbortController or tracking patterns
- [x] **Dead CSS Removal** - 13 legacy CSS files removed (2,033 lines)
- [x] **CI Pipeline** - Fixed npm audit for Bun project
- [x] **Library Exports** - All TypeScript components exported from entry point
- [x] **JS/CSS Mismatches** - Fixed dropdown base class, navigation active/menu-open
- [x] **Pears Component Prefixing** - All pears.css classes (.stats, .slats, .stat-card, etc.) prefixed with .aiab-
- [x] **Missing CSS Imports** - Added foundation-fixes.css and updates-section-fix.css to main.css
- [x] **Print CSS** - Fixed .col selector to target [class*="aiab-col-"]

### Remaining
- [ ] **Test Coverage** - 12+ JS modules untested (accordion, dropdown, toast, etc.)
- [ ] **JSDoc Comments** - Public APIs lack documentation comments
- [ ] **State Class Prefixing** - Plain JS components use unprefixed state classes (open, selected, etc.) in compound selectors — low collision risk

## 3. Testing

### Current: 210 tests, 469 assertions, 10 test files - all passing

### Tested Modules
- [x] Navigation (9 tests)
- [x] Modal (44 tests)
- [x] Tooltip (42 tests)
- [x] Forms (29 tests)
- [x] Carousel (24 tests)
- [x] Tabs (20 tests)
- [x] Smooth Scroll (15 tests)
- [x] Theme Cascade (16 tests)
- [x] CSS Components (58 tests)
- [x] CSS Cascade (7 tests)

### Untested Modules
- [ ] accordion.js
- [ ] dropdown.js / dropdown-enhanced.js
- [ ] toast.js
- [ ] color-picker.js
- [ ] datepicker.js / datepicker-enhanced.js
- [ ] data-table.js
- [ ] file-upload.js / file-upload-enhanced.js
- [ ] range-slider.js
- [ ] search-bar.js / search-bar-enhanced.js
- [ ] form-builder.js
- [ ] timeline.js

## 4. Build & Distribution

### Current
- **CSS**: 389 KB (62 KB gzip)
- **JS**: 114 KB ES module (36 KB gzip) — includes all component exports
- **CI/CD**: GitHub Actions with lint, typecheck, test, build, security scan
- **Bundle limit**: 2 MB

### Remaining
- [ ] **NPM Publishing** - Package ready but not published
- [ ] **CDN Distribution** - Host on public CDN
- [ ] **Tree Shaking** - Individual component imports

## 5. Documentation

### Available
- [x] Component HTML pages in docs/
- [x] API reference page
- [x] Getting started guide
- [x] Grid system documentation
- [x] Icon system documentation

### Needed
- [ ] Migration guide from A.mphibio.us
- [ ] Theming/customization guide
- [ ] Accessibility compliance documentation

## Priority Matrix

### Done
1. ~~Modal/Dialog component~~ ✅
2. ~~Tooltip component~~ ✅
3. ~~Icon System migration~~ ✅
4. ~~Namespace isolation~~ ✅ (P0-P4 complete)
5. ~~TypeScript strict mode~~ ✅
6. ~~Library exports~~ ✅
7. ~~Dead code removal~~ ✅
8. ~~CI/CD fixes~~ ✅

### Next Up
1. **Test coverage** - Add tests for untested JS modules
2. **NPM publish** - Package and publish to registry
3. **E-commerce components** - Cart, checkout, payment forms
4. **Performance audit** - Lighthouse scores, bundle optimization

---

**Note**: This list is maintained alongside the codebase and updated as features are completed.
