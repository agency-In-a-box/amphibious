# Amphibious 2.0 - Site Map & Navigation Structure

## 🗺️ Complete Site Map

### Homepage
- **/** - Main landing page with hero, features, and component previews
  - Hero section with statistics
  - Key features showcase
  - Grid system demonstration
  - Component library preview
  - Getting started guide
  - Footer with links

### 📚 Documentation (/docs/)

#### Getting Started
- **/docs/** - Documentation home/overview
- **/docs/getting-started.html** - Installation, setup, quick start guide
- **/docs/migration-guide.html** - Migrating from A.mphibio.us v1

#### Core Systems
- **/docs/grid-system.html** ✅ - 16-column grid documentation
- **/docs/typography.html** - Typography and text styles
- **/docs/variables.html** - CSS variables and theming
- **/docs/utilities.html** - Helper classes and utilities

#### Components
- **/docs/components/** - Component documentation index
- **/docs/components/icons.html** - Icon system documentation
- **/docs/components/tooltips.html** - Tooltip system documentation
- **/docs/components/modals.html** - Modal system documentation
- **/docs/components/navigation.html** - Navigation components
- **/docs/components/forms.html** - Form components and validation
- **/docs/components/cards.html** - Card components
- **/docs/components/alerts.html** - Alert and notification components
- **/docs/components/buttons.html** - Button styles and variants
- **/docs/components/tables.html** - Table components

#### Advanced
- **/docs/api-reference.html** - JavaScript API documentation
- **/docs/typescript.html** - TypeScript interfaces and types
- **/docs/performance.html** - Performance optimization guide
- **/docs/accessibility.html** - Accessibility guidelines

### 🎨 Examples (/examples/)

#### Component Showcases
- **/examples/** - Examples index page
- **/examples/icons-enhanced.html** ✅ - Interactive icon gallery
- **/examples/tooltip-enhanced.html** ✅ - Tooltip demonstrations
- **/examples/modal-enhanced.html** ✅ - Modal system showcase
- **/examples/navigation.html** - Navigation patterns
- **/examples/forms.html** - Form examples
- **/examples/cards.html** - Card layouts
- **/examples/alerts.html** - Alert variations

#### E-commerce Templates
- **/examples/e-commerce-catalog.html** ✅ - Product catalog page
- **/examples/e-commerce-product.html** ✅ - Product detail page
- **/examples/e-commerce-cart.html** - Shopping cart
- **/examples/e-commerce-checkout.html** - Checkout flow
- **/examples/e-commerce-account.html** - User account dashboard
- **/examples/e-commerce-wishlist.html** - Wishlist page

#### Layout Templates
- **/examples/layouts/blog.html** - Blog layout
- **/examples/layouts/dashboard.html** - Admin dashboard
- **/examples/layouts/landing.html** - Landing page
- **/examples/layouts/portfolio.html** - Portfolio gallery
- **/examples/layouts/pricing.html** - Pricing tables

### 🎮 Interactive (/playground/)
- **/playground/** - Interactive playground index
- **/playground/grid-builder.html** - Visual grid builder
- **/playground/theme-editor.html** - Theme customization tool
- **/playground/icon-finder.html** - Icon search and copy tool
- **/playground/component-builder.html** - Component configuration tool

### 📊 Showcase (/showcase/)
- **/showcase/** - Real-world implementations
- **/showcase/case-studies.html** - Case studies
- **/showcase/performance.html** - Performance benchmarks
- **/showcase/browser-support.html** - Compatibility matrix

---

## 🧭 Navigation Structure

### Primary Navigation (Top Bar)
```
Logo | Documentation | Components | Examples | Playground | Showcase | GitHub
```

### Secondary Navigation (Documentation Sidebar)
```
Getting Started
├── Installation
├── Quick Start
└── Migration Guide

Foundation
├── Grid System
├── Typography
├── Variables
└── Utilities

Components
├── Icons
├── Tooltips
├── Modals
├── Navigation
├── Forms
├── Cards
├── Alerts
├── Buttons
└── Tables

Advanced
├── API Reference
├── TypeScript
├── Performance
└── Accessibility
```

### Footer Structure
```
Product              Resources           Community          Company
├── Features        ├── Documentation   ├── GitHub        ├── About
├── Pricing         ├── Examples        ├── Discord       ├── Blog
├── Showcase        ├── API Reference   ├── Twitter       ├── Careers
└── Roadmap         └── Support         └── Forum         └── Contact

Newsletter Signup | Social Links | Copyright
```

---

## 🎯 Navigation Component Requirements

### Global Navigation Bar
- **Sticky positioning** on scroll
- **Responsive menu** for mobile (hamburger)
- **Search functionality** with instant results
- **Version selector** (v2.0, v1.x)
- **Theme toggle** (light/dark mode)
- **GitHub stars** counter

### Sidebar Navigation (Docs)
- **Collapsible sections**
- **Active page highlighting**
- **Breadcrumb trail**
- **Search within docs**
- **Previous/Next page links**

### Footer Component
- **4-column layout** on desktop
- **Newsletter signup** with validation
- **Social media links** with icons
- **Quick links** to important pages
- **Language selector** (future)
- **Back to top** button

---

## 🔗 Call-to-Action Zones

### Primary CTAs
1. **Get Started** - Installation and setup
2. **View Examples** - Live demonstrations
3. **Download** - Get the framework
4. **GitHub** - View source code

### Secondary CTAs
1. **Join Newsletter** - Updates and tips
2. **Star on GitHub** - Support the project
3. **View Showcase** - See implementations
4. **Read Docs** - Complete documentation

### Contextual CTAs
- **Try in Playground** - On component pages
- **Copy Code** - On example snippets
- **View Source** - On demonstrations
- **Report Issue** - On documentation pages

---

## 📱 Mobile Navigation

### Mobile Menu Structure
```
☰ Menu
├── Home
├── Documentation ▼
│   ├── Getting Started
│   ├── Components
│   └── API Reference
├── Examples ▼
│   ├── Components
│   ├── E-commerce
│   └── Layouts
├── Playground
└── GitHub
```

### Mobile-Specific Features
- **Swipe gestures** for navigation
- **Bottom navigation bar** for key sections
- **Floating action button** for quick actions
- **Progressive disclosure** for complex menus

---

## 🔍 SEO & Metadata

### Page Naming Convention
- Documentation: `{component} - Documentation | Amphibious 2.0`
- Examples: `{example} Example - Amphibious 2.0`
- Guides: `{topic} Guide - Amphibious 2.0`

### URL Structure
- Semantic URLs: `/docs/components/modals`
- No file extensions in URLs (handled by server)
- Lowercase, hyphenated naming
- Redirects from v1 URLs

### Meta Tags
- Unique descriptions per page
- Open Graph tags for social sharing
- Structured data for documentation
- Canonical URLs for all pages

---

## 🚀 Implementation Priority

### Phase 1: Core Navigation
1. ✅ Create site map structure
2. Build global navigation component
3. Build footer component
4. Implement mobile menu

### Phase 2: Documentation Navigation
1. Create sidebar navigation
2. Add breadcrumbs
3. Implement search
4. Add previous/next links

### Phase 3: Enhanced Features
1. Add theme toggle
2. Implement version selector
3. Add language selector
4. Create floating CTAs

### Phase 4: Polish
1. Add animations/transitions
2. Implement keyboard navigation
3. Add analytics tracking
4. Optimize for performance

---

## 📋 Navigation Component Specification

### HTML Structure
```html
<!-- Global Navigation -->
<nav class="amp-nav" role="navigation" aria-label="Main">
  <div class="container">
    <div class="amp-nav__brand">
      <a href="/" class="amp-nav__logo">
        <span class="amp-nav__icon">🐸</span>
        <span class="amp-nav__text">Amphibious 2.0</span>
      </a>
    </div>

    <ul class="amp-nav__menu">
      <li class="amp-nav__item">
        <a href="/docs/" class="amp-nav__link">Documentation</a>
      </li>
      <!-- More items -->
    </ul>

    <div class="amp-nav__actions">
      <button class="amp-nav__search" aria-label="Search">
        <i data-lucide="search"></i>
      </button>
      <button class="amp-nav__theme" aria-label="Toggle theme">
        <i data-lucide="moon"></i>
      </button>
      <a href="https://github.com" class="amp-nav__github">
        <i data-lucide="github"></i>
        <span class="amp-nav__stars">1.2k</span>
      </a>
    </div>

    <button class="amp-nav__toggle" aria-label="Menu">
      <span></span>
      <span></span>
      <span></span>
    </button>
  </div>
</nav>

<!-- Footer -->
<footer class="amp-footer" role="contentinfo">
  <div class="container">
    <div class="row">
      <div class="col-4">
        <h4>Product</h4>
        <ul class="amp-footer__links">
          <!-- Links -->
        </ul>
      </div>
      <!-- More columns -->
    </div>

    <div class="amp-footer__bottom">
      <p>&copy; 2024 Amphibious. Built with ❤️ by the community.</p>
      <div class="amp-footer__social">
        <!-- Social links -->
      </div>
    </div>
  </div>
</footer>
```

### CSS Classes
- `.amp-nav` - Main navigation wrapper
- `.amp-nav--sticky` - Sticky on scroll
- `.amp-nav--transparent` - Transparent background
- `.amp-nav__menu--open` - Mobile menu open state
- `.amp-footer` - Footer wrapper
- `.amp-footer--minimal` - Minimal footer variant

### JavaScript API
```javascript
// Navigation component
const nav = amp.createNavigation({
  sticky: true,
  transparent: false,
  breakpoint: 768,
  onToggle: (isOpen) => console.log('Menu:', isOpen)
});

// Footer component
const footer = amp.createFooter({
  newsletter: true,
  social: ['twitter', 'github', 'discord'],
  backToTop: true
});
```

---

This comprehensive sitemap and navigation structure provides a complete blueprint for building out the Amphibious 2.0 documentation site with consistent navigation and user-friendly organization.