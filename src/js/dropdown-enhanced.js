/**
 * Enhanced Dropdown Component JavaScript
 * Advanced select functionality with complete cleanup and rich features
 * Part of Amphibious 2.0 Component Library
 */

class DropdownEnhanced {
  constructor(element, options = {}) {
    this.element = element;

    // Memory management
    this.handlers = new Map();
    this.timers = new Set();
    this.createdElements = new Set();
    this.observers = new Set();

    this.options = {
      // Basic options
      searchable: options.searchable || element.dataset.searchable === 'true',
      multiple: options.multiple || element.dataset.multiple === 'true',
      placeholder: options.placeholder || element.dataset.placeholder || 'Select an option',
      maxItems: options.maxItems || Number.parseInt(element.dataset.maxItems) || null,

      // Advanced options
      allowCreate: options.allowCreate || false,
      createText: options.createText || 'Create: ',
      clearable: options.clearable !== false,
      disabled: options.disabled || false,
      closeOnSelect: options.closeOnSelect !== false,

      // Data options
      source: options.source || null, // Function or URL for remote data
      ajax: options.ajax || false,
      cacheResults: options.cacheResults !== false,
      minChars: options.minChars || 1,

      // Display options
      optionRenderer: options.optionRenderer || null,
      selectedRenderer: options.selectedRenderer || null,
      groupBy: options.groupBy || null,
      sortBy: options.sortBy || null,

      // Behavior options
      openOnFocus: options.openOnFocus !== false,
      selectOnTab: options.selectOnTab !== false,
      highlightFirst: options.highlightFirst !== false,
      virtualScroll: options.virtualScroll || false,
      pageSize: options.pageSize || 50,

      // Callbacks
      onChange: options.onChange || null,
      onOpen: options.onOpen || null,
      onClose: options.onClose || null,
      onCreate: options.onCreate || null,
      onSearch: options.onSearch || null,
      onSelect: options.onSelect || null,
      onRemove: options.onRemove || null,

      ...options,
    };

    // State management
    this.state = {
      isOpen: false,
      selectedValues: [],
      selectedItems: [],
      filteredItems: [],
      allItems: [],
      highlightedIndex: -1,
      searchTerm: '',
      loading: false,
      cache: new Map(),
      page: 1,
      hasMore: false,
    };

    // Debounce timer for search
    this.searchDebounceTimer = null;

    this.init();
  }

  init() {
    this.parseNativeSelect();
    this.createDropdown();
    this.bindEvents();
    this.setInitialValue();

    if (this.options.disabled) {
      this.disable();
    }
  }

  parseNativeSelect() {
    // Find native select if exists
    const nativeSelect = this.element.querySelector('select');
    if (!nativeSelect) {
      // Use data-options if no native select
      this.parseDataOptions();
      return;
    }

    this.nativeSelect = nativeSelect;
    nativeSelect.style.display = 'none';

    const items = [];
    const optgroups = nativeSelect.querySelectorAll('optgroup');

    if (optgroups.length > 0) {
      optgroups.forEach((group) => {
        const groupLabel = group.label;
        const groupOptions = group.querySelectorAll('option');

        groupOptions.forEach((option) => {
          items.push({
            value: option.value,
            text: option.textContent,
            selected: option.selected,
            disabled: option.disabled,
            group: groupLabel,
            element: option,
          });
        });
      });
    } else {
      nativeSelect.querySelectorAll('option').forEach((option) => {
        if (option.value) {
          items.push({
            value: option.value,
            text: option.textContent,
            selected: option.selected,
            disabled: option.disabled,
            element: option,
          });
        }
      });
    }

    this.state.allItems = items;
    this.state.filteredItems = [...items];
  }

  parseDataOptions() {
    const optionsData = this.element.dataset.options;
    if (optionsData) {
      try {
        this.state.allItems = JSON.parse(optionsData);
        this.state.filteredItems = [...this.state.allItems];
      } catch (e) {
        this.state.allItems = [];
        this.state.filteredItems = [];
      }
    }
  }

  createDropdown() {
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'dropdown-enhanced';
    if (this.options.multiple) {
      wrapper.classList.add('dropdown-enhanced--multi');
    }

    // Create select button
    const selectBtn = document.createElement('div');
    selectBtn.className = 'dropdown-select';
    selectBtn.setAttribute('role', 'combobox');
    selectBtn.setAttribute('aria-expanded', 'false');
    selectBtn.setAttribute('aria-haspopup', 'listbox');
    selectBtn.setAttribute('tabindex', '0');

    // Value display
    const valueDisplay = document.createElement('div');
    valueDisplay.className = 'dropdown-value';

    if (this.options.searchable && !this.options.multiple) {
      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.className = 'dropdown-search-inline';
      searchInput.placeholder = this.options.placeholder;
      valueDisplay.appendChild(searchInput);
      this.searchInput = searchInput;
    } else {
      const valueText = document.createElement('span');
      valueText.className = 'dropdown-value-text dropdown-placeholder';
      valueText.textContent = this.options.placeholder;
      valueDisplay.appendChild(valueText);
      this.valueText = valueText;
    }

    // Icons container
    const icons = document.createElement('div');
    icons.className = 'dropdown-icons';

    // Clear button
    if (this.options.clearable) {
      const clearBtn = document.createElement('button');
      clearBtn.className = 'dropdown-clear';
      clearBtn.type = 'button';
      clearBtn.innerHTML = '×';
      clearBtn.style.display = 'none';
      icons.appendChild(clearBtn);
      this.clearBtn = clearBtn;
    }

    // Dropdown arrow
    const arrow = document.createElement('span');
    arrow.className = 'dropdown-arrow';
    arrow.innerHTML = '▼';
    icons.appendChild(arrow);

    selectBtn.appendChild(valueDisplay);
    selectBtn.appendChild(icons);

    // Create menu
    const menu = document.createElement('div');
    menu.className = 'dropdown-menu';
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('aria-hidden', 'true');

    // Search box (for multiple or when searchable)
    if (this.options.searchable && this.options.multiple) {
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

    // Options container
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'dropdown-items';

    if (this.options.virtualScroll) {
      itemsContainer.classList.add('dropdown-items--virtual');
      this.setupVirtualScroll(itemsContainer);
    }

    menu.appendChild(itemsContainer);

    // No results message
    const noResults = document.createElement('div');
    noResults.className = 'dropdown-no-results';
    noResults.textContent = 'No results found';
    noResults.style.display = 'none';
    menu.appendChild(noResults);

    // Loading indicator
    const loading = document.createElement('div');
    loading.className = 'dropdown-loading';
    loading.innerHTML = '<span class="dropdown-spinner"></span> Loading...';
    loading.style.display = 'none';
    menu.appendChild(loading);

    // Add to wrapper
    wrapper.appendChild(selectBtn);
    wrapper.appendChild(menu);

    // Replace element
    this.element.appendChild(wrapper);

    // Store references
    this.wrapper = wrapper;
    this.selectBtn = selectBtn;
    this.valueDisplay = valueDisplay;
    this.menu = menu;
    this.itemsContainer = itemsContainer;
    this.noResults = noResults;
    this.loading = loading;

    this.createdElements.add(wrapper);

    // Initial render
    this.renderItems();
  }

  setupVirtualScroll(container) {
    // Create viewport
    const viewport = document.createElement('div');
    viewport.className = 'dropdown-viewport';

    // Create spacer for scrollbar
    const spacer = document.createElement('div');
    spacer.className = 'dropdown-spacer';

    container.appendChild(spacer);
    container.appendChild(viewport);

    this.viewport = viewport;
    this.spacer = spacer;

    // Setup scroll observer
    const scrollHandler = this.debounce(() => {
      this.renderVirtualItems();
    }, 10);

    this.addHandler(container, 'scroll', scrollHandler);
  }

  renderItems(searchTerm = '') {
    // Filter items
    let items = this.state.allItems;

    if (searchTerm) {
      items = this.filterItems(searchTerm);
    }

    // Sort items
    if (this.options.sortBy) {
      items = this.sortItems(items);
    }

    // Group items
    if (this.options.groupBy) {
      items = this.groupItems(items);
    }

    this.state.filteredItems = items;

    // Render based on virtual scroll
    if (this.options.virtualScroll) {
      this.renderVirtualItems();
    } else {
      this.renderNormalItems();
    }

    // Show/hide no results
    this.noResults.style.display = items.length === 0 ? 'block' : 'none';
  }

  renderNormalItems() {
    this.itemsContainer.innerHTML = '';

    let currentGroup = null;

    this.state.filteredItems.forEach((item, index) => {
      // Render group header
      if (item.group && item.group !== currentGroup) {
        const groupHeader = document.createElement('div');
        groupHeader.className = 'dropdown-group-header';
        groupHeader.textContent = item.group;
        this.itemsContainer.appendChild(groupHeader);
        currentGroup = item.group;
      }

      // Render item
      const itemEl = this.createItemElement(item, index);
      this.itemsContainer.appendChild(itemEl);
    });
  }

  renderVirtualItems() {
    const scrollTop = this.itemsContainer.scrollTop;
    const containerHeight = this.itemsContainer.clientHeight;
    const itemHeight = 40; // Approximate item height

    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      this.state.filteredItems.length,
    );

    // Update spacer height
    this.spacer.style.height = `${this.state.filteredItems.length * itemHeight}px`;

    // Clear viewport
    this.viewport.innerHTML = '';
    this.viewport.style.transform = `translateY(${startIndex * itemHeight}px)`;

    // Render visible items
    for (let i = startIndex; i < endIndex; i++) {
      const item = this.state.filteredItems[i];
      if (item) {
        const itemEl = this.createItemElement(item, i);
        this.viewport.appendChild(itemEl);
      }
    }
  }

  createItemElement(item, index) {
    const itemEl = document.createElement('div');
    itemEl.className = 'dropdown-item';
    itemEl.setAttribute('role', 'option');
    itemEl.dataset.value = item.value;
    itemEl.dataset.index = index;

    if (item.disabled) {
      itemEl.classList.add('dropdown-item--disabled');
      itemEl.setAttribute('aria-disabled', 'true');
    }

    if (this.isSelected(item.value)) {
      itemEl.classList.add('dropdown-item--selected');
      itemEl.setAttribute('aria-selected', 'true');
    }

    if (index === this.state.highlightedIndex) {
      itemEl.classList.add('dropdown-item--highlighted');
    }

    // Custom renderer or default
    if (this.options.optionRenderer) {
      itemEl.innerHTML = this.options.optionRenderer(item, this);
    } else {
      // Checkbox for multiple
      if (this.options.multiple) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'dropdown-checkbox';
        checkbox.checked = this.isSelected(item.value);
        checkbox.onclick = (e) => e.stopPropagation();
        itemEl.appendChild(checkbox);
      }

      // Text
      const text = document.createElement('span');
      text.className = 'dropdown-item-text';
      text.textContent = item.text;
      itemEl.appendChild(text);

      // Highlight search term
      if (this.state.searchTerm) {
        this.highlightSearchTerm(text, this.state.searchTerm);
      }
    }

    // Bind events
    if (!item.disabled) {
      const selectHandler = (e) => {
        e.stopPropagation();
        this.selectItem(item);
      };

      const hoverHandler = () => {
        this.state.highlightedIndex = index;
        this.updateHighlight();
      };

      this.addHandler(itemEl, 'click', selectHandler);
      this.addHandler(itemEl, 'mouseenter', hoverHandler);
    }

    return itemEl;
  }

  bindEvents() {
    // Toggle dropdown
    const toggleHandler = () => this.toggle();
    this.addHandler(this.selectBtn, 'click', toggleHandler);

    // Keyboard navigation
    const keyHandler = (e) => this.handleKeydown(e);
    this.addHandler(this.selectBtn, 'keydown', keyHandler);
    this.addHandler(this.menu, 'keydown', keyHandler);

    // Search input
    if (this.searchInput) {
      const searchHandler = (e) => {
        this.state.searchTerm = e.target.value;

        if (this.searchDebounceTimer) {
          clearTimeout(this.searchDebounceTimer);
        }

        this.searchDebounceTimer = setTimeout(
          () => {
            this.handleSearch(e.target.value);
          },
          this.options.ajax ? 300 : 0,
        );

        this.timers.add(this.searchDebounceTimer);
      };

      this.addHandler(this.searchInput, 'input', searchHandler);

      // Prevent dropdown from closing when clicking search
      const preventClose = (e) => e.stopPropagation();
      this.addHandler(this.searchInput, 'click', preventClose);
    }

    // Clear button
    if (this.clearBtn) {
      const clearHandler = (e) => {
        e.stopPropagation();
        this.clear();
      };
      this.addHandler(this.clearBtn, 'click', clearHandler);
    }

    // Focus events
    if (this.options.openOnFocus) {
      const focusHandler = () => this.open();
      this.addHandler(this.selectBtn, 'focus', focusHandler);
    }

    // Click outside to close
    const outsideHandler = (e) => {
      if (!this.wrapper.contains(e.target) && this.state.isOpen) {
        this.close();
      }
    };
    this.addHandler(document, 'click', outsideHandler);

    // ESC key to close
    const escHandler = (e) => {
      if (e.key === 'Escape' && this.state.isOpen) {
        this.close();
        this.selectBtn.focus();
      }
    };
    this.addHandler(document, 'keydown', escHandler);

    // Window resize
    const resizeHandler = () => this.updatePosition();
    this.addHandler(window, 'resize', resizeHandler);

    // Handle native select changes
    if (this.nativeSelect) {
      const changeHandler = () => this.syncFromNative();
      this.addHandler(this.nativeSelect, 'change', changeHandler);
    }
  }

  handleKeydown(e) {
    const items = this.state.filteredItems.filter((i) => !i.disabled);

    switch (e.key) {
      case 'Enter':
        if (this.state.isOpen && this.state.highlightedIndex >= 0) {
          e.preventDefault();
          const item = items[this.state.highlightedIndex];
          if (item) this.selectItem(item);
        } else {
          e.preventDefault();
          this.open();
        }
        break;

      case ' ':
        if (!this.searchInput || e.target !== this.searchInput) {
          e.preventDefault();
          if (this.state.isOpen && this.state.highlightedIndex >= 0) {
            const item = items[this.state.highlightedIndex];
            if (item) this.selectItem(item);
          } else {
            this.open();
          }
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!this.state.isOpen) {
          this.open();
        } else {
          this.state.highlightedIndex = Math.min(this.state.highlightedIndex + 1, items.length - 1);
          this.updateHighlight();
          this.scrollToHighlighted();
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (this.state.isOpen) {
          this.state.highlightedIndex = Math.max(this.state.highlightedIndex - 1, 0);
          this.updateHighlight();
          this.scrollToHighlighted();
        }
        break;

      case 'Home':
        if (this.state.isOpen) {
          e.preventDefault();
          this.state.highlightedIndex = 0;
          this.updateHighlight();
          this.scrollToHighlighted();
        }
        break;

      case 'End':
        if (this.state.isOpen) {
          e.preventDefault();
          this.state.highlightedIndex = items.length - 1;
          this.updateHighlight();
          this.scrollToHighlighted();
        }
        break;

      case 'Tab':
        if (this.state.isOpen && this.options.selectOnTab && this.state.highlightedIndex >= 0) {
          const item = items[this.state.highlightedIndex];
          if (item) {
            e.preventDefault();
            this.selectItem(item);
          }
        }
        break;
    }
  }

  handleSearch(searchTerm) {
    if (this.options.ajax && this.options.source) {
      this.loadRemoteData(searchTerm);
    } else {
      this.renderItems(searchTerm);

      if (this.options.onSearch) {
        this.options.onSearch(searchTerm, this.state.filteredItems, this);
      }
    }
  }

  async loadRemoteData(searchTerm) {
    // Check cache
    if (this.options.cacheResults && this.state.cache.has(searchTerm)) {
      this.state.allItems = this.state.cache.get(searchTerm);
      this.renderItems();
      return;
    }

    this.state.loading = true;
    this.loading.style.display = 'block';

    try {
      let data;

      if (typeof this.options.source === 'function') {
        data = await this.options.source(searchTerm);
      } else {
        const response = await fetch(`${this.options.source}?q=${encodeURIComponent(searchTerm)}`);
        data = await response.json();
      }

      // Cache results
      if (this.options.cacheResults) {
        this.state.cache.set(searchTerm, data);
      }

      this.state.allItems = data;
      this.renderItems();
    } catch (error) {
      this.noResults.textContent = 'Error loading data';
      this.noResults.style.display = 'block';
    } finally {
      this.state.loading = false;
      this.loading.style.display = 'none';
    }
  }

  filterItems(searchTerm) {
    const term = searchTerm.toLowerCase();

    return this.state.allItems.filter((item) => {
      const text = item.text.toLowerCase();
      const value = item.value.toString().toLowerCase();

      return text.includes(term) || value.includes(term);
    });
  }

  sortItems(items) {
    const sortBy = this.options.sortBy;

    if (typeof sortBy === 'function') {
      return items.sort(sortBy);
    }

    if (typeof sortBy === 'string') {
      return items.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];

        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
        return 0;
      });
    }

    return items;
  }

  groupItems(items) {
    const groups = new Map();

    items.forEach((item) => {
      const groupKey =
        typeof this.options.groupBy === 'function'
          ? this.options.groupBy(item)
          : item[this.options.groupBy];

      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }

      groups.get(groupKey).push(item);
    });

    // Flatten groups
    const grouped = [];
    groups.forEach((groupItems, groupName) => {
      groupItems.forEach((item) => {
        grouped.push({ ...item, group: groupName });
      });
    });

    return grouped;
  }

  highlightSearchTerm(element, term) {
    const text = element.textContent;
    const regex = new RegExp(`(${term})`, 'gi');
    const highlighted = text.replace(regex, '<mark>$1</mark>');
    element.innerHTML = highlighted;
  }

  selectItem(item) {
    if (this.options.multiple) {
      const index = this.state.selectedValues.indexOf(item.value);

      if (index > -1) {
        // Remove
        this.state.selectedValues.splice(index, 1);
        this.state.selectedItems.splice(index, 1);

        if (this.options.onRemove) {
          this.options.onRemove(item, this);
        }
      } else {
        // Add
        if (!this.options.maxItems || this.state.selectedValues.length < this.options.maxItems) {
          this.state.selectedValues.push(item.value);
          this.state.selectedItems.push(item);

          if (this.options.onSelect) {
            this.options.onSelect(item, this);
          }
        }
      }

      this.renderItems(this.state.searchTerm);
    } else {
      this.state.selectedValues = [item.value];
      this.state.selectedItems = [item];

      if (this.options.onSelect) {
        this.options.onSelect(item, this);
      }

      if (this.options.closeOnSelect) {
        this.close();
      }
    }

    this.updateDisplay();
    this.updateNativeSelect();

    if (this.options.onChange) {
      this.options.onChange(this.getValue(), this);
    }
  }

  updateDisplay() {
    if (this.state.selectedItems.length === 0) {
      if (this.valueText) {
        this.valueText.className = 'dropdown-value-text dropdown-placeholder';
        this.valueText.textContent = this.options.placeholder;
      }

      if (this.clearBtn) {
        this.clearBtn.style.display = 'none';
      }
    } else {
      if (this.options.multiple && this.valueText) {
        // Multi-select display
        this.valueText.className = 'dropdown-value-text';
        this.valueText.innerHTML = '';

        this.state.selectedItems.forEach((item) => {
          const tag = document.createElement('span');
          tag.className = 'dropdown-tag';

          const tagText = document.createElement('span');
          tagText.textContent = item.text;

          const removeBtn = document.createElement('button');
          removeBtn.className = 'dropdown-tag-remove';
          removeBtn.innerHTML = '×';
          removeBtn.onclick = (e) => {
            e.stopPropagation();
            this.removeItem(item);
          };

          tag.appendChild(tagText);
          tag.appendChild(removeBtn);
          this.valueText.appendChild(tag);
        });
      } else if (this.valueText) {
        // Single select display
        const item = this.state.selectedItems[0];

        if (this.options.selectedRenderer) {
          this.valueText.innerHTML = this.options.selectedRenderer(item, this);
        } else {
          this.valueText.className = 'dropdown-value-text';
          this.valueText.textContent = item.text;
        }
      } else if (this.searchInput && !this.options.multiple) {
        // Searchable single select
        this.searchInput.value = this.state.selectedItems[0].text;
      }

      if (this.clearBtn) {
        this.clearBtn.style.display = 'block';
      }
    }
  }

  updateNativeSelect() {
    if (!this.nativeSelect) return;

    this.nativeSelect.querySelectorAll('option').forEach((option) => {
      option.selected = this.state.selectedValues.includes(option.value);
    });

    // Trigger change event
    const event = new Event('change', { bubbles: true });
    this.nativeSelect.dispatchEvent(event);
  }

  updateHighlight() {
    this.itemsContainer.querySelectorAll('.dropdown-item').forEach((item, index) => {
      if (index === this.state.highlightedIndex) {
        item.classList.add('dropdown-item--highlighted');
      } else {
        item.classList.remove('dropdown-item--highlighted');
      }
    });
  }

  scrollToHighlighted() {
    const highlighted = this.itemsContainer.querySelector('.dropdown-item--highlighted');
    if (highlighted) {
      highlighted.scrollIntoView({ block: 'nearest' });
    }
  }

  updatePosition() {
    if (!this.state.isOpen) return;

    const rect = this.selectBtn.getBoundingClientRect();
    const menuHeight = this.menu.offsetHeight;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    this.menu.classList.remove('dropdown-menu--top', 'dropdown-menu--bottom');

    if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
      this.menu.classList.add('dropdown-menu--top');
    } else {
      this.menu.classList.add('dropdown-menu--bottom');
    }
  }

  removeItem(item) {
    const index = this.state.selectedValues.indexOf(item.value);
    if (index > -1) {
      this.state.selectedValues.splice(index, 1);
      this.state.selectedItems.splice(index, 1);

      this.updateDisplay();
      this.updateNativeSelect();
      this.renderItems(this.state.searchTerm);

      if (this.options.onRemove) {
        this.options.onRemove(item, this);
      }

      if (this.options.onChange) {
        this.options.onChange(this.getValue(), this);
      }
    }
  }

  isSelected(value) {
    return this.state.selectedValues.includes(value);
  }

  setInitialValue() {
    const selectedItems = this.state.allItems.filter((item) => item.selected);

    if (selectedItems.length > 0) {
      this.state.selectedValues = selectedItems.map((item) => item.value);
      this.state.selectedItems = selectedItems;
      this.updateDisplay();
    }
  }

  syncFromNative() {
    if (!this.nativeSelect) return;

    const selectedOptions = Array.from(this.nativeSelect.selectedOptions);
    this.state.selectedValues = selectedOptions.map((opt) => opt.value);
    this.state.selectedItems = this.state.allItems.filter((item) =>
      this.state.selectedValues.includes(item.value),
    );

    this.updateDisplay();
    this.renderItems(this.state.searchTerm);
  }

  open() {
    if (this.state.isOpen || this.options.disabled) return;

    this.state.isOpen = true;
    this.wrapper.classList.add('dropdown-enhanced--open');
    this.selectBtn.setAttribute('aria-expanded', 'true');
    this.menu.setAttribute('aria-hidden', 'false');

    this.updatePosition();

    // Focus search or highlight first
    if (this.searchInput) {
      if (this.options.multiple || !this.state.selectedItems.length) {
        this.searchInput.focus();
      }
    }

    if (this.options.highlightFirst && !this.state.highlightedIndex) {
      const firstEnabled = this.state.filteredItems.findIndex((i) => !i.disabled);
      if (firstEnabled >= 0) {
        this.state.highlightedIndex = firstEnabled;
        this.updateHighlight();
      }
    }

    if (this.options.onOpen) {
      this.options.onOpen(this);
    }
  }

  close() {
    if (!this.state.isOpen) return;

    this.state.isOpen = false;
    this.wrapper.classList.remove('dropdown-enhanced--open');
    this.selectBtn.setAttribute('aria-expanded', 'false');
    this.menu.setAttribute('aria-hidden', 'true');

    // Clear search
    if (this.searchInput) {
      this.searchInput.value = '';
      this.state.searchTerm = '';
      this.renderItems();
    }

    this.state.highlightedIndex = -1;

    if (this.options.onClose) {
      this.options.onClose(this);
    }
  }

  toggle() {
    if (this.state.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  clear() {
    this.state.selectedValues = [];
    this.state.selectedItems = [];

    this.updateDisplay();
    this.updateNativeSelect();
    this.renderItems(this.state.searchTerm);

    if (this.options.onChange) {
      this.options.onChange(null, this);
    }
  }

  disable() {
    this.options.disabled = true;
    this.wrapper.classList.add('dropdown-enhanced--disabled');
    this.selectBtn.setAttribute('aria-disabled', 'true');
    this.selectBtn.setAttribute('tabindex', '-1');
    this.close();
  }

  enable() {
    this.options.disabled = false;
    this.wrapper.classList.remove('dropdown-enhanced--disabled');
    this.selectBtn.setAttribute('aria-disabled', 'false');
    this.selectBtn.setAttribute('tabindex', '0');
  }

  // Helper methods
  addHandler(element, event, handler) {
    element.addEventListener(event, handler);

    if (!this.handlers.has(element)) {
      this.handlers.set(element, []);
    }

    this.handlers.get(element).push({ event, handler });
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Public API
  getValue() {
    if (this.options.multiple) {
      return this.state.selectedValues;
    }
    return this.state.selectedValues[0] || null;
  }

  getItems() {
    if (this.options.multiple) {
      return this.state.selectedItems;
    }
    return this.state.selectedItems[0] || null;
  }

  setValue(value) {
    if (this.options.multiple && Array.isArray(value)) {
      this.state.selectedValues = value;
      this.state.selectedItems = this.state.allItems.filter((item) => value.includes(item.value));
    } else if (value) {
      this.state.selectedValues = [value];
      this.state.selectedItems = this.state.allItems.filter((item) => item.value === value);
    } else {
      this.clear();
    }

    this.updateDisplay();
    this.updateNativeSelect();
    this.renderItems();
  }

  addOption(option) {
    this.state.allItems.push(option);
    this.renderItems(this.state.searchTerm);
  }

  removeOption(value) {
    this.state.allItems = this.state.allItems.filter((item) => item.value !== value);
    this.removeItem({ value });
    this.renderItems(this.state.searchTerm);
  }

  refresh() {
    this.parseNativeSelect();
    this.renderItems(this.state.searchTerm);
    this.setInitialValue();
  }

  /**
   * Comprehensive destroy method
   */
  destroy() {
    // Close if open
    this.close();

    // Clear all timers
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();

    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    // Remove all event listeners
    this.handlers.forEach((handlerList, element) => {
      handlerList.forEach(({ event, handler }) => {
        element.removeEventListener(event, handler);
      });
    });
    this.handlers.clear();

    // Disconnect observers
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();

    // Remove created elements
    this.createdElements.forEach((element) => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.createdElements.clear();

    // Show native select if it exists
    if (this.nativeSelect) {
      this.nativeSelect.style.display = '';
    }

    // Clear all references
    this.element = null;
    this.wrapper = null;
    this.selectBtn = null;
    this.valueDisplay = null;
    this.valueText = null;
    this.searchInput = null;
    this.clearBtn = null;
    this.menu = null;
    this.itemsContainer = null;
    this.noResults = null;
    this.loading = null;
    this.viewport = null;
    this.spacer = null;
    this.nativeSelect = null;

    // Clear state
    this.state = null;
    this.options = null;
  }
}

// Register with component registry if available
if (window.AmphibiousRegistry) {
  window.AmphibiousRegistry.registerComponent('dropdown', DropdownEnhanced, {
    selector: '[data-dropdown]',
    autoInit: true,
  });
}

// Export
window.DropdownEnhanced = DropdownEnhanced;
export default DropdownEnhanced;
