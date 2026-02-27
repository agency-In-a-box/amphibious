# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Amphibious 2.0** - A modern CSS framework and component library built with Vite 6, TypeScript, and Atomic Design principles. Evolution of the original A.mphibio.us responsive framework.

### Core Principles
- **Semantic HTML purist** - Clean, standards-compliant markup
- **No hacks allowed** - Best practices only, no code bloat
- **TypeScript strict mode** - Properly typed, no implicit any
- **Minimal classes** - Lean templates, efficient CSS

## Development Commands

```bash
# Core Development
bun run dev              # Dev server on port 2960
bun run build            # Production build (library mode)
bun run build:site       # Build documentation site
bun run preview          # Preview production build

# Code Quality
bun run lint             # Run Biome linter
bun run lint:fix         # Auto-fix linting issues
bun run format           # Format code with Biome
bun run typecheck        # TypeScript type checking

# Testing
bun test                 # Run tests with happy-dom
bun test --watch         # Watch mode

# Utility Scripts
bun run fix:grid         # Fix grid system issues
bun run fix:docs         # Fix documentation paths
bun run fix:images       # Update image placeholders
```

## Architecture

### CSS Structure (Atomic Design)
```
src/css/
├── tokens/
│   ├── design-tokens.css  # Colors, spacing, typography, shadows
│   └── breakpoints.css    # @custom-media responsive breakpoints
├── atoms/               # Basic elements (buttons, badges, icons)
├── molecules/           # Simple combinations (alerts, tooltips)
├── organisms/           # Complex components (cards, modals, forms)
├── pages/              # Page-specific fixes and overrides
└── main.css            # Entry point with @import ordering
```

### Namespace Isolation
All CSS classes use `.aiab-` prefix to prevent conflicts with agency frameworks (Bootstrap, Tailwind, etc.):
- `.container` → `.aiab-container`, `.btn` → `.aiab-btn`, `.col-N` → `.aiab-col-N`
- Transformation script: `scripts/add-aiab-namespace.js`
- **Important**: Never apply `.aiab-` prefix to JS DOM properties/methods (`.focus()`, `.disabled`, `.input`, etc.)

### Responsive Breakpoints (@custom-media)
All responsive breakpoints are defined as `@custom-media` tokens in `src/css/tokens/breakpoints.css`, compiled by PostCSS at build time:
- `--bp-xs-down` (max-width: 480px) — Phone portrait
- `--bp-sm-down` (max-width: 640px) — Phone landscape
- `--bp-md-down` (max-width: 768px) — Tablet portrait
- `--bp-lg-down` (max-width: 1024px) — Tablet landscape
- `--bp-md-up` (min-width: 768px) — Tablet and up
- `--bp-lg-up` (min-width: 1024px) — Desktop and up
- `--bp-md-only` (min-width: 768px) and (max-width: 1024px) — Tablet only

Usage: `@media (--bp-sm-down) { ... }` — never use hardcoded pixel values.

### Component System
- **Grid**: 16-column flexbox system with `.aiab-col-N` classes (defined in `grid-modern.css`)
- **Responsive**: Mobile-first with @custom-media breakpoint tokens
- **Dark Mode**: CSS custom properties with localStorage persistence
- **Icons**: Lucide icons via CDN with `data-lucide` attributes
- **Navigation**: Scroll-aware header with `.is-scrolled` state (rAF-throttled)

### JavaScript/TypeScript Modules
```
src/js/
├── navigation.ts       # Mobile nav and dropdowns
├── modal.ts           # Modal dialogs with focus trapping
├── tabs.ts            # Tab components with ARIA
├── carousel.ts        # Splide.js wrapper
├── smooth-scroll.ts   # Anchor scrolling
├── forms.ts           # Form validation and file uploads
├── tooltip.ts         # Tooltips with smart positioning
├── accordion.js       # Accordion panels
├── dropdown.js        # Dropdown menus
├── dropdown-enhanced.js # Enhanced dropdowns with search
├── toast.js           # Toast notifications
├── color-picker.js    # Color picker component
├── datepicker.js      # Date picker
├── data-table.js      # Data tables with sorting/pagination
├── file-upload.js     # File upload with progress
├── search-bar.js      # Search with suggestions
├── range-slider.js    # Range slider input
├── timeline.js        # Timeline component
└── form-builder.js    # Drag-and-drop form builder
```

### Utilities
```
src/utils/
├── sanitize.ts        # DOMPurify wrapper for XSS prevention
└── memory-leak-fixes.ts # Event listener cleanup helpers
```

## Build Configuration

### Vite Configs
- `vite.config.js` - Library build (default)
- `vite.config.app.js` - Application development
- `vite.config.docs.js` - Documentation site

### Output Structure
```
dist/
├── amphibious.es.js    # ES module
├── amphibious.umd.js   # UMD module
├── amphibious.css      # Compiled CSS
└── index.d.ts          # TypeScript declarations
```

## CI/CD Pipeline

GitHub Actions workflow runs on push/PR:
1. **Lint & Format** - Biome checks
2. **Type Check** - TypeScript validation
3. **Tests** - Bun test suite
4. **Build** - Production build with size check (2MB limit)
5. **Security** - Vulnerability scanning

### Common CI Fixes
- Replace `-webkit-min-device-pixel-ratio` with `min-resolution: 2dppx`
- Use lowercase hex colors (#ed8b00 not #ED8B00)
- Ensure proper CSS selector syntax (no comma before @media)
- Biome schema version must match CI runner (currently 2.3.11)
- `noUnknownMediaFeatureName` and `noUnknownAtRules` are off in biome.json for PostCSS @custom-media support
- Run `bun run format` before committing to avoid formatting drift

## Dark Mode Implementation

### Toggle System
- Button: Top-right 48px circular (sun/moon icons)
- Shortcut: ⌘+Shift+D (Mac) or Ctrl+Shift+D (PC)
- Storage: `localStorage['amphibious-theme']`
- Attribute: `<html data-theme="light|dark">`

### CSS Architecture
```css
/* Default light mode */
:root:not([data-theme="dark"]) { }

/* System preference dark */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { }
}

/* User selected dark */
[data-theme="dark"] { }
```

## Testing Strategy

### Setup
- Test runner: Bun with happy-dom
- Setup file: `test/setup.ts` (DOM globals, scroll mocks, getBoundingClientRect)
- Pattern: `test/*.test.ts` files
- Run: `bun test` (484 tests, 993 assertions across 18 files)
- Note: Bun 1.2.11 may segfault when running all files via glob — specify files individually if needed

### Test Files (18 total)
| File | Module | Tests |
|------|--------|-------|
| `components.test.ts` | CSS inventory + DOM structure | 58 |
| `modal.test.ts` | Modal lifecycle, ARIA, focus trapping, ModalManager | 44 |
| `tooltip.test.ts` | Tooltip triggers, positioning, keyboard, EcommerceTooltips | 42 |
| `forms.test.ts` | Validation, ARIA, character counters | 29 |
| `carousel.test.ts` | DOM scaffolding, Splide mock, data attributes | 24 |
| `tabs.test.ts` | Tab switching, keyboard nav, ARIA | 20 |
| `theme-cascade.test.ts` | Theme layer precedence | 16 |
| `smooth-scroll.test.ts` | Anchor scrolling, hash nav | 15 |
| `navigation.test.ts` | Mobile menu, dropdowns | 9 |
| `cascade.test.ts` | CSS @layer ordering | 7 |
| `accordion.test.ts` | Accordion panels | ~20 |
| `dropdown.test.ts` | Dropdown menus | ~20 |
| `toast.test.ts` | Toast notifications | ~20 |
| `color-picker.test.ts` | Color picker component | ~20 |
| `datepicker.test.ts` | Date picker component | ~20 |
| `data-table.test.ts` | Data tables | ~20 |
| `file-upload.test.ts` | File upload | ~20 |
| `search-bar.test.ts` | Search with suggestions | ~20 |

## Component Development

### Creating Components
1. Follow Atomic Design hierarchy
2. Use CSS custom properties for theming
3. Include ARIA attributes for accessibility
4. Support keyboard navigation
5. Test in both light/dark modes

### Naming Conventions
- CSS classes: `.aiab-component-name`, `.component-part` (internal parts don't need prefix)
- CSS files: `atoms/component.css`
- TypeScript: `src/js/component.ts`
- Tests: `test/component.test.ts`

## Important Files

### Entry Points
- `src/index.ts` - Main library entry
- `src/css/main.css` - CSS imports orchestration
- `docs/index.html` - Documentation homepage

### Configuration
- `biome.json` - Linting and formatting rules
- `tsconfig.json` - TypeScript configuration
- `.github/workflows/ci.yml` - CI/CD pipeline

### Scripts
- `scripts/build-site.js` - Documentation builder
- `scripts/fix-*.ts` - Various fix utilities

## NPM Package

### Publishing (when ready)
```json
{
  "name": "@agency-in-a-box/amphibious",
  "version": "2.0.0",
  "exports": {
    ".": "./dist/amphibious.js",
    "./css": "./dist/amphibious.css",
    "./theme": "./dist/theme.css"
  }
}
```

## Knowledge Base

Extended documentation available at:
`/Users/clivemoore/Documents/dockets/claude-project-knowledge-system/amphibious_knowledge/`

## Current Focus Areas

1. NPM package publication preparation
2. Public open-source release readiness
3. Community contribution readiness and marketing
4. Remaining low-priority technical debt (@layer architecture)

## Known Issues

- **Grid file naming**: Grid CSS lives in `grid-modern.css` (not `grid.css`), navigation in `navigation-unified.css` (not `organisms/navigation.css`)
- **Bun 1.2.11 segfault**: `bun test` (glob mode) may segfault with many files — run test files individually as workaround
- **Non-standard breakpoints**: 2 files use `576px` (buttons.css, modal.css) — marked with TODO comments, not part of @custom-media tokens