# Claude Code Migration Instructions

**Target**: Migrate A.mphibio.us (Grunt-based) to Amphibious 2.0 (Vite-based)  
**For**: Claude Code CLI  
**Date**: October 31, 2025

## Overview

You are tasked with systematically migrating components from the original A.mphibio.us framework to the modernized Amphibious 2.0 module within the AIAB monorepo.

## File Paths Reference

```
Original Source: /Users/clivemoore/Documents/GitHub/A.mphibio.us
Target Module:   /Users/clivemoore/Documents/GitHub/AIAB/amphibious

Key Directories:
- Old CSS Source:  /Users/clivemoore/Documents/GitHub/A.mphibio.us/src/css/
- New CSS Target:  /Users/clivemoore/Documents/GitHub/AIAB/amphibious/src/css/
- Old JS Source:   /Users/clivemoore/Documents/GitHub/A.mphibio.us/src/js/
- New JS Target:   /Users/clivemoore/Documents/GitHub/AIAB/amphibious/src/js/
- Old Examples:    /Users/clivemoore/Documents/GitHub/A.mphibio.us/examples/
- New Examples:    /Users/clivemoore/Documents/GitHub/AIAB/amphibious/examples/
```

## Working Directory

Always execute commands from:
```bash
cd /Users/clivemoore/Documents/GitHub/AIAB/amphibious
```

## Migration Phases

### PHASE 1: Core Foundation (DO THIS FIRST)

Complete these files in order. Each must be completed before moving to the next.

---

#### Task 1.1: Complete normalize.css

**Goal**: Migrate full CSS reset from original

**Steps**:
1. Read original file:
   ```
   /Users/clivemoore/Documents/GitHub/A.mphibio.us/src/css/normalize.css
   ```

2. Compare with current placeholder:
   ```
   /Users/clivemoore/Documents/GitHub/AIAB/amphibious/src/css/normalize.css
   ```

3. Update the target file with complete normalize rules
4. Keep modern box-sizing approach
5. Remove any IE6/7 specific hacks
6. Ensure all HTML5 elements are normalized

**Verification**:
```bash
bun run dev
# Check browser console for CSS errors
# Verify basic HTML elements render correctly
```

**Deliverable**: Complete normalize.css with modern reset rules

---

#### Task 1.2: Complete typography.css

**Goal**: Full typography system with proper hierarchy

**Steps**:
1. Read original file:
   ```
   /Users/clivemoore/Documents/GitHub/A.mphibio.us/src/css/typography.css
   ```

2. Migrate all rules to:
   ```
   /Users/clivemoore/Documents/GitHub/AIAB/amphibious/src/css/typography.css
   ```

3. **Modernization requirements**:
   - Convert fixed pixel sizes to rem where appropriate
   - Use CSS variables for font families, sizes, weights
   - Example conversion:
     ```css
     /* OLD */
     h1 { font-size: 24px; }
     
     /* NEW */
     h1 { font-size: var(--font-size-h1, 2.5rem); }
     ```

4. Add new variables to `variables.css` as needed:
   ```css
   --font-size-h1: 2.5rem;
   --font-size-h2: 2rem;
   --font-weight-normal: 400;
   --font-weight-bold: 700;
   ```

5. Include all text utility classes (if present in original)

**Verification**:
```bash
bun run dev
# Check all heading levels (h1-h6)
# Verify paragraph spacing
# Test bold, italic, links
```

**Deliverable**: Complete typography system with CSS variables

---

#### Task 1.3: Complete grid_sixteen.css

**Goal**: Full 16-column grid implementation

**Steps**:
1. Read original grid file:
   ```
   /Users/clivemoore/Documents/GitHub/A.mphibio.us/src/css/grid_sixteen.css
   ```

2. Update target file:
   ```
   /Users/clivemoore/Documents/GitHub/AIAB/amphibious/src/css/grid.css
   ```

3. **Migration checklist**:
   - [ ] All column classes (.col-1 through .col-16)
   - [ ] Container and container-fluid
   - [ ] Row clearing
   - [ ] Push classes (if present)
   - [ ] Pull classes (if present)
   - [ ] Offset classes (if present)
   - [ ] Alpha/Omega (first/last) helpers (if present)

4. **Modernization**:
   - Keep flexbox approach (already started)
   - Use CSS variables for gutter spacing
   - Simplify with modern CSS (no need for clearfix if using flexbox)

**Verification**:
```bash
bun run dev
# Test various column combinations
# Verify columns add up to 16
# Check gutters are consistent
```

**Deliverable**: Complete 16-column grid system

---

#### Task 1.4: Complete responsive breakpoints

**Goal**: All responsive grid classes working

**Steps**:
1. Read original responsive files:
   ```
   /Users/clivemoore/Documents/GitHub/A.mphibio.us/src/css/tablet_sixteen.css
   /Users/clivemoore/Documents/GitHub/A.mphibio.us/src/css/mobile_l_sixteen.css
   /Users/clivemoore/Documents/GitHub/A.mphibio.us/src/css/mobile_p_sixteen.css
   ```

2. Consolidate into:
   ```
   /Users/clivemoore/Documents/GitHub/AIAB/amphibious/src/css/grid-responsive.css
   ```

3. **Structure**:
   ```css
   /* Desktop (default) - no media query needed */
   
   /* Tablet: 768px and below */
   @media (max-width: 768px) {
     .col-tablet-1 { ... }
     .col-tablet-2 { ... }
     /* ... through col-tablet-16 */
   }
   
   /* Mobile Landscape: 480px and below */
   @media (max-width: 480px) {
     .col-mobile-1 { ... }
     /* ... through col-mobile-16 */
   }
   
   /* Mobile Portrait: 320px and below */
   @media (max-width: 320px) {
     /* Adjustments for very small screens */
   }
   ```

4. Ensure mobile-first approach (base styles apply to mobile, enhance for larger)

**Verification**:
```bash
bun run dev
# Resize browser to each breakpoint
# Verify columns stack/resize correctly
# Test on actual mobile device if possible
```

**Deliverable**: Complete responsive grid system

---

#### Task 1.5: Complete helpers.css

**Goal**: All utility classes from original

**Steps**:
1. Read original helper file:
   ```
   /Users/clivemoore/Documents/GitHub/A.mphibio.us/src/css/helpers.css
   ```

2. Also check:
   ```
   /Users/clivemoore/Documents/GitHub/A.mphibio.us/src/css/clearing.css
   ```

3. Consolidate into:
   ```
   /Users/clivemoore/Documents/GitHub/AIAB/amphibious/src/css/helpers.css
   ```

4. **Include**:
   - Display utilities (hidden, visible, etc.)
   - Text alignment
   - Float utilities
   - Clearfix (if needed for legacy support)
   - Margin/padding utilities
   - Any other helper classes

5. Use modern CSS where possible (flexbox instead of floats)

**Verification**:
```bash
bun run dev
# Test each utility class
# Verify no conflicts with component styles
```

**Deliverable**: Complete utility class system

---

#### Task 1.6: Update print.css

**Goal**: Complete print stylesheet

**Steps**:
1. Read original:
   ```
   /Users/clivemoore/Documents/GitHub/A.mphibio.us/src/css/print.css
   ```

2. Update:
   ```
   /Users/clivemoore/Documents/GitHub/AIAB/amphibious/src/css/print.css
   ```

3. Ensure all print optimizations are included

**Verification**:
```bash
bun run dev
# Use browser Print Preview
# Verify layout is print-friendly
```

**Deliverable**: Complete print stylesheet

---

### PHASE 2: Essential Components

Only begin after Phase 1 is 100% complete.

---

#### Task 2.1: Navigation Component

**Priority**: CRITICAL - Most websites need navigation

**Steps**:
1. Read original:
   ```
   /Users/clivemoore/Documents/GitHub/A.mphibio.us/src/css/components/navigation.css
   ```

2. Also check if there's additional navigation CSS in:
   ```
   /Users/clivemoore/Documents/GitHub/A.mphibio.us/src/css/navigation.css
   ```

3. Update:
   ```
   /Users/clivemoore/Documents/GitHub/AIAB/amphibious/src/css/components/navigation.css
   ```

4. **Modernization checklist**:
   - [ ] Convert colors to CSS variables
   - [ ] Remove vendor prefixes
   - [ ] Use modern flexbox for layout
   - [ ] Ensure mobile menu works without JS (CSS-only if possible)
   - [ ] Add ARIA-friendly structure in documentation

5. **Create example**:
   ```
   /Users/clivemoore/Documents/GitHub/AIAB/amphibious/examples/navigation.html
   ```

   Example structure:
   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <link rel="stylesheet" href="../dist/amphibious.css">
   </head>
   <body>
     <nav class="nav">
       <div class="container">
         <ul class="nav-menu">
           <li><a href="#">Home</a></li>
           <li><a href="#">About</a></li>
           <li><a href="#">Contact</a></li>
         </ul>
       </div>
     </nav>
     <script src="../dist/amphibious.js"></script>
   </body>
   </html>
   ```

6. **Create documentation**:
   ```
   /Users/clivemoore/Documents/GitHub/AIAB/amphibious/docs/NAVIGATION.md
   ```

   Include:
   - Usage instructions
   - HTML structure
   - CSS classes available
   - Responsive behavior
   - Accessibility notes

**Verification**:
```bash
bun run build
# Open examples/navigation.html in browser
# Test responsive behavior
# Verify accessibility with keyboard navigation
```

**Deliverable**: Complete navigation component with example and docs

---

#### Task 2.2: Complete Cards Component

**Steps**:
1. Read original:
   ```
   /Users/clivemoore/Documents/GitHub/A.mphibio.us/src/css/components/cards.css
   ```

2. Update existing placeholder:
   ```
   /Users/clivemoore/Documents/GitHub/AIAB/amphibious/src/css/components/cards.css
   ```

3. **Features to include**:
   - [ ] Basic card structure
   - [ ] Card with header
   - [ ] Card with footer
   - [ ] Card with image
   - [ ] Card variants (if in original)
   - [ ] Card groups/decks (if in original)

4. Use CSS variables for:
   - Border colors
   - Background colors
   - Padding/spacing
   - Border radius
   - Shadow

5. Create example: `examples/cards.html`
6. Create documentation: `docs/CARDS.md`

**Verification**:
```bash
bun run build
# Test all card variants
# Verify responsive behavior
```

**Deliverable**: Complete cards component

---

#### Task 2.3: Complete Alerts Component

**Steps**:
1. Read original:
   ```
   /Users/clivemoore/Documents/GitHub/A.mphibio.us/src/css/components/alerts.css
   ```

2. Update existing placeholder:
   ```
   /Users/clivemoore/Documents/GitHub/AIAB/amphibious/src/css/components/alerts.css
   ```

3. **Alert types to include**:
   - [ ] Success (.alert-success)
   - [ ] Error/Danger (.alert-danger)
   - [ ] Warning (.alert-warning)
   - [ ] Info (.alert-info)
   - [ ] Dismissible alerts (if in original)

4. Use CSS variables for all colors

5. Create example: `examples/alerts.html`
6. Create documentation: `docs/ALERTS.md`

**Verification**:
```bash
bun run build
# Test all alert types
# Verify colors match design system
```

**Deliverable**: Complete alerts component

---

#### Task 2.4: Forms & Input Groups

**Steps**:
1. Read original files:
   ```
   /Users/clivemoore/Documents/GitHub/A.mphibio.us/src/css/forms.css
   /Users/clivemoore/Documents/GitHub/A.mphibio.us/src/css/components/input-groups.css
   ```

2. Update:
   ```
   /Users/clivemoore/Documents/GitHub/AIAB/amphibious/src/css/components/input-groups.css
   ```

3. **Include**:
   - [ ] Basic form styling
   - [ ] Input, textarea, select styling
   - [ ] Input groups (prepend/append)
   - [ ] Form validation states
   - [ ] Button styling (if not in separate file)
   - [ ] Label styling
   - [ ] Fieldset styling

4. Check if there's a separate buttons.css:
   ```
   /Users/clivemoore/Documents/GitHub/A.mphibio.us/src/css/buttons.css
   ```

5. If buttons are separate, create:
   ```
   /Users/clivemoore/Documents/GitHub/AIAB/amphibious/src/css/components/buttons.css
   ```

6. Create example: `examples/forms.html`
7. Create documentation: `docs/FORMS.md`

**Verification**:
```bash
bun run build
# Test all form elements
# Verify validation states
# Test accessibility (labels, focus states)
```

**Deliverable**: Complete forms and input groups

---

#### Task 2.5: Responsive Tables

**Steps**:
1. Read original:
   ```
   /Users/clivemoore/Documents/GitHub/A.mphibio.us/src/css/components/responsive-tables.css
   ```

2. Also check:
   ```
   /Users/clivemoore/Documents/GitHub/A.mphibio.us/src/css/rwd_tables.css
   /Users/clivemoore/Documents/GitHub/A.mphibio.us/src/css/table_styles.css
   ```

3. Consolidate best approaches into:
   ```
   /Users/clivemoore/Documents/GitHub/AIAB/amphibious/src/css/components/responsive-tables.css
   ```

4. **Include**:
   - [ ] Basic table styling
   - [ ] Striped tables
   - [ ] Bordered tables
   - [ ] Hover states
   - [ ] Mobile-responsive behavior (stacking or horizontal scroll)

5. Create example: `examples/tables.html`
6. Create documentation: `docs/TABLES.md`

**Verification**:
```bash
bun run build
# Test tables at all breakpoints
# Verify mobile behavior
```

**Deliverable**: Complete responsive tables

---

### PHASE 3: Advanced Components

Only begin after Phase 2 is complete.

---

#### Task 3.1-3.6: Remaining Components

For each of these components, follow the same pattern as Phase 2:

1. **Breadcrumbs** (`components/breadcrumbs.css`)
2. **Tabs** (`components/tabs.css`)
3. **Pagination** (`components/pagination.css`)
4. **Steps/Wizard** (`components/steps.css`)
5. **Sidebar** (`components/sidebar.css`)

For each:
- Read original file
- Modernize CSS (variables, remove prefixes)
- Create example HTML
- Create documentation
- Verify with `bun run build`

---

### PHASE 4: JavaScript Migration

Only begin after Phase 3 is complete.

---

#### Task 4.1: Identify Required JavaScript

**Steps**:
1. Audit which components need JavaScript:
   - Navigation toggle (mobile menu)
   - Tabs switching
   - Alert dismissal
   - Form validation
   - Smooth scrolling

2. List original jQuery plugins:
   ```
   /Users/clivemoore/Documents/GitHub/A.mphibio.us/src/js/
   ```

3. Prioritize based on necessity

**Deliverable**: List of JavaScript features to migrate

---

#### Task 4.2: Convert jQuery to Vanilla JS

For each identified feature:

1. **Study original jQuery code**
2. **Convert to modern vanilla JavaScript**

Example conversion:
```javascript
// OLD (jQuery)
$('.nav-toggle').on('click', function() {
  $('.nav-menu').slideToggle();
});

// NEW (Vanilla JS in TypeScript)
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

navToggle?.addEventListener('click', () => {
  navMenu?.classList.toggle('is-open');
});
```

3. **Add to appropriate files**:
   - Core utilities: `src/index.ts`
   - Component-specific: `src/js/[component].ts`

4. **Update namespace**:
   ```typescript
   export const amp = {
     // ... existing code ...
     
     navigation: {
       init() {
         // navigation JS
       }
     },
     
     tabs: {
       init() {
         // tabs JS
       }
     }
   };
   ```

**Deliverable**: Working vanilla JS replacements

---

## Testing Protocol

After each task, run this checklist:

```bash
# 1. Lint check
bun run lint

# 2. Type check
bun run typecheck

# 3. Build
bun run build

# 4. Dev server
bun run dev

# 5. Manual testing
# - Test in Chrome
# - Test in Firefox
# - Test in Safari
# - Test on mobile device
# - Test all breakpoints (desktop, tablet, mobile)
# - Test keyboard navigation
# - Test screen reader (basic check)
```

---

## Documentation Standards

For every component migrated, create:

### Example File Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Component Name] - Amphibious Examples</title>
  <link rel="stylesheet" href="../dist/amphibious.css">
</head>
<body>
  <div class="container">
    <h1>[Component Name] Examples</h1>
    
    <!-- Example 1 -->
    <section>
      <h2>Basic Example</h2>
      <!-- Component HTML -->
    </section>
    
    <!-- Example 2 -->
    <section>
      <h2>Variant Example</h2>
      <!-- Component HTML -->
    </section>
  </div>
  
  <script type="module" src="../dist/amphibious.js"></script>
</body>
</html>
```

### Documentation File Template

```markdown
# [Component Name]

## Overview

Brief description of the component and its use cases.

## Basic Usage

### HTML Structure

\`\`\`html
<!-- Basic example -->
\`\`\`

### CSS Classes

| Class | Description |
|-------|-------------|
| `.component` | Base class |
| `.component--modifier` | Variant |
| `.component__element` | Sub-element |

## Variations

### Variant 1

Description and example.

### Variant 2

Description and example.

## Responsive Behavior

How the component adapts at different breakpoints.

## Accessibility

- ARIA attributes needed
- Keyboard interaction
- Screen reader considerations

## Browser Support

Any specific browser considerations.

## Examples

Link to example file.
```

---

## Progress Tracking

After completing each task, update:
```
/Users/clivemoore/Documents/GitHub/AIAB/amphibious/docs/MIGRATION-STATUS.md
```

Change status from ❌ or ⏳ to ✅ for completed items.

---

## Quality Checklist

Before marking any component as "complete":

- [ ] All CSS uses variables (no hardcoded colors/spacing)
- [ ] No vendor prefixes unless absolutely necessary
- [ ] Mobile-first responsive design
- [ ] BEM naming convention followed
- [ ] Example HTML file created
- [ ] Documentation file created
- [ ] Tested at all breakpoints
- [ ] Keyboard accessible
- [ ] No console errors
- [ ] Passes linting (`bun run lint`)
- [ ] Passes type checking (`bun run typecheck`)
- [ ] Production build works (`bun run build`)

---

## Common Issues & Solutions

### Issue: CSS Variables Not Working

**Problem**: `var(--color-primary)` not applying  
**Solution**: 
1. Check `variables.css` is imported first in `main.css`
2. Ensure variable is defined in `:root {}`
3. Check for typos in variable name

### Issue: Import Order

**Problem**: Styles not applying correctly  
**Solution**: Import order in `main.css` must be:
1. normalize.css
2. variables.css
3. typography.css
4. grid.css
5. grid-responsive.css
6. components/*
7. helpers.css
8. print.css

### Issue: Responsive Not Working

**Problem**: Breakpoints not triggering  
**Solution**:
1. Check viewport meta tag in HTML
2. Verify media query syntax
3. Test actual device vs. browser emulation

---

## Emergency Rollback

If migration breaks something:

```bash
# 1. Check what changed
cd /Users/clivemoore/Documents/GitHub/AIAB/amphibious
git diff

# 2. Rollback specific file
git checkout HEAD -- src/css/[filename].css

# 3. Or rollback everything
git reset --hard HEAD
```

---

## Getting Help

If stuck:
1. Check original A.mphibio.us documentation
2. Review `CLAUDE.md` in amphibious directory
3. Check `MIGRATION-GUIDE.md` for patterns
4. Ask user for clarification

---

## Success Criteria

Migration is complete when:

- [ ] All Phase 1 tasks complete
- [ ] All Phase 2 tasks complete
- [ ] All Phase 3 tasks complete
- [ ] All Phase 4 tasks complete
- [ ] All examples work
- [ ] All documentation complete
- [ ] All tests passing
- [ ] Production build successful
- [ ] User approval obtained

---

## Start Here

**Your first task**: Begin with Task 1.1 (Complete normalize.css)

**Command to start**:
```bash
cd /Users/clivemoore/Documents/GitHub/AIAB/amphibious
bun run dev
```

Then open two terminal windows:
1. Keep dev server running
2. Use second terminal for file operations

**Ready? Begin Task 1.1!**
