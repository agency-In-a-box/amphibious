# Modal Component Documentation

## Overview

The Modal component provides accessible, customizable dialog boxes for Amphibious 2.0. It supports multiple sizes, variants, animations, and is perfect for e-commerce applications like product quick views, shopping carts, and checkout flows.

## Features

- 🎯 **Accessible**: Full ARIA support and keyboard navigation
- 📱 **Responsive**: Works on all screen sizes
- 🎨 **Customizable**: Multiple sizes and variants
- ⚡ **Performant**: Hardware-accelerated animations
- 🔒 **Focus Management**: Traps focus within modal
- 🌍 **International**: RTL support included
- 🎭 **Dark Mode**: Automatic dark mode support

## Installation

The modal component is included in the main Amphibious bundle:

```javascript
import amp from '@agency-in-a-box/amphibious';
```

Or import directly:

```javascript
import { Modal, ModalManager } from '@agency-in-a-box/amphibious';
```

## Basic Usage

### HTML Structure

```html
<div id="myModal" class="modal" aria-hidden="true">
  <div class="modal__dialog">
    <div class="modal__header">
      <h3 class="modal__title">Modal Title</h3>
      <button class="modal__close" aria-label="Close">&times;</button>
    </div>
    <div class="modal__body">
      <p>Modal content goes here.</p>
    </div>
    <div class="modal__footer">
      <button class="btn btn--secondary" data-modal-close>Cancel</button>
      <button class="btn btn--primary" data-modal-confirm>Confirm</button>
    </div>
  </div>
</div>
```

### JavaScript Initialization

```javascript
// Create modal instance
const modal = amp.createModal('myModal', '#myModal', {
  size: 'default',
  variant: 'default',
  closeOnBackdrop: true,
  closeOnEscape: true
});

// Open modal
modal.open();

// Close modal
modal.close();
```

## Modal Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `size` | string | 'default' | Modal size: 'sm', 'default', 'lg', 'xl', 'full' |
| `variant` | string | 'default' | Modal variant: 'default', 'alert', 'image', 'drawer-left', 'drawer-right', 'bottom-sheet' |
| `animation` | string | 'fade-in' | Animation style: 'fade-in', 'slide-down', 'zoom-in' |
| `closeOnBackdrop` | boolean | true | Close modal when clicking backdrop |
| `closeOnEscape` | boolean | true | Close modal on Escape key |
| `keyboard` | boolean | true | Enable keyboard navigation |
| `focus` | boolean | true | Auto-focus first element |
| `backdrop` | boolean\|'static' | true | Show backdrop (true, false, 'static') |
| `onOpen` | function | null | Callback when modal opens |
| `onClose` | function | null | Callback when modal closes |
| `onConfirm` | function | null | Callback for confirm action |
| `onCancel` | function | null | Callback for cancel action |

## Modal Sizes

### Small Modal (300px)
```javascript
const modal = amp.createModal('small', '#smallModal', {
  size: 'sm'
});
```

### Default Modal (500px)
```javascript
const modal = amp.createModal('default', '#defaultModal');
```

### Large Modal (800px)
```javascript
const modal = amp.createModal('large', '#largeModal', {
  size: 'lg'
});
```

### Extra Large Modal (1140px)
```javascript
const modal = amp.createModal('xlarge', '#xlargeModal', {
  size: 'xl'
});
```

### Full Screen Modal
```javascript
const modal = amp.createModal('full', '#fullModal', {
  size: 'full'
});
```

## Modal Variants

### Alert Modal
Perfect for notifications and simple confirmations:

```javascript
// Using the alert utility
await amp.alert('Operation successful!', 'success');
await amp.alert('An error occurred', 'error');
await amp.alert('Please review', 'warning');
await amp.alert('For your information', 'info');
```

### Confirm Modal
For user confirmations with custom button text:

```javascript
const confirmed = await amp.confirm(
  'Are you sure you want to delete this item?',
  'Yes, Delete',
  'Cancel'
);

if (confirmed) {
  // User clicked confirm
  deleteItem();
}
```

### Image Modal
For displaying images in a lightbox:

```javascript
const imageModal = amp.createModal('image', '#imageModal', {
  variant: 'image'
});
```

### Drawer Modals
Slide-in panels from the side:

```javascript
// Left drawer
const leftDrawer = amp.createModal('cart', '#cartModal', {
  variant: 'drawer-left'
});

// Right drawer (perfect for shopping cart)
const rightDrawer = amp.createModal('cart', '#cartModal', {
  variant: 'drawer-right'
});
```

### Bottom Sheet
Mobile-friendly bottom sliding panel:

```javascript
const bottomSheet = amp.createModal('options', '#optionsModal', {
  variant: 'bottom-sheet'
});
```

## E-Commerce Examples

### Product Quick View
```html
<div id="productModal" class="modal modal--lg">
  <div class="modal__dialog">
    <div class="modal__header">
      <h3 class="modal__title">Product Name</h3>
      <button class="modal__close">&times;</button>
    </div>
    <div class="modal__body">
      <div class="product-gallery">
        <!-- Product images -->
      </div>
      <div class="product-details">
        <h2>Product Title</h2>
        <div class="product-price">$99.99</div>
        <div class="product-description">...</div>
        <button class="btn btn--primary">Add to Cart</button>
      </div>
    </div>
  </div>
</div>
```

### Shopping Cart Drawer
```javascript
const cartModal = amp.createModal('cart', '#cartModal', {
  variant: 'drawer-right',
  closeOnBackdrop: false, // Keep open while shopping
  onOpen: () => {
    updateCartItems();
    calculateTotal();
  }
});
```

### Checkout Modal
```javascript
const checkoutModal = amp.createModal('checkout', '#checkoutModal', {
  size: 'xl',
  closeOnEscape: false, // Prevent accidental closing
  onConfirm: async () => {
    const isValid = await validateCheckoutForm();
    if (isValid) {
      await processPayment();
    }
  }
});
```

## API Methods

### Modal Instance Methods

```javascript
const modal = amp.createModal('myModal', '#myModal');

// Open the modal
modal.open();

// Close the modal
modal.close();

// Toggle open/close state
modal.toggle();

// Update content dynamically
modal.setContent('<p>New content</p>', 'body');
modal.setTitle('New Title');

// Check if modal is open
if (modal.isModalOpen()) {
  console.log('Modal is open');
}

// Update options
modal.updateOptions({
  closeOnBackdrop: false
});

// Destroy modal instance
modal.destroy();
```

### ModalManager Static Methods

```javascript
// Create and register modal
ModalManager.create('myModal', '#myModal', options);

// Get registered modal
const modal = ModalManager.get('myModal');

// Open modal by ID
ModalManager.open('myModal');

// Close modal by ID
ModalManager.close('myModal');

// Close all open modals
ModalManager.closeAll();

// Destroy modal by ID
ModalManager.destroy('myModal');

// Destroy all modals
ModalManager.destroyAll();
```

## Events

Modals dispatch custom events:

```javascript
const modal = document.querySelector('#myModal');

// Listen for open event
modal.addEventListener('modal:open', (e) => {
  console.log('Modal opened', e.detail.modal);
});

// Listen for close event
modal.addEventListener('modal:close', (e) => {
  console.log('Modal closed', e.detail.modal);
});
```

## CSS Customization

### CSS Variables

```css
:root {
  /* Colors */
  --modal-backdrop-bg: rgba(0, 0, 0, 0.5);
  --modal-bg: #ffffff;
  --modal-border-color: #dee2e6;
  --modal-header-bg: #f8f9fa;
  --modal-footer-bg: #f8f9fa;

  /* Sizing */
  --modal-width-sm: 300px;
  --modal-width-default: 500px;
  --modal-width-lg: 800px;
  --modal-width-xl: 1140px;

  /* Styling */
  --modal-border-radius: 0.5rem;
  --modal-box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  --modal-z-index: 1050;

  /* Animation */
  --modal-transition-duration: 0.3s;
  --modal-transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Custom Styling

```css
/* Custom modal theme */
.modal--custom {
  --modal-bg: #1a1a1a;
  --modal-header-bg: #2a2a2a;
  --modal-footer-bg: #2a2a2a;
}

/* Custom animations */
@keyframes customSlide {
  from {
    transform: translateY(-100vh);
  }
  to {
    transform: translateY(0);
  }
}

.modal--custom-slide .modal__dialog {
  animation: customSlide 0.5s ease-out;
}
```

## Accessibility

### Keyboard Navigation

- `Tab` - Navigate through focusable elements
- `Shift + Tab` - Navigate backwards
- `Escape` - Close modal (if enabled)
- `Enter` - Activate focused button

### ARIA Attributes

The modal automatically manages these ARIA attributes:
- `role="dialog"` - Identifies as dialog
- `aria-modal="true"` - Indicates modal behavior
- `aria-hidden` - Toggles visibility state
- `aria-labelledby` - Links to title
- `aria-describedby` - Links to content

### Focus Management

- Focus is trapped within modal when open
- Focus returns to trigger element on close
- First focusable element receives focus on open

## Best Practices

### Do's

✅ **Always include a close button** - Users need a clear way to exit
✅ **Use appropriate sizes** - Don't use full screen for simple confirmations
✅ **Provide keyboard navigation** - Ensure all actions are keyboard accessible
✅ **Add loading states** - Show spinners for async operations
✅ **Test on mobile** - Ensure touch-friendly on small screens

### Don'ts

❌ **Don't auto-open on page load** - Let users trigger modals
❌ **Don't nest modals** - One modal at a time
❌ **Don't disable escape key** - Unless absolutely necessary
❌ **Don't use for critical actions only** - Provide alternatives
❌ **Don't overflow content** - Use scrollable body for long content

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Safari iOS: ✅ Full support
- Samsung Internet: ✅ Full support

## Performance Tips

1. **Lazy load modal content** - Load content when needed
2. **Use CSS transforms** - Hardware acceleration
3. **Minimize reflows** - Batch DOM updates
4. **Optimize images** - Use appropriate formats
5. **Code split** - Load modal code when needed

## Troubleshooting

### Modal doesn't open
- Check if element selector is correct
- Ensure modal HTML is in the DOM
- Verify JavaScript is loaded

### Focus not trapped
- Check if `keyboard` option is enabled
- Ensure focusable elements exist
- Verify no z-index conflicts

### Backdrop not showing
- Check if `backdrop` option is enabled
- Verify no CSS conflicts
- Ensure backdrop element exists

### Animation issues
- Check `prefers-reduced-motion` setting
- Verify CSS animation support
- Test transition duration

## Examples

Full working examples are available in:
- `/examples/modal.html` - All modal variants
- `/examples/ecommerce.html` - E-commerce use cases
- `/test/modal.test.ts` - Test suite

## Migration from Other Libraries

### From Bootstrap Modal
```javascript
// Bootstrap
$('#myModal').modal('show');

// Amphibious
const modal = amp.createModal('myModal', '#myModal');
modal.open();
```

### From Native Dialog
```javascript
// Native
dialog.showModal();

// Amphibious
modal.open();
```

---

For more examples and updates, see the [GitHub repository](https://github.com/your-org/AIAB/tree/main/amphibious).