# Modern SaaS Theme

A clean, minimal landing page theme inspired by modern SaaS websites like HeroHire.ai.

## Design Characteristics

- **Soft blue primary color** with light gray backgrounds
- **Generous whitespace** and clean typography  
- **Subtle shadows** and rounded corners
- **Pill-shaped badges** and buttons
- **Modern, professional** aesthetic

## Quick Start

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Google Fonts - Inter -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- Amphibious Core -->
  <link rel="stylesheet" href="/src/css/main-atomic.css">
  
  <!-- Modern SaaS Theme -->
  <link rel="stylesheet" href="/examples/themes/modern-saas/theme.css">
</head>
<body>
  <!-- Your content -->
</body>
</html>
```

## Components

### Navigation
```html
<nav class="saas-nav">
  <div class="saas-container">
    <div class="saas-nav__inner">
      <a href="/" class="saas-nav__logo">Logo</a>
      <ul class="saas-nav__links">
        <li><a href="#" class="saas-nav__link">Link</a></li>
      </ul>
      <div class="saas-nav__actions">
        <a href="#" class="saas-btn saas-btn--primary">CTA</a>
      </div>
    </div>
  </div>
</nav>
```

### Hero Section
```html
<section class="saas-hero">
  <div class="saas-container">
    <span class="saas-hero__badge">Badge text</span>
    <h1 class="saas-hero__title">
      Main headline<br>
      <span class="saas-hero__title-accent">Accent text</span>
    </h1>
    <p class="saas-hero__subtitle">Subtitle description</p>
    <div class="saas-hero__actions">
      <a href="#" class="saas-btn saas-btn--primary saas-btn--lg">Primary CTA</a>
      <a href="#" class="saas-btn saas-btn--secondary saas-btn--lg">Secondary CTA</a>
    </div>
  </div>
</section>
```

### Feature Cards
```html
<div class="saas-features">
  <article class="saas-feature-card">
    <div class="saas-feature-card__icon">
      <!-- Icon SVG -->
    </div>
    <h3 class="saas-feature-card__title">Feature Title</h3>
    <p class="saas-feature-card__description">Feature description</p>
  </article>
</div>
```

### Testimonials
```html
<div class="saas-testimonials">
  <article class="saas-testimonial">
    <p class="saas-testimonial__quote">Quote text"</p>
    <footer class="saas-testimonial__author">
      <div class="saas-testimonial__avatar">AB</div>
      <div class="saas-testimonial__info">
        <span class="saas-testimonial__name">Name</span>
        <span class="saas-testimonial__role">Role</span>
      </div>
    </footer>
  </article>
</div>
```

### CTA Section
```html
<div class="saas-cta">
  <h2 class="saas-cta__title">Ready to start?</h2>
  <p class="saas-cta__subtitle">Subtitle text</p>
  <div class="saas-cta__actions">
    <a href="#" class="saas-btn saas-btn--primary saas-btn--lg">CTA</a>
  </div>
</div>
```

### Buttons
```html
<a href="#" class="saas-btn saas-btn--primary">Primary</a>
<a href="#" class="saas-btn saas-btn--secondary">Secondary</a>
<a href="#" class="saas-btn saas-btn--ghost">Ghost</a>

<!-- Sizes -->
<a href="#" class="saas-btn saas-btn--primary saas-btn--sm">Small</a>
<a href="#" class="saas-btn saas-btn--primary saas-btn--lg">Large</a>
```

### Sections
```html
<section class="saas-section">...</section>
<section class="saas-section saas-section--subtle">...</section>
<section class="saas-section saas-section--lg">...</section>
```

## Color Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--color-primary` | `#3b82f6` | Primary blue |
| `--color-primary-hover` | `#2563eb` | Primary hover |
| `--color-background` | `#ffffff` | Page background |
| `--color-background-subtle` | `#f8fafc` | Subtle sections |
| `--color-text` | `#1e293b` | Body text |
| `--color-heading` | `#0f172a` | Heading text |

## Customization

Override CSS variables to customize:

```css
:root {
  --color-primary: #your-brand-color;
  --color-primary-hover: #your-hover-color;
  --font-family-base: 'Your Font', sans-serif;
}
```

## Files

- `theme.css` - Theme styles
- `index.html` - Full landing page example

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
