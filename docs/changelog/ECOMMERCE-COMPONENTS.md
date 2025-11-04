# E-Commerce Components Roadmap for Amphibious 2.0

**Created**: November 2, 2025
**Priority**: HIGH
**Target**: Version 2.1

## Overview

This document outlines the essential e-commerce components needed for Amphibious 2.0 to support modern online shopping experiences.

## 🛒 Core E-Commerce Components

### 1. Product Display Components

#### Product Card
```html
<div class="product-card">
  <div class="product-card__image">
    <img src="..." alt="Product">
    <span class="product-badge product-badge--sale">-20%</span>
  </div>
  <div class="product-card__content">
    <h3 class="product-card__title">Product Name</h3>
    <div class="product-rating" data-rating="4.5">★★★★☆</div>
    <div class="product-price">
      <span class="product-price__current">$79.99</span>
      <span class="product-price__original">$99.99</span>
    </div>
    <button class="btn btn--primary">Add to Cart</button>
  </div>
</div>
```

**Features Needed:**
- Image lazy loading
- Quick view modal trigger
- Wishlist toggle
- Rating display
- Price with discount
- Stock status indicator
- Add to cart with quantity

#### Product Gallery
```html
<div class="product-gallery">
  <div class="product-gallery__main">
    <img src="..." data-zoom="true">
  </div>
  <div class="product-gallery__thumbs">
    <img src="thumb1.jpg" data-full="full1.jpg">
    <img src="thumb2.jpg" data-full="full2.jpg">
  </div>
</div>
```

**Features Needed:**
- Image zoom on hover/click
- Thumbnail navigation
- Swipe support for mobile
- Video support
- 360° view capability

### 2. Shopping Cart Components

#### Mini Cart (Dropdown/Sidebar)
```html
<div class="mini-cart">
  <div class="mini-cart__header">
    <h3>Shopping Cart (3)</h3>
    <button class="mini-cart__close">×</button>
  </div>
  <div class="mini-cart__items">
    <div class="cart-item">
      <img src="..." class="cart-item__image">
      <div class="cart-item__details">
        <h4>Product Name</h4>
        <span class="cart-item__price">$79.99</span>
        <div class="quantity-selector">
          <button>-</button>
          <input type="number" value="1">
          <button>+</button>
        </div>
      </div>
      <button class="cart-item__remove">×</button>
    </div>
  </div>
  <div class="mini-cart__footer">
    <div class="cart-total">
      <span>Total:</span>
      <strong>$239.97</strong>
    </div>
    <button class="btn btn--primary btn--block">Checkout</button>
  </div>
</div>
```

#### Quantity Selector
```html
<div class="quantity-selector">
  <button class="quantity-selector__minus" aria-label="Decrease">-</button>
  <input type="number" class="quantity-selector__input" value="1" min="1" max="99">
  <button class="quantity-selector__plus" aria-label="Increase">+</button>
</div>
```

### 3. Product Filtering & Search

#### Filter Sidebar
```html
<aside class="product-filters">
  <div class="filter-group">
    <h3 class="filter-group__title">Category</h3>
    <div class="filter-group__content">
      <label class="filter-checkbox">
        <input type="checkbox">
        <span>Electronics</span>
        <span class="filter-count">(124)</span>
      </label>
    </div>
  </div>

  <div class="filter-group">
    <h3 class="filter-group__title">Price Range</h3>
    <div class="price-range">
      <input type="range" min="0" max="1000" class="price-range__slider">
      <div class="price-range__values">
        <span>$0</span> - <span>$1000</span>
      </div>
    </div>
  </div>

  <div class="filter-group">
    <h3 class="filter-group__title">Rating</h3>
    <div class="rating-filter">
      <button class="rating-stars" data-rating="4">★★★★☆ & up</button>
    </div>
  </div>
</aside>
```

#### Product Grid Controls
```html
<div class="product-controls">
  <div class="product-controls__view">
    <button class="view-toggle view-toggle--grid active" aria-label="Grid view">⊞</button>
    <button class="view-toggle view-toggle--list" aria-label="List view">☰</button>
  </div>
  <div class="product-controls__sort">
    <select class="sort-select">
      <option>Featured</option>
      <option>Price: Low to High</option>
      <option>Price: High to Low</option>
      <option>Customer Rating</option>
      <option>Newest</option>
    </select>
  </div>
  <div class="product-controls__count">
    Showing 1-12 of 124 results
  </div>
</div>
```

### 4. Checkout Components

#### Checkout Steps
```html
<div class="checkout-steps">
  <div class="checkout-step checkout-step--completed">
    <span class="checkout-step__number">1</span>
    <span class="checkout-step__label">Cart</span>
  </div>
  <div class="checkout-step checkout-step--active">
    <span class="checkout-step__number">2</span>
    <span class="checkout-step__label">Shipping</span>
  </div>
  <div class="checkout-step">
    <span class="checkout-step__number">3</span>
    <span class="checkout-step__label">Payment</span>
  </div>
  <div class="checkout-step">
    <span class="checkout-step__number">4</span>
    <span class="checkout-step__label">Confirm</span>
  </div>
</div>
```

#### Order Summary
```html
<div class="order-summary">
  <h3 class="order-summary__title">Order Summary</h3>
  <div class="order-summary__items">
    <!-- Order items -->
  </div>
  <div class="order-summary__totals">
    <div class="order-line">
      <span>Subtotal:</span>
      <span>$239.97</span>
    </div>
    <div class="order-line">
      <span>Shipping:</span>
      <span>$9.99</span>
    </div>
    <div class="order-line">
      <span>Tax:</span>
      <span>$24.00</span>
    </div>
    <div class="order-line order-line--coupon">
      <input type="text" placeholder="Coupon code">
      <button>Apply</button>
    </div>
    <div class="order-line order-line--total">
      <strong>Total:</strong>
      <strong>$273.96</strong>
    </div>
  </div>
</div>
```

### 5. User Account Components

#### Wishlist
```html
<button class="wishlist-toggle" aria-label="Add to wishlist">
  <svg class="wishlist-icon">♡</svg>
</button>
```

#### Product Comparison
```html
<div class="comparison-table">
  <table class="table table--comparison">
    <thead>
      <tr>
        <th>Feature</th>
        <th>Product A</th>
        <th>Product B</th>
        <th>Product C</th>
      </tr>
    </thead>
    <tbody>
      <!-- Comparison rows -->
    </tbody>
  </table>
</div>
```

### 6. Supporting Components

#### Product Badge System
```css
.product-badge {
  --badge-bg: var(--color-primary);
  --badge-color: white;
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: var(--badge-bg);
  color: var(--badge-color);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
}

.product-badge--sale { --badge-bg: var(--color-danger); }
.product-badge--new { --badge-bg: var(--color-success); }
.product-badge--limited { --badge-bg: var(--color-warning); }
.product-badge--soldout { --badge-bg: var(--color-gray); }
```

#### Price Display
```css
.product-price {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.product-price__current {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-primary);
}

.product-price__original {
  text-decoration: line-through;
  color: var(--color-gray);
  font-size: 0.875rem;
}

.product-price__discount {
  background: var(--color-danger);
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
}
```

#### Stock Indicator
```html
<div class="stock-status stock-status--instock">
  <span class="stock-icon">✓</span>
  <span class="stock-text">In Stock</span>
</div>

<div class="stock-status stock-status--lowstock">
  <span class="stock-icon">!</span>
  <span class="stock-text">Only 3 left</span>
</div>

<div class="stock-status stock-status--outofstock">
  <span class="stock-icon">×</span>
  <span class="stock-text">Out of Stock</span>
</div>
```

## JavaScript Modules Needed

### 1. Cart Module
```typescript
class ShoppingCart {
  addItem(productId: string, quantity: number): void
  removeItem(productId: string): void
  updateQuantity(productId: string, quantity: number): void
  getTotal(): number
  clearCart(): void
  saveCart(): void
  loadCart(): void
}
```

### 2. Product Gallery Module
```typescript
class ProductGallery {
  init(): void
  showImage(index: number): void
  nextImage(): void
  prevImage(): void
  enableZoom(): void
  handleTouchSwipe(): void
}
```

### 3. Filter Module
```typescript
class ProductFilter {
  applyFilters(filters: FilterOptions): void
  clearFilters(): void
  updatePriceRange(min: number, max: number): void
  sortProducts(sortBy: string): void
  toggleView(view: 'grid' | 'list'): void
}
```

### 4. Wishlist Module
```typescript
class Wishlist {
  toggle(productId: string): void
  add(productId: string): void
  remove(productId: string): void
  getItems(): string[]
  sync(): void
}
```

## Implementation Priority

### Phase 1: Core Shopping (Week 1)
1. Product Card component
2. Mini Cart dropdown
3. Quantity Selector
4. Add to Cart functionality
5. Price display components

### Phase 2: Product Display (Week 2)
1. Product Gallery with zoom
2. Product badges
3. Stock indicators
4. Rating display
5. Product grid/list toggle

### Phase 3: Shopping Experience (Week 3)
1. Filter sidebar
2. Sort controls
3. Wishlist functionality
4. Product comparison
5. Search suggestions

### Phase 4: Checkout (Week 4)
1. Checkout steps
2. Order summary
3. Coupon system
4. Address forms
5. Payment forms

## CSS Variables Needed

```css
:root {
  /* E-commerce specific colors */
  --color-sale: #dc3545;
  --color-instock: #28a745;
  --color-outofstock: #6c757d;
  --color-rating: #ffc107;

  /* Product card */
  --product-card-bg: white;
  --product-card-shadow: 0 2px 4px rgba(0,0,0,0.1);
  --product-card-radius: 0.5rem;

  /* Cart */
  --cart-bg: white;
  --cart-border: #dee2e6;
  --cart-item-padding: 1rem;

  /* Checkout */
  --checkout-step-complete: #28a745;
  --checkout-step-active: #007bff;
  --checkout-step-inactive: #dee2e6;
}
```

## Accessibility Requirements

- All interactive elements keyboard accessible
- ARIA labels for icon buttons
- Proper form labels and error messages
- Screen reader announcements for cart updates
- Focus management in modals
- Sufficient color contrast
- Alternative text for product images

## Performance Considerations

- Lazy load product images
- Virtualize long product lists
- Debounce filter inputs
- Optimize cart operations
- Cache product data
- Use CSS containment for cards
- Implement skeleton loaders

## Testing Requirements

- Cart add/remove/update operations
- Filter combinations
- Sort functionality
- Responsive behavior
- Keyboard navigation
- Screen reader compatibility
- Cross-browser testing
- Performance benchmarks

## Success Metrics

- Cart operations < 100ms
- Image lazy loading working
- All components keyboard accessible
- WCAG AA compliance
- Mobile-optimized touch targets
- Smooth animations (60fps)
- No layout shifts

---

**Next Steps:**
1. Create Modal component (prerequisite)
2. Implement Product Card
3. Build Mini Cart
4. Add Cart JavaScript module
5. Create examples and documentation