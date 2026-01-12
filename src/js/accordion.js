/**
 * Accordion Component JavaScript
 * Handles expand/collapse functionality with accessibility
 * Part of Amphibious 2.0 Component Library
 */

class Accordion {
  constructor(element, options = {}) {
    this.accordion = element;
    this.options = {
      allowMultiple: options.allowMultiple || element.dataset.allowMultiple === 'true' || false,
      defaultOpen: options.defaultOpen || element.dataset.defaultOpen || null,
      animated: options.animated !== false,
      onOpen: options.onOpen || null,
      onClose: options.onClose || null,
      ...options
    };

    this.items = Array.from(this.accordion.querySelectorAll('.accordion-item'));
    this.init();
  }

  init() {
    // Set up ARIA attributes
    this.accordion.setAttribute('role', 'presentation');

    this.items.forEach((item, index) => {
      const header = item.querySelector('.accordion-header');
      const content = item.querySelector('.accordion-content');
      const itemId = `accordion-item-${Date.now()}-${index}`;

      // Set IDs and ARIA attributes
      header.setAttribute('id', `${itemId}-header`);
      content.setAttribute('id', `${itemId}-content`);
      header.setAttribute('aria-controls', `${itemId}-content`);
      content.setAttribute('aria-labelledby', `${itemId}-header`);

      // Set initial state
      const isOpen = item.classList.contains('active') ||
                     (this.options.defaultOpen === index ||
                      this.options.defaultOpen === 'all');

      this.setItemState(item, header, content, isOpen);

      // Add event listeners
      header.addEventListener('click', (e) => this.toggle(item, e));
      header.addEventListener('keydown', (e) => this.handleKeydown(e, item, index));
    });

    // Set up keyboard navigation
    this.setupKeyboardNavigation();
  }

  toggle(item, event) {
    event.preventDefault();

    const header = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content');
    const isOpen = header.getAttribute('aria-expanded') === 'true';

    if (!isOpen) {
      // Opening
      if (!this.options.allowMultiple) {
        // Close other items
        this.items.forEach(otherItem => {
          if (otherItem !== item) {
            const otherHeader = otherItem.querySelector('.accordion-header');
            const otherContent = otherItem.querySelector('.accordion-content');
            this.setItemState(otherItem, otherHeader, otherContent, false);
          }
        });
      }

      this.setItemState(item, header, content, true);

      // Callback
      if (this.options.onOpen) {
        this.options.onOpen(item, content);
      }
    } else {
      // Closing
      this.setItemState(item, header, content, false);

      // Callback
      if (this.options.onClose) {
        this.options.onClose(item, content);
      }
    }
  }

  setItemState(item, header, content, isOpen) {
    if (isOpen) {
      item.classList.add('active');
      header.setAttribute('aria-expanded', 'true');
      content.setAttribute('aria-hidden', 'false');

      // Calculate and set max-height for animation
      if (this.options.animated) {
        const scrollHeight = content.scrollHeight;
        content.style.maxHeight = scrollHeight + 'px';
      }
    } else {
      item.classList.remove('active');
      header.setAttribute('aria-expanded', 'false');
      content.setAttribute('aria-hidden', 'true');

      if (this.options.animated) {
        content.style.maxHeight = null;
      }
    }
  }

  handleKeydown(event, item, index) {
    const key = event.key;
    let preventDefault = false;

    switch(key) {
      case 'Enter':
      case ' ':
        this.toggle(item, event);
        preventDefault = true;
        break;

      case 'ArrowDown':
        this.focusNextItem(index);
        preventDefault = true;
        break;

      case 'ArrowUp':
        this.focusPreviousItem(index);
        preventDefault = true;
        break;

      case 'Home':
        this.focusFirstItem();
        preventDefault = true;
        break;

      case 'End':
        this.focusLastItem();
        preventDefault = true;
        break;
    }

    if (preventDefault) {
      event.preventDefault();
    }
  }

  setupKeyboardNavigation() {
    // Make headers focusable
    this.items.forEach(item => {
      const header = item.querySelector('.accordion-header');
      if (!header.hasAttribute('tabindex')) {
        header.setAttribute('tabindex', '0');
      }
    });
  }

  focusNextItem(currentIndex) {
    const nextIndex = (currentIndex + 1) % this.items.length;
    const nextHeader = this.items[nextIndex].querySelector('.accordion-header');
    nextHeader.focus();
  }

  focusPreviousItem(currentIndex) {
    const prevIndex = (currentIndex - 1 + this.items.length) % this.items.length;
    const prevHeader = this.items[prevIndex].querySelector('.accordion-header');
    prevHeader.focus();
  }

  focusFirstItem() {
    const firstHeader = this.items[0].querySelector('.accordion-header');
    firstHeader.focus();
  }

  focusLastItem() {
    const lastHeader = this.items[this.items.length - 1].querySelector('.accordion-header');
    lastHeader.focus();
  }

  // Public methods
  openAll() {
    this.items.forEach(item => {
      const header = item.querySelector('.accordion-header');
      const content = item.querySelector('.accordion-content');
      this.setItemState(item, header, content, true);
    });
  }

  closeAll() {
    this.items.forEach(item => {
      const header = item.querySelector('.accordion-header');
      const content = item.querySelector('.accordion-content');
      this.setItemState(item, header, content, false);
    });
  }

  openItem(index) {
    if (index >= 0 && index < this.items.length) {
      const item = this.items[index];
      const header = item.querySelector('.accordion-header');
      const content = item.querySelector('.accordion-content');
      this.setItemState(item, header, content, true);
    }
  }

  closeItem(index) {
    if (index >= 0 && index < this.items.length) {
      const item = this.items[index];
      const header = item.querySelector('.accordion-header');
      const content = item.querySelector('.accordion-content');
      this.setItemState(item, header, content, false);
    }
  }

  destroy() {
    this.items.forEach(item => {
      const header = item.querySelector('.accordion-header');
      header.removeEventListener('click', this.toggle);
      header.removeEventListener('keydown', this.handleKeydown);
    });
  }
}

// Auto-initialize accordions on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const accordions = document.querySelectorAll('.accordion[data-auto-init="true"]');
  accordions.forEach(accordion => {
    new Accordion(accordion);
  });
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Accordion;
}

// Add to global scope
window.Accordion = Accordion;