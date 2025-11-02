# Cards & Alerts Components Documentation

## Overview

The modernized A.mphibio.us framework now includes two new powerful components:

- **Cards**: Flexible, responsive card components with multiple variants and layouts
- **Alerts**: Modern, accessible alert and toast notification system

Both components are built with modern CSS techniques including CSS custom properties, flexbox/grid, and comprehensive accessibility support.

## Installation

### CSS Files
```html
<!-- Include the component CSS files -->
<link rel="stylesheet" href="src/css/components/cards.css">
<link rel="stylesheet" href="src/css/components/alerts.css">
```

### JavaScript (for Alerts)
```html
<!-- Include alerts JavaScript for interactive functionality -->
<script src="src/js/alerts.js"></script>
```

---

## Cards Component

### Basic Usage

```html
<div class="card">
    <div class="card__header">
        <h3 class="card__title">Card Title</h3>
        <p class="card__subtitle">Optional subtitle</p>
    </div>
    <div class="card__body">
        <p class="card__text">Card content goes here.</p>
    </div>
    <div class="card__footer">
        <button class="button">Action</button>
    </div>
</div>
```

### Card Structure

- `.card` - Main card container
- `.card__header` - Optional header section
- `.card__title` - Main title
- `.card__subtitle` - Optional subtitle
- `.card__body` / `.card__content` - Main content area
- `.card__text` - Text content
- `.card__footer` - Optional footer section
- `.card__media` - Images or media
- `.card__actions` - Action buttons container

### Card Variants

#### Shadow Variants
```html
<div class="card card--shadow-none">No shadow</div>
<div class="card card--shadow-sm">Small shadow (default)</div>
<div class="card card--shadow-md">Medium shadow</div>
<div class="card card--shadow-lg">Large shadow</div>
<div class="card card--shadow-xl">Extra large shadow</div>
```

#### Interactive Variants
```html
<div class="card card--hoverable">Subtle hover effects</div>
<div class="card card--interactive">Strong interactive effects</div>
```

#### Border Variants
```html
<div class="card card--borderless">No border</div>
<div class="card card--outlined">Outlined with border</div>
```

#### Size Variants
```html
<div class="card card--compact">Compact padding</div>
<div class="card">Default padding</div>
<div class="card card--spacious">Generous padding</div>
```

### Specialized Card Types

#### Product Cards
```html
<div class="card card--product">
    <img src="product.jpg" alt="Product" class="card__media">
    <div class="card__body">
        <h4 class="card__title">Product Name</h4>
        <div class="card__price">$99.99</div>
        <div class="card__actions">
            <button class="button">Add to Cart</button>
        </div>
    </div>
</div>
```

#### Profile Cards
```html
<div class="card card--profile">
    <div class="card__body">
        <img src="avatar.jpg" alt="Profile" class="card__avatar">
        <h4 class="card__title">John Doe</h4>
        <p class="card__subtitle">Senior Developer</p>
        <p class="card__text">Brief bio...</p>
        <div class="card__actions">
            <button class="button">Connect</button>
        </div>
    </div>
</div>
```

#### Stat Cards
```html
<div class="card card--stat">
    <span class="card__number">1,234</span>
    <span class="card__label">Total Users</span>
</div>
```

### Card Layouts

#### Horizontal Cards
```html
<div class="card card--horizontal">
    <img src="image.jpg" alt="Image" class="card__media">
    <div class="card__content">
        <!-- Card content -->
    </div>
</div>
```

#### Card Grids
```html
<div class="card-grid">
    <!-- Cards will auto-arrange in responsive grid -->
</div>

<!-- Specific grid columns -->
<div class="card-grid card-grid--2">2 column grid</div>
<div class="card-grid card-grid--3">3 column grid</div>
<div class="card-grid card-grid--4">4 column grid</div>
```

### Media Handling
```html
<!-- Responsive images -->
<img src="image.jpg" class="card__media" alt="Image">

<!-- Aspect ratio variants -->
<img src="image.jpg" class="card__media card__media--aspect-video" alt="16:9 ratio">
<img src="image.jpg" class="card__media card__media--aspect-square" alt="1:1 ratio">

<!-- Rounded media with padding -->
<img src="image.jpg" class="card__media card__media--rounded" alt="Rounded image">
```

### Loading States
```html
<div class="card card--loading">
    <!-- Card content with shimmer effect -->
</div>
```

---

## Alerts Component

### Basic Usage

```html
<div class="alert alert--success">
    <svg class="alert__icon" fill="currentColor" viewBox="0 0 20 20">
        <!-- Icon SVG -->
    </svg>
    <div class="alert__content">
        <p class="alert__message">Success message here!</p>
    </div>
</div>
```

### Alert Types

```html
<div class="alert alert--success">Success alert</div>
<div class="alert alert--info">Information alert</div>
<div class="alert alert--warning">Warning alert</div>
<div class="alert alert--error">Error alert</div>
<div class="alert alert--danger">Danger alert (same as error)</div>
```

### Alert Structure

- `.alert` - Main alert container
- `.alert__icon` - Optional icon
- `.alert__content` - Content wrapper
- `.alert__title` - Optional title
- `.alert__message` - Alert message
- `.alert__actions` - Action buttons
- `.alert__dismiss` - Dismiss button

### Alert Variants

#### Style Variants
```html
<div class="alert alert--success">Default style</div>
<div class="alert alert--success alert--solid">Solid background</div>
<div class="alert alert--success alert--outline">Outlined style</div>
<div class="alert alert--success alert--accent">Left border accent</div>
<div class="alert alert--success alert--minimal">Minimal style</div>
```

#### Size Variants
```html
<div class="alert alert--small">Small alert</div>
<div class="alert">Default size</div>
<div class="alert alert--large">Large alert</div>
```

### Dismissible Alerts
```html
<div class="alert alert--info alert--dismissible">
    <div class="alert__content">
        <p class="alert__message">This alert can be dismissed.</p>
    </div>
    <button class="alert__dismiss">
        <svg><!-- Close icon --></svg>
    </button>
</div>
```

### Alerts with Actions
```html
<div class="alert alert--warning">
    <div class="alert__content">
        <h4 class="alert__title">Warning Title</h4>
        <p class="alert__message">Warning message here.</p>
        <div class="alert__actions">
            <button class="alert__action">Primary Action</button>
            <button class="alert__action">Secondary Action</button>
        </div>
    </div>
</div>
```

---

## JavaScript API (Alerts)

### Basic Toast Usage

```javascript
// Simple toasts
alerts.success('Operation completed successfully!');
alerts.error('Something went wrong.');
alerts.warning('Please review this information.');
alerts.info('Here is some useful information.');
```

### Advanced Toast Options

```javascript
// Custom options
alerts.success('Success message', 'Custom Title', {
    duration: 3000,        // Auto-dismiss after 3 seconds
    closeButton: true,     // Show close button
    pauseOnHover: true,    // Pause auto-dismiss on hover
    closeOnClick: false    // Don't close when clicked
});

// Manual toast creation
alerts.toast('info', 'Custom message', 'Title', {
    position: 'bottom-right',
    duration: 0,  // No auto-dismiss
    maxToasts: 3
});
```

### Configuration

```javascript
// Global configuration
alerts.configure({
    position: 'top-right',     // toast position
    duration: 5000,            // default auto-dismiss time
    maxToasts: 5,              // maximum visible toasts
    animations: true,          // enable animations
    pauseOnHover: true,        // pause on hover
    closeOnClick: false,       // close on click
    closeButton: true          // show close button
});
```

### Toast Positions
- `top-right` (default)
- `top-left`
- `top-center`
- `bottom-right`
- `bottom-left`
- `bottom-center`

### Static Alerts

```javascript
// Show static alert
StaticAlerts.show('success', 'Message', 'Title', containerElement);

// Dismiss specific alert
StaticAlerts.dismiss(alertElement);
```

### Event Handling

```javascript
// Clear all toasts
alerts.clearAll();

// Dismiss specific toast
alerts.dismiss(toastElement);

// ESC key automatically clears toasts
```

---

## CSS Custom Properties

### Cards
```css
:root {
  --card-border-radius: 0.5rem;
  --card-shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  --card-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --card-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --card-bg: #ffffff;
  --card-border: rgba(0, 0, 0, 0.1);
  --card-spacing: 1.5rem;
}
```

### Alerts
```css
:root {
  --alert-success-bg: #f0fdf4;
  --alert-success-text: #166534;
  --alert-error-bg: #fef2f2;
  --alert-error-text: #dc2626;
  --alert-border-radius: 0.5rem;
  --alert-padding: 1rem;
}
```

---

## Accessibility Features

### Cards
- Proper semantic HTML structure
- Focus management for interactive cards
- Screen reader friendly content
- High contrast mode support
- Print stylesheet optimization

### Alerts
- ARIA labels and roles
- Keyboard navigation (ESC to dismiss)
- Screen reader announcements
- High contrast mode support
- Reduced motion support
- Proper focus management

---

## Browser Support

- Modern browsers (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
- CSS Grid and Flexbox support required
- CSS Custom Properties support required
- ES6+ JavaScript features used in alerts.js

---

## Migration from Legacy

### Old Alert Classes → New Classes
```css
.error → .alert.alert--error
.attn → .alert.alert--warning
.confirm → .alert.alert--success
.dialog → .alert
```

### Legacy Support
The CSS includes backward compatibility mappings for existing classes.

---

## Examples

See the following example files:
- `examples/cards-demo.html` - Complete card component showcase
- `examples/alerts-demo.html` - Complete alert component showcase

---

## Customization

Both components are highly customizable through CSS custom properties and modifier classes. You can:

1. Override CSS custom properties for global changes
2. Create custom modifier classes for specific use cases
3. Extend the JavaScript API for alerts with custom functionality
4. Use the provided SCSS structure for advanced customization

---

## Performance Considerations

- Components use efficient CSS with minimal reflow/repaint
- JavaScript uses event delegation for optimal performance
- Images in cards should include proper `loading="lazy"` attributes
- Toast notifications are automatically limited to prevent memory issues
