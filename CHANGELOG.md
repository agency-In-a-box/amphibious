# Changelog

All notable changes to Amphibious will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-02-25

### Added

- **Namespace isolation**: All CSS classes now use `.aiab-` prefix (e.g., `.aiab-container`, `.aiab-btn`, `.aiab-col-N`) to prevent conflicts with agency frameworks like Bootstrap and Tailwind
- **16-column flexbox grid** with responsive breakpoints, golden ratio columns, and source ordering
- **TypeScript component library**: Modal, Tooltip, Carousel (Splide.js), Tabs, Navigation, Forms, Smooth Scroll
- **Standalone JS components**: Accordion, Dropdown, Toast, Color Picker, Datepicker, Data Table, File Upload, Search Bar, Range Slider, Timeline, Form Builder
- **Design token system** with CSS custom properties for colors, spacing, typography, shadows, and transitions
- **Dark mode** with `data-theme` attribute, localStorage persistence, keyboard shortcut (Cmd/Ctrl+Shift+D), and system preference detection
- **Accessibility**: Skip-navigation links, ARIA attributes across all components, keyboard navigation for carousel/tabs/modal/navigation, focus trapping, `prefers-reduced-motion` support in JS animations
- **WCAG AA contrast compliance**: `--color-primary-text` token (`#a65e00`, 7.6:1 ratio) for text on white backgrounds, with comprehensive contrast-fixes.css
- **Security**: XSS prevention via shared `escapeHTML`/`sanitizeHTML` utilities (DOMPurify-based), safe innerHTML helpers
- **E-commerce utilities**: Product info tooltips, shipping info tooltips, stock status indicators
- **Atomic Design CSS architecture**: Tokens, Atoms, Molecules, Organisms, Pages layers
- **Multiple Vite build configs**: Library (ES/UMD), Application dev server, Documentation site
- **CI/CD pipeline**: Lint, typecheck, test, build, security scan via GitHub Actions
- **Test suite**: 210+ tests with happy-dom covering Modal, Tooltip, Forms, Carousel, Tabs, Navigation, Smooth Scroll, Theme Cascade, and CSS architecture

### Changed

- **Complete rewrite** from the original A.mphibio.us responsive framework
- **Build system**: Migrated from Grunt/Sass to Vite 6 with native CSS custom properties
- **Grid system**: Replaced percentage-based 12-column grid with 16-column flexbox grid aligned to 4px baseline
- **Typography**: Avenir Next font hierarchy with system font fallbacks
- **Color system**: Consolidated to CSS custom properties with automatic dark mode support

### Breaking Changes

- All CSS classes require `.aiab-` prefix (`.container` is now `.aiab-container`)
- 12-column grid classes replaced with 16-column equivalents (`.col-6` is now `.aiab-col-8`)
- Sass variables replaced with CSS custom properties
- jQuery dependency removed; all components are vanilla JS/TS
- Build output changed from concatenated CSS to Vite library bundles

## [1.x] - Legacy

The original A.mphibio.us responsive CSS framework. No longer maintained. See the [2.0 migration guide](docs/getting-started.html) for upgrade instructions.
