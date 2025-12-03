# Navigation Components Documentation

## Overview

The A.mphibio.us navigation system provides a comprehensive set of modern, accessible navigation components built with contemporary CSS techniques and vanilla JavaScript. All components follow WCAG 2.1 guidelines and implement proper ARIA attributes for screen reader compatibility.

## Components Included

### 1. Primary Navigation (`navigation.css`)
### 2. Breadcrumbs (`breadcrumbs.css`)
### 3. Tabs (`tabs.css`)  
### 4. Pagination (`pagination.css`)
### 5. Step Navigation (`steps.css`)
### 6. JavaScript Controller (`navigation.js`)

---

## 🧭 Primary Navigation

### Basic Usage

```html
<nav class="nav" role="navigation" aria-label="Main navigation">
  <div class="nav__container">
    <a href="#" class="nav__brand">Brand</a>
    <ul class="nav__menu">
      <li class="nav__item">
        <a href="#" class="nav__link nav__link--active" aria-current="page">Home</a>
      </li>
      <li class="nav__item">
        <a href="#" class="nav__link">About</a>
      </li>
    </ul>
    <button class="nav__toggle" aria-label="Toggle navigation">
      <span class="nav__toggle-icon"></span>
    </button>
  </div>
</nav>
```

### Features

- **Responsive Design**: Mobile-first with hamburger menu
- **Dropdown Menus**: Multi-level dropdown support
- **Mega Menus**: Complex dropdown layouts
- **Keyboard Navigation**: Full arrow key support
- **Touch Friendly**: 44px minimum touch targets
- **Sticky Navigation**: Optional sticky positioning

### Dropdown Menu

```html
<li class="nav__item nav__item--dropdown">
  <a href="#" class="nav__link">Products</a>
  <ul class="nav__dropdown">
    <li class="nav__dropdown-item">
      <a href="#" class="nav__dropdown-link">Web Design</a>
    </li>
    <li class="nav__dropdown-item">
      <a href="#" class="nav__dropdown-link">Mobile Apps</a>
    </li>
  </ul>
</li>
```

### Mega Menu

```html
<li class="nav__item nav__item--mega">
  <a href="#" class="nav__link">Solutions</a>
  <div class="nav__mega-menu">
    <div class="nav__mega-grid">
      <ul class="nav__mega-section">
        <li class="nav__mega-title">Category</li>
        <li><a href="#" class="nav__mega-link">Item 1</a></li>
        <li><a href="#" class="nav__mega-link">Item 2</a></li>
      </ul>
    </div>
  </div>
</li>
```

### CSS Custom Properties

```css
:root {
  --nav-bg: #ffffff;
  --nav-text: #374151;
  --nav-text-active: #3b82f6;
  --nav-height: 4rem;
  --nav-padding-x: 1.5rem;
}
```

---

## 🏠 Breadcrumbs

### Basic Usage

```html
<nav aria-label="Breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb__item">
      <a href="#" class="breadcrumb__link">Home</a>
    </li>
    <li class="breadcrumb__item">
      <a href="#" class="breadcrumb__link">Products</a>
    </li>
    <li class="breadcrumb__item">
      <span class="breadcrumb__current" aria-current="page">Current Page</span>
    </li>
  </ol>
</nav>
```

### Variants

- `breadcrumb--compact`: Smaller spacing
- `breadcrumb--large`: Larger spacing  
- `breadcrumb--boxed`: Background container
- `breadcrumb--arrow`: Arrow separators
- `breadcrumb--chevron`: Chevron separators

### With Icons

```html
<li class="breadcrumb__item">
  <a href="#" class="breadcrumb__link breadcrumb__home">
    <svg class="breadcrumb__icon" fill="currentColor" viewBox="0 0 20 20">
      <!-- Home icon -->
    </svg>
    Home
  </a>
</li>
```

---

## 📑 Tabs

### Basic Usage

```html
<div class="tabs">
  <ul class="tabs__list" role="tablist">
    <li class="tabs__item">
      <button class="tabs__button" role="tab" aria-selected="true">Tab 1</button>
    </li>
    <li class="tabs__item">
      <button class="tabs__button" role="tab" aria-selected="false">Tab 2</button>
    </li>
  </ul>
  <div class="tabs__panels">
    <div class="tabs__panel" role="tabpanel" aria-hidden="false">Content 1</div>
    <div class="tabs__panel" role="tabpanel" aria-hidden="true">Content 2</div>
  </div>
</div>
```

### Variants

- `tabs--underlined`: Default underline style
- `tabs--boxed`: Boxed background style
- `tabs--pills`: Pill-shaped tabs
- `tabs--vertical`: Vertical orientation
- `tabs--bordered`: Bordered tabs

### With Icons and Badges

```html
<button class="tabs__button tabs__button--icon" role="tab">
  <svg class="tabs__icon" fill="currentColor" viewBox="0 0 20 20">
    <!-- Icon -->
  </svg>
  Messages
  <span class="tabs__badge">3</span>
</button>
```

### JavaScript API

```javascript
const tabs = new Tabs(document.querySelector('.tabs'), {
  keyboard: true,
  activeClass: 'is-active'
});

// Methods
tabs.activateTab(2); // Activate tab by index
tabs.next(); // Go to next tab
tabs.previous(); // Go to previous tab
tabs.getActiveTab(); // Get current active tab index
```

---

## 📄 Pagination

### Basic Usage

```html
<nav aria-label="Pagination" class="pagination">
  <a href="#" class="pagination__link pagination__link--prev">Previous</a>
  <a href="#" class="pagination__link">1</a>
  <span class="pagination__current">2</span>
  <a href="#" class="pagination__link">3</a>
  <a href="#" class="pagination__link pagination__link--next">Next</a>
</nav>
```

### Full Pagination Container

```html
<div class="pagination-container">
  <div class="pagination-container__left">
    <div class="pagination__info">
      Showing <span class="pagination__info-highlight">1-20</span> 
      of <span class="pagination__info-highlight">200</span> results
    </div>
  </div>
  <div class="pagination-container__center">
    <!-- Pagination component -->
  </div>
  <div class="pagination-container__right">
    <div class="pagination__page-size">
      <label for="page-size">Show:</label>
      <select class="pagination__page-size-select">
        <option value="10">10</option>
        <option value="20">20</option>
      </select>
    </div>
  </div>
</div>
```

### Variants

- `pagination--simple`: Previous/Next only
- `pagination--compact`: Smaller sizing
- `pagination--large`: Larger sizing
- `pagination--pills`: Pill-shaped buttons
- `pagination--rounded`: Circular buttons

### JavaScript API

```javascript
const pagination = new Pagination(document.querySelector('.pagination'), {
  totalPages: 10,
  currentPage: 1,
  onPageChange: (page) => console.log('Page:', page),
  onPageSizeChange: (size) => console.log('Size:', size)
});

// Methods
pagination.goToPage(5);
pagination.updateTotalPages(15);
pagination.getCurrentPage();
```

---

## 📊 Step Navigation

### Basic Usage

```html
<ol class="steps">
  <li class="steps__item steps__item--complete">
    <div class="steps__circle">
      <span class="steps__number">1</span>
    </div>
    <div class="steps__content">
      <div class="steps__title">Step 1</div>
      <div class="steps__description">First step description</div>
    </div>
  </li>
  <li class="steps__item steps__item--active">
    <div class="steps__circle">
      <span class="steps__number">2</span>
    </div>
    <div class="steps__content">
      <div class="steps__title">Step 2</div>
      <div class="steps__description">Second step description</div>
    </div>
  </li>
</ol>
```

### Variants

- `steps--vertical`: Vertical layout
- `steps--compact`: Smaller spacing
- `steps--large`: Larger sizing
- `steps--minimal`: Numbers only
- `steps--dots`: Dot indicators
- `steps--interactive`: Clickable steps

### JavaScript API

```javascript
const steps = new Steps(document.querySelector('.steps'), {
  currentStep: 0,
  allowClick: true,
  validateStep: (step) => true,
  onStepChange: (step) => console.log('Step:', step)
});

// Methods
steps.nextStep();
steps.previousStep();
steps.goToStep(2);
steps.completeStep(1);
steps.markStepAsError(1);
```

---

## 🎨 Theming and Customization

### CSS Custom Properties

All components use CSS custom properties for easy theming:

```css
:root {
  /* Navigation */
  --nav-bg: #ffffff;
  --nav-text: #374151;
  --nav-text-active: #3b82f6;
  
  /* Breadcrumbs */
  --breadcrumb-text: #6b7280;
  --breadcrumb-separator: #9ca3af;
  
  /* Tabs */
  --tab-border-active: #3b82f6;
  --tab-text-active: #1f2937;
  
  /* Pagination */
  --pagination-active-bg: #3b82f6;
  --pagination-active-text: #ffffff;
  
  /* Steps */
  --step-bg-active: #3b82f6;
  --step-bg-complete: #10b981;
}
```

### Dark Mode

Dark mode is automatically supported via `prefers-color-scheme`:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --nav-bg: #1f2937;
    --nav-text: #d1d5db;
    /* Additional dark mode variables */
  }
}
```

---

## ♿ Accessibility Features

### Navigation
- Proper ARIA attributes (`aria-expanded`, `aria-current`)
- Keyboard navigation (Tab, Enter, Space, Arrow keys)
- Focus management and trap
- Skip-to-content links

### Tabs
- `role="tablist"`, `role="tab"`, `role="tabpanel"`
- `aria-selected`, `aria-controls`, `aria-labelledby`
- Keyboard navigation (Arrow keys, Home, End)

### Pagination
- Descriptive `aria-label` attributes
- Disabled state communication
- Page information for screen readers

### Steps
- Optional `role="tab"` for interactive steps
- `aria-selected` for current step
- Clear step progress indication

---

## 📱 Responsive Design

### Breakpoints
- Mobile: `< 640px`
- Tablet: `640px - 768px`
- Desktop: `> 768px`

### Mobile Optimizations
- Touch-friendly targets (44px minimum)
- Swipe gestures where appropriate
- Collapsed navigation patterns
- Scrollable tabs
- Stacked layouts

---

## 🚀 Performance Considerations

### CSS
- Efficient selectors
- Minimal reflow/repaint
- Hardware-accelerated animations
- Container queries for component-scoped responsive design

### JavaScript
- Event delegation
- Debounced resize handlers
- Lazy initialization
- Memory leak prevention

---

## 🔧 Browser Support

- **Modern browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **CSS Features**: Custom properties, Flexbox, Grid
- **JavaScript**: ES6+ features
- **Accessibility**: Full WCAG 2.1 AA compliance

---

## 📦 Installation and Setup

### CSS Files
```html
<link rel="stylesheet" href="src/css/components/navigation.css">
<link rel="stylesheet" href="src/css/components/breadcrumbs.css">
<link rel="stylesheet" href="src/css/components/tabs.css">
<link rel="stylesheet" href="src/css/components/pagination.css">
<link rel="stylesheet" href="src/css/components/steps.css">
```

### JavaScript
```html
<script src="src/js/navigation.js"></script>
```

### Auto-initialization
Components initialize automatically when the DOM is ready:

```javascript
// Manual initialization
const nav = new Navigation(document.querySelector('.nav'));
const tabs = new Tabs(document.querySelector('.tabs'));
const pagination = new Pagination(document.querySelector('.pagination'));
const steps = new Steps(document.querySelector('.steps'));
```

---

## 🧪 Testing

### Accessibility Testing
- Use automated tools (axe-core, WAVE)
- Manual keyboard navigation testing
- Screen reader testing (NVDA, VoiceOver)

### Browser Testing
- Cross-browser compatibility testing
- Mobile device testing
- Performance testing with Lighthouse

### Example Test
```javascript
// Test keyboard navigation
const tab = document.querySelector('.tabs__button');
tab.focus();
// Press Arrow Right
tab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
// Verify next tab is focused
```

---

## 🔄 Migration from Legacy

### Old Classes → New Classes
```css
/* Old navigation.css */
.horizontal → .nav__menu
.vertical → .nav--vertical
.breadcrumb li:after → .breadcrumb__item:not(:last-child)::after

/* Old tabs.css */
ul.tabs → .tabs__list
ul.tabs li a → .tabs__button
ul.tabs-content → .tabs__panels
```

### JavaScript Migration
```javascript
// Old: Manual tab switching
$('.tab').click(function() { /* manual code */ });

// New: Component-based
const tabs = new Tabs(element, options);
tabs.on('tabChanged', handler);
```

---

## 📋 Best Practices

### HTML Structure
- Use semantic HTML elements (`nav`, `ol`, `button`)
- Include proper ARIA attributes
- Provide descriptive labels and alt text

### CSS
- Leverage CSS custom properties for theming
- Use relative units for scalability
- Follow BEM naming convention

### JavaScript
- Initialize components after DOM ready
- Handle edge cases (missing elements)
- Provide fallbacks for older browsers

### Performance
- Minimize DOM queries
- Use event delegation
- Implement lazy loading where appropriate

---

## 🐛 Troubleshooting

### Common Issues

**Navigation not opening on mobile**
- Check if `nav__toggle` and `nav__mobile` elements exist
- Verify JavaScript is loaded after DOM

**Tabs not switching**
- Ensure `role="tab"` and `aria-selected` are set
- Check if JavaScript initialized correctly

**Dropdown not positioning correctly**
- Verify parent has `position: relative`
- Check for CSS conflicts with z-index

**Keyboard navigation not working**
- Confirm `tabindex` attributes are set
- Check event listener attachment

---

## 🔮 Future Enhancements

- Container queries for better responsive behavior
- CSS anchor positioning for dropdown alignment
- Web Components version
- React/Vue integration packages
- Additional animation options
- RTL language support improvements

---

## 📞 Support

For questions, issues, or contributions:

- Check the example files in `/examples/`
- Review the source code in `/src/css/components/`
- Test with the provided demo files
- Follow accessibility guidelines in implementation

The navigation system is designed to be production-ready while maintaining flexibility for customization and extension.
