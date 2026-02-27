# Changelog

All notable changes to Amphibious will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.3] - 2026-02-27

### Added

- **@custom-media breakpoint tokens**: Single source of truth for all responsive breakpoints in `src/css/tokens/breakpoints.css` — 7 tokens (`--bp-xs-down` through `--bp-md-only`) compiled by PostCSS at build time
- **Navigation scroll state**: Header gains white background and shadow when scrolled past hero section, using rAF-throttled scroll listener with dark mode support

### Fixed

- **Tooltip position class bug**: `updatePosition()` no longer wipes variant/size classes when adjusting position — only position classes are replaced
- **43 broken navigation links**: Fixed cross-page nav references and surfaced orphaned example pages
- **Full-bleed header on inner pages**: Restructured HTML on docs/features, docs/form, and docs/function so header wraps container (not vice versa)
- **Logo invisible on scroll**: Added `.is-scrolled` CSS state to prevent orange logo on orange background
- **Broken slideshow controls**: Fixed class name mismatch (`'active'` to `'aiab-active'`) in inline JS
- **Blockquote white background in header**: Removed opaque background from blockquotes inside `.aiab-docs-header` so text is white on the orange gradient
- **CI pipeline**: Fixed pre-existing failures — aligned Biome schema version (2.3.11), auto-formatted drifted files
- **Netlify deployment**: Rewrite Vite dev imports to production paths in build-site.js

### Changed

- **Breakpoint consistency**: Standardized `767px` to `768px` (4 files) and `479px` to `480px` (1 file) during @custom-media migration
- **Biome config**: Suppressed `noUnknownMediaFeatureName` and `noUnknownAtRules` for PostCSS @custom-media support

## [2.0.2] - 2026-02-26

### Added

- **Published to npm**: Package now available as `@agency-in-a-box/amphibious` on the npm registry

### Fixed

- **CI pipeline**: Specified test files explicitly in GitHub Actions to work around Bun glob-mode crash
- **Tooltip `removeChild` error**: Added `parentNode` guard to prevent unhandled errors when DOM is cleared during cleanup

### Changed

- **Slimmed npm package**: Removed legacy assets (icomoon fonts, jQuery UI images, Illustrator files) — package size reduced from 2.5 MB to 363 KB
- **Tightened `files` field**: npm package now includes only dist bundles, type declarations, and source CSS/JS/TS
- **Repository URL**: Updated `package.json` to point to actual GitHub repository

## [2.0.1] - 2026-02-25

### Added

- **Test coverage expansion**: 482 tests across 18 files (up from 210 across 10), covering Accordion, Dropdown, Toast, Datepicker, Data Table, Range Slider, Search Bar, and File Upload
- **JSDoc documentation**: Comprehensive API docs on all 9 TypeScript modules — classes, interfaces, public methods, `@param`/`@returns`/`@throws`/`@fires`/`@example` tags
- **Browser targets**: `.browserslistrc` with modern ES2020+ targets
- **Skip-navigation links**: Accessible skip-to-content pattern across documentation and example pages
- **`prefers-reduced-motion` support**: JS components (Modal, Tooltip, Carousel, Smooth Scroll, Toast) respect the user's motion preference

### Fixed

- **WCAG AA contrast**: Added `--color-primary-text` token (`#a65e00`, 7.6:1 ratio) and `contrast-fixes.css` for text on white backgrounds
- **Memory leaks**: Added `AbortController`-based cleanup to Navigation, consolidated `removeEventListener` patterns, fixed detached DOM references in Tooltip and Modal
- **BEM namespace consistency**: Fixed unprefixed `modal__*` and `sidebar__*` classes in 5 HTML files to use `aiab-modal__*` and `aiab-sidebar__*`
- **Carousel keyboard accessibility**: Added arrow key navigation and proper ARIA attributes
- **HTML accessibility**: Lang attributes, meta descriptions, and heading hierarchy across docs/examples pages
- **Deprecated API removal**: Replaced `.substr()` with `.substring()` in 7 files, removed `-webkit-overflow-scrolling: touch` from 3 CSS locations

### Changed

- **Shared utilities**: Extracted `escapeHTML()` into `src/utils/sanitize.ts`, removed 6 duplicate inline implementations
- **Removed duplicate modules**: Consolidated `dropdown.js`/`dropdown-enhanced.js` and `file-upload.js`/`file-upload-enhanced.js`
- **TypeScript target**: Updated from ES2015 to ES2020 to match browserslist
- **Dependencies**: Removed unused `@fullhuman/postcss-purgecss` and `autoprefixer` devDependencies

### Security

- Resolved 3 npm audit vulnerabilities (rollup, nanoid, vite)
- Disabled source maps in production build
- Removed `console.log` debug statements from production code

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
- **Test suite**: Tests with happy-dom covering Modal, Tooltip, Forms, Carousel, Tabs, Navigation, Smooth Scroll, Theme Cascade, and CSS architecture

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
