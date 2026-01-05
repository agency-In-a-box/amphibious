# CSS @layer Architecture - Amphibious 2.0

## Overview
Amphibious 2.0 uses CSS `@layer` to create a predictable cascade without relying on `!important` declarations. This modern approach provides clear specificity rules and maintainable style overrides.

## Layer Hierarchy

Layers are defined in order from lowest to highest priority:

```css
@layer reset, tokens, base, layout, components, themes, utilities;
```

### 1. **reset** (Lowest Priority)
- Browser normalizations and CSS resets
- Files: `normalize.css`
- Purpose: Consistent baseline across browsers

### 2. **tokens**
- CSS custom properties and design tokens
- Files: `tokens/design-tokens.css`
- Purpose: Centralized design system variables

### 3. **base**
- Typography and HTML element styles
- Files: `typography.css`
- Purpose: Default styling for semantic HTML

### 4. **layout**
- Grid systems and layout utilities
- Files: `grid-modern.css`
- Purpose: Structural layout components

### 5. **components**
- UI components following Atomic Design
- Atoms: `badges.css`, `buttons.css`, `icons.css`, `spinners.css`
- Molecules: `alerts.css`, `progress.css`, `tags.css`, `tooltip.css`
- Organisms: `cards.css`, `navigation-unified.css`, `modal.css`, `forms.css`
- Purpose: Reusable UI components

### 6. **themes**
- Design system overrides and variations
- Files: `apple-design-system.css`, `premium-design-system.css`
- Purpose: Branded component variations

### 7. **utilities** (Highest Priority)
- Helper and utility classes
- Files: `helpers.css`
- Purpose: Single-purpose override classes

## How It Works

### Cascade Resolution
When multiple layers define styles for the same element, the layer order determines which styles win:

```css
/* Component layer */
@layer components {
  .button {
    padding: 16px;
    background: gray;
  }
}

/* Utility layer - WINS */
@layer utilities {
  .p-0 {
    padding: 0;
  }
}
```

Result: `<button class="button p-0">` will have 0 padding.

### Real-World Examples

#### Example 1: Button with Utilities
```html
<button class="btn-premium mb-0 text-center">
  Submit
</button>
```
- `btn-premium` (themes layer) provides base button styling
- `mb-0` (utilities layer) overrides margin-bottom to 0
- `text-center` (utilities layer) overrides text alignment

#### Example 2: Card with Theme and Utilities
```html
<div class="card-premium p-0 shadow-none">
  Content
</div>
```
- `card-premium` (themes layer) provides premium card styling
- `p-0` (utilities layer) removes all padding
- `shadow-none` (utilities layer) removes box shadow

#### Example 3: Navigation with Active State
```html
<nav class="site-nav">
  <ul class="horizontal">
    <li class="active"><a href="#">Home</a></li>
    <li><a href="#" class="text-primary">About</a></li>
  </ul>
</nav>
```
- Navigation styles (components layer) provide base nav styling
- `.active` class (components layer) highlights current page
- `.text-primary` (utilities layer) overrides text color

## Benefits

### 1. No !important Needed
Utility classes naturally override component styles without `!important`:

```css
/* OLD way - required !important */
.p-0 {
  padding: 0 !important;
}

/* NEW way - layer priority handles it */
@layer utilities {
  .p-0 {
    padding: 0;
  }
}
```

### 2. Predictable Specificity
Layer order is explicit and predictable:
- Developers know utilities always win
- Themes override components
- Components override base styles

### 3. Better Maintainability
- Clear separation of concerns
- Easy to add new themes without breaking existing styles
- Utilities remain consistent across all components

### 4. Progressive Enhancement
```css
/* Base button */
@layer components {
  .button { /* simple styles */ }
}

/* Enhanced theme */
@layer themes {
  .button-premium { /* enhanced styles */ }
}

/* Quick overrides */
@layer utilities {
  .rounded-full { border-radius: 9999px; }
}
```

## Migration Guide

### From !important to @layer

Before:
```css
.text-center {
  text-align: center !important;
}

.btn-primary {
  background: blue;
}
```

After:
```css
@layer components {
  .btn-primary {
    background: blue;
  }
}

@layer utilities {
  .text-center {
    text-align: center; /* No !important needed */
  }
}
```

### Testing Cascade Behavior

1. Open `test-cascade.html` in a browser
2. Verify utility classes override components
3. Check theme styles override base components
4. Ensure no visual regressions

### Browser Support

CSS `@layer` is supported in all modern browsers:
- Chrome 99+
- Firefox 97+
- Safari 15.4+
- Edge 99+

For older browsers, styles still work but without layer-based cascade control.

## Best Practices

### 1. Keep Layers Pure
Don't mix concerns between layers:
```css
/* GOOD - utilities only in utilities layer */
@layer utilities {
  .mt-0 { margin-top: 0; }
}

/* BAD - component in utilities layer */
@layer utilities {
  .card { /* full component styles */ }
}
```

### 2. Use Semantic Layer Names
Our layers follow a logical progression:
- Foundation (reset, tokens, base)
- Structure (layout)
- Components (components)
- Enhancements (themes)
- Overrides (utilities)

### 3. Document Layer Usage
When creating new styles, document which layer they belong to:
```css
/* Navigation Component - components layer */
@layer components {
  .site-nav { /* ... */ }
}
```

### 4. Avoid Unlayered Styles
Styles outside layers have highest priority (except inline styles). Use them sparingly:
```css
/* This will override everything except inline styles */
.emergency-override {
  color: red;
}

/* Better - put in utilities layer */
@layer utilities {
  .text-danger {
    color: red;
  }
}
```

## Performance Considerations

### Build Output
The layer architecture is compiled into efficient CSS:
- Development: Preserves layers for debugging
- Production: Optimized and minified
- Current size: 1.07KB gzipped (CSS only)

### Runtime Performance
- No JavaScript required for cascade control
- Browser-native cascade resolution
- Zero runtime overhead

## Summary

The CSS `@layer` architecture in Amphibious 2.0 provides:

✅ **Predictable cascade** - Clear priority order
✅ **No !important** - Reduced from 58 to 0 declarations
✅ **Better DX** - Intuitive style overrides
✅ **Maintainable** - Clear separation of concerns
✅ **Modern** - Uses native CSS features
✅ **Performant** - No JavaScript overhead

This architecture ensures styles are predictable, maintainable, and easy to override when needed.