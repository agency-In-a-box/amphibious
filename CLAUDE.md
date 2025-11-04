# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Amphibious module in the AIAB repository.

## Project Overview

**Amphibious 2.0** is a modern CSS framework and component library within the AIAB monorepo. It's a complete rebuild of [A.mphibio.us](http://a.mphibio.us) (circa 2015), modernizing the build system and tooling while preserving the elegant responsive design patterns.

**Root directory**: `/Users/clivemoore/Documents/GitHub/AIAB/amphibious`

**Original source**: `/Users/clivemoore/Documents/GitHub/A.mphibio.us` (legacy Grunt-based version)

## Current Status

✅ **Core Framework**: Modern build system (Vite 6) with TypeScript and Biome
✅ **Grid System**: 16-column responsive grid with modern flexbox implementation
✅ **Image System**: All broken links replaced with brand-consistent placeholders
✅ **Performance**: Lazy loading enabled, optimized build pipeline
✅ **Components**: 25+ UI components with comprehensive examples
⚠️ **Migration**: Legacy component migration from A.mphibio.us in progress

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

### File Structure
```
amphibious/
├── src/
│   ├── css/
│   │   ├── components/          # Modern component system
│   │   │   ├── cards.css
│   │   │   ├── alerts.css
│   │   │   ├── navigation.css
│   │   │   ├── breadcrumbs.css
│   │   │   ├── tabs.css
│   │   │   ├── pagination.css
│   │   │   ├── steps.css
│   │   │   ├── sidebar.css
│   │   │   ├── input-groups.css
│   │   │   └── responsive-tables.css
│   │   ├── normalize.css        # CSS reset
│   │   ├── variables.css        # CSS custom properties
│   │   ├── typography.css       # Text styles
│   │   ├── grid.css            # 16-column grid system
│   │   ├── grid-responsive.css # Responsive breakpoints
│   │   ├── helpers.css         # Utility classes
│   │   ├── print.css           # Print styles
│   │   └── main.css            # Entry point (imports all)
│   ├── js/                      # JavaScript plugins (to migrate)
│   └── index.ts                # Main TypeScript entry
├── scripts/                     # Automation scripts
│   ├── fix-grid.ts              # Grid system modernization
│   └── update-image-placeholders.ts # Image placeholder replacement
├── scss/                        # Sass theme system (optional)
├── examples/                    # Live usage examples
├── docs/                        # Component documentation
├── public/                      # Static assets
├── dist/                        # Built output (gitignored)
├── index.html                   # Development preview page
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
├── biome.json                  # Biome linting/formatting
└── package.json                # Dependencies & scripts
```

### Build Process

**Development**: Vite serves files with HMR (Hot Module Replacement)
- CSS changes = instant update
- TypeScript changes = fast rebuild
- No manual concatenation needed

**Production**: Vite bundles everything
- Entry: `src/index.ts` → `dist/amphibious.js`
- Styles: `src/css/main.css` → `dist/amphibious.css`
- Minification: Automatic via esbuild
- Source maps: Generated for debugging

## Grid System

### 16-Column Grid
Based on 960 Grid System principles:
- Container: 960px fixed or 96% fluid
- 16 equal columns with gutters
- Columns: `.col-1` through `.col-16`
- Math: Each column = 6.25% of container

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
- **BEM Methodology**: Block Element Modifier naming
- **Mobile-First**: Base styles for small screens, enhance up
- **Accessibility**: ARIA attributes where needed
- **Modular**: Each component in separate file
- **CSS Variables**: Easy theming without Sass

### Component Status
All components marked with `TODO` need migration from original A.mphibio.us:

**Completed (basic placeholders)**:
- ✅ Cards (basic structure)
- ✅ Alerts (basic structure)
- ✅ Grid system (basic structure)

**To Migrate from A.mphibio.us**:
- ⏳ Navigation (from `src/css/components/navigation.css`)
- ⏳ Breadcrumbs (from `src/css/components/breadcrumbs.css`)
- ⏳ Tabs (from `src/css/components/tabs.css`)
- ⏳ Pagination (from `src/css/components/pagination.css`)
- ⏳ Steps (from `src/css/components/steps.css`)
- ⏳ Sidebar (from `src/css/components/sidebar.css`)
- ⏳ Input Groups (from `src/css/components/input-groups.css`)
- ⏳ Responsive Tables (from `src/css/components/responsive-tables.css`)
- ⏳ Full normalize.css
- ⏳ Complete typography system
- ⏳ All helper utilities

## Migration Guide

### From Original A.mphibio.us

**Source Location**: `/Users/clivemoore/Documents/GitHub/A.mphibio.us`

#### To Migrate a Component:

1. **Locate original file**:
   ```bash
   # Original: /Users/clivemoore/Documents/GitHub/A.mphibio.us/src/css/components/[name].css
   # Target: /Users/clivemoore/Documents/GitHub/AIAB/amphibious/src/css/components/[name].css
   ```

2. **Copy and modernize**:
   - Replace old vendor prefixes with modern CSS
   - Convert fixed values to CSS variables where appropriate
   - Ensure mobile-first approach
   - Add comments for complex selectors
   - Test responsive behavior

3. **Update imports**:
   - Ensure component is imported in `src/css/main.css`
   - Check import order (normalize → variables → layout → components → utilities)

4. **Test in dev server**:
   ```bash
   bun run dev
   # View at http://localhost:3000
   ```

### CSS Variable Migration

**Old approach** (Sass variables):
```scss
$primary-color: #0066cc;
```

**New approach** (CSS variables):
```css
:root {
  --color-primary: #0066cc;
}
.button { background: var(--color-primary); }
```

### Grunt → Vite Translation

| Old Grunt Task | New Vite Equivalent |
|---------------|-------------------|
| `grunt watch` | `bun run dev` (automatic) |
| `grunt concat:css` | Automatic via imports |
| `grunt concat:js` | Automatic bundling |
| `grunt cssmin` | `bun run build` (automatic) |
| `grunt uglify` | `bun run build` (automatic) |
| `grunt sass` | Native CSS (or Vite Sass plugin) |

## Development Best Practices

### When Editing CSS
1. **Edit source files** in `src/css/`, never in `dist/`
2. **Use CSS variables** from `variables.css` for theming
3. **Follow BEM naming**: `.block__element--modifier`
4. **Mobile-first**: Base styles, then `@media (min-width: ...)`
5. **Test responsive**: Check all three breakpoints

### When Editing TypeScript
1. **Type everything**: No `any` types
2. **Use modern ES6+**: Classes, arrow functions, async/await
3. **Namespace**: Keep utilities under `amp` namespace
4. **Document**: JSDoc comments for public APIs

### Adding New Components
1. Create file: `src/css/components/[name].css`
2. Add import: In `src/css/main.css`
3. Create example: In `examples/[name].html`
4. Document: In `docs/[name].md`
5. Test: Run `bun run dev` and verify

## Key Differences from Legacy Version

### No More Grunt
- ❌ No gruntfile.js
- ❌ No manual task configuration
- ✅ Vite handles everything automatically

### Modern JavaScript
- ❌ No jQuery dependency
- ❌ No old plugin files
- ✅ Native ES6+ modules
- ✅ TypeScript for safety

### CSS Approach
- ❌ No manual concatenation
- ❌ No separate minification step
- ✅ ES6 imports (`@import`)
- ✅ CSS variables for theming
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
Once stable, can be published to npm:
```bash
bun run build
npm publish
```

## Known Issues & Fixes

### Grid System Issues
The current grid system has several problems with float-based layouts, incorrect width calculations, and responsive behavior. See **[GRID-FIX-GUIDE.md](GRID-FIX-GUIDE.md)** for:
- Detailed analysis of grid issues
- Three solution options (float-based fix, flexbox, CSS grid)
- Recommended modern flexbox implementation
- Step-by-step migration guide
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
Order in `main.css` is critical:
1. Normalize (reset)
2. Variables (theme)
3. Typography (base text)
4. Grid (layout)
5. Components (UI)
6. Helpers (utilities)
7. Print (media query)

### Backwards Compatibility
Maintain class names from original A.mphibio.us where possible:
- `.col-*` → Keep
- `.container` → Keep
- Component classes → Keep original names

### Performance
- Vite dev server is instant (HMR)
- Production builds are optimized
- No runtime dependencies
- Pure CSS (no JS required for styles)

## Testing Checklist

### Core System Tests
Before committing changes:
- [ ] `bun run lint` passes
- [ ] `bun run typecheck` passes
- [ ] `bun run build` succeeds
- [ ] Test in dev server (`bun run dev`)
- [ ] Check responsive breakpoints
- [ ] Verify in multiple browsers
- [ ] Check print styles

### Grid System Verification
After running `bun run fix:grid`:
- [ ] No horizontal scrollbar on any page
- [ ] All column widths add up to exactly 100%
- [ ] Consistent 20px gutters between columns
- [ ] Responsive stacking works on mobile
- [ ] No console errors related to layout

### Image System Verification
After running `bun run fix:images`:
- [ ] No broken image icons visible
- [ ] All placeholder images load correctly
- [ ] Appropriate sizes for context (check various pages)
- [ ] Brand colors used consistently
- [ ] No 404 errors in browser network tab
- [ ] Lazy loading working (check DevTools)

## Future Enhancements

Planned improvements:
- [ ] Storybook integration (like `headless` module)
- [ ] Component unit tests
- [ ] Automated visual regression testing
- [ ] Dark mode theme
- [ ] RTL (right-to-left) support
- [ ] Accessibility audit
- [ ] Performance benchmarks

## Resources

- **Original**: `/Users/clivemoore/Documents/GitHub/A.mphibio.us`
- **Vite Docs**: https://vite.dev
- **Biome Docs**: https://biomejs.dev
- **CSS Variables**: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
- **BEM Methodology**: http://getbem.com

---

**Migration Status**: 🚧 Active - Core structure complete, components need migration from original source
