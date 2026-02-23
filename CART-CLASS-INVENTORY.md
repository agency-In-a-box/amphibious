# Cart & Checkout Class Inventory

Reference document for the shopping cart / checkout namespace migration.
All custom classes have been prefixed with `.aiab-cart-*` or `.aiab-checkout-*` to prevent collisions with agency CSS frameworks.

---

## shopping-cart-modern (HTML + CSS + JS)

### Generic collision-risk classes (renamed)

| Old Class | New Class | Risk |
|-----------|-----------|------|
| `.save` | `.aiab-cart-save` | Conflicts with generic "save" patterns |
| `.remove` | `.aiab-cart-remove` | Conflicts with utility frameworks |
| `.free` | `.aiab-cart-free` | Generic modifier word |
| `.feature` | `.aiab-cart-feature` | Common class name |
| `.price` | `.aiab-cart-price` | Used by many e-commerce frameworks |
| `.step` | `.aiab-cart-step` | Common wizard/stepper class |
| `.minus` | `.aiab-cart-minus` | Generic modifier |
| `.plus` | `.aiab-cart-plus` | Generic modifier |
| `.savings` | `.aiab-cart-savings` | Common e-commerce class |

### Cart-specific classes

| Old Class | New Class |
|-----------|-----------|
| `.cart-header` | `.aiab-cart-header` |
| `.cart-count` | `.aiab-cart-count` |
| `.cart-items-section` | `.aiab-cart-items-section` |
| `.cart-items` | `.aiab-cart-items` |
| `.cart-item` | `.aiab-cart-item` |
| `.item-image` | `.aiab-cart-item-image` |
| `.item-content` | `.aiab-cart-item-content` |
| `.item-title-row` | `.aiab-cart-item-title-row` |
| `.item-details-row` | `.aiab-cart-item-details-row` |
| `.item-details` | `.aiab-cart-item-details` |
| `.item-meta` | `.aiab-cart-item-meta` |
| `.meta-label` | `.aiab-cart-meta-label` |
| `.meta-value` | `.aiab-cart-meta-value` |
| `.meta-divider` | `.aiab-cart-meta-divider` |
| `.item-stock` | `.aiab-cart-item-stock` |
| `.in-stock` | `.aiab-cart-in-stock` |
| `.low-stock` | `.aiab-cart-low-stock` |
| `.item-promo` | `.aiab-cart-item-promo` |
| `.item-price` | `.aiab-cart-item-price` |
| `.price-current` | `.aiab-cart-price-current` |
| `.price-original` | `.aiab-cart-price-original` |
| `.item-quantity` | `.aiab-cart-item-quantity` |
| `.qty-btn` | `.aiab-cart-qty-btn` |
| `.qty-input` | `.aiab-cart-qty-input` |
| `.item-total` | `.aiab-cart-item-total` |
| `.total-price` | `.aiab-cart-total-price` |
| `.item-actions` | `.aiab-cart-item-actions` |
| `.action-btn` | `.aiab-cart-action-btn` |
| `.select-all-bar` | `.aiab-cart-select-all-bar` |
| `.checkbox-wrapper` | `.aiab-cart-checkbox-wrapper` |
| `.checkbox-custom` | `.aiab-cart-checkbox-custom` |
| `.clear-cart` | `.aiab-cart-clear` |
| `.continue-shopping` | `.aiab-cart-continue-shopping` |
| `.progress-steps` | `.aiab-cart-progress-steps` |
| `.step-icon` | `.aiab-cart-step-icon` |
| `.step-line` | `.aiab-cart-step-line` |
| `.promo-section` | `.aiab-cart-promo-section` |
| `.promo-input-group` | `.aiab-cart-promo-input-group` |
| `.promo-input` | `.aiab-cart-promo-input` |
| `.promo-apply` | `.aiab-cart-promo-apply` |
| `.order-summary` | `.aiab-cart-order-summary` |
| `.order-summary-sidebar` | `.aiab-cart-order-summary-sidebar` |
| `.summary-line` | `.aiab-cart-summary-line` |
| `.summary-total` | `.aiab-cart-summary-total` |
| `.checkout-actions` | `.aiab-cart-checkout-actions` |
| `.btn-checkout` | `.aiab-cart-btn-checkout` |
| `.btn-paypal` | `.aiab-cart-btn-paypal` |
| `.or-divider` | `.aiab-cart-or-divider` |
| `.security-features` | `.aiab-cart-security-features` |
| `.recently-viewed` | `.aiab-cart-recently-viewed` |
| `.recent-items` | `.aiab-cart-recent-items` |
| `.recent-item` | `.aiab-cart-recent-item` |

### CSS variables replaced

| Old Variable | Replacement |
|---|---|
| `--primary-color` | `var(--color-primary)` |
| `--primary-hover` | `var(--color-primary-active)` |
| `--primary-light` | `var(--color-primary-alpha-10)` |
| `--success-color` | `var(--color-success)` |
| `--success-light` | `rgba(40, 167, 69, 0.1)` |
| `--warning-color` | `var(--color-warning)` |
| `--warning-light` | `rgba(255, 193, 7, 0.1)` |
| `--danger-color` | `var(--color-danger)` |
| `--text-primary` | `var(--color-text)` |
| `--text-secondary` | `var(--color-text-secondary)` |
| `--text-tertiary` | `var(--color-text-tertiary)` |
| `--border-color` | `var(--color-border)` |
| `--border-light` | `var(--color-border-light)` |
| `--bg-white` | `#ffffff` |
| `--bg-gray` | `var(--color-surface)` |
| `--bg-light` | `#fefefe` |
| `--radius-sm` | `var(--border-radius-sm)` |
| `--radius-md` | `0.375rem` |
| `--radius-lg` | `var(--border-radius-lg)` |
| `--radius-xl` | `0.75rem` |
| `--radius-full` | `9999px` |
| `--shadow-sm/md/lg` | Same names (framework provides) |
| `--paypal-yellow/blue` | Kept as page-local vars |

---

## e-commerce-cart (HTML + extracted CSS)

### Classes renamed

| Old Class | New Class |
|-----------|-----------|
| `.cart-header` | `.aiab-cart-header` |
| `.cart-header-content` | `.aiab-cart-header-content` |
| `.cart-title` | `.aiab-cart-title` |
| `.cart-count` | `.aiab-cart-count` |
| `.continue-shopping` | `.aiab-cart-continue-shopping` |
| `.cart-progress` | `.aiab-cart-progress` |
| `.progress-steps` | `.aiab-cart-progress-steps` |
| `.progress-step` | `.aiab-cart-progress-step` |
| `.progress-step-icon` | `.aiab-cart-progress-step-icon` |
| `.progress-step-label` | `.aiab-cart-progress-step-label` |
| `.cart-items` | `.aiab-cart-items` |
| `.cart-items-header` | `.aiab-cart-items-header` |
| `.select-all` | `.aiab-cart-select-all` |
| `.clear-cart` | `.aiab-cart-clear` |
| `.cart-item` | `.aiab-cart-item` |
| `.cart-item-checkbox` | `.aiab-cart-item-checkbox` |
| `.cart-item-image` | `.aiab-cart-item-image` |
| `.cart-item-details` | `.aiab-cart-item-details` |
| `.cart-item-name` | `.aiab-cart-item-name` |
| `.cart-item-variants` | `.aiab-cart-item-variants` |
| `.cart-item-variant` | `.aiab-cart-item-variant` |
| `.cart-item-stock` | `.aiab-cart-item-stock` |
| `.in-stock` | `.aiab-cart-in-stock` |
| `.low-stock` | `.aiab-cart-low-stock` |
| `.out-of-stock` | `.aiab-cart-out-of-stock` |
| `.cart-item-actions` | `.aiab-cart-item-actions` |
| `.quantity-selector` | `.aiab-cart-quantity-selector` |
| `.cart-item-price` | `.aiab-cart-item-price` |
| `.price-current` | `.aiab-cart-price-current` |
| `.price-original` | `.aiab-cart-price-original` |
| `.price-savings` | `.aiab-cart-price-savings` |
| `.cart-item-remove` | `.aiab-cart-item-remove` |
| `.save-for-later` | `.aiab-cart-save-for-later` |
| `.empty-cart` | `.aiab-cart-empty` |
| `.empty-cart-icon` | `.aiab-cart-empty-icon` |
| `.empty-cart-actions` | `.aiab-cart-empty-actions` |
| `.cart-sidebar` | `.aiab-cart-sidebar` |
| `.cart-summary` | `.aiab-cart-summary` |
| `.summary-row` | `.aiab-cart-summary-row` |
| `.summary-label` | `.aiab-cart-summary-label` |
| `.summary-value` | `.aiab-cart-summary-value` |
| `.savings-value` | `.aiab-cart-savings-value` |
| `.checkout-button` | `.aiab-cart-checkout-btn` |
| `.paypal-button` | `.aiab-cart-paypal-btn` |
| `.promo-code` | `.aiab-cart-promo-code` |
| `.promo-form` | `.aiab-cart-promo-form` |
| `.promo-input` | `.aiab-cart-promo-input` |
| `.promo-button` | `.aiab-cart-promo-button` |
| `.promo-applied` | `.aiab-cart-promo-applied` |
| `.promo-applied-code` | `.aiab-cart-promo-applied-code` |
| `.promo-remove` | `.aiab-cart-promo-remove` |
| `.security-features` | `.aiab-cart-security-features` |
| `.security-item` | `.aiab-cart-security-item` |
| `.recently-viewed` | `.aiab-cart-recently-viewed` |
| `.recently-viewed-grid` | `.aiab-cart-recently-viewed-grid` |
| `.recently-item` | `.aiab-cart-recently-item` |
| `.recently-item-image` | `.aiab-cart-recently-item-image` |
| `.recently-item-name` | `.aiab-cart-recently-item-name` |
| `.recently-item-price` | `.aiab-cart-recently-item-price` |
| `.saved-items` | `.aiab-cart-saved-items` |
| `.saved-items-header` | `.aiab-cart-saved-items-header` |
| `.saved-items-count` | `.aiab-cart-saved-items-count` |
| `.mobile-only` | `.aiab-cart-mobile-only` |
| `.mobile-summary` | `.aiab-cart-mobile-summary` |
| `.mobile-total` | `.aiab-cart-mobile-total` |
| `.product-card` | `.aiab-cart-product-card` |
| `.product-image` | `.aiab-cart-product-image` |
| `.product-info` | `.aiab-cart-product-info` |

### Framework-adjacent classes aligned

| Old Class | New Class |
|-----------|-----------|
| `.btn--primary` | `.aiab-btn-primary` |
| `.btn--secondary` | `.aiab-btn-secondary` |
| `.btn--danger` | `.aiab-btn-danger` |
| `.btn--sm` | `.aiab-btn-sm` |
| `.alert-success` | `.aiab-alert-success` |
| `.icon--xs` | `.aiab-icon-xs` |
| `.icon--sm` | `.aiab-icon-sm` |
| `.modal__dialog` | `.aiab-modal-dialog` |
| `.modal__header` | `.aiab-modal-header` |
| `.modal__title` | `.aiab-modal-title` |
| `.modal__close` | `.aiab-modal-close` |
| `.modal__body` | `.aiab-modal-body` |
| `.modal__footer` | `.aiab-modal-footer` |
| `.visually-hidden` | `.aiab-sr-only` |

### Inline styles moved to CSS

| Original inline style | New CSS class |
|---|---|
| `style="margin: 0.5rem 0;"` (alert) | `.aiab-cart-alert-promo` |
| `style="list-style: none; ..."` (security) | `.aiab-cart-security-list` |
| `style="padding: 1.5rem;"` (saved items) | `.aiab-cart-saved-items-padding` |
| `style="background: #f8f9fa; ..."` (product img) | `.aiab-cart-product-image-wrapper` |
| `style="padding: 1rem;"` (product info) | `.aiab-cart-product-info-inner` |
| `style="width: 100%; margin-top..."` (move btn) | `.aiab-cart-move-to-cart` |
| `style="text-align: center; ..."` (installments) | `.aiab-cart-pay-installments` |

---

## checkout-flow (HTML + extracted CSS)

### Classes renamed

| Old Class | New Class |
|-----------|-----------|
| `.checkout-header` | `.aiab-checkout-header` |
| `.progress-steps` | `.aiab-checkout-progress-steps` |
| `.step-number` | `.aiab-checkout-step-number` |
| `.step-connector` | `.aiab-checkout-step-connector` |
| `.completed` | `.aiab-checkout-completed` |
| `.checkout-form` | `.aiab-checkout-form` |
| `.form-row` | `.aiab-checkout-form-row` |
| `.form-help` | `.aiab-checkout-form-help` |
| `.full-width` | `.aiab-checkout-full-width` |
| `.radio-option` | `.aiab-checkout-radio-option` |
| `.checkbox-option` | `.aiab-checkout-checkbox-option` |
| `.checkbox-group` | `.aiab-checkout-checkbox-group` |
| `.selected` | `.aiab-checkout-selected` |
| `.order-summary` | `.aiab-checkout-order-summary` |
| `.order-items` | `.aiab-checkout-order-items` |
| `.order-item` | `.aiab-checkout-order-item` |
| `.order-item-details` | `.aiab-checkout-order-item-details` |
| `.order-item-name` | `.aiab-checkout-order-item-name` |
| `.order-item-meta` | `.aiab-checkout-order-item-meta` |
| `.order-item-price` | `.aiab-checkout-order-item-price` |
| `.order-totals` | `.aiab-checkout-order-totals` |
| `.total-row` | `.aiab-checkout-total-row` |
| `.form-actions` | `.aiab-checkout-form-actions` |
| `.btn-link` | `.aiab-checkout-btn-link` |
| `.secure-badge` | `.aiab-checkout-secure-badge` |

### Framework button alignment

| Old Class | New Class |
|-----------|-----------|
| `.btn-primary` | `.aiab-primary` (with `.aiab-btn`) |
| `.btn-secondary` | `.aiab-secondary` (with `.aiab-btn`) |

### Inline styles moved to CSS

| Original inline style | New CSS class |
|---|---|
| `style="padding: 2rem 0;"` (main) | `.aiab-checkout-main` |
| `style="font-size: 0.875rem; color: #6c757d;"` (desc) | `.aiab-checkout-shipping-desc` |
| `style="margin-left: auto;"` (prices) | `.aiab-checkout-option-price` |
| `style="margin-top: 1rem;"` (notes) | `.aiab-checkout-notes-group` |
| `style="display: flex; ..."` (action btns) | `.aiab-checkout-action-buttons` |
| `style="margin-top: 1.5rem; ..."` (promo) | `.aiab-checkout-promo-section` |
| `style="display: flex; gap..."` (promo input) | `.aiab-checkout-promo-input-group` |
| `style="margin-top: 1.5rem;"` (payment) | `.aiab-checkout-payment-methods` |
| `style="display: flex; gap..."` (icons) | `.aiab-checkout-payment-icons` |
| `style="color: #28a745;"` (discount) | `.aiab-checkout-discount-value` |

---

## Framework classes (unchanged)

These classes belong to the Amphibious framework and are NOT renamed:
- `.aiab-container`, `.aiab-row`, `.aiab-col-*`
- `.aiab-btn`, `.aiab-primary`, `.aiab-secondary`
- `.aiab-active`, `.aiab-sr-only`
- `.aiab-site-nav`, `.aiab-nav-toggle`, `.aiab-horizontal`, `.aiab-branded`
- `.aiab-form-group`, `.aiab-radio-group`
- `.aiab-modal`, `.aiab-alert`, `.aiab-tooltip`
