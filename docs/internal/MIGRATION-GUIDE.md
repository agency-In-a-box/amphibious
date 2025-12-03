# Migration Guide: A.mphibio.us → Amphibious 2.0

This guide helps migrate components from the original A.mphibio.us (Grunt-based) to the modern Amphibious 2.0 (Vite-based).

## Quick Reference

| Aspect | Old (A.mphibio.us) | New (Amphibious 2.0) |
|--------|-------------------|---------------------|
| **Location** | `/Users/clivemoore/Documents/GitHub/A.mphibio.us` | `/Users/clivemoore/Documents/GitHub/AIAB/amphibious` |
| **Build Tool** | Grunt 0.4.5 | Vite 6 |
| **Runtime** | Node + npm | Bun |
| **CSS Build** | Manual concat/minify | Automatic bundling |
| **JS Build** | Uglify | esbuild |
| **Linting** | JSHint | Biome |
| **Dev Server** | None (manual refresh) | HMR (instant updates) |
| **Output** | `css/`, `js/` | `dist/` |

## Migration Priority

### Phase 1: Core Styles (PRIORITY)
1. ✅ CSS Variables system
2. ⏳ Complete normalize.css
3. ⏳ Full typography system
4. ⏳ Complete grid system with all responsive breakpoints
5. ⏳ Helper utilities

### Phase 2: Essential Components
1. ⏳ Navigation component
2. ⏳ Cards (complete implementation)
3. ⏳ Alerts (complete implementation)
4. ⏳ Forms and input groups
5. ⏳ Responsive tables

### Phase 3: Advanced Components
1. ⏳ Breadcrumbs
2. ⏳ Tabs
3. ⏳ Pagination
4. ⏳ Steps/Wizard
5. ⏳ Sidebar layouts

### Phase 4: JavaScript & Interactivity
1. ⏳ Migrate jQuery plugins to vanilla JS
2. ⏳ Smooth scroll functionality
3. ⏳ Navigation interactions
4. ⏳ Tab switching
5. ⏳ Responsive table behavior

## Step-by-Step Component Migration

### Example: Migrating a CSS Component

**Source**: `/Users/clivemoore/Documents/GitHub/A.mphibio.us/src/css/components/navigation.css`

**Target**: `/Users/clivemoore/Documents/GitHub/AIAB/amphibious/src/css/components/navigation.css`

#### Step 1: Copy Original Content
```bash
# Read the original file
cat /Users/clivemoore/Documents/GitHub/A.mphibio.us/src/css/components/navigation.css
```

#### Step 2: Modernize CSS

**Old approach**:
```css
.nav {
  background: #333;
  padding: 10px 20px;
}
```

**New approach**:
```css
.nav {
  background: var(--color-gray-800);
  padding: var(--spacing-sm) var(--spacing-md);
}
```

#### Step 3: Update Selectors for Modern CSS

**Old** (browser prefixes):
```css
.nav {
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
}
```

**New** (modern browsers):
```css
.nav {
  border-radius: var(--border-radius);
}
```

#### Step 4: Ensure Mobile-First
```css
/* Base styles (mobile) */
.nav {
  display: block;
}

/* Tablet and up */
@media (min-width: 768px) {
  .nav {
    display: flex;
  }
}
```

#### Step 5: Add to Build
Ensure component is imported in `src/css/main.css`:
```css
@import './components/navigation.css';
```

#### Step 6: Test
```bash
bun run dev
# Check http://localhost:3000
```

## CSS Variable Mapping

Map old Sass variables to new CSS variables:

| Old Sass Variable | New CSS Variable |
|------------------|------------------|
| `$primary` | `var(--color-primary)` |
| `$gray-dark` | `var(--color-gray-800)` |
| `$border-radius` | `var(--border-radius)` |
| `$spacing-unit` | `var(--spacing-md)` |
| `$container-width` | `var(--container-width)` |
| `$font-family` | `var(--font-family-base)` |

## Grid Migration Checklist

- [x] Basic 16-column structure
- [ ] All column classes (`.col-1` through `.col-16`)
- [ ] Tablet responsive classes (`.col-tablet-*`)
- [ ] Mobile landscape classes (`.col-mobile-*`)
- [ ] Mobile portrait adjustments
- [ ] Push/pull classes (if used)
- [ ] Offset classes (if used)
- [ ] Container variants (fixed/fluid)

## Component Checklist Template

For each component, verify:

```markdown
## Component: [Name]

- [ ] CSS copied from original
- [ ] CSS modernized (variables, prefixes removed)
- [ ] Mobile-first responsive design
- [ ] BEM naming convention followed
- [ ] Imported in main.css
- [ ] Example created in examples/
- [ ] Documented in docs/
- [ ] Tested in dev server
- [ ] Tested in all breakpoints
- [ ] Tested in multiple browsers
```

## JavaScript Migration

### jQuery to Vanilla JS

**Old** (jQuery):
```javascript
$('.nav-toggle').on('click', function() {
  $('.nav-menu').slideToggle();
});
```

**New** (Vanilla JS):
```typescript
document.querySelector('.nav-toggle')?.addEventListener('click', () => {
  const menu = document.querySelector('.nav-menu');
  menu?.classList.toggle('is-open');
});
```

### Plugin Migration Priority
1. Navigation toggle
2. Smooth scroll
3. Tabs functionality
4. Form validation
5. Other interactions

## Testing Strategy

### Manual Testing Checklist
- [ ] Desktop (>1024px)
- [ ] Tablet (768px-1024px)
- [ ] Mobile Landscape (480px-768px)
- [ ] Mobile Portrait (<480px)
- [ ] Print styles
- [ ] Dark mode (future)

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari
- [ ] Mobile Chrome

## Common Issues & Solutions

### Issue: Import Order
**Problem**: Styles not applying correctly
**Solution**: Check import order in `main.css` - variables must come before components

### Issue: CSS Variables Not Working
**Problem**: `var(--color-primary)` not working
**Solution**: Ensure `variables.css` is imported first in `main.css`

### Issue: Responsive Not Working
**Problem**: Grid not responding to breakpoints
**Solution**: Check that `grid-responsive.css` is imported after `grid.css`

### Issue: Build Errors
**Problem**: Vite build fails
**Solution**: Check for CSS syntax errors, missing imports, or invalid selectors

## Documentation Requirements

For each migrated component, create:

1. **Example HTML** in `examples/[component].html`
2. **Documentation** in `docs/[component].md` with:
   - Usage instructions
   - HTML structure
   - Available modifiers
   - Responsive behavior
   - Accessibility notes

## Quality Standards

Before marking a component as "complete":

✅ **Code Quality**
- No hardcoded colors (use CSS variables)
- No vendor prefixes (unless required)
- Clear, semantic class names
- Commented complex selectors

✅ **Responsive**
- Works on all breakpoints
- Touch-friendly (min 44px targets)
- No horizontal scroll

✅ **Accessible**
- Proper ARIA attributes
- Keyboard navigable
- Screen reader friendly

✅ **Performance**
- No unused styles
- Efficient selectors
- Minimal specificity

## Migration Progress Tracking

Create a tracking file: `docs/MIGRATION-STATUS.md`

```markdown
# Migration Status

Last Updated: [Date]

## Core (5/5) ✅
- [x] Variables
- [x] Normalize
- [x] Typography
- [x] Grid
- [x] Helpers

## Components (0/10) ⏳
- [ ] Navigation
- [ ] Cards
- [ ] Alerts
- [ ] Breadcrumbs
- [ ] Tabs
- [ ] Pagination
- [ ] Steps
- [ ] Sidebar
- [ ] Input Groups
- [ ] Responsive Tables

## JavaScript (0/5) ⏳
- [ ] Core utilities
- [ ] Navigation
- [ ] Tabs
- [ ] Smooth scroll
- [ ] Form validation
```

## Next Steps

1. Start with Phase 1 (Core Styles)
2. Test each component thoroughly
3. Document as you go
4. Update migration status
5. Move to next phase

---

**Remember**: Quality over speed. It's better to have 5 perfect components than 20 broken ones.
