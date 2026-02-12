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
├── tokens/              # Design tokens (colors, spacing, typography)
├── atoms/               # Basic elements (buttons, badges, icons)
├── molecules/           # Simple combinations (alerts, tooltips)
├── organisms/           # Complex components (cards, modals, forms)
├── pages/              # Page-specific fixes and overrides
└── main.css            # Entry point with @import ordering
```

### Component System
- **Grid**: 16-column flexbox system with `.col-N` classes
- **Responsive**: Mobile-first with tablet/desktop breakpoints
- **Dark Mode**: CSS custom properties with localStorage persistence
- **Icons**: Lucide icons via CDN with `data-lucide` attributes

### JavaScript Modules
```
src/js/
├── navigation.ts       # Mobile nav and dropdowns
├── modal.ts           # Modal dialogs
├── tabs.ts            # Tab components
├── carousel.ts        # Splide.js wrapper
├── smooth-scroll.ts   # Anchor scrolling
└── forms.ts          # Form validation and file uploads
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
- Setup file: `test/setup.ts` (DOM globals)
- Pattern: `*.test.ts` files

### Key Test Areas
- Component mounting and interactions
- Navigation mobile/desktop behavior
- Form validation and file uploads
- Smooth scroll calculations
- Theme cascade and inheritance

## Component Development

### Creating Components
1. Follow Atomic Design hierarchy
2. Use CSS custom properties for theming
3. Include ARIA attributes for accessibility
4. Support keyboard navigation
5. Test in both light/dark modes

### Naming Conventions
- CSS classes: `.component-name`, `.component-part`
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

1. Navigation and grid system verification
2. Documentation consistency across pages
3. Dark mode toggle deployment to all docs
4. NPM package publication preparation
5. Public open-source release readiness