# Changelog

All notable changes to Amphibious will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **Primary orange is WCAG AA**: `--color-primary` is now `#a65e00` (4.97:1 with white text, 4.72:1 as text on `#f8f9fa`), with darker hover/active shades. The logo orange stays available as `--color-brand` (`#ec8b00`) for decoration only; it is 2.5:1 with white, so never use it for text or behind text
- `--color-success` is `#1e7e34` in light mode (5.1:1 with white); `--color-secondary` and light-mode `--color-text-secondary` are `#5f6a72` (5.25:1 on `#f8f9fa`)

### Added

- `--color-on-primary`: text and icon colour on a primary background. White in light mode, near-black in dark mode, where the bright orange is only 2.2:1 with white. Buttons, badges, timeline, footer, form-builder and colour-picker controls use it

### Fixed

- **FileUploadEnhanced `resumable: true` did nothing**: progress was never saved and the load step was a stub. Progress is now saved after each chunk; re-adding the same file (matched by name, size and type) reuses its upload id and skips finished chunks; finished or removed uploads are forgotten. Saved data from `localStorage` is validated before use
- **Dark mode on the docs site**: page stylesheets hard-coded light backgrounds and dark text, so dark mode showed white text on white cards on about 30 pages. They now use the theme tokens (`--color-surface*`, `--color-text*`)
- Doc header breadcrumbs were orange on orange; code inside dark code blocks used the inline-code pink (2.9:1); apple-redesign syntax colours on the dark code block
- Solid alerts: success and warning use dark text (white was 1.9–2.3:1), error uses a deeper red; dark-mode links no longer override button and nav colours; nav text set explicitly in dark mode
- **Landmarks**: 24 pages had no `<main>`; their content is now wrapped in `<main id="main-content">` (the skip-link target, moved off headings). Demo layouts no longer nest a second `<main>`; pages without an `<h1>` get a screen-reader-only one; duplicate `footer-include` ids removed. A browser test requires one `<main>` per page holding `#main-content`
- axe colour-contrast failures across the site: light mode 1181 to 262 nodes, dark mode 2539 to 530

## [2.2.0] - 2026-11-25

Live-site QA remediation, accessibility and a colour-picker security fix. The deployed documentation site had missing CSS, scripts the browser refused to run, icons rendering as boxes, dark-mode styles leaking into light pages, dead links on every page, and horizontal scrolling on phones. The deployed documentation site had missing CSS, scripts the browser refused to run, icons rendering as boxes, dark-mode styles leaking into light pages, dead links on every page, and horizontal scrolling on phones. The causes are fixed and CI now fails if they come back.

### Added

- **Real site build**: `bun run build:site` is a Vite multi-page build (`vite.config.docs.js`) over every page, output to `dist-site/` with the same URLs. It replaces the old copy-and-regex script, which shipped raw `.ts` files and missed hyphenated imports
- **Site QA gate** (`bun run qa:site`, `scripts/qa-site.ts`): crawls the built site and fails on broken CSS/JS/imports/images, unresolved links and fragments, unknown icons, raw `@media (--*)`, `.ts` files and leaked files. Intentional exceptions live in `scripts/qa-site.allowlist.json`. Netlify runs `qa:site:offline` on every deploy
- **Browser tests** (`bun run test:e2e`, Playwright): every published page loads with no page errors, console errors or failed requests and fits a 375px screen, plus checks for the 404, mobile menu, dropdowns and sidebar. Runs in CI and gates the deploy preview
- **`amp` global API** (`src/amp.ts`, `window.amp`): `createModal`, `createTooltip`, `createNavigation`, `createCart`, `createButton`, `refreshIcons` and more, which the docs and 15 example pages already called but nothing defined
- **`Sidebar` and `Steps` components** with tests, matching the existing sidebar and steps CSS
- **Navigation options**: `Navigation` takes `(element?, options?)` with `breakpoint`, `sticky`, `highlightCurrent`, `currentPath`, `toggle` and `onToggle`; `Navigation.create()` replaces an existing instance instead of doubling handlers; tap-to-expand on touch devices; flyouts flip only when they would overflow
- **Build-time icons**: the icon set is generated from `lucide-static` (`scripts/generate-icons.js`); an unknown icon name fails the build. Adds `iconMarkup()` and `registerIcons()`, and maps `icon--*` modifier classes to `aiab-icon--*`
- **Single-source navigation**: `includes/navigation.html` is injected at build time, replacing 57 copy-pasted nav blocks
- **Custom 404 page** with a "Report a broken link" link, and 301 redirects from the removed `shopping-cart-modern` page
- **`.aiab-table-wrapper`** scroll container for wide tables
- **SEO and site metadata** (`scripts/vite-plugin-seo.js`): canonical and Open Graph tags on every page, `sitemap.xml`, `robots.txt`, and a `%APP_VERSION%` placeholder so the homepage always shows the package version
- **Security headers** on the docs site: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`; the `netlify.app` address redirects to the custom domain
- `Icon.createButton()` accepts a `label` option for the accessible name

### Fixed

- **Accessibility** (axe critical rules now clean on every page): icon-only buttons, color swatches, range-slider handles, inputs and selects have accessible names; `Icon.createButton()` names its button; the rating component has `role="img"`; tab lists no longer break `tablist` structure; an invalid `aria` attribute on the validation demo
- **Security: ColorPicker** rendered preset and stored recent colors into swatch HTML unescaped, so a crafted value could add attributes or CSS declarations. Swatch colors are now validated against a strict, non-backtracking grammar (`#hex`, `rgb()/hsl()` with numeric arguments, or a keyword) and anything else is dropped
- **Dark mode leaking into light pages**: rules in `prefers-color-scheme: dark` now defer to `data-theme="light"` and honour an explicit `data-theme="dark"` on a light OS (PostCSS `postcss-theme-scope`, no added specificity). Read-only styling uses `[readonly]`, which no longer dashes every checkbox
- **Bare `<button>` styled as an orange primary button** and home hero CTA styles restyling every `.aiab-btn-primary`
- **`@media (--bp-*)` served raw** in page stylesheets, so mobile layouts never applied on 24 stylesheets
- **Icons**: 143 icons rendering as a box on 13 pages, corrupted `aiab-` icon names, an unpinned CDN script on the homepage, and `getting-started` loading no icon code
- **Demo pages that threw on load**: accordion, advanced components, form builder, carousel, dark mode, sidebar, steps, navigation showcase and tooltip demos
- **Navigation**: every `#` link marked as the current page, dropdowns clipped by their container, doubled arrows, stray list bullets, flyouts opening the wrong way, hover flicker, and nav anchors that pointed at IDs that did not exist
- **Broken links**: dead internal links, placeholder GitHub URLs and dead social links replaced with the real repository
- **Horizontal scrolling at 375px** on 24 pages: layouts that stretched around wide content, `minmax(300px+, 1fr)` grids, unwrapped tables and flex rows, a color picker positioned off-screen, and a static sidebar that pushed the page wider
- **Skip link** target (`#main-content`) missing on 20 pages
- **Theme flash**: the saved theme is applied before first paint on every page
- **Demo pages**: `apple-redesign` classes did not match its stylesheet; the grid examples hid their sidebar and showed near-invisible code

### Changed

- Navigation docs and demos rewritten for the element + options API; component pages link to demos that exist
- `Icon` helper classes carry the `aiab-` prefix
- Docs layouts use the `--bp-md-down` token instead of `768px`

### Removed

- **Legacy 2013 pages** (`pea.rs`, classic and green themes, `docs/tests/fluid`) moved to `_archive/` folders and no longer published; they depended on `a.mphibio.us` assets that no longer exist
- **Seven developer debug/test pages** under `demos/` moved to `demos/_archive/`
- `AmphibiousNavigation`, `src/js/index.ts`, `scripts/build-site.js`, and 10 tracked backup / `-broken` files
- Unpublishable files (internal notes, backups, `.md`, `.ts`) no longer ship
- `docs/navigation-include.html`: the navigation fragment was being published as a page

## [2.1.0] - 2026-03-29

Audit remediation release.

### Fixed

- XSS in `Modal.alert/confirm`, carousel custom icons and `EcommerceTooltips`; injection points documented with `@security` JSDoc
- Dark-mode qualifier bugs in `pears.css` and `file-card.css`; `prefers-color-scheme` rules no longer override an explicit light theme
- Datepicker previous-month navigation day overflow
- Toast: global Escape key dismisses

### Changed

- Hard-coded colors replaced with design tokens (adoption from 59% to over 80%)
- CSS nesting adopted across atoms, molecules and organisms; dark-mode support added to the remaining components
- Example images converted to WebP

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
