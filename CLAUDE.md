# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Amphibious module in the AIAB repository.

## Project Overview

**Amphibious 2.0** is a modern CSS framework and component library within the AIAB monorepo. It's a complete rebuild of [A.mphibio.us](http://a.mphibio.us) (circa 2015), modernizing the build system, implementing Atomic Design principles, and establishing a production-ready component ecosystem.

**Root directory**: `/Users/clivemoore/Documents/GitHub/AIAB/amphibious`

**Original source**: `/Users/clivemoore/Documents/GitHub/A.mphibio.us` (legacy Grunt-based version)

## Current Status: 95% Complete - QA Phase

✅ **Core Framework**: Modern build system (Vite 6) with TypeScript and Biome  
✅ **Grid System**: 16-column responsive grid with modern flexbox implementation  
✅ **Image System**: All broken links replaced with brand-consistent placeholders  
✅ **Performance**: Lazy loading enabled, optimized build pipeline  
✅ **Atomic Design**: Complete implementation with tokens, atoms, molecules, organisms  
✅ **Components**: 25+ production-ready UI components with comprehensive examples  
✅ **Theming**: CSS custom properties system with dark mode foundation  
🔍 **QA Phase**: Navigation testing, cross-browser validation, pre-launch preparation

**Quick Start**: `bun install && bun run dev` → http://localhost:2960

## Development Commands

### Primary Commands
```bash
bun install              # Install dependencies
bun run dev             # Start Vite dev server (port 2960)
bun run build           # Build for production
bun run preview         # Preview production build (port 2961)
bun run lint            # Lint with Biome
bun run lint:fix        # Auto-fix linting issues
bun run format          # Format code with Biome
bun run typecheck       # TypeScript type checking
bun run clean           # Remove dist/ directory
```

### Fix Commands
```bash
bun run fix:grid        # Fix broken grid system with modern flexbox
bun run fix:images      # Replace broken image links with placeholders
```

### Quick Development
```bash
cd /Users/clivemoore/Documents/GitHub/AIAB/amphibious
bun install
bun run dev
# Visit http://localhost:2960 or http://192.168.0.16:2960
```

### Local Hostname Setup (Optional)
```bash
# Add custom hostname (requires password)
echo "127.0.0.1 amphibious.local" | sudo tee -a /etc/hosts
# Then access at http://amphibious.local:2960
```

## Automation Scripts

Amphibious 2.0 includes automated scripts for common migration and maintenance tasks:

### Available Scripts
```bash
bun run fix:grid        # Modernize grid system (float → flexbox)
bun run fix:images      # Replace broken images with placeholders
```

### Script Features
- ✅ **Automatic Backups**: All scripts create timestamped backups before modifications
- ✅ **Comprehensive Logging**: Detailed audit trails for all changes
- ✅ **Brand Consistency**: Uses official Amphibious color palette
- ✅ **Performance Optimization**: Adds modern optimizations (lazy loading, etc.)
- ✅ **Backward Compatibility**: Maintains existing class names and structure

### Documentation
- **[GRID-FIX-GUIDE.md](GRID-FIX-GUIDE.md)** - Grid system analysis and solutions
- **[IMAGE-REPLACEMENT-SUMMARY.md](IMAGE-REPLACEMENT-SUMMARY.md)** - Complete image replacement results
- **[CLAUDE-CODE-IMAGE-INSTRUCTIONS.md](CLAUDE-CODE-IMAGE-INSTRUCTIONS.md)** - Image workflow instructions

## Architecture Overview

### Modern Stack
- **Build Tool**: Vite 6 (replaced Grunt 0.4.5)
- **Runtime**: Bun (compatible with Node.js)
- **Linting**: Biome (replaced JSHint)
- **Styling**: CSS with CSS Variables (Sass optional for themes)
- **Types**: TypeScript for JS functionality
- **Module System**: ESM (ES Modules)
- **Design System**: Atomic Design methodology

### File Structure - Atomic Design Organization
```
amphibious/
├── src/
│   ├── css/
│   │   ├── tokens/
│   │   │   └── design-tokens.css    # Subatomic foundation (colors, spacing, etc.)
│   │   ├── atoms/                   # Basic building blocks
│   │   │   ├── badges.css           # Status indicators
│   │   │   ├── buttons.css          # Button system
│   │   │   ├── icons.css            # Icon system
│   │   │   ├── spinners.css         # Loading indicators
│   │   │   └── icon-buttons.css     # Icon-only buttons
│   │   ├── molecules/               # Simple component combinations
│   │   │   ├── alerts.css           # System notifications
│   │   │   ├── progress.css         # Progress indicators
│   │   │   ├── tags.css             # Removable labels/chips
│   │   │   ├── tooltip.css          # Contextual help
│   │   │   └── pears.css            # Content patterns (stats, slats)
│   │   ├── organisms/               # Complex UI sections
│   │   │   ├── cards.css            # Card components
│   │   │   ├── navigation.css       # Navigation patterns
│   │   │   ├── breadcrumbs.css      # Breadcrumb trails
│   │   │   ├── tabs.css             # Tabbed interfaces
│   │   │   ├── pagination.css       # Page navigation
│   │   │   ├── steps.css            # Multi-step processes
│   │   │   ├── sidebar.css          # Sidebar layouts
│   │   │   ├── footer.css           # Footer sections
│   │   │   ├── carousel.css         # Image/content carousels (Splide.js)
│   │   │   ├── forms.css            # Form layouts
│   │   │   ├── modals.css           # Modal dialogs
│   │   │   └── tables.css           # Table components
│   │   ├── normalize.css            # CSS reset
│   │   ├── variables.css            # Legacy CSS custom properties
│   │   ├── typography.css           # Text styles
│   │   ├── grid.css                 # 16-column grid system
│   │   ├── grid-responsive.css      # Responsive breakpoints
│   │   ├── helpers.css              # Utility classes
│   │   ├── print.css                # Print styles
│   │   ├── main.css                 # Classic entry point
│   │   └── main-atomic.css          # Atomic Design entry point
│   ├── js/                          # JavaScript plugins
│   └── index.ts                     # Main TypeScript entry
├── scripts/                         # Automation scripts
│   ├── fix-grid.ts                  # Grid system modernization
│   └── update-image-placeholders.ts # Image placeholder replacement
├── scss/                            # Sass theme system (optional)
├── examples/                        # Live usage examples
│   └── atomic-design-demo.html      # Complete atomic showcase
├── docs/                            # Component documentation
├── public/                          # Static assets
├── dist/                            # Built output (gitignored)
├── index.html                       # Development preview page
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript config
├── biome.json                       # Biome linting/formatting
└── package.json                     # Dependencies & scripts
```

### Build Process

**Development**: Vite serves files with HMR (Hot Module Replacement)
- CSS changes = instant update
- TypeScript changes = fast rebuild
- No manual concatenation needed

**Production**: Vite bundles everything
- Entry: `src/index.ts` → `dist/amphibious.js`
- Styles: `src/css/main.css` or `src/css/main-atomic.css` → `dist/amphibious.css`
- Minification: Automatic via esbuild
- Source maps: Generated for debugging

## Design System - Atomic Design

Amphibious 2.0 implements Brad Frost's Atomic Design methodology for systematic, scalable component architecture.

### Design Tokens (Subatomic)
**Location**: `src/css/tokens/design-tokens.css`

Foundation for the entire design system:
- **Colors**: Primary, secondary, semantic (success, warning, error, info)
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Consistent scale (4px base)
- **Shadows**: Elevation system
- **Borders**: Radius, widths
- **Transitions**: Duration, timing functions
- **Dark Mode**: CSS variable switching for theme support

### Atoms (5 Components)
**Location**: `src/css/atoms/`

Basic building blocks that can't be broken down further:
- **badges.css** - Status indicators (primary, success, warning, error, info)
- **buttons.css** - Complete button system with states and variants
- **icons.css** - Icon system integration
- **spinners.css** - Loading indicators (small, medium, large)
- **icon-buttons.css** - Icon-only interactive buttons

### Molecules (5 Components)
**Location**: `src/css/molecules/`

Simple combinations of atoms:
- **alerts.css** - System notifications with semantic colors
- **progress.css** - Progress bars, circular progress, step indicators
- **tags.css** - Removable chips/labels for filters and categories
- **tooltip.css** - Contextual help overlays
- **pears.css** - Content patterns (stats, slats, feature lists)

### Organisms (12+ Components)
**Location**: `src/css/organisms/`

Complex UI sections combining molecules and atoms:
- **cards.css** - Card layouts with headers, footers, images
- **navigation.css** - Nav bars, menus, mobile patterns
- **breadcrumbs.css** - Hierarchical navigation trails
- **tabs.css** - Tabbed interface patterns
- **pagination.css** - Page navigation controls
- **steps.css** - Multi-step process indicators
- **sidebar.css** - Sidebar navigation layouts
- **footer.css** - Footer sections and patterns
- **carousel.css** - Image/content carousels (uses Splide.js)
- **forms.css** - Form layouts and input groups
- **modals.css** - Modal dialog patterns
- **tables.css** - Responsive table components

### Using Atomic Design

Two entry points available:

**Classic** (`main.css`):
```css
@import 'normalize.css';
@import 'variables.css';
@import 'typography.css';
/* ... traditional organization */
```

**Atomic** (`main-atomic.css`):
```css
@import 'tokens/design-tokens.css';
@import 'atoms/buttons.css';
@import 'molecules/alerts.css';
@import 'organisms/cards.css';
/* ... atomic organization */
```

## Grid System

### 16-Column Grid
Based on 960 Grid System principles:
- Container: 960px fixed or 96% fluid
- 16 equal columns with gutters
- Columns: `.col-1` through `.col-16`
- Math: Each column = 6.25% of container
- Modern flexbox implementation (no floats)

### Usage
```html
<div class="container">
  <div class="row">
    <div class="col-8">Half width (8/16 = 50%)</div>
    <div class="col-8">Half width</div>
  </div>
</div>
```

### Responsive Classes
- Desktop: `.col-*` (default)
- Tablet: `.col-tablet-*` (≤768px)
- Mobile: `.col-mobile-*` (≤480px)

## Component System

### Design Principles
- **Atomic Design**: Systematic component hierarchy
- **BEM Methodology**: Block Element Modifier naming
- **Mobile-First**: Base styles for small screens, enhance up
- **Accessibility**: ARIA attributes, keyboard navigation, focus states
- **Modular**: Each component in separate file
- **CSS Variables**: Easy theming without Sass
- **Dark Mode Ready**: Variable switching for theme support

### Complete Component Inventory (25+)

**✅ Atoms (5)**:
- Badges
- Buttons
- Icons
- Spinners
- Icon Buttons

**✅ Molecules (5)**:
- Alerts
- Progress Indicators
- Tags/Chips
- Tooltips
- Content Patterns (Pears)

**✅ Organisms (12+)**:
- Cards
- Navigation
- Breadcrumbs
- Tabs
- Pagination
- Steps
- Sidebar
- Footer
- Carousel (Splide.js)
- Forms
- Modals
- Tables

**✅ Foundation**:
- Design Tokens
- Grid System (16-column flexbox)
- Typography System
- Utility Classes
- Normalize/Reset

## Theming System

### Current Implementation (6/10 Ease of Use)

**What Works**:
- ✅ Design tokens in `tokens/design-tokens.css`
- ✅ CSS custom properties throughout
- ✅ Dark mode foundation
- ✅ Color system with semantic variants
- ✅ Component-level customization possible

**What Needs Improvement**:
- ⚠️ Missing theme compilation documentation
- ⚠️ No example themes provided
- ⚠️ Vite configuration for theme builds not documented
- ⚠️ Theme creation workflow unclear

### Future Theming Enhancements
- [ ] Comprehensive theme documentation
- [ ] Multiple example themes (light, dark, high-contrast)
- [ ] Vite configuration guide for custom themes
- [ ] Theme starter template
- [ ] Theme switching demo

## Development Best Practices

### When Editing CSS
1. **Edit source files** in `src/css/`, never in `dist/`
2. **Use design tokens** from `tokens/design-tokens.css` for consistency
3. **Follow Atomic Design**: Put components in appropriate hierarchy
4. **Follow BEM naming**: `.block__element--modifier`
5. **Mobile-first**: Base styles, then `@media (min-width: ...)`
6. **Test responsive**: Check all three breakpoints
7. **Use CSS variables**: Leverage theming system

### When Editing TypeScript
1. **Type everything**: No `any` types
2. **Use modern ES6+**: Classes, arrow functions, async/await
3. **Namespace**: Keep utilities under `amp` namespace
4. **Document**: JSDoc comments for public APIs

### Adding New Components

**Atoms**:
1. Create file: `src/css/atoms/[name].css`
2. Add import: In `src/css/main-atomic.css` under atoms section
3. Use design tokens for consistency

**Molecules**:
1. Create file: `src/css/molecules/[name].css`
2. Combine existing atoms
3. Add import: In `src/css/main-atomic.css` under molecules section

**Organisms**:
1. Create file: `src/css/organisms/[name].css`
2. Combine molecules and atoms
3. Add import: In `src/css/main-atomic.css` under organisms section
4. Create example: In `examples/[name].html`
5. Document: In `docs/[name].md`

## Key Differences from Legacy Version

### No More Grunt
- ❌ No gruntfile.js
- ❌ No manual task configuration
- ✅ Vite handles everything automatically

### Modern JavaScript
- ❌ No jQuery dependency
- ❌ No old plugin files (except Splide.js for carousel)
- ✅ Native ES6+ modules
- ✅ TypeScript for safety

### CSS Approach
- ❌ No manual concatenation
- ❌ No separate minification step
- ❌ No float-based grid
- ✅ ES6 imports (`@import`)
- ✅ CSS variables for theming
- ✅ Atomic Design organization
- ✅ Modern flexbox grid
- ✅ Automatic processing

### Build Output
- Old: `css/a.mphibio.us.min.css` + `js/a.mphibio.us.js`
- New: `dist/amphibious.css` + `dist/amphibious.js`

## Integration with AIAB

### As AIAB Module
Amphibious follows AIAB monorepo patterns:
- ✅ Bun as runtime
- ✅ Biome for linting
- ✅ TypeScript configuration
- ✅ Consistent npm scripts
- ✅ Shared tooling approach

### Usage in Other Modules
```typescript
// In other AIAB modules:
import '@agency-in-a-box/amphibious';
import '@agency-in-a-box/amphibious/css';
```

### Publishing
Preparing for NPM publication:
```bash
bun run build
npm publish
```

## Known Issues & Fixes

### ✅ Grid System (RESOLVED)
**Status**: Successfully migrated from float-based to modern flexbox implementation.

See **[GRID-FIX-GUIDE.md](GRID-FIX-GUIDE.md)** for:
- Analysis of original float-based issues
- Modern flexbox solution implemented
- Testing checklist

### ✅ Image Links (RESOLVED)
**Status**: All broken image references have been systematically replaced with modern placeholders.

**Quick Fix**: Use `bun run fix:images` to run the automated replacement script.

**What was Fixed**:
- ✅ 70 broken/outdated image references updated
- ✅ Modern placeholder services (placehold.co, picsum.photos)
- ✅ Brand-consistent colors across all placeholders
- ✅ Performance optimization with lazy loading (171 images)
- ✅ Complete backup and audit trail

**Documentation**:
- **[IMAGE-REPLACEMENT-SUMMARY.md](IMAGE-REPLACEMENT-SUMMARY.md)** - Complete results and analysis
- **[CLAUDE-CODE-IMAGE-INSTRUCTIONS.md](CLAUDE-CODE-IMAGE-INSTRUCTIONS.md)** - Original workflow instructions
- **`image-replacement-log.txt`** - Detailed change log
- **`scripts/update-image-placeholders.ts`** - Reusable automation script

## Important Notes

### CSS Import Order Matters

**Classic Organization** (`main.css`):
1. Normalize (reset)
2. Variables (theme)
3. Typography (base text)
4. Grid (layout)
5. Components (UI)
6. Helpers (utilities)
7. Print (media query)

**Atomic Organization** (`main-atomic.css`):
1. Design Tokens (subatomic)
2. Atoms (basic elements)
3. Molecules (simple combinations)
4. Organisms (complex sections)
5. Typography (text styles)
6. Grid (layout system)
7. Helpers (utilities)
8. Print (media query)

### Backwards Compatibility
Maintains class names from original A.mphibio.us:
- `.col-*` → Keep
- `.container` → Keep
- Component classes → Keep original names
- Atomic Design adds organization, doesn't break existing code

### Performance
- Vite dev server is instant (HMR)
- Production builds are optimized
- Tree-shaking enabled
- No runtime dependencies (except Splide.js for carousel)
- Pure CSS (no JS required for styles)

## Pre-Launch QA Checklist

### Navigation Testing
- [ ] Desktop navigation fully functional
- [ ] Mobile navigation (hamburger menu) works
- [ ] All nav links accessible
- [ ] Keyboard navigation works
- [ ] Focus states visible

### Grid System Verification
- [ ] No horizontal scrollbar on any page
- [ ] All column widths add up to exactly 100%
- [ ] Consistent 20px gutters between columns
- [ ] Responsive stacking works on mobile (≤480px)
- [ ] Tablet layout correct (≤768px)
- [ ] No console errors related to layout

### Component Functionality
- [ ] All 25+ components render correctly
- [ ] Interactive components work (tabs, modals, etc.)
- [ ] Accessibility features functional (ARIA, keyboard nav)
- [ ] Dark mode switches properly (if implemented)
- [ ] Print styles work

### Cross-Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### Build & Deploy
- [ ] `bun run lint` passes
- [ ] `bun run typecheck` passes
- [ ] `bun run build` succeeds without errors
- [ ] Production build works (`bun run preview`)
- [ ] File sizes reasonable (< 100kb CSS, < 50kb JS)

### Documentation
- [ ] README.md complete
- [ ] Component examples all working
- [ ] API documentation complete
- [ ] Theme creation guide ready
- [ ] NPM package.json ready

## NPM Publication Preparation

### Pre-Publication Checklist
- [ ] Version number set (semantic versioning)
- [ ] package.json metadata complete
- [ ] README.md polished
- [ ] LICENSE file included
- [ ] CHANGELOG.md created
- [ ] .npmignore configured
- [ ] Keywords for discoverability
- [ ] Repository links correct
- [ ] Build artifacts in correct location

### Publication Steps
```bash
# 1. Final build
bun run build

# 2. Version bump
npm version patch|minor|major

# 3. Publish
npm publish

# 4. Create GitHub release
git tag v2.0.0
git push --tags
```

## Future Enhancements

### Immediate (Post-Launch)
- [ ] Attract contributors for QA
- [ ] Gather user feedback
- [ ] Bug fixes from real-world usage
- [ ] Performance monitoring

### Short-Term
- [ ] Improved theming documentation
- [ ] Multiple example themes
- [ ] Theme builder tool
- [ ] Storybook integration
- [ ] Component playground

### Long-Term
- [ ] Component unit tests
- [ ] Automated visual regression testing
- [ ] Accessibility audit & improvements
- [ ] RTL (right-to-left) support
- [ ] Performance benchmarks
- [ ] CDN distribution

## Resources

- **Original**: `/Users/clivemoore/Documents/GitHub/A.mphibio.us`
- **Vite Docs**: https://vite.dev
- **Biome Docs**: https://biomejs.dev
- **CSS Variables**: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
- **BEM Methodology**: http://getbem.com
- **Atomic Design**: https://atomicdesign.bradfrost.com
- **Splide.js**: https://splidejs.com (carousel component)

---

**Status**: 🎯 95% Complete - QA Phase  
**Next Milestone**: NPM Publication & Public Release  
**Focus**: Navigation testing, cross-browser validation, documentation polish
