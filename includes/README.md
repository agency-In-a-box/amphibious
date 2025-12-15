# Amphibious Navigation & Footer Includes

## Overview

This directory contains centralized HTML components that should be included across all Amphibious pages to maintain consistency. Any structural changes to navigation or footer only need to be made once in these files.

## Files

- **`navigation.html`** - Main site navigation with dropdowns
- **`footer.html`** - Site footer with links and copyright
- **`page-template.html`** - Example template showing how to use includes

## How It Works

### Structure (HTML)
- All navigation structure is defined in `navigation.html`
- Changes to menu items, links, or hierarchy are made only in this file
- The navigation automatically adapts to mobile with hamburger menu

### Styling (CSS)
- All navigation styles are in `src/css/navigation-standard.css`
- Visual changes (colors, spacing, animations) are CSS-only
- No need to touch HTML for style updates

### Behavior (JavaScript)
- `src/js/navigation-component.js` handles functionality
- Automatically sets active states based on current URL
- Manages mobile toggle and dropdown behaviors

## Usage Methods

### Method 1: Server-Side Includes (SSI)
For Apache/Nginx servers with SSI enabled:

```html
<!--#include virtual="/includes/navigation.html" -->
```

### Method 2: Build Tool (Recommended for Production)
Use a build tool like Vite, Webpack, or Parcel to inject includes during build:

```html
<!-- Will be replaced by build tool -->
<include src="./includes/navigation.html"></include>
```

### Method 3: JavaScript Loader (Development)
For local development without a server:

```html
<div id="navigation-include"></div>
<script>
  fetch('/includes/navigation.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('navigation-include').outerHTML = html;
    });
</script>
```

### Method 4: PHP Include
For PHP servers:

```php
<?php include $_SERVER['DOCUMENT_ROOT'] . '/includes/navigation.html'; ?>
```

## Making Changes

### To Change Menu Structure
1. Edit `includes/navigation.html`
2. Add/remove/modify menu items
3. Changes apply to all pages immediately

### To Change Navigation Style
1. Edit `src/css/navigation-standard.css`
2. Modify colors, spacing, animations, etc.
3. CSS changes apply globally

### To Change Navigation Behavior
1. Edit `src/js/navigation-component.js`
2. Modify dropdown logic, mobile behavior, etc.
3. JavaScript changes apply globally

## Active State Management

The navigation automatically highlights the current page:

1. Compares current URL with menu links
2. Adds `.active` class to matching items
3. Sets `aria-current="page"` for accessibility
4. Works with both top-level and dropdown items

## Mobile Navigation

- Hamburger menu appears at 768px breakpoint
- Dropdowns become toggleable accordions on mobile
- Touch-friendly tap targets
- Smooth animations

## Footer

The footer follows the same include pattern:

```html
<!-- Static include -->
<!--#include virtual="/includes/footer.html" -->

<!-- Or dynamic -->
<div id="footer-include"></div>
```

## Benefits

✅ **Single Source of Truth** - One navigation file for entire site
✅ **Consistency** - Same navigation on every page
✅ **Maintainability** - Update once, applies everywhere
✅ **Separation of Concerns** - Structure (HTML), Style (CSS), Behavior (JS) are separate
✅ **Performance** - Can be cached by browser
✅ **Accessibility** - Consistent ARIA labels and keyboard navigation

## Example Implementation

See `page-template.html` for a complete example of how to implement navigation and footer includes in your pages.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers

## Notes

- Always test navigation changes across all breakpoints
- Ensure accessibility with keyboard navigation
- Keep menu depth reasonable (max 3 levels recommended)
- Use semantic HTML for better SEO and accessibility