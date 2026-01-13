/**
 * Enhanced Search Bar Component JavaScript
 * Advanced search with autocomplete, suggestions, and complete memory management
 * Part of Amphibious 2.0 Component Library
 */

class SearchBarEnhanced {
  constructor(element, options = {}) {
    this.element = element;

    // Memory management
    this.handlers = new Map();
    this.timers = new Set();
    this.createdElements = new Set();
    this.abortControllers = new Set();
    this.observers = new Set();

    this.options = {
      // Basic options
      placeholder: options.placeholder || 'Search...',
      minChars: options.minChars || 2,
      maxResults: options.maxResults || 10,
      debounceDelay: options.debounceDelay || 300,
      searchOnFocus: options.searchOnFocus || false,

      // Data source
      source: options.source || null, // Function, URL, or array
      ajax: options.ajax || false,
      method: options.method || 'GET',
      headers: options.headers || {},

      // Features
      autocomplete: options.autocomplete !== false,
      suggestions: options.suggestions !== false,
      recentSearches: options.recentSearches !== false,
      popularSearches: options.popularSearches || null,
      fuzzySearch: options.fuzzySearch || false,
      highlight: options.highlight !== false,
      cache: options.cache !== false,
      persistRecent: options.persistRecent !== false,

      // Advanced features
      voice: options.voice || false,
      filters: options.filters || null,
      categories: options.categories || null,
      searchOperators: options.searchOperators || false, // Support AND, OR, NOT
      wildcards: options.wildcards || false, // Support * and ?

      // Display options
      resultTemplate: options.resultTemplate || null,
      groupBy: options.groupBy || null,
      sortBy: options.sortBy || null,
      noResultsText: options.noResultsText || 'No results found',
      loadingText: options.loadingText || 'Searching...',
      errorText: options.errorText || 'Search failed',

      // Behavior
      closeOnSelect: options.closeOnSelect !== false,
      selectOnTab: options.selectOnTab || false,
      clearOnEscape: options.clearOnEscape || false,
      submitOnEnter: options.submitOnEnter !== false,

      // UI options
      showIcon: options.showIcon !== false,
      showClear: options.showClear !== false,
      showSubmit: options.showSubmit || false,
      showFilters: options.showFilters || false,
      position: options.position || 'auto', // auto, top, bottom
      maxHeight: options.maxHeight || 400,
      theme: options.theme || 'light',

      // Callbacks
      onSearch: options.onSearch || null,
      onSelect: options.onSelect || null,
      onSubmit: options.onSubmit || null,
      onChange: options.onChange || null,
      onFocus: options.onFocus || null,
      onBlur: options.onBlur || null,
      onClear: options.onClear || null,
      onOpen: options.onOpen || null,
      onClose: options.onClose || null,

      ...options,
    };

    // State management
    this.state = {
      isOpen: false,
      isLoading: false,
      query: '',
      results: [],
      filteredResults: [],
      highlightedIndex: -1,
      selectedItem: null,
      recentSearches: [],
      cache: new Map(),
      activeFilters: new Set(),
      page: 1,
      hasMore: false,
      lastSearch: null,
    };

    // Debounce timer
    this.searchDebounceTimer = null;

    this.init();
  }

  init() {
    this.loadRecentSearches();
    this.createSearchBar();
    this.bindEvents();
    this.setupAccessibility();

    if (this.options.voice) {
      this.setupVoiceSearch();
    }

    if (this.options.filters) {
      this.createFilters();
    }
  }

  createSearchBar() {
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'search-bar-enhanced';
    if (this.options.theme) {
      wrapper.classList.add(`search-bar-theme-${this.options.theme}`);
    }

    // Create input container
    const inputContainer = document.createElement('div');
    inputContainer.className = 'search-bar-input-container';

    // Search icon
    if (this.options.showIcon) {
      const icon = document.createElement('span');
      icon.className = 'search-bar-icon';
      icon.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      `;
      inputContainer.appendChild(icon);
    }

    // Search input
    const input = document.createElement('input');
    input.type = 'search';
    input.className = 'search-bar-input';
    input.placeholder = this.options.placeholder;
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-controls', 'search-results');

    // Voice button
    if (this.options.voice && this.hasVoiceSupport()) {
      const voiceBtn = document.createElement('button');
      voiceBtn.type = 'button';
      voiceBtn.className = 'search-bar-voice';
      voiceBtn.innerHTML = '🎤';
      voiceBtn.setAttribute('aria-label', 'Voice search');
      inputContainer.appendChild(voiceBtn);
      this.voiceBtn = voiceBtn;
    }

    // Clear button
    if (this.options.showClear) {
      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'search-bar-clear';
      clearBtn.innerHTML = '×';
      clearBtn.style.display = 'none';
      clearBtn.setAttribute('aria-label', 'Clear search');
      inputContainer.appendChild(clearBtn);
      this.clearBtn = clearBtn;
    }

    // Submit button
    if (this.options.showSubmit) {
      const submitBtn = document.createElement('button');
      submitBtn.type = 'button';
      submitBtn.className = 'search-bar-submit';
      submitBtn.innerHTML = 'Search';
      inputContainer.appendChild(submitBtn);
      this.submitBtn = submitBtn;
    }

    inputContainer.appendChild(input);

    // Create results container
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'search-bar-results';
    resultsContainer.id = 'search-results';
    resultsContainer.setAttribute('role', 'listbox');
    resultsContainer.style.display = 'none';

    // Sections
    const sectionsContainer = document.createElement('div');
    sectionsContainer.className = 'search-bar-sections';

    // Recent searches section
    if (this.options.recentSearches) {
      const recentSection = document.createElement('div');
      recentSection.className = 'search-bar-section search-bar-recent';
      recentSection.style.display = 'none';

      const recentHeader = document.createElement('div');
      recentHeader.className = 'search-bar-section-header';
      recentHeader.innerHTML = `
        <span>Recent Searches</span>
        <button type="button" class="search-bar-clear-recent">Clear</button>
      `;

      const recentList = document.createElement('div');
      recentList.className = 'search-bar-recent-list';

      recentSection.appendChild(recentHeader);
      recentSection.appendChild(recentList);
      sectionsContainer.appendChild(recentSection);

      this.recentSection = recentSection;
      this.recentList = recentList;
    }

    // Popular searches section
    if (this.options.popularSearches) {
      const popularSection = document.createElement('div');
      popularSection.className = 'search-bar-section search-bar-popular';

      const popularHeader = document.createElement('div');
      popularHeader.className = 'search-bar-section-header';
      popularHeader.textContent = 'Popular Searches';

      const popularList = document.createElement('div');
      popularList.className = 'search-bar-popular-list';

      this.options.popularSearches.forEach((term) => {
        const item = document.createElement('div');
        item.className = 'search-bar-popular-item';
        item.textContent = term;
        popularList.appendChild(item);
      });

      popularSection.appendChild(popularHeader);
      popularSection.appendChild(popularList);
      sectionsContainer.appendChild(popularSection);

      this.popularSection = popularSection;
    }

    // Results list
    const resultsList = document.createElement('div');
    resultsList.className = 'search-bar-results-list';

    // No results message
    const noResults = document.createElement('div');
    noResults.className = 'search-bar-no-results';
    noResults.textContent = this.options.noResultsText;
    noResults.style.display = 'none';

    // Loading indicator
    const loading = document.createElement('div');
    loading.className = 'search-bar-loading';
    loading.innerHTML = `
      <span class="search-bar-spinner"></span>
      ${this.options.loadingText}
    `;
    loading.style.display = 'none';

    // Error message
    const error = document.createElement('div');
    error.className = 'search-bar-error';
    error.textContent = this.options.errorText;
    error.style.display = 'none';

    resultsContainer.appendChild(sectionsContainer);
    resultsContainer.appendChild(resultsList);
    resultsContainer.appendChild(noResults);
    resultsContainer.appendChild(loading);
    resultsContainer.appendChild(error);

    // Assemble wrapper
    wrapper.appendChild(inputContainer);
    wrapper.appendChild(resultsContainer);

    // Add to DOM
    this.element.appendChild(wrapper);

    // Store references
    this.wrapper = wrapper;
    this.input = input;
    this.resultsContainer = resultsContainer;
    this.resultsList = resultsList;
    this.noResults = noResults;
    this.loading = loading;
    this.error = error;

    this.createdElements.add(wrapper);
  }

  createFilters() {
    const filtersContainer = document.createElement('div');
    filtersContainer.className = 'search-bar-filters';

    const filtersToggle = document.createElement('button');
    filtersToggle.type = 'button';
    filtersToggle.className = 'search-bar-filters-toggle';
    filtersToggle.innerHTML = '⚙️ Filters';

    const filtersPanel = document.createElement('div');
    filtersPanel.className = 'search-bar-filters-panel';
    filtersPanel.style.display = 'none';

    this.options.filters.forEach((filter) => {
      const filterGroup = document.createElement('div');
      filterGroup.className = 'search-bar-filter-group';

      const label = document.createElement('label');
      label.textContent = filter.label;

      if (filter.type === 'checkbox') {
        filter.options.forEach((option) => {
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.value = option.value;
          checkbox.name = filter.name;

          const checkLabel = document.createElement('label');
          checkLabel.appendChild(checkbox);
          checkLabel.appendChild(document.createTextNode(` ${option.label}`));

          filterGroup.appendChild(checkLabel);
        });
      } else if (filter.type === 'select') {
        const select = document.createElement('select');
        select.name = filter.name;

        filter.options.forEach((option) => {
          const optionEl = document.createElement('option');
          optionEl.value = option.value;
          optionEl.textContent = option.label;
          select.appendChild(optionEl);
        });

        filterGroup.appendChild(label);
        filterGroup.appendChild(select);
      }

      filtersPanel.appendChild(filterGroup);
    });

    filtersContainer.appendChild(filtersToggle);
    filtersContainer.appendChild(filtersPanel);

    this.wrapper.insertBefore(filtersContainer, this.resultsContainer);

    this.filtersContainer = filtersContainer;
    this.filtersToggle = filtersToggle;
    this.filtersPanel = filtersPanel;

    this.createdElements.add(filtersContainer);

    // Bind filter events
    this.addHandler(filtersToggle, 'click', () => {
      filtersPanel.style.display = filtersPanel.style.display === 'none' ? 'block' : 'none';
    });

    filtersPanel.querySelectorAll('input, select').forEach((filter) => {
      this.addHandler(filter, 'change', () => this.applyFilters());
    });
  }

  bindEvents() {
    // Input events
    this.addHandler(this.input, 'input', (e) => {
      this.state.query = e.target.value;

      if (this.clearBtn) {
        this.clearBtn.style.display = this.state.query ? 'block' : 'none';
      }

      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer);
        this.timers.delete(this.searchDebounceTimer);
      }

      if (this.state.query.length >= this.options.minChars || this.state.query === '') {
        this.searchDebounceTimer = setTimeout(() => {
          this.search(this.state.query);
        }, this.options.debounceDelay);

        this.timers.add(this.searchDebounceTimer);
      } else {
        this.showSuggestions();
      }

      if (this.options.onChange) {
        this.options.onChange(this.state.query, this);
      }
    });

    // Focus/Blur
    this.addHandler(this.input, 'focus', () => {
      if (this.options.searchOnFocus && this.state.query) {
        this.search(this.state.query);
      } else {
        this.showSuggestions();
      }

      if (this.options.onFocus) {
        this.options.onFocus(this);
      }
    });

    this.addHandler(this.input, 'blur', () => {
      const timer = setTimeout(() => {
        if (!this.wrapper.contains(document.activeElement)) {
          this.close();
        }
      }, 200);

      this.timers.add(timer);

      if (this.options.onBlur) {
        this.options.onBlur(this);
      }
    });

    // Keyboard navigation
    this.addHandler(this.input, 'keydown', (e) => this.handleKeydown(e));

    // Clear button
    if (this.clearBtn) {
      this.addHandler(this.clearBtn, 'click', () => this.clear());
    }

    // Submit button
    if (this.submitBtn) {
      this.addHandler(this.submitBtn, 'click', () => this.submit());
    }

    // Voice button
    if (this.voiceBtn) {
      this.addHandler(this.voiceBtn, 'click', () => this.startVoiceSearch());
    }

    // Recent searches
    if (this.recentSection) {
      const clearRecentBtn = this.recentSection.querySelector('.search-bar-clear-recent');
      this.addHandler(clearRecentBtn, 'click', () => this.clearRecentSearches());
    }

    // Click outside to close
    this.addHandler(document, 'click', (e) => {
      if (!this.wrapper.contains(e.target) && this.state.isOpen) {
        this.close();
      }
    });

    // Results scroll for infinite loading
    if (this.options.source && typeof this.options.source === 'string') {
      this.addHandler(this.resultsList, 'scroll', () => {
        const { scrollTop, scrollHeight, clientHeight } = this.resultsList;
        if (
          scrollTop + clientHeight >= scrollHeight - 50 &&
          this.state.hasMore &&
          !this.state.isLoading
        ) {
          this.loadMore();
        }
      });
    }
  }

  setupAccessibility() {
    // ARIA live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    this.wrapper.appendChild(liveRegion);
    this.liveRegion = liveRegion;

    // Update ARIA attributes
    const updateAria = () => {
      const resultCount = this.state.filteredResults.length;
      if (resultCount > 0) {
        this.liveRegion.textContent = `${resultCount} results available`;
      } else if (this.state.query) {
        this.liveRegion.textContent = 'No results found';
      }
    };

    // Observer for results changes
    const observer = new MutationObserver(updateAria);
    observer.observe(this.resultsList, { childList: true });
    this.observers.add(observer);
  }

  setupVoiceSearch() {
    if (!this.hasVoiceSupport()) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      this.input.value = transcript;
      this.state.query = transcript;
      this.search(transcript);
    };

    this.recognition.onerror = () => {
      this.showError('Voice search failed');
    };
  }

  handleKeydown(e) {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (this.state.highlightedIndex >= 0) {
          const item = this.state.filteredResults[this.state.highlightedIndex];
          if (item) this.selectItem(item);
        } else if (this.options.submitOnEnter) {
          this.submit();
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        this.navigate(1);
        break;

      case 'ArrowUp':
        e.preventDefault();
        this.navigate(-1);
        break;

      case 'Escape':
        if (this.options.clearOnEscape && this.state.query) {
          e.preventDefault();
          this.clear();
        } else {
          this.close();
        }
        break;

      case 'Tab':
        if (this.options.selectOnTab && this.state.highlightedIndex >= 0) {
          e.preventDefault();
          const item = this.state.filteredResults[this.state.highlightedIndex];
          if (item) this.selectItem(item);
        }
        break;
    }
  }

  navigate(direction) {
    const maxIndex = this.state.filteredResults.length - 1;

    if (direction === 1) {
      this.state.highlightedIndex = Math.min(this.state.highlightedIndex + 1, maxIndex);
    } else {
      this.state.highlightedIndex = Math.max(this.state.highlightedIndex - 1, -1);
    }

    this.updateHighlight();
  }

  updateHighlight() {
    this.resultsContainer.querySelectorAll('.search-bar-result').forEach((el, index) => {
      if (index === this.state.highlightedIndex) {
        el.classList.add('search-bar-result--highlighted');
        el.scrollIntoView({ block: 'nearest' });
      } else {
        el.classList.remove('search-bar-result--highlighted');
      }
    });
  }

  async search(query) {
    if (!query && !this.options.searchOnFocus) {
      this.showSuggestions();
      return;
    }

    // Check cache
    if (this.options.cache && this.state.cache.has(query)) {
      this.state.results = this.state.cache.get(query);
      this.renderResults();
      return;
    }

    this.state.isLoading = true;
    this.showLoading();

    try {
      let results = [];

      if (typeof this.options.source === 'function') {
        results = await this.options.source(query);
      } else if (typeof this.options.source === 'string') {
        results = await this.fetchResults(query);
      } else if (Array.isArray(this.options.source)) {
        results = this.searchLocal(query);
      }

      // Cache results
      if (this.options.cache) {
        this.state.cache.set(query, results);
      }

      this.state.results = results;
      this.state.lastSearch = query;

      // Add to recent searches
      if (query && !this.state.recentSearches.includes(query)) {
        this.state.recentSearches.unshift(query);
        if (this.state.recentSearches.length > 10) {
          this.state.recentSearches.pop();
        }
        this.saveRecentSearches();
      }

      this.applyFilters();

      if (this.options.onSearch) {
        this.options.onSearch(query, results, this);
      }
    } catch (error) {
      this.showError();
    } finally {
      this.state.isLoading = false;
    }
  }

  async fetchResults(query) {
    const controller = new AbortController();
    this.abortControllers.add(controller);

    try {
      const url = new URL(this.options.source);
      url.searchParams.set('q', query);

      if (this.state.page > 1) {
        url.searchParams.set('page', this.state.page);
      }

      // Add filters to URL
      this.state.activeFilters.forEach((filter) => {
        url.searchParams.append('filter', filter);
      });

      const response = await fetch(url, {
        method: this.options.method,
        headers: this.options.headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      // Assume the API returns { results: [], hasMore: bool }
      if (typeof data === 'object' && data.results) {
        this.state.hasMore = data.hasMore || false;
        return data.results;
      }

      return data;
    } finally {
      this.abortControllers.delete(controller);
    }
  }

  searchLocal(query) {
    const lowerQuery = query.toLowerCase();
    const results = this.options.source.filter((item) => {
      const searchText = typeof item === 'string' ? item : item.text || item.label || '';

      if (this.options.fuzzySearch) {
        return this.fuzzyMatch(searchText.toLowerCase(), lowerQuery);
      }
      return searchText.toLowerCase().includes(lowerQuery);
    });

    return results.slice(0, this.options.maxResults);
  }

  fuzzyMatch(str, pattern) {
    let patternIdx = 0;
    const patternLength = pattern.length;
    const strLength = str.length;

    for (let strIdx = 0; strIdx < strLength && patternIdx < patternLength; strIdx++) {
      if (str[strIdx] === pattern[patternIdx]) {
        patternIdx++;
      }
    }

    return patternIdx === patternLength;
  }

  applyFilters() {
    let results = [...this.state.results];

    // Apply active filters
    if (this.filtersPanel) {
      this.state.activeFilters.clear();

      this.filtersPanel.querySelectorAll('input:checked, select').forEach((filter) => {
        if (filter.value) {
          this.state.activeFilters.add(filter.value);

          // Filter results based on filter logic
          // This is a simple example, real implementation would be more complex
          if (filter.dataset.filterField) {
            results = results.filter((item) => {
              return item[filter.dataset.filterField] === filter.value;
            });
          }
        }
      });
    }

    // Apply categories
    if (this.options.categories && this.state.selectedCategory) {
      results = results.filter((item) => item.category === this.state.selectedCategory);
    }

    // Sort results
    if (this.options.sortBy) {
      results = this.sortResults(results);
    }

    // Group results
    if (this.options.groupBy) {
      results = this.groupResults(results);
    }

    // Limit results
    results = results.slice(0, this.options.maxResults);

    this.state.filteredResults = results;
    this.renderResults();
  }

  sortResults(results) {
    if (typeof this.options.sortBy === 'function') {
      return results.sort(this.options.sortBy);
    }

    if (typeof this.options.sortBy === 'string') {
      return results.sort((a, b) => {
        const aVal = a[this.options.sortBy];
        const bVal = b[this.options.sortBy];
        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
        return 0;
      });
    }

    return results;
  }

  groupResults(results) {
    const groups = new Map();

    results.forEach((item) => {
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
    groups.forEach((items, groupName) => {
      grouped.push({ type: 'group', name: groupName });
      grouped.push(...items);
    });

    return grouped;
  }

  renderResults() {
    this.resultsList.innerHTML = '';
    this.state.highlightedIndex = -1;

    if (this.state.filteredResults.length === 0) {
      this.showNoResults();
      return;
    }

    this.state.filteredResults.forEach((item, index) => {
      if (item.type === 'group') {
        const groupHeader = document.createElement('div');
        groupHeader.className = 'search-bar-group-header';
        groupHeader.textContent = item.name;
        this.resultsList.appendChild(groupHeader);
      } else {
        const resultEl = this.createResultElement(item, index);
        this.resultsList.appendChild(resultEl);
      }
    });

    this.open();
  }

  createResultElement(item, index) {
    const resultEl = document.createElement('div');
    resultEl.className = 'search-bar-result';
    resultEl.setAttribute('role', 'option');
    resultEl.dataset.index = index;

    if (this.options.resultTemplate) {
      resultEl.innerHTML = this.options.resultTemplate(item, this.state.query, this);
    } else {
      const text = typeof item === 'string' ? item : item.text || item.label || item.title || '';
      const displayText = this.options.highlight
        ? this.highlightQuery(text, this.state.query)
        : text;

      resultEl.innerHTML = `
        <div class="search-bar-result-text">${displayText}</div>
        ${item.description ? `<div class="search-bar-result-description">${item.description}</div>` : ''}
      `;
    }

    // Bind events
    this.addHandler(resultEl, 'click', () => this.selectItem(item));
    this.addHandler(resultEl, 'mouseenter', () => {
      this.state.highlightedIndex = index;
      this.updateHighlight();
    });

    return resultEl;
  }

  highlightQuery(text, query) {
    if (!query) return text;

    const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  selectItem(item) {
    this.state.selectedItem = item;

    const text = typeof item === 'string' ? item : item.text || item.label || item.title || '';
    this.input.value = text;
    this.state.query = text;

    if (this.options.onSelect) {
      this.options.onSelect(item, this);
    }

    if (this.options.closeOnSelect) {
      this.close();
    }

    // Add to recent
    if (!this.state.recentSearches.includes(text)) {
      this.state.recentSearches.unshift(text);
      if (this.state.recentSearches.length > 10) {
        this.state.recentSearches.pop();
      }
      this.saveRecentSearches();
    }
  }

  showSuggestions() {
    this.resultsList.innerHTML = '';

    let hasSuggestions = false;

    // Show recent searches
    if (this.options.recentSearches && this.state.recentSearches.length > 0) {
      this.renderRecentSearches();
      hasSuggestions = true;
    }

    // Show popular searches
    if (this.options.popularSearches && this.popularSection) {
      this.popularSection.style.display = 'block';
      hasSuggestions = true;
    }

    if (hasSuggestions) {
      this.open();
    } else {
      this.close();
    }
  }

  renderRecentSearches() {
    if (!this.recentSection) return;

    this.recentList.innerHTML = '';

    this.state.recentSearches.forEach((search) => {
      const item = document.createElement('div');
      item.className = 'search-bar-recent-item';
      item.innerHTML = `
        <span class="search-bar-recent-text">🕐 ${search}</span>
        <button type="button" class="search-bar-recent-remove" data-search="${search}">×</button>
      `;

      this.addHandler(item.querySelector('.search-bar-recent-text'), 'click', () => {
        this.input.value = search;
        this.state.query = search;
        this.search(search);
      });

      this.addHandler(item.querySelector('.search-bar-recent-remove'), 'click', (e) => {
        e.stopPropagation();
        this.removeRecentSearch(search);
      });

      this.recentList.appendChild(item);
    });

    this.recentSection.style.display = 'block';
  }

  loadMore() {
    if (this.state.isLoading || !this.state.hasMore) return;

    this.state.page++;
    this.search(this.state.lastSearch);
  }

  submit() {
    if (this.options.onSubmit) {
      this.options.onSubmit(this.state.query, this.state.selectedItem, this);
    }

    this.close();
  }

  clear() {
    this.input.value = '';
    this.state.query = '';
    this.state.selectedItem = null;
    this.state.highlightedIndex = -1;

    if (this.clearBtn) {
      this.clearBtn.style.display = 'none';
    }

    this.close();

    if (this.options.onClear) {
      this.options.onClear(this);
    }
  }

  open() {
    if (this.state.isOpen) return;

    this.state.isOpen = true;
    this.resultsContainer.style.display = 'block';
    this.input.setAttribute('aria-expanded', 'true');

    this.updatePosition();

    if (this.options.onOpen) {
      this.options.onOpen(this);
    }
  }

  close() {
    if (!this.state.isOpen) return;

    this.state.isOpen = false;
    this.resultsContainer.style.display = 'none';
    this.input.setAttribute('aria-expanded', 'false');

    this.state.highlightedIndex = -1;

    if (this.options.onClose) {
      this.options.onClose(this);
    }
  }

  updatePosition() {
    if (this.options.position === 'auto') {
      const rect = this.input.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      this.resultsContainer.classList.remove(
        'search-bar-results--top',
        'search-bar-results--bottom',
      );

      if (spaceBelow < this.options.maxHeight && spaceAbove > spaceBelow) {
        this.resultsContainer.classList.add('search-bar-results--top');
      } else {
        this.resultsContainer.classList.add('search-bar-results--bottom');
      }
    }
  }

  showLoading() {
    this.loading.style.display = 'block';
    this.noResults.style.display = 'none';
    this.error.style.display = 'none';
    this.resultsList.innerHTML = '';
    this.open();
  }

  showNoResults() {
    this.loading.style.display = 'none';
    this.noResults.style.display = 'block';
    this.error.style.display = 'none';
    this.open();
  }

  showError(message) {
    this.loading.style.display = 'none';
    this.noResults.style.display = 'none';
    this.error.style.display = 'block';
    if (message) {
      this.error.textContent = message;
    }
    this.open();
  }

  startVoiceSearch() {
    if (this.recognition) {
      this.recognition.start();
      this.voiceBtn.classList.add('search-bar-voice--active');

      this.recognition.onend = () => {
        this.voiceBtn.classList.remove('search-bar-voice--active');
      };
    }
  }

  hasVoiceSupport() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  loadRecentSearches() {
    if (!this.options.persistRecent) return;

    try {
      const saved = localStorage.getItem('amphibious-recent-searches');
      if (saved) {
        this.state.recentSearches = JSON.parse(saved);
      }
    } catch (e) {
      // Ignore errors
    }
  }

  saveRecentSearches() {
    if (!this.options.persistRecent) return;

    try {
      localStorage.setItem('amphibious-recent-searches', JSON.stringify(this.state.recentSearches));
    } catch (e) {
      // Ignore errors
    }
  }

  removeRecentSearch(search) {
    this.state.recentSearches = this.state.recentSearches.filter((s) => s !== search);
    this.saveRecentSearches();
    this.renderRecentSearches();

    if (this.state.recentSearches.length === 0) {
      this.recentSection.style.display = 'none';
    }
  }

  clearRecentSearches() {
    this.state.recentSearches = [];
    this.saveRecentSearches();
    this.recentSection.style.display = 'none';
  }

  // Helper methods
  addHandler(element, event, handler) {
    element.addEventListener(event, handler);

    if (!this.handlers.has(element)) {
      this.handlers.set(element, []);
    }

    this.handlers.get(element).push({ event, handler });
  }

  // Public API
  getValue() {
    return this.state.query;
  }

  setValue(value) {
    this.input.value = value;
    this.state.query = value;
    if (this.clearBtn) {
      this.clearBtn.style.display = value ? 'block' : 'none';
    }
  }

  getSelected() {
    return this.state.selectedItem;
  }

  setSource(source) {
    this.options.source = source;
    this.state.cache.clear();
  }

  refresh() {
    if (this.state.query) {
      this.search(this.state.query);
    }
  }

  focus() {
    this.input.focus();
  }

  /**
   * Comprehensive destroy method
   */
  destroy() {
    // Cancel any pending operations
    this.abortControllers.forEach((controller) => controller.abort());
    this.abortControllers.clear();

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

    // Clean up voice recognition
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }

    // Remove created elements
    this.createdElements.forEach((element) => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.createdElements.clear();

    // Clear state
    this.state.cache.clear();
    this.state = null;

    // Clear references
    this.element = null;
    this.wrapper = null;
    this.input = null;
    this.resultsContainer = null;
    this.resultsList = null;
    this.noResults = null;
    this.loading = null;
    this.error = null;
    this.clearBtn = null;
    this.submitBtn = null;
    this.voiceBtn = null;
    this.recentSection = null;
    this.recentList = null;
    this.popularSection = null;
    this.filtersContainer = null;
    this.filtersToggle = null;
    this.filtersPanel = null;
    this.liveRegion = null;
    this.options = null;
  }
}

// Register with component registry if available
if (window.AmphibiousRegistry) {
  window.AmphibiousRegistry.registerComponent('search-bar', SearchBarEnhanced, {
    selector: '[data-search-bar]',
    autoInit: true,
  });
}

// Export
window.SearchBarEnhanced = SearchBarEnhanced;
export default SearchBarEnhanced;
