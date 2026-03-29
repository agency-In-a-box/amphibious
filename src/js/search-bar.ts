/**
 * Search Bar Component with Autocomplete
 * Vanilla JS search with debouncing and suggestions
 * Part of Amphibious 2.0 Component Library
 *
 * @module search-bar
 */

import { escapeHTML, sanitizeHTML } from '../utils/sanitize';

/**
 * A single category filter option displayed above search results.
 *
 * @property label - Human-readable category name.
 * @property value - Machine-readable category identifier.
 */
export interface SearchBarCategory {
  label: string;
  value: string;
}

/**
 * A structured search result object.
 * String results are also supported via the `SearchBarSourceItem` union.
 *
 * @property title - Primary display text.
 * @property name - Alternative primary text (fallback for title).
 * @property text - Alternative primary text (fallback for title and name).
 * @property subtitle - Secondary display text.
 * @property description - Alternative secondary text (fallback for subtitle).
 * @property icon - Icon string to display beside the result.
 */
export interface SearchBarResultObject {
  title?: string;
  name?: string;
  text?: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  [key: string]: unknown;
}

/** A source item can be a plain string or a structured result object. */
export type SearchBarSourceItem = string | SearchBarResultObject;

/**
 * The data source for search results. Can be:
 * - An array of items to filter locally
 * - A URL string for remote fetching
 * - An async function that returns results
 */
export type SearchBarSource =
  | SearchBarSourceItem[]
  | string
  | ((query: string) => Promise<SearchBarSourceItem[]> | SearchBarSourceItem[]);

/**
 * Localizable UI labels used by the search bar component.
 *
 * @property clearSearch - ARIA label for the clear button.
 */
export interface SearchBarLabels {
  clearSearch: string;
}

/**
 * Configuration options for the SearchBar component.
 *
 * @property minChars - Minimum characters before searching. Defaults to `2`.
 * @property delay - Debounce delay in ms. Defaults to `300`.
 * @property maxResults - Maximum number of results to display. Defaults to `10`.
 * @property source - Data source: array, URL string, or async function.
 * @property searchKeys - Object keys to search when source contains objects.
 * @property placeholder - Input placeholder text.
 * @property noResultsText - Text shown when no results are found.
 * @property categories - Optional category filters.
 * @property recentSearches - Enable recent searches feature. Defaults to `true`.
 * @property maxRecent - Maximum number of recent searches to store.
 * @property highlightMatches - Highlight matching text in results. Defaults to `true`.
 * @property autoFocus - Automatically focus the input on init.
 * @property clearOnSelect - Clear input after selecting a result.
 * @property onSelect - Callback fired when a result is selected.
 * @property onSearch - Callback fired after search completes.
 * @property onChange - Callback fired on input value change.
 * @property onClear - Callback fired when the input is cleared.
 * @property renderItem - Custom render function for result items. Output is sanitized via DOMPurify.
 * @property labels - Translatable UI label strings.
 */
export interface SearchBarOptions {
  minChars?: number;
  delay?: number;
  maxResults?: number;
  source?: SearchBarSource;
  searchKeys?: string[];
  placeholder?: string;
  noResultsText?: string;
  categories?: SearchBarCategory[] | null;
  recentSearches?: boolean;
  maxRecent?: number;
  highlightMatches?: boolean;
  autoFocus?: boolean;
  clearOnSelect?: boolean;
  onSelect?: ((result: SearchBarSourceItem, searchBar: SearchBar) => void) | null;
  onSearch?: ((query: string, results: SearchBarSourceItem[], searchBar: SearchBar) => void) | null;
  onChange?: ((value: string, searchBar: SearchBar) => void) | null;
  onClear?: ((searchBar: SearchBar) => void) | null;
  renderItem?: ((result: SearchBarSourceItem, query: string) => string) | null;
  labels?: Partial<SearchBarLabels>;
}

/**
 * Internal resolved options with all defaults applied.
 * Every property is required (no `undefined`).
 */
interface SearchBarResolvedOptions {
  minChars: number;
  delay: number;
  maxResults: number;
  source: SearchBarSource;
  searchKeys: string[];
  placeholder: string;
  noResultsText: string;
  categories: SearchBarCategory[] | null;
  recentSearches: boolean;
  maxRecent: number;
  highlightMatches: boolean;
  autoFocus: boolean;
  clearOnSelect: boolean;
  onSelect: ((result: SearchBarSourceItem, searchBar: SearchBar) => void) | null;
  onSearch: ((query: string, results: SearchBarSourceItem[], searchBar: SearchBar) => void) | null;
  onChange: ((value: string, searchBar: SearchBar) => void) | null;
  onClear: ((searchBar: SearchBar) => void) | null;
  renderItem: ((result: SearchBarSourceItem, query: string) => string) | null;
  labels: SearchBarLabels;
}

/**
 * Search bar component with autocomplete, debouncing, category filters,
 * recent searches, and keyboard navigation.
 *
 * @example
 * ```ts
 * const el = document.querySelector('#search');
 * const search = new SearchBar(el, {
 *   source: ['Apple', 'Banana', 'Cherry'],
 *   onSelect: (result) => console.log('Selected:', result),
 * });
 * ```
 */
class SearchBar {
  public element: HTMLElement;
  public options: SearchBarResolvedOptions;

  public isOpen: boolean;
  public currentFocus: number;
  public results: SearchBarSourceItem[];

  public wrapper!: HTMLDivElement;
  public input!: HTMLInputElement;
  public clearBtn!: HTMLButtonElement;
  public spinner!: HTMLDivElement;
  public dropdown!: HTMLDivElement;
  public resultsContainer!: HTMLDivElement;

  private debounceTimer: ReturnType<typeof setTimeout> | null;
  private recentSearches: string[];
  private _abortController: AbortController;
  private _fetchController: AbortController | null;

  constructor(element: HTMLElement, options: SearchBarOptions = {}) {
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
      labels: {
        clearSearch: 'Clear search',
        ...(options.labels || {}),
      },
    };

    this.isOpen = false;
    this.currentFocus = -1;
    this.results = [];
    this.debounceTimer = null;
    this.recentSearches = this.loadRecentSearches();
    this._abortController = new AbortController();
    this._fetchController = null;

    this.init();
  }

  private init(): void {
    this.createSearchBar();
    this.bindEvents();

    if (this.options.autoFocus) {
      this.input.focus();
    }
  }

  private createSearchBar(): void {
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'aiab-search-bar';

    // Create input wrapper
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'aiab-search-bar-wrapper';

    // Create search icon
    const icon = document.createElement('span');
    icon.className = 'aiab-search-bar-icon';
    icon.innerHTML = `
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    `;

    // Create input
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'aiab-search-bar-input';
    input.placeholder = this.options.placeholder;
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');

    // Create clear button
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'aiab-search-bar-clear';
    clearBtn.innerHTML = `
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    `;
    clearBtn.setAttribute('aria-label', this.options.labels.clearSearch);

    // Create spinner
    const spinner = document.createElement('div');
    spinner.className = 'aiab-search-bar-spinner';

    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'aiab-search-bar-dropdown';
    dropdown.setAttribute('role', 'listbox');

    // Add categories if provided
    if (this.options.categories) {
      const categoriesDiv = this.createCategories();
      dropdown.appendChild(categoriesDiv);
    }

    // Create results container
    const results = document.createElement('div');
    results.className = 'aiab-search-bar-results';
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

  private createCategories(): HTMLDivElement {
    const categoriesDiv = document.createElement('div');
    categoriesDiv.className = 'aiab-search-bar-categories';

    // biome-ignore lint/style/noNonNullAssertion: categories is checked non-null by caller
    this.options.categories!.forEach((category: SearchBarCategory) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'aiab-search-bar-category';
      btn.textContent = category.label;
      btn.dataset.category = category.value;

      btn.addEventListener('click', () => {
        this.selectCategory(category.value);
      });

      categoriesDiv.appendChild(btn);
    });

    return categoriesDiv;
  }

  private bindEvents(): void {
    const signal = this._abortController.signal;

    // Input events
    this.input.addEventListener('input', () => this.handleInput(), { signal });
    this.input.addEventListener('focus', () => this.handleFocus(), { signal });
    this.input.addEventListener('blur', () => this.handleBlur(), { signal });

    // Keyboard navigation
    this.input.addEventListener('keydown', (e: KeyboardEvent) => this.handleKeydown(e), {
      signal,
    });

    // Clear button
    this.clearBtn.addEventListener('click', () => this.clear(), { signal });

    // Click outside to close
    document.addEventListener(
      'click',
      (e: MouseEvent) => {
        if (!this.wrapper.contains(e.target as Node)) {
          this.close();
        }
      },
      { signal },
    );
  }

  private handleInput(): void {
    const value = this.input.value.trim();

    // Update UI state
    if (value) {
      this.wrapper.classList.add('aiab-search-bar--has-value');
    } else {
      this.wrapper.classList.remove('aiab-search-bar--has-value');
    }

    // Clear previous timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Handle search
    if (value.length >= this.options.minChars) {
      this.wrapper.classList.add('aiab-search-bar--loading');

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

  private handleFocus(): void {
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

  private handleBlur(): void {
    // Delay to allow clicking on results
    setTimeout(() => {
      if (!this.wrapper.contains(document.activeElement)) {
        this.close();
      }
    }, 200);
  }

  private handleKeydown(e: KeyboardEvent): void {
    const items = this.resultsContainer.querySelectorAll('.aiab-search-bar-item');

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
          (items[this.currentFocus] as HTMLElement).click();
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

  private highlightItem(items: NodeListOf<Element>): void {
    items.forEach((item: Element, index: number) => {
      if (index === this.currentFocus) {
        item.classList.add('aiab-search-bar-item--active');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('aiab-search-bar-item--active');
      }
    });
  }

  public async search(query: string): Promise<void> {
    let results: SearchBarSourceItem[] = [];

    // Abort any in-flight fetch request before starting a new one
    if (this._fetchController) {
      this._fetchController.abort();
    }

    try {
      // Get results based on source type
      if (typeof this.options.source === 'function') {
        // Function source
        results = await this.options.source(query);
      } else if (typeof this.options.source === 'string') {
        // Remote URL source — use AbortController with timeout
        this._fetchController = new AbortController();
        const timeoutId = setTimeout(() => this._fetchController?.abort(), 5000);

        try {
          const response = await fetch(`${this.options.source}?q=${encodeURIComponent(query)}`, {
            signal: this._fetchController.signal,
          });
          if (!response.ok) {
            throw new Error(`Search request failed: ${response.status}`);
          }
          results = await response.json();
        } finally {
          clearTimeout(timeoutId);
          this._fetchController = null;
        }
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
    } catch (error: unknown) {
      // Silently ignore aborted requests (user typed again or component destroyed)
      if (error instanceof Error && error.name === 'AbortError') return;
      // Handle search error - console removed for production
      this.renderError();
    } finally {
      this.wrapper.classList.remove('aiab-search-bar--loading');
    }
  }

  private filterLocalData(query: string): SearchBarSourceItem[] {
    const lowerQuery = query.toLowerCase();

    return (this.options.source as SearchBarSourceItem[]).filter((item: SearchBarSourceItem) => {
      if (typeof item === 'string') {
        return item.toLowerCase().includes(lowerQuery);
      }
      if (typeof item === 'object') {
        return this.options.searchKeys.some((key: string) => {
          const value = this.getNestedValue(item, key);
          return value?.toString().toLowerCase().includes(lowerQuery);
        });
      }
      return false;
    });
  }

  private getNestedValue(obj: SearchBarResultObject, path: string): unknown {
    return path.split('.').reduce<unknown>(
      (curr: unknown, prop: string) =>
        // biome-ignore lint/suspicious/noExplicitAny: dynamic nested property access requires any
        curr != null ? (curr as any)[prop] : undefined,
      obj,
    );
  }

  private renderResults(results: SearchBarSourceItem[], query: string): void {
    this.resultsContainer.innerHTML = '';

    if (results.length === 0) {
      this.renderEmpty();
      this.open();
      return;
    }

    results.forEach((result: SearchBarSourceItem, _index: number) => {
      const item = this.createResultItem(result, query);
      this.resultsContainer.appendChild(item);
    });

    this.currentFocus = -1;
    this.open();
  }

  private createResultItem(result: SearchBarSourceItem, query: string): HTMLButtonElement {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'aiab-search-bar-item';
    item.setAttribute('role', 'option');

    if (this.options.renderItem) {
      item.innerHTML = sanitizeHTML(this.options.renderItem(result, query));
    } else if (typeof result === 'string') {
      // Simple string result
      item.innerHTML = `
        <div class="aiab-search-bar-item-content">
          <div class="aiab-search-bar-item-title">
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
        ${icon ? `<span class="aiab-search-bar-item-icon">${escapeHTML(icon)}</span>` : ''}
        <div class="aiab-search-bar-item-content">
          <div class="aiab-search-bar-item-title">
            ${this.highlightMatch(title, query)}
          </div>
          ${
            subtitle
              ? `
            <div class="aiab-search-bar-item-subtitle">
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

  private highlightMatch(text: string, query: string): string {
    if (!this.options.highlightMatches || !query) {
      return escapeHTML(text);
    }

    const escaped = escapeHTML(text);
    const escapedQuery = escapeHTML(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return escaped.replace(regex, '<mark>$1</mark>');
  }

  private showRecentSearches(): void {
    if (this.recentSearches.length === 0) {
      return;
    }

    this.resultsContainer.innerHTML = '';

    // Create header
    const header = document.createElement('div');
    header.className = 'aiab-search-bar-recent-header';
    header.innerHTML = `
      <span>Recent Searches</span>
      <button type="button" class="aiab-search-bar-recent-clear">Clear</button>
    `;

    const clearRecentBtn = header.querySelector('.aiab-search-bar-recent-clear');
    if (clearRecentBtn) {
      clearRecentBtn.addEventListener('click', () => {
        this.clearRecentSearches();
      });
    }

    this.resultsContainer.appendChild(header);

    // Add recent items
    const recentDiv = document.createElement('div');
    recentDiv.className = 'aiab-search-bar-recent';

    this.recentSearches.forEach((search: string) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'aiab-search-bar-item';
      item.innerHTML = `
        <span class="aiab-search-bar-item-icon">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
        <div class="aiab-search-bar-item-content">
          <div class="aiab-search-bar-item-title">${escapeHTML(search)}</div>
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

  private renderEmpty(): void {
    this.resultsContainer.innerHTML = `
      <div class="aiab-search-bar-empty">
        <svg class="aiab-search-bar-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="aiab-search-bar-empty-text">${this.options.noResultsText}</div>
      </div>
    `;
  }

  private renderError(): void {
    this.resultsContainer.innerHTML = `
      <div class="aiab-search-bar-empty">
        <div class="aiab-search-bar-empty-text">Search error. Please try again.</div>
      </div>
    `;
  }

  private selectResult(result: SearchBarSourceItem, query: string): void {
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

  private selectCategory(category: string): void {
    // Update UI
    const buttons = this.wrapper.querySelectorAll('.aiab-search-bar-category');
    buttons.forEach((btn: Element) => {
      btn.classList.toggle(
        'aiab-search-bar-category--active',
        (btn as HTMLElement).dataset.category === category,
      );
    });

    // Re-search with category
    const query = this.input.value.trim();
    if (query.length >= this.options.minChars) {
      this.search(query);
    }
  }

  public open(): void {
    if (!this.isOpen) {
      this.isOpen = true;
      this.wrapper.classList.add('aiab-search-bar--open');
      this.input.setAttribute('aria-expanded', 'true');
    }
  }

  public close(): void {
    if (this.isOpen) {
      this.isOpen = false;
      this.wrapper.classList.remove('aiab-search-bar--open');
      this.input.setAttribute('aria-expanded', 'false');
      this.currentFocus = -1;
    }
  }

  public clear(): void {
    this.input.value = '';
    this.wrapper.classList.remove('aiab-search-bar--has-value');
    this.close();
    this.input.focus();

    if (this.options.onClear) {
      this.options.onClear(this);
    }
  }

  // Recent searches management
  private loadRecentSearches(): string[] {
    if (!this.options.recentSearches) return [];

    const stored = localStorage.getItem('aiab-search-bar-recent');
    return stored ? JSON.parse(stored) : [];
  }

  private saveRecentSearch(query: string): void {
    if (!this.options.recentSearches) return;

    // Remove if already exists
    this.recentSearches = this.recentSearches.filter((s: string) => s !== query);

    // Add to beginning
    this.recentSearches.unshift(query);

    // Limit length
    if (this.recentSearches.length > this.options.maxRecent) {
      this.recentSearches = this.recentSearches.slice(0, this.options.maxRecent);
    }

    localStorage.setItem('aiab-search-bar-recent', JSON.stringify(this.recentSearches));
  }

  private clearRecentSearches(): void {
    this.recentSearches = [];
    localStorage.removeItem('aiab-search-bar-recent');
    this.close();
  }

  // Public API
  public focus(): void {
    this.input.focus();
  }

  public getValue(): string {
    return this.input.value;
  }

  public setValue(value: string): void {
    this.input.value = value;
    this.handleInput();
  }

  public destroy(): void {
    this._abortController.abort();
    if (this._fetchController) this._fetchController.abort();
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.wrapper.replaceWith(this.element);
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  try {
    const searchBars = document.querySelectorAll('[data-search-bar="true"]');
    searchBars.forEach((element: Element) => {
      new SearchBar(element as HTMLElement);
    });
  } catch (error) {
    console.error('[Amphibious] SearchBar auto-init failed:', error);
  }
});

// biome-ignore lint/suspicious/noExplicitAny: global window assignment for non-module consumers
(window as any).SearchBar = SearchBar;

export default SearchBar;
export { SearchBar };
