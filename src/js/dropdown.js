/**
 * Custom Dropdown Component JavaScript
 * Enhanced select functionality with search and multi-select
 * Part of Amphibious 2.0 Component Library
 */

class Dropdown {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      searchable: options.searchable || element.dataset.searchable === 'true',
      multiple: options.multiple || element.dataset.multiple === 'true',
      placeholder: options.placeholder || element.dataset.placeholder || 'Select an option',
      maxItems: options.maxItems || parseInt(element.dataset.maxItems) || null,
      onChange: options.onChange || null,
      onOpen: options.onOpen || null,
      onClose: options.onClose || null,
      ...options
    };

    this.isOpen = false;
    this.selectedValues = [];
    this.filteredItems = [];

    this.init();
  }

  init() {
    this.createDropdown();
    this.bindEvents();
    this.setInitialValue();
  }

  createDropdown() {
    // Hide native select if exists
    const nativeSelect = this.element.querySelector('select');
    if (nativeSelect) {
      nativeSelect.style.display = 'none';
      this.nativeSelect = nativeSelect;
      this.parseNativeOptions();
    }

    // Create dropdown structure
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown';
    if (this.options.multiple) {
      dropdown.classList.add('dropdown--multi');
    }

    // Create select button
    const selectBtn = document.createElement('button');
    selectBtn.className = 'dropdown-select';
    selectBtn.setAttribute('type', 'button');
    selectBtn.setAttribute('aria-expanded', 'false');
    selectBtn.setAttribute('aria-haspopup', 'listbox');

    const valueSpan = document.createElement('span');
    valueSpan.className = 'dropdown-value dropdown-placeholder';
    valueSpan.textContent = this.options.placeholder;
    selectBtn.appendChild(valueSpan);

    // Create dropdown menu
    const menu = document.createElement('div');
    menu.className = 'dropdown-menu';
    menu.setAttribute('role', 'listbox');

    // Add search if enabled
    if (this.options.searchable) {
      const searchContainer = document.createElement('div');
      searchContainer.className = 'dropdown-search';

      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.className = 'dropdown-search-input';
      searchInput.placeholder = 'Search...';
      searchInput.setAttribute('aria-label', 'Search options');

      searchContainer.appendChild(searchInput);
      menu.appendChild(searchContainer);

      this.searchInput = searchInput;
    }

    // Add items container
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'dropdown-items';
    menu.appendChild(itemsContainer);

    dropdown.appendChild(selectBtn);
    dropdown.appendChild(menu);

    // Replace original element
    this.element.appendChild(dropdown);

    this.dropdown = dropdown;
    this.selectBtn = selectBtn;
    this.valueSpan = valueSpan;
    this.menu = menu;
    this.itemsContainer = itemsContainer;
  }

  parseNativeOptions() {
    this.items = [];
    const optgroups = this.nativeSelect.querySelectorAll('optgroup');
    const options = this.nativeSelect.querySelectorAll('option');

    if (optgroups.length > 0) {
      optgroups.forEach(group => {
        const groupLabel = group.label;
        const groupOptions = group.querySelectorAll('option');

        this.items.push({
          type: 'group',
          label: groupLabel
        });

        groupOptions.forEach(option => {
          this.items.push({
            type: 'option',
            value: option.value,
            text: option.textContent,
            selected: option.selected,
            disabled: option.disabled
          });
        });
      });
    } else {
      options.forEach(option => {
        if (option.value) { // Skip empty placeholders
          this.items.push({
            type: 'option',
            value: option.value,
            text: option.textContent,
            selected: option.selected,
            disabled: option.disabled
          });
        }
      });
    }

    this.renderItems();
  }

  renderItems(searchTerm = '') {
    this.itemsContainer.innerHTML = '';

    let currentGroup = null;
    const itemsToRender = searchTerm
      ? this.items.filter(item =>
          item.type === 'option' &&
          item.text.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : this.items;

    itemsToRender.forEach(item => {
      if (item.type === 'group') {
        currentGroup = document.createElement('div');
        currentGroup.className = 'dropdown-group';

        const label = document.createElement('div');
        label.className = 'dropdown-group-label';
        label.textContent = item.label;

        currentGroup.appendChild(label);
        this.itemsContainer.appendChild(currentGroup);
      } else {
        const button = document.createElement('button');
        button.className = 'dropdown-item';
        button.setAttribute('type', 'button');
        button.setAttribute('role', 'option');
        button.dataset.value = item.value;
        button.textContent = item.text;

        if (item.disabled) {
          button.disabled = true;
          button.classList.add('disabled');
        }

        if (this.selectedValues.includes(item.value)) {
          button.classList.add('selected');
          button.setAttribute('aria-selected', 'true');
        }

        if (currentGroup) {
          currentGroup.appendChild(button);
        } else {
          this.itemsContainer.appendChild(button);
        }
      }
    });

    this.filteredItems = this.itemsContainer.querySelectorAll('.dropdown-item:not(.disabled)');
  }

  bindEvents() {
    // Toggle dropdown
    this.selectBtn.addEventListener('click', () => this.toggle());

    // Handle item selection
    this.itemsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('dropdown-item') && !e.target.disabled) {
        this.selectItem(e.target);
      }
    });

    // Search functionality
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.renderItems(e.target.value);
      });

      this.searchInput.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!this.dropdown.contains(e.target) && this.isOpen) {
        this.close();
      }
    });

    // Keyboard navigation
    this.selectBtn.addEventListener('keydown', (e) => this.handleKeydown(e));
    this.menu.addEventListener('keydown', (e) => this.handleKeydown(e));

    // Handle ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
        this.selectBtn.focus();
      }
    });
  }

  handleKeydown(e) {
    const items = Array.from(this.filteredItems);
    const currentIndex = items.findIndex(item => item === document.activeElement);

    switch(e.key) {
      case 'Enter':
      case ' ':
        if (e.target === this.selectBtn) {
          e.preventDefault();
          this.toggle();
        } else if (e.target.classList.contains('dropdown-item')) {
          e.preventDefault();
          this.selectItem(e.target);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!this.isOpen) {
          this.open();
        } else {
          const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          items[nextIndex]?.focus();
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (this.isOpen) {
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          items[prevIndex]?.focus();
        }
        break;

      case 'Home':
        if (this.isOpen) {
          e.preventDefault();
          items[0]?.focus();
        }
        break;

      case 'End':
        if (this.isOpen) {
          e.preventDefault();
          items[items.length - 1]?.focus();
        }
        break;
    }
  }

  selectItem(item) {
    const value = item.dataset.value;

    if (this.options.multiple) {
      // Multi-select logic
      const index = this.selectedValues.indexOf(value);
      if (index > -1) {
        this.selectedValues.splice(index, 1);
        item.classList.remove('selected');
        item.setAttribute('aria-selected', 'false');
      } else {
        if (!this.options.maxItems || this.selectedValues.length < this.options.maxItems) {
          this.selectedValues.push(value);
          item.classList.add('selected');
          item.setAttribute('aria-selected', 'true');
        }
      }
      this.updateDisplay();
    } else {
      // Single select logic
      this.filteredItems.forEach(i => {
        i.classList.remove('selected');
        i.setAttribute('aria-selected', 'false');
      });

      item.classList.add('selected');
      item.setAttribute('aria-selected', 'true');
      this.selectedValues = [value];
      this.updateDisplay();
      this.close();
    }

    // Update native select
    if (this.nativeSelect) {
      const options = this.nativeSelect.querySelectorAll('option');
      options.forEach(option => {
        option.selected = this.selectedValues.includes(option.value);
      });

      // Trigger change event on native select
      const event = new Event('change', { bubbles: true });
      this.nativeSelect.dispatchEvent(event);
    }

    // Callback
    if (this.options.onChange) {
      this.options.onChange(this.selectedValues, this);
    }
  }

  updateDisplay() {
    if (this.selectedValues.length === 0) {
      this.valueSpan.className = 'dropdown-value dropdown-placeholder';
      this.valueSpan.textContent = this.options.placeholder;
    } else if (this.options.multiple) {
      this.valueSpan.className = 'dropdown-value';
      this.valueSpan.innerHTML = '';

      this.selectedValues.forEach(value => {
        const item = this.items.find(i => i.value === value);
        if (item) {
          const tag = document.createElement('span');
          tag.className = 'dropdown-tag';
          tag.innerHTML = `
            ${item.text}
            <span class="dropdown-tag-remove" data-value="${value}">×</span>
          `;
          this.valueSpan.appendChild(tag);
        }
      });

      // Handle tag removal
      this.valueSpan.querySelectorAll('.dropdown-tag-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const value = btn.dataset.value;
          const index = this.selectedValues.indexOf(value);
          if (index > -1) {
            this.selectedValues.splice(index, 1);
            this.updateDisplay();
            this.renderItems();

            if (this.options.onChange) {
              this.options.onChange(this.selectedValues, this);
            }
          }
        });
      });
    } else {
      const item = this.items.find(i => i.value === this.selectedValues[0]);
      this.valueSpan.className = 'dropdown-value';
      this.valueSpan.textContent = item ? item.text : '';
    }
  }

  setInitialValue() {
    const selectedItems = this.items.filter(item => item.selected);
    if (selectedItems.length > 0) {
      this.selectedValues = selectedItems.map(item => item.value);
      this.updateDisplay();
      this.renderItems();
    }
  }

  open() {
    if (!this.isOpen) {
      this.isOpen = true;
      this.dropdown.classList.add('open');
      this.selectBtn.setAttribute('aria-expanded', 'true');

      if (this.searchInput) {
        setTimeout(() => this.searchInput.focus(), 100);
      }

      if (this.options.onOpen) {
        this.options.onOpen(this);
      }
    }
  }

  close() {
    if (this.isOpen) {
      this.isOpen = false;
      this.dropdown.classList.remove('open');
      this.selectBtn.setAttribute('aria-expanded', 'false');

      if (this.searchInput) {
        this.searchInput.value = '';
        this.renderItems();
      }

      if (this.options.onClose) {
        this.options.onClose(this);
      }
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  // Public API methods
  getValue() {
    return this.options.multiple ? this.selectedValues : this.selectedValues[0];
  }

  setValue(value) {
    if (this.options.multiple && Array.isArray(value)) {
      this.selectedValues = value;
    } else {
      this.selectedValues = [value];
    }
    this.updateDisplay();
    this.renderItems();
  }

  reset() {
    this.selectedValues = [];
    this.updateDisplay();
    this.renderItems();
  }

  destroy() {
    this.dropdown.remove();
    if (this.nativeSelect) {
      this.nativeSelect.style.display = '';
    }
  }
}

// Auto-initialize dropdowns
document.addEventListener('DOMContentLoaded', () => {
  const dropdowns = document.querySelectorAll('[data-dropdown="true"]');
  dropdowns.forEach(element => {
    new Dropdown(element);
  });
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Dropdown;
}

// Add to global scope
window.Dropdown = Dropdown;