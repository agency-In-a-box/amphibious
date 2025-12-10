# Claude Code Instructions for Amphibious 2.0

This document provides comprehensive instructions for Claude Code CLI when working with the Amphibious 2.0 framework within the AIAB monorepo.

## Project Overview & Status

**Amphibious 2.0** is a modern CSS framework and component library that's a complete rebuild of the original A.mphibio.us (circa 2015).

**Current Status**: 🎯 **98% Complete - Production Ready**
- ✅ Modern build system (Vite 6) with TypeScript and Biome
- ✅ Complete Atomic Design implementation (25+ components)
- ✅ Responsive 16-column grid system
- ✅ Comprehensive icon system (1,641+ Lucide icons)
- ✅ Professional examples and documentation
- ✅ Cross-browser compatibility
- 🔄 **Ready for NPM publication**

**Root Directory**: `/Users/clivemoore/Documents/GitHub/AIAB/amphibious`

## Development Environment

### Quick Start Commands
```bash
cd /Users/clivemoore/Documents/GitHub/AIAB/amphibious
bun install
bun run dev  # → http://localhost:2960
```

### Development Server
- **Development**: http://localhost:2960
- **Network Access**: http://192.168.0.16:2960
- **Preview Build**: `bun run preview` → http://localhost:2961

### Essential Commands
```bash
bun run build          # Production build
bun run lint            # Lint with Biome
bun run lint:fix        # Auto-fix issues
bun run typecheck       # TypeScript checking
bun run format          # Format code
bun run clean           # Clean dist/
```

## Architecture & File Structure

### Modern Stack
- **Build**: Vite 6 (replaced Grunt 0.4.5)
- **Runtime**: Bun (Node.js compatible)
- **Linting**: Biome (replaced JSHint)
- **Styling**: CSS with CSS Variables
- **Icons**: Lucide (1,641+ icons)
- **Module System**: ESM
- **Design**: Atomic Design methodology

### Directory Structure
```
amphibious/
├── src/
│   ├── css/
│   │   ├── tokens/design-tokens.css    # Design system foundation
│   │   ├── atoms/                      # Basic UI elements (5)
│   │   ├── molecules/                  # Simple combinations (5)
│   │   ├── organisms/                  # Complex sections (12+)
│   │   ├── main.css                   # Classic entry point
│   │   └── main-atomic.css            # Atomic Design entry
│   ├── js/                            # JavaScript utilities
│   └── index.ts                       # TypeScript entry
├── docs/                              # Documentation pages
├── examples/                          # Live demonstrations
├── scripts/                          # Automation tools
└── dist/                             # Build output (gitignored)
```

## Design System - Atomic Design Implementation

### Design Tokens (Foundation)
**Location**: `src/css/tokens/design-tokens.css`

**Corporate Branding**:
- **Primary Color**: #FF6900 (PMS 144 - Corporate Orange)
- **Primary Hover**: #E65100
- **Primary Light**: rgba(255, 105, 0, 0.1)
- **Corporate Font**: Avenir (primary), with system fallbacks

**Core Variables**:
```css
:root {
  /* Corporate Branding */
  --primary-color: #FF6900;  /* PMS 144 */
  --primary-hover: #E65100;
  --primary-light: rgba(255, 105, 0, 0.1);

  /* Typography */
  --font-family-primary: Avenir, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

  /* Colors */
  --text-primary: #1a1a1a;
  --text-secondary: #4a5568;
  --border-color: #e2e8f0;
  --bg-primary: #ffffff;
  --bg-secondary: #f7fafc;
}
```

### Component Hierarchy

**Atoms (5 Components)**:
- `atoms/badges.css` - Status indicators
- `atoms/buttons.css` - Button system with variants
- `atoms/icons.css` - Icon integration
- `atoms/spinners.css` - Loading indicators
- `atoms/icon-buttons.css` - Icon-only buttons

**Molecules (5 Components)**:
- `molecules/alerts.css` - System notifications
- `molecules/progress.css` - Progress indicators
- `molecules/tags.css` - Removable labels/chips
- `molecules/tooltip.css` - Contextual help
- `molecules/pears.css` - Content patterns

**Organisms (12+ Components)**:
- `organisms/cards.css` - Card layouts
- `organisms/navigation.css` - Navigation patterns
- `organisms/breadcrumbs.css` - Breadcrumb trails
- `organisms/tabs.css` - Tabbed interfaces
- `organisms/pagination.css` - Page navigation
- `organisms/steps.css` - Multi-step processes
- `organisms/sidebar.css` - Sidebar layouts
- `organisms/footer.css` - Footer sections
- `organisms/carousel.css` - Splide.js integration
- `organisms/forms.css` - Form layouts
- `organisms/modals.css` - Modal dialogs
- `organisms/tables.css` - Table components

## Grid System

### 16-Column Responsive Grid
- **Container**: 960px fixed or 96% fluid
- **Columns**: `.col-1` through `.col-16`
- **Math**: Each column = 6.25% of container
- **Implementation**: Modern flexbox (no floats)

**Usage Example**:
```html
<div class="container">
  <div class="row">
    <div class="col-8">50% width (8/16)</div>
    <div class="col-8">50% width</div>
  </div>
</div>
```

**Responsive Breakpoints**:
- **Desktop**: `.col-*` (default)
- **Tablet**: `.col-tablet-*` (≤768px)
- **Mobile**: `.col-mobile-*` (≤480px)

## Icon System - Lucide Integration

### Implementation Requirements
Always include Lucide icons with proper initialization:

**HTML Head**:
```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
```

**CSS Styles**:
```css
[data-lucide] {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  stroke-width: 2;
  vertical-align: middle;
  margin-right: 0.25rem;
}

.icon--xs[data-lucide] { width: 0.875rem; height: 0.875rem; }
.icon--sm[data-lucide] { width: 1rem; height: 1rem; }
.icon--filled[data-lucide] { fill: currentColor; }
```

**JavaScript Initialization**:
```javascript
document.addEventListener('DOMContentLoaded', function() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();

    // Re-initialize after dynamic content
    const observer = new MutationObserver(() => {
      lucide.createIcons();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
});
```

**Icon Usage**:
```html
<i data-lucide="heart"></i>
<i data-lucide="search" class="icon--sm"></i>
<i data-lucide="star" class="icon--filled"></i>
```

**Icon Browse Page**: `/docs/icons.html` - Complete library with search and copy functionality

## Corporate Brand Standards

### Typography - Avenir Font Family
**Primary Font**: Avenir (corporate standard)
**Fallback Stack**:
```css
font-family: Avenir, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

**Implementation**: Always use Avenir as the primary font with system fallbacks for compatibility.

### Color System - PMS 144
**Primary Brand Color**: PMS 144 (#FF6900)
- Use for primary actions, highlights, and brand elements
- Maintains accessibility standards with proper contrast ratios
- Consistent across all components and interactions

## Page Design Patterns

### Modern Professional Theme
All new pages should follow this established pattern:

**Header Structure**:
```html
<div class="page-header">
  <div class="hero-content">
    <div class="hero-inner">
      <h1 class="hero-title">Page Title</h1>
      <p class="hero-subtitle">Description text...</p>
    </div>
  </div>
</div>
```

**Hero Section CSS**:
```css
.hero-section {
  position: relative;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  height: 600px;
  background: linear-gradient(135deg,
    rgba(255, 105, 0, 0.95) 0%,
    rgba(255, 105, 0, 0.85) 25%,
    rgba(123, 67, 151, 0.9) 50%,
    rgba(67, 56, 202, 0.95) 100%);
  overflow: hidden;
}
```

**Animated Background Pattern**:
```css
.hero-section::after {
  content: '';
  background-image: repeating-linear-gradient(
    45deg, transparent, transparent 100px,
    rgba(255, 255, 255, 0.03) 100px,
    rgba(255, 255, 255, 0.03) 200px
  );
  animation: drift 20s linear infinite;
}

@keyframes drift {
  from { transform: translate(0, 0); }
  to { transform: translate(100px, 100px); }
}
```

### Standard Footer Template
```html
<footer class="site-footer">
  <div class="container">
    <div class="footer-content" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 3rem; margin-bottom: 3rem;">
      <div class="footer-section">
        <h4 style="color: white; margin-bottom: 1rem;">Framework</h4>
        <div class="footer-links" style="display: flex; flex-direction: column; gap: 0.5rem;">
          <a href="/docs/foundation.html">Foundation</a>
          <a href="/docs/form.html">Forms</a>
          <a href="/docs/function.html">Components</a>
          <a href="/docs/features.html">Features</a>
        </div>
      </div>
      <!-- Additional footer sections... -->
    </div>
    <div style="text-align: center; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1);">
      <p>&copy; 2024 Amphibious 2.0. Built with performance and accessibility in mind.</p>
    </div>
  </div>
</footer>
```

## Development Best Practices

### CSS Guidelines
1. **Edit source files** in `src/css/`, never in `dist/`
2. **Use design tokens** from `tokens/design-tokens.css`
3. **Follow Atomic Design**: Components go in appropriate hierarchy
4. **BEM naming**: `.block__element--modifier`
5. **Mobile-first**: Base styles, then `@media (min-width: ...)`
6. **CSS variables**: Leverage theming system
7. **No comments**: Keep CSS clean unless specifically requested

### Component Development
**Adding New Components**:

1. **Atoms**: Create `src/css/atoms/[name].css`
2. **Molecules**: Create `src/css/molecules/[name].css`
3. **Organisms**: Create `src/css/organisms/[name].css`
4. Add import to `src/css/main-atomic.css`
5. Create example in `examples/[name].html`
6. Follow existing patterns and conventions

### JavaScript Guidelines
1. **Type everything**: No `any` types in TypeScript
2. **Modern ES6+**: Classes, arrow functions, async/await
3. **Namespace**: Keep utilities under `amp` namespace
4. **Document**: JSDoc for public APIs
5. **Lucide integration**: Always initialize icons properly

## Responsive Design Requirements

### Breakpoint Strategy
```css
/* Mobile First Approach */
/* Base styles: Mobile (≤480px) */

@media (min-width: 481px) {
  /* Tablet styles (481px - 768px) */
}

@media (min-width: 769px) {
  /* Desktop styles (≥769px) */
}

@media (min-width: 1200px) {
  /* Large desktop styles (≥1200px) */
}
```

### Component Responsive Patterns

**Product Grids**:
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns

**Navigation**:
- Mobile: Hamburger menu/drawer
- Desktop: Horizontal navigation

**Cards**:
- Mobile: Full width stack
- Tablet: 2-column grid
- Desktop: 3+ column grid

## Modern Filter Systems

### Workilo-Style Filter Implementation
Based on our successful e-commerce catalog implementation:

**Filter Toggle Button** (Fixed position):
```css
.filter-toggle {
  position: fixed;
  left: 2rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  background: white;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem 1.5rem;
}
```

**Sliding Drawer**:
```css
.filter-drawer {
  position: fixed;
  left: -400px;
  top: 0;
  width: 380px;
  height: 100vh;
  background: white;
  transition: left 0.3s ease;
}

.filter-drawer.open {
  left: 0;
}
```

**JavaScript Pattern**:
```javascript
function toggleFilterDrawer() {
  const drawer = document.getElementById('filterDrawer');
  const overlay = document.getElementById('filtersOverlay');

  drawer.classList.toggle('open');
  overlay.classList.toggle('open');

  if (drawer.classList.contains('open')) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}
```

## E-commerce Component Patterns

### Shopping Cart Layout
Based on our refined shopping cart implementation:

**Product Structure**:
```html
<article class="product-card" data-item-id="1">
  <div class="item-content">
    <div class="item-title-row">
      <h3>Product Name</h3>
    </div>
    <div class="item-details-row">
      <div class="item-details">...</div>
      <div class="item-price">...</div>
      <div class="item-quantity">...</div>
      <div class="item-total">...</div>
    </div>
  </div>
</article>
```

**No-wrap Labels**:
```css
.meta-label,
.meta-value {
  white-space: nowrap;
}
```

**JavaScript Event Handling**:
```javascript
// Use data attributes instead of array indices
const itemId = parseInt(cartItem.dataset.itemId);
handleQuantityChange(itemId, -1);
```

## Common Issues & Solutions

### Icon Display Problems
**Symptoms**: Empty boxes instead of icons
**Solution**: Proper Lucide initialization after DOM changes

```javascript
// Initialize after dynamic content
if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}
```

### CSS Path Issues
**Wrong**: `/css/a.mphibio.us.css`
**Correct**: `/src/css/main.css`

### Grid Layout Problems
**Wrong**: Float-based layout
**Correct**: Modern flexbox grid implementation

### Responsive Issues
Always test:
1. Mobile (≤480px): Single column
2. Tablet (481-768px): Two columns
3. Desktop (≥769px): Three columns

## Testing Checklist

### Before Completing Any Task
1. **Visual Check**: View in browser at http://localhost:2960
2. **Responsive Test**: Check mobile, tablet, desktop
3. **Icon Test**: Ensure all Lucide icons display
4. **Navigation Test**: All links work correctly
5. **Console Check**: No 404 errors or JavaScript errors
6. **Lint Check**: `bun run lint` passes
7. **Build Check**: `bun run build` succeeds

### Cross-Browser Requirements
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (macOS/iOS)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## File Management

### Always Edit These Paths
- **CSS**: `/src/css/` directory
- **Examples**: `/examples/` directory
- **Documentation**: `/docs/` directory
- **Scripts**: `/scripts/` directory

### Never Edit These Paths
- **Dist**: `/dist/` (generated)
- **Node Modules**: `/node_modules/` (dependencies)
- **Old Legacy**: Any `/css/a.mphibio.us.css` references

### File Naming Conventions
- **CSS Files**: `kebab-case.css`
- **HTML Files**: `kebab-case.html`
- **TypeScript**: `camelCase.ts`
- **Components**: Use semantic names that describe function

## Automation Scripts

### Available Scripts
```bash
bun run fix:grid        # Modernize grid system
bun run fix:images      # Replace broken images
```

### Script Features
- ✅ Automatic backups before modifications
- ✅ Detailed logging and audit trails
- ✅ Brand-consistent placeholders
- ✅ Performance optimizations
- ✅ Backward compatibility

## Performance Guidelines

### CSS Performance
- Use CSS variables for theming
- Minimize specificity
- Leverage Vite's build optimization
- Tree-shake unused styles

### JavaScript Performance
- Lazy load heavy components
- Use mutation observers sparingly
- Debounce user input handlers
- Initialize icons only when needed

### Image Performance
- Use modern placeholder services
- Implement lazy loading: `loading="lazy"`
- Optimize image sizes for context
- Use appropriate formats (WebP when possible)

## Accessibility Standards

### Required Practices
1. **Semantic HTML**: Use proper elements
2. **ARIA Labels**: For interactive elements
3. **Keyboard Navigation**: Tab order and focus states
4. **Screen Readers**: Alt text and labels
5. **Color Contrast**: Meet WCAG standards
6. **Focus Indicators**: Visible focus states

### Implementation Examples
```html
<!-- Good: Semantic and accessible -->
<button class="btn btn-primary" aria-label="Add to cart">
  <i data-lucide="shopping-cart"></i>
  Add to Cart
</button>

<!-- Good: Form accessibility -->
<label for="email">Email Address</label>
<input type="email" id="email" required aria-describedby="email-help">
<div id="email-help">We'll never share your email</div>
```

## Quality Assurance

### Pre-Launch Checklist
- [ ] All 25+ components render correctly
- [ ] Interactive elements work (tabs, modals, etc.)
- [ ] Responsive behavior verified
- [ ] Cross-browser testing complete
- [ ] Performance metrics acceptable
- [ ] Accessibility audit passed
- [ ] Documentation complete
- [ ] Build process working
- [ ] No console errors

### Success Metrics
- **Build Time**: < 5 seconds
- **Bundle Size**: CSS < 100kb, JS < 50kb
- **Load Time**: < 2 seconds on 3G
- **Lighthouse Score**: > 90 across all metrics

## NPM Publication Preparation

### Pre-Publication Steps
1. Version bump: `npm version patch|minor|major`
2. Final build: `bun run build`
3. Test distribution: `bun run preview`
4. Update CHANGELOG.md
5. Verify package.json metadata
6. Check .npmignore configuration

### Publication Command
```bash
npm publish
```

### Post-Publication
1. Create GitHub release
2. Update documentation
3. Announce to community

---

## Emergency Procedures

### If Build Breaks
1. Check `bun run lint` output
2. Verify all imports are correct
3. Check for TypeScript errors: `bun run typecheck`
4. Clear cache: `bun run clean && bun install`
5. Restart dev server: Stop + `bun run dev`

### If Icons Don't Display
1. Check Lucide script is loaded: `<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>`
2. Verify initialization: `lucide.createIcons()`
3. Check CSS styles for `[data-lucide]` elements
4. Test in browser console: `lucide.createIcons()`

### If Responsive Breaks
1. Check grid column math (should add to 16)
2. Verify breakpoint CSS order (mobile-first)
3. Test container max-width settings
4. Check for overflow issues

---

This document represents the complete knowledge base for working with Amphibious 2.0. Follow these patterns and practices for consistent, high-quality results that match the established design system and user experience expectations.

**Remember**: Amphibious 2.0 is 98% complete and production-ready. Focus on polish, consistency, and maintaining the high standards we've established throughout this project.