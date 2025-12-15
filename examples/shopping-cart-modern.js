/**
 * Shopping Cart - Modern JavaScript
 * Handles cart interactions and calculations
 */

// Cart State
let cartState = {
  items: [
    { id: 1, name: 'Premium Cotton T-Shirt', price: 49.99, quantity: 1, selected: true },
    { id: 2, name: 'Slim Fit Denim Jeans', price: 89.99, originalPrice: 119.99, quantity: 1, selected: true },
    { id: 3, name: 'Wireless Headphones Pro', price: 299.99, quantity: 1, maxQty: 3, selected: true },
    { id: 4, name: 'Running Sneakers Pro', price: 129.99, originalPrice: 159.99, quantity: 2, selected: true },
    { id: 5, name: 'Premium Leather Wallet', price: 59.99, quantity: 1, selected: true }
  ]
};

// Format Currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Calculate Totals
function calculateTotals() {
  const selectedItems = cartState.items.filter(item => item.selected);

  let subtotal = 0;
  let savings = 0;
  let itemCount = 0;

  selectedItems.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    itemCount += item.quantity;

    if (item.originalPrice) {
      savings += (item.originalPrice - item.price) * item.quantity;
    }
  });

  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  return {
    subtotal,
    savings,
    tax,
    shipping,
    total,
    itemCount
  };
}

// Update Summary Display
function updateSummary() {
  const totals = calculateTotals();

  // Update cart count
  document.querySelector('.cart-count').textContent = `${totals.itemCount} items`;

  // Update summary lines
  document.querySelector('.summary-line:nth-child(1) span:last-child').textContent = formatCurrency(totals.subtotal);
  document.querySelector('.summary-line:nth-child(2) span:last-child').textContent = totals.shipping === 0 ? 'FREE' : formatCurrency(totals.shipping);
  document.querySelector('.summary-line:nth-child(3) span:last-child').textContent = formatCurrency(totals.tax);

  if (totals.savings > 0) {
    document.querySelector('.summary-line.savings span:last-child').textContent = `-${formatCurrency(totals.savings)}`;
  }

  document.querySelector('.summary-total span:last-child').textContent = formatCurrency(totals.total);
}

// Handle Quantity Changes
function handleQuantityChange(itemId, change) {
  const item = cartState.items.find(i => i.id === itemId);
  if (!item) return;

  const newQty = item.quantity + change;

  // Check bounds
  if (newQty < 1) return;
  if (item.maxQty && newQty > item.maxQty) return;

  item.quantity = newQty;

  // Update UI - find the correct item element by data attribute or ID
  const itemElement = document.querySelector(`.cart-item[data-item-id="${itemId}"]`);
  if (itemElement) {
    itemElement.querySelector('.qty-input').value = newQty;

    const itemTotal = item.price * newQty;
    itemElement.querySelector('.total-price').textContent = formatCurrency(itemTotal);

    if (item.originalPrice) {
      const itemSavings = (item.originalPrice - item.price) * newQty;
      const savingsElement = itemElement.querySelector('.savings');
      if (savingsElement) {
        savingsElement.textContent = `Save ${formatCurrency(itemSavings)}`;
      }
    }
  }

  updateSummary();
}

// Handle Item Selection
function handleItemSelection(itemId, selected) {
  const item = cartState.items.find(i => i.id === itemId);
  if (item) {
    item.selected = selected;
    updateSummary();
  }
}

// Handle Select All
function handleSelectAll(selected) {
  cartState.items.forEach(item => {
    item.selected = selected;
  });

  // Update all checkboxes
  document.querySelectorAll('.cart-item input[type="checkbox"]').forEach(checkbox => {
    checkbox.checked = selected;
  });

  updateSummary();
}

// Remove Item
function removeItem(itemId) {
  const index = cartState.items.findIndex(i => i.id === itemId);
  if (index > -1) {
    cartState.items.splice(index, 1);

    // Remove from DOM
    const itemElement = document.querySelector(`.cart-item:nth-child(${itemId + 1})`);
    if (itemElement) {
      itemElement.style.opacity = '0';
      itemElement.style.transform = 'translateX(-20px)';
      setTimeout(() => {
        itemElement.remove();
        updateSummary();
      }, 300);
    }
  }
}

// Save for Later
function saveForLater(itemId) {
  const item = cartState.items.find(i => i.id === itemId);
  if (item) {
    // In a real app, this would move to saved items
    removeItem(itemId);
  }
}

// Clear Cart
function clearCart() {
  if (confirm('Are you sure you want to clear your cart?')) {
    cartState.items = [];
    document.querySelector('.cart-items').innerHTML = '<p style="text-align: center; padding: 3rem; color: #6b7280;">Your cart is empty</p>';
    updateSummary();
  }
}

// Apply Promo Code
function applyPromo() {
  const promoInput = document.querySelector('.promo-input');
  const code = promoInput.value.trim().toUpperCase();

  if (code === 'SAVE10') {
    alert('Promo code applied! 10% discount added.');
    // In a real app, this would apply the discount
    updateSummary();
  } else if (code) {
    alert('Invalid promo code. Please try again.');
  }
}

// Initialize Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  // Select All Checkbox
  const selectAllCheckbox = document.getElementById('selectAll');
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', function() {
      handleSelectAll(this.checked);
    });
  }

  // Clear Cart Button
  document.querySelector('.clear-cart')?.addEventListener('click', clearCart);

  // Item Checkboxes
  document.querySelectorAll('.cart-item').forEach((cartItem, index) => {
    const checkbox = cartItem.querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.addEventListener('change', function() {
        const itemId = parseInt(cartItem.dataset.itemId) || (index + 1);
        handleItemSelection(itemId, this.checked);

        // Update select all checkbox
        const allChecked = cartState.items.every(item => item.selected);
        const selectAll = document.getElementById('selectAll');
        if (selectAll) {
          selectAll.checked = allChecked;
        }
      });
    }
  });

  // Quantity Buttons
  document.querySelectorAll('.cart-item').forEach((cartItem, index) => {
    const itemId = parseInt(cartItem.dataset.itemId) || (index + 1);

    const minusBtn = cartItem.querySelector('.qty-btn.minus');
    const plusBtn = cartItem.querySelector('.qty-btn.plus');
    const qtyInput = cartItem.querySelector('.qty-input');
    const removeBtn = cartItem.querySelector('.action-btn.remove');
    const saveBtn = cartItem.querySelector('.action-btn.save');

    if (minusBtn) {
      minusBtn.addEventListener('click', () => handleQuantityChange(itemId, -1));
    }

    if (plusBtn) {
      plusBtn.addEventListener('click', () => handleQuantityChange(itemId, 1));
    }

    if (qtyInput) {
      qtyInput.addEventListener('change', function() {
        const newQty = parseInt(this.value) || 1;
        const item = cartState.items.find(i => i.id === itemId);
        if (item) {
          const diff = newQty - item.quantity;
          if (diff !== 0) {
            handleQuantityChange(itemId, diff);
          }
        }
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', () => removeItem(itemId));
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => saveForLater(itemId));
    }
  });

  // Promo Code Apply Button
  document.querySelector('.promo-apply')?.addEventListener('click', applyPromo);

  // Promo Code Input - Enter Key
  document.querySelector('.promo-input')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      applyPromo();
    }
  });

  // Checkout Buttons
  document.querySelector('.btn-checkout.primary')?.addEventListener('click', function() {
    alert('Proceeding to checkout with ' + cartState.items.length + ' items');
  });

  document.querySelector('.btn-paypal')?.addEventListener('click', function() {
    alert('Redirecting to PayPal checkout...');
  });

  // Recently Viewed Items
  document.querySelectorAll('.recent-item').forEach(item => {
    item.addEventListener('click', function() {
      const productName = this.querySelector('h4').textContent;
    });
  });

  // Initialize summary on load
  updateSummary();
});