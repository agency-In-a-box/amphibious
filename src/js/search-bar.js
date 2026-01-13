/**
 * Search Bar Component with Autocomplete
 * Vanilla JS search with debouncing and suggestions
 * Part of Amphibious 2.0 Component Library
 */

class SearchBar {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      minChars: options.minChars || 2,
      delay: options.delay || 300,
      maxResults: options.maxResults || 10,
      source: options.source || [],
      searchKeys: options.searchKeys || ['title', 'text'],
      placeholder: options.placeholder || 'Search...',
      noResultsText: options.noResultsText || 'No results found',
      categories: options.categories || null,
      recentSearches: options.recentSearches !== false,
      maxRecent: options.maxRecent || 5,
      highlightMatches: options.highlightMatches !== false,
      autoFocus: options.autoFocus || false,
      clearOnSelect: options.clearOnSelect || false,
      onSelect: options.onSelect || null,
      onSearch: options.onSearch || null,
      onChange: options.onChange || null,
      onClear: options.onClear || null,
      renderItem: options.renderItem || null,
      ...options,
    };

    this.isOpen = false;
    this.currentFocus = -1;
    this.results = [];
    this.debounceTimer = null;
    this.recentSearches = this.loadRecentSearches();

    this.init();
  }

  init() {
    this.createSearchBar();
    this.bindEvents();

    if (this.options.autoFocus) {
      this.input.focus();
    }
  }

  createSearchBar() {
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'search-bar';

    // Create input wrapper
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'search-bar-wrapper';

    // Create search icon
    const icon = document.createElement('span');
    icon.className = 'search-bar-icon';
    icon.innerHTML = `
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    `;

    // Create input
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'search-bar-input';
    input.placeholder = this.options.placeholder;
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');

    // Create clear button
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'search-bar-clear';
    clearBtn.innerHTML = `
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    `;
    clearBtn.setAttribute('aria-label', 'Clear search');

    // Create spinner
    const spinner = document.createElement('div');
    spinner.className = 'search-bar-spinner';

    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'search-bar-dropdown';
    dropdown.setAttribute('role', 'listbox');

    // Add categories if provided
    if (this.options.categories) {
      const categoriesDiv = this.createCategories();
      dropdown.appendChild(categoriesDiv);
    }

    // Create results container
    const results = document.createElement('div');
    results.className = 'search-bar-results';
    dropdown.appendChild(results);

    // Assemble
    inputWrapper.appendChild(icon);
    inputWrapper.appendChild(input);
    inputWrapper.appendChild(clearBtn);
    inputWrapper.appendChild(spinner);
    wrapper.appendChild(inputWrapper);
    wrapper.appendChild(dropdown);

    // Replace original element
    this.element.replaceWith(wrapper);

    // Store references
    this.wrapper = wrapper;
    this.input = input;
    this.clearBtn = clearBtn;
    this.spinner = spinner;
    this.dropdown = dropdown;
    this.resultsContainer = results;
  }

  createCategories() {
    const categoriesDiv = document.createElement('div');
    categoriesDiv.className = 'search-bar-categories';

    this.options.categories.forEach((category) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'search-bar-category';
      btn.textContent = category.label;
      btn.dataset.category = category.value;

      btn.addEventListener('click', () => {
        this.selectCategory(category.value);
      });

      categoriesDiv.appendChild(btn);
    });

    return categoriesDiv;
  }

  bindEvents() {
    // Input events
    this.input.addEventListener('input', () => this.handleInput());
    this.input.addEventListener('focus', () => this.handleFocus());
    this.input.addEventListener('blur', () => this.handleBlur());

    // Keyboard navigation
    this.input.addEventListener('keydown', (e) => this.handleKeydown(e));

    // Clear button
    this.clearBtn.addEventListener('click', () => this.clear());

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!this.wrapper.contains(e.target)) {
        this.close();
      }
    });
  }

  handleInput() {
    const value = this.input.value.trim();

    // Update UI state
    if (value) {
      this.wrapper.classList.add('search-bar--has-value');
    } else {
      this.wrapper.classList.remove('search-bar--has-value');
    }

    // Clear previous timer
    clearTimeout(this.debounceTimer);

    // Handle search
    if (value.length >= this.options.minChars) {
      this.wrapper.classList.add('search-bar--loading');

      this.debounceTimer = setTimeout(() => {
        this.search(value);
      }, this.options.delay);
    } else if (value.length === 0 && this.options.recentSearches) {
      this.showRecentSearches();
    } else {
      this.close();
    }

    // Callback
    if (this.options.onChange) {
      this.options.onChange(value, this);
    }
  }

  handleFocus() {
    const value = this.input.value.trim();

    if (value.length >= this.options.minChars) {
      this.search(value);
    } else if (
      value.length === 0 &&
      this.options.recentSearches &&
      this.recentSearches.length > 0
    ) {
      this.showRecentSearches();
    }
  }

  handleBlur() {
    // Delay to allow clicking on results
    setTimeout(() => {
      if (!this.wrapper.contains(document.activeElement)) {
        this.close();
      }
    }, 200);
  }

  handleKeydown(e) {
    const items = this.resultsContainer.querySelectorAll('.search-bar-item');

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.currentFocus++;
        if (this.currentFocus >= items.length) {
          this.currentFocus = 0;
        }
        this.highlightItem(items);
        break;

      case 'ArrowUp':
        e.preventDefault();
        this.currentFocus--;
        if (this.currentFocus < 0) {
          this.currentFocus = items.length - 1;
        }
        this.highlightItem(items);
        break;

      case 'Enter':
        e.preventDefault();
        if (this.currentFocus > -1 && items[this.currentFocus]) {
          items[this.currentFocus].click();
        } else {
          this.search(this.input.value.trim());
        }
        break;

      case 'Escape':
        this.close();
        this.input.blur();
        break;
    }
  }

  highlightItem(items) {
    items.forEach((item, index) => {
      if (index === this.currentFocus) {
        item.classList.add('search-bar-item--active');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('search-bar-item--active');
      }
    });
  }

  async search(query) {
    let results = [];

    try {
      // Get results based on source type
      if (typeof this.options.source === 'function') {
        // Function source
        results = await this.options.source(query);
      } else if (typeof this.options.source === 'string') {
        // Remote URL source
        const response = await fetch(`${this.options.source}?q=${encodeURIComponent(query)}`);
        results = await response.json();
      } else if (Array.isArray(this.options.source)) {
        // Local array source
        results = this.filterLocalData(query);
      }

      // Limit results
      if (this.options.maxResults) {
        results = results.slice(0, this.options.maxResults);
      }

      this.results = results;
      this.renderResults(results, query);

      // Callback
      if (this.options.onSearch) {
        this.options.onSearch(query, results, this);
      }
    } catch (error) {
      console.error('Search error:', error);
      this.renderError();
    } finally {
      this.wrapper.classList.remove('search-bar--loading');
    }
  }

  filterLocalData(query) {
    const lowerQuery = query.toLowerCase();

    return this.options.source.filter((item) => {
      if (typeof item === 'string') {
        return item.toLowerCase().includes(lowerQuery);
      }
      if (typeof item === 'object') {
        return this.options.searchKeys.some((key) => {
          const value = this.getNestedValue(item, key);
          return value?.toString().toLowerCase().includes(lowerQuery);
        });
      }
      return false;
    });
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((curr, prop) => curr?.[prop], obj);
  }

  renderResults(results, query) {
    this.resultsContainer.innerHTML = '';

    if (results.length === 0) {
      this.renderEmpty();
      this.open();
      return;
    }

    results.forEach((result, index) => {
      const item = this.createResultItem(result, query);
      this.resultsContainer.appendChild(item);
    });

    this.currentFocus = -1;
    this.open();
  }

  createResultItem(result, query) {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'search-bar-item';
    item.setAttribute('role', 'option');

    if (this.options.renderItem) {
      // Custom renderer
      item.innerHTML = this.options.renderItem(result, query);
    } else if (typeof result === 'string') {
      // Simple string result
      item.innerHTML = `
        <div class="search-bar-item-content">
          <div class="search-bar-item-title">
            ${this.highlightMatch(result, query)}
          </div>
        </div>
      `;
    } else {
      // Object result
      const title = result.title || result.name || result.text || '';
      const subtitle = result.subtitle || result.description || '';
      const icon = result.icon || '';

      item.innerHTML = `
        ${icon ? `<span class="search-bar-item-icon">${icon}</span>` : ''}
        <div class="search-bar-item-content">
          <div class="search-bar-item-title">
            ${this.highlightMatch(title, query)}
          </div>
          ${
            subtitle
              ? `
            <div class="search-bar-item-subtitle">
              ${this.highlightMatch(subtitle, query)}
            </div>
          `
              : ''
          }
        </div>
      `;
    }

    item.addEventListener('click', () => {
      this.selectResult(result, query);
    });

    return item;
  }

  highlightMatch(text, query) {
    if (!this.options.highlightMatches || !query) {
      return text;
    }

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  showRecentSearches() {
    if (this.recentSearches.length === 0) {
      return;
    }

    this.resultsContainer.innerHTML = '';

    // Create header
    const header = document.createElement('div');
    header.className = 'search-bar-recent-header';
    header.innerHTML = `
      <span>Recent Searches</span>
      <button type="button" class="search-bar-recent-clear">Clear</button>
    `;

    header.querySelector('.search-bar-recent-clear').addEventListener('click', () => {
      this.clearRecentSearches();
    });

    this.resultsContainer.appendChild(header);

    // Add recent items
    const recentDiv = document.createElement('div');
    recentDiv.className = 'search-bar-recent';

    this.recentSearches.forEach((search) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'search-bar-item';
      item.innerHTML = `
        <span class="search-bar-item-icon">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
        <div class="search-bar-item-content">
          <div class="search-bar-item-title">${search}</div>
        </div>
      `;

      item.addEventListener('click', () => {
        this.input.value = search;
        this.handleInput();
      });

      recentDiv.appendChild(item);
    });

    this.resultsContainer.appendChild(recentDiv);
    this.open();
  }

  renderEmpty() {
    this.resultsContainer.innerHTML = `
      <div class="search-bar-empty">
        <svg class="search-bar-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="search-bar-empty-text">${this.options.noResultsText}</div>
      </div>
    `;
  }

  renderError() {
    this.resultsContainer.innerHTML = `
      <div class="search-bar-empty">
        <div class="search-bar-empty-text">Search error. Please try again.</div>
      </div>
    `;
  }

  selectResult(result, query) {
    // Save to recent searches
    if (this.options.recentSearches && query) {
      this.saveRecentSearch(query);
    }

    // Update input
    if (!this.options.clearOnSelect) {
      const value =
        typeof result === 'string' ? result : result.title || result.name || result.text || '';
      this.input.value = value;
    }

    // Close dropdown
    this.close();

    // Callback
    if (this.options.onSelect) {
      this.options.onSelect(result, this);
    }
  }

  selectCategory(category) {
    // Update UI
    const buttons = this.wrapper.querySelectorAll('.search-bar-category');
    buttons.forEach((btn) => {
      btn.classList.toggle('search-bar-category--active', btn.dataset.category === category);
    });

    // Re-search with category
    const query = this.input.value.trim();
    if (query.length >= this.options.minChars) {
      this.search(query);
    }
  }

  open() {
    if (!this.isOpen) {
      this.isOpen = true;
      this.wrapper.classList.add('search-bar--open');
      this.input.setAttribute('aria-expanded', 'true');
    }
  }

  close() {
    if (this.isOpen) {
      this.isOpen = false;
      this.wrapper.classList.remove('search-bar--open');
      this.input.setAttribute('aria-expanded', 'false');
      this.currentFocus = -1;
    }
  }

  clear() {
    this.input.value = '';
    this.wrapper.classList.remove('search-bar--has-value');
    this.close();
    this.input.focus();

    if (this.options.onClear) {
      this.options.onClear(this);
    }
  }

  // Recent searches management
  loadRecentSearches() {
    if (!this.options.recentSearches) return [];

    const stored = localStorage.getItem('search-bar-recent');
    return stored ? JSON.parse(stored) : [];
  }

  saveRecentSearch(query) {
    if (!this.options.recentSearches) return;

    // Remove if already exists
    this.recentSearches = this.recentSearches.filter((s) => s !== query);

    // Add to beginning
    this.recentSearches.unshift(query);

    // Limit length
    if (this.recentSearches.length > this.options.maxRecent) {
      this.recentSearches = this.recentSearches.slice(0, this.options.maxRecent);
    }

    localStorage.setItem('search-bar-recent', JSON.stringify(this.recentSearches));
  }

  clearRecentSearches() {
    this.recentSearches = [];
    localStorage.removeItem('search-bar-recent');
    this.close();
  }

  // Public API
  focus() {
    this.input.focus();
  }

  getValue() {
    return this.input.value;
  }

  setValue(value) {
    this.input.value = value;
    this.handleInput();
  }

  destroy() {
    // Remove event listeners and clean up
    this.wrapper.replaceWith(this.element);
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  const searchBars = document.querySelectorAll('[data-search-bar="true"]');
  searchBars.forEach((element) => {
    new SearchBar(element);
  });
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SearchBar;
}

window.SearchBar = SearchBar;
