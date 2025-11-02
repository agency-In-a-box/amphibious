# Quick Reference Guide for Migration

**For**: Claude Code CLI  
**Purpose**: Common patterns, conversions, and gotchas during migration

---

## File Path Quick Reference

```bash
# Original A.mphibio.us
OLD_ROOT="/Users/clivemoore/Documents/GitHub/A.mphibio.us"
OLD_CSS="$OLD_ROOT/src/css"
OLD_JS="$OLD_ROOT/src/js"

# New Amphibious 2.0
NEW_ROOT="/Users/clivemoore/Documents/GitHub/AIAB/amphibious"
NEW_CSS="$NEW_ROOT/src/css"
NEW_JS="$NEW_ROOT/src/js"
```

---

## CSS Variable Conversion Patterns

### Colors
```css
/* OLD - Hardcoded */
.element {
  color: #333;
  background: #0066cc;
  border-color: #ccc;
}

/* NEW - CSS Variables */
.element {
  color: var(--color-gray-800);
  background: var(--color-primary);
  border-color: var(--color-gray-300);
}
```

### Spacing
```css
/* OLD - Fixed pixels */
.element {
  padding: 10px 20px;
  margin-bottom: 15px;
}

/* NEW - Variable spacing */
.element {
  padding: var(--spacing-sm) var(--spacing-md);
  margin-bottom: var(--spacing-md);
}
```

### Typography
```css
/* OLD - Fixed sizes */
h1 {
  font-family: Arial, sans-serif;
  font-size: 24px;
  line-height: 1.5;
}

/* NEW - Variable system */
h1 {
  font-family: var(--font-family-base);
  font-size: var(--font-size-h1, 2.5rem);
  line-height: var(--line-height-base);
}
```

### Border Radius
```css
/* OLD - Fixed values */
.card {
  border-radius: 4px;
}

/* NEW - Variable system */
.card {
  border-radius: var(--border-radius);
}
```

---

## Available CSS Variables

Reference these from `src/css/variables.css`:

### Colors
```css
--color-primary
--color-secondary
--color-success
--color-danger
--color-warning
--color-info

--color-gray-100 through --color-gray-900
```

### Typography
```css
--font-family-base
--font-family-monospace
--font-size-base
--font-size-sm
--font-size-lg
--line-height-base
```

### Spacing
```css
--spacing-xs   (0.25rem)
--spacing-sm   (0.5rem)
--spacing-md   (1rem)
--spacing-lg   (1.5rem)
--spacing-xl   (3rem)
```

### Grid
```css
--container-width         (960px)
--container-width-fluid   (96%)
--grid-gutter            (20px)
```

### Other
```css
--border-radius
--border-radius-sm
--border-radius-lg
--border-width
--shadow-sm
--shadow-md
--shadow-lg
--transition-speed
--transition-timing
```

---

## Vendor Prefix Removal

### DON'T Include (Modern CSS handles these)
```css
/* ❌ REMOVE THESE */
-webkit-border-radius: 4px;
-moz-border-radius: 4px;
border-radius: 4px;

-webkit-box-shadow: 0 2px 4px rgba(0,0,0,0.1);
-moz-box-shadow: 0 2px 4px rgba(0,0,0,0.1);
box-shadow: 0 2px 4px rgba(0,0,0,0.1);

-webkit-transition: all 0.3s;
-moz-transition: all 0.3s;
transition: all 0.3s;
```

### Just Keep Standard
```css
/* ✅ MODERN - No prefixes needed */
.element {
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-speed) var(--transition-timing);
}
```

### ONLY Keep Prefixes For
```css
/* ✅ These still need prefixes (rare cases) */
-webkit-appearance: none;  /* Form elements */
-webkit-font-smoothing: antialiased;  /* Font rendering */
```

---

## Responsive Pattern: Old vs New

### Old Approach (Separate Files)
```css
/* grid_sixteen.css - Desktop */
.col-8 { width: 50%; }

/* tablet_sixteen.css - Tablet */
.col-8 { width: 100%; }

/* mobile_l_sixteen.css - Mobile */
.col-8 { width: 100%; }
```

### New Approach (Single File)
```css
/* grid.css - Desktop (default) */
.col-8 {
  flex: 0 0 50%;
  max-width: 50%;
}

/* grid-responsive.css - Responsive */
@media (max-width: 768px) {
  .col-tablet-16 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .col-mobile-16 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}
```

---

## Float to Flexbox Conversion

### Old Float-based Grid
```css
.row {
  overflow: hidden;
}

.col {
  float: left;
  margin-left: 10px;
  margin-right: 10px;
}

.row:after {
  content: "";
  display: table;
  clear: both;
}
```

### New Flexbox Grid
```css
.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 calc(var(--grid-gutter) * -1);
}

.col {
  padding: 0 var(--grid-gutter);
  flex: 1;
}

/* No clearfix needed with flexbox! */
```

---

## BEM Naming Convention

Use Block Element Modifier pattern:

```css
/* Block */
.card { }

/* Element (part of block) */
.card__header { }
.card__body { }
.card__footer { }

/* Modifier (variation) */
.card--large { }
.card--highlighted { }

/* Element with Modifier */
.card__header--bordered { }
```

---

## Import Order in main.css

**CRITICAL**: Order matters!

```css
/* 1. Reset */
@import './normalize.css';

/* 2. Variables (must come early) */
@import './variables.css';

/* 3. Base styles */
@import './typography.css';

/* 4. Layout */
@import './grid.css';
@import './grid-responsive.css';

/* 5. Components (alphabetical) */
@import './components/alerts.css';
@import './components/breadcrumbs.css';
@import './components/cards.css';
@import './components/input-groups.css';
@import './components/navigation.css';
@import './components/pagination.css';
@import './components/responsive-tables.css';
@import './components/sidebar.css';
@import './components/steps.css';
@import './components/tabs.css';

/* 6. Utilities */
@import './helpers.css';

/* 7. Print (last) */
@import './print.css';
```

---

## Example HTML Structure

### Basic Page Template
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Component Name - Amphibious</title>
  <link rel="stylesheet" href="../dist/amphibious.css">
</head>
<body>
  <div class="container">
    <h1>Component Examples</h1>
    
    <section>
      <h2>Example 1</h2>
      <!-- Component HTML here -->
    </section>
  </div>
  
  <script type="module" src="../dist/amphibious.js"></script>
</body>
</html>
```

---

## Testing Quick Commands

```bash
# Run from: /Users/clivemoore/Documents/GitHub/AIAB/amphibious

# Start dev server (keep running in one terminal)
bun run dev

# In second terminal, run tests:
bun run lint           # Check code quality
bun run typecheck      # TypeScript validation
bun run build         # Production build

# Open browser to:
http://localhost:3000                    # Main dev page
http://localhost:3000/examples/         # Examples directory
```

---

## Common Gotchas

### 1. Forgetting to Import in main.css
```css
/* ❌ Created new component but forgot this */
/* main.css missing: @import './components/new-component.css'; */

/* ✅ Always add import */
@import './components/new-component.css';
```

### 2. Using Variables Before Definition
```css
/* ❌ WRONG ORDER */
@import './components/cards.css';  /* Uses variables */
@import './variables.css';         /* Defines variables */

/* ✅ CORRECT ORDER */
@import './variables.css';         /* Define first */
@import './components/cards.css';  /* Use second */
```

### 3. Hardcoded Values
```css
/* ❌ Avoid */
.element {
  color: #333;
  padding: 16px;
}

/* ✅ Use variables */
.element {
  color: var(--color-gray-800);
  padding: var(--spacing-md);
}
```

### 4. Missing Responsive Classes
```css
/* ❌ Only desktop */
.col-8 { width: 50%; }

/* ✅ Include responsive variants */
.col-8 { width: 50%; }

@media (max-width: 768px) {
  .col-tablet-16 { width: 100%; }
}
```

---

## jQuery to Vanilla JS Patterns

### Event Listeners
```javascript
// ❌ OLD (jQuery)
$('.button').on('click', function() {
  // code
});

// ✅ NEW (Vanilla)
document.querySelector('.button')?.addEventListener('click', () => {
  // code
});
```

### Class Manipulation
```javascript
// ❌ OLD (jQuery)
$('.element').addClass('active');
$('.element').removeClass('active');
$('.element').toggleClass('active');

// ✅ NEW (Vanilla)
element.classList.add('active');
element.classList.remove('active');
element.classList.toggle('active');
```

### DOM Traversal
```javascript
// ❌ OLD (jQuery)
$('.parent').find('.child');
$('.element').parent();
$('.element').siblings();

// ✅ NEW (Vanilla)
parent.querySelector('.child');
element.parentElement;
Array.from(element.parentElement.children).filter(el => el !== element);
```

### Animation (slideToggle replacement)
```javascript
// ❌ OLD (jQuery)
$('.element').slideToggle();

// ✅ NEW (CSS + Vanilla JS)
// Use CSS transitions and toggle classes
element.classList.toggle('is-open');

/* CSS */
.element {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.element.is-open {
  max-height: 1000px;
}
```

---

## Documentation Template

Save this as `docs/COMPONENT-TEMPLATE.md` for reference:

```markdown
# Component Name

## Overview

Brief description of what this component does.

## Basic Usage

### HTML Structure

\`\`\`html
<div class="component">
  <div class="component__element">Content</div>
</div>
\`\`\`

### CSS Classes

| Class | Description |
|-------|-------------|
| `.component` | Base component class |
| `.component__element` | Component sub-element |
| `.component--modifier` | Component variant |

## Variations

### Variation 1: Name

Description and usage.

### Variation 2: Name

Description and usage.

## Responsive Behavior

- **Desktop**: Full layout
- **Tablet**: Adjusted layout
- **Mobile**: Stacked layout

## Accessibility

- ARIA attributes: `role="..."`, `aria-label="..."`
- Keyboard navigation: Tab, Enter, Escape
- Screen reader: Proper labels and descriptions

## Examples

See: `examples/component-name.html`

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge).

## Notes

Any additional information or warnings.
```

---

## Quick Verification Steps

After migrating each component:

1. **Visual Check**
   ```bash
   bun run dev
   # Open http://localhost:3000/examples/[component].html
   ```

2. **Responsive Check**
   - Resize browser to 1200px (desktop)
   - Resize to 768px (tablet)
   - Resize to 480px (mobile)
   - Resize to 320px (mobile portrait)

3. **Code Quality**
   ```bash
   bun run lint        # No errors
   bun run typecheck   # No type errors
   ```

4. **Build Test**
   ```bash
   bun run build       # Successful build
   ```

5. **Console Check**
   - Open browser DevTools
   - Check for CSS warnings
   - Check for JavaScript errors

---

## Need Help?

**Documentation**:
- Main guide: `CLAUDE-CODE-INSTRUCTIONS.md`
- Checklist: `CLAUDE-CODE-CHECKLIST.md`
- Migration guide: `docs/MIGRATION-GUIDE.md`
- Status tracker: `docs/MIGRATION-STATUS.md`

**Original Source**:
- Browse: `/Users/clivemoore/Documents/GitHub/A.mphibio.us`
- Examples: Look at original `examples/` directory
- Docs: Check original `docs/` directory

---

**Remember**: When in doubt, check the original A.mphibio.us files for patterns and behavior!
