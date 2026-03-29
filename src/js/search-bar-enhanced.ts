/**
 * Enhanced Search Bar Component
 * Advanced search with autocomplete, suggestions, and complete memory management
 * Part of Amphibious 2.0 Component Library
 *
 * @module search-bar-enhanced
 */

import { escapeHTML, sanitizeHTML } from '../utils/sanitize';

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

/**
 * A structured search result object.
 * String results are also supported via the `SearchBarEnhancedSourceItem` union.
 */
export interface SearchBarEnhancedResultObject {
  text?: string;
  label?: string;
  title?: string;
  description?: string;
  category?: string;
  /** Group header marker produced by {@link SearchBarEnhanced.groupResults}. */
  type?: string;
  /** Group name when `type === 'group'`. */
  name?: string;
  [key: string]: unknown;
}

/** A source item can be a plain string or a structured result object. */
export type SearchBarEnhancedSourceItem = string | SearchBarEnhancedResultObject;

/**
 * The data source for search results. Can be:
 * - An array of items to filter locally
 * - A URL string for remote fetching
 * - An async function that returns results
 */
export type SearchBarEnhancedSource =
  | SearchBarEnhancedSourceItem[]
  | string
  | ((query: string) => Promise<SearchBarEnhancedSourceItem[]> | SearchBarEnhancedSourceItem[]);

/** Filter option within a filter group. */
export interface SearchBarEnhancedFilterOption {
  label: string;
  value: string;
}

/** A single filter group displayed in the filters panel. */
export interface SearchBarEnhancedFilter {
  label: string;
  name: string;
  type: 'checkbox' | 'select';
  options: SearchBarEnhancedFilterOption[];
}

/** Category descriptor. */
export interface SearchBarEnhancedCategory {
  label: string;
  value: string;
}

/** Localizable UI labels used by the enhanced search bar. */
export interface SearchBarEnhancedLabels {
  voiceSearch: string;
  clearSearch: string;
  submit: string;
  recentSearches: string;
  clearRecent: string;
  popularSearches: string;
  filters: string;
  resultsAvailable: (count: number) => string;
  voiceSearchFailed: string;
  voiceLang: string;
}

/**
 * Public configuration options for the SearchBarEnhanced component.
 * All properties are optional; sensible defaults are applied internally.
 */
export interface SearchBarEnhancedOptions {
  // Basic options
  placeholder?: string;
  minChars?: number;
  maxResults?: number;
  debounceDelay?: number;
  searchOnFocus?: boolean;

  // Data source
  source?: SearchBarEnhancedSource | null;
  ajax?: boolean;
  method?: string;
  headers?: Record<string, string>;

  // Features
  autocomplete?: boolean;
  suggestions?: boolean;
  recentSearches?: boolean;
  popularSearches?: string[] | null;
  fuzzySearch?: boolean;
  highlight?: boolean;
  cache?: boolean;
  persistRecent?: boolean;

  // Advanced features
  voice?: boolean;
  filters?: SearchBarEnhancedFilter[] | null;
  categories?: SearchBarEnhancedCategory[] | null;
  searchOperators?: boolean;
  wildcards?: boolean;

  // Display options
  resultTemplate?:
    | ((item: SearchBarEnhancedSourceItem, query: string, instance: SearchBarEnhanced) => string)
    | null;
  groupBy?: string | ((item: SearchBarEnhancedResultObject) => string) | null;
  sortBy?:
    | string
    | ((a: SearchBarEnhancedSourceItem, b: SearchBarEnhancedSourceItem) => number)
    | null;
  noResultsText?: string;
  loadingText?: string;
  errorText?: string;

  // Behavior
  closeOnSelect?: boolean;
  selectOnTab?: boolean;
  clearOnEscape?: boolean;
  submitOnEnter?: boolean;

  // UI options
  showIcon?: boolean;
  showClear?: boolean;
  showSubmit?: boolean;
  showFilters?: boolean;
  position?: 'auto' | 'top' | 'bottom';
  maxHeight?: number;
  theme?: string;

  // Labels (i18n)
  labels?: Partial<SearchBarEnhancedLabels>;

  // Callbacks
  onSearch?:
    | ((query: string, results: SearchBarEnhancedSourceItem[], instance: SearchBarEnhanced) => void)
    | null;
  onSelect?: ((item: SearchBarEnhancedSourceItem, instance: SearchBarEnhanced) => void) | null;
  onSubmit?:
    | ((
        query: string,
        selectedItem: SearchBarEnhancedSourceItem | null,
        instance: SearchBarEnhanced,
      ) => void)
    | null;
  onChange?: ((query: string, instance: SearchBarEnhanced) => void) | null;
  onFocus?: ((instance: SearchBarEnhanced) => void) | null;
  onBlur?: ((instance: SearchBarEnhanced) => void) | null;
  onClear?: ((instance: SearchBarEnhanced) => void) | null;
  onOpen?: ((instance: SearchBarEnhanced) => void) | null;
  onClose?: ((instance: SearchBarEnhanced) => void) | null;
}

/**
 * Internal fully-resolved options with all defaults applied.
 * Every property is required (no `undefined`).
 */
interface SearchBarEnhancedResolvedOptions {
  placeholder: string;
  minChars: number;
  maxResults: number;
  debounceDelay: number;
  searchOnFocus: boolean;

  source: SearchBarEnhancedSource | null;
  ajax: boolean;
  method: string;
  headers: Record<string, string>;

  autocomplete: boolean;
  suggestions: boolean;
  recentSearches: boolean;
  popularSearches: string[] | null;
  fuzzySearch: boolean;
  highlight: boolean;
  cache: boolean;
  persistRecent: boolean;

  voice: boolean;
  filters: SearchBarEnhancedFilter[] | null;
  categories: SearchBarEnhancedCategory[] | null;
  searchOperators: boolean;
  wildcards: boolean;

  resultTemplate:
    | ((item: SearchBarEnhancedSourceItem, query: string, instance: SearchBarEnhanced) => string)
    | null;
  groupBy: string | ((item: SearchBarEnhancedResultObject) => string) | null;
  sortBy:
    | string
    | ((a: SearchBarEnhancedSourceItem, b: SearchBarEnhancedSourceItem) => number)
    | null;
  noResultsText: string;
  loadingText: string;
  errorText: string;

  closeOnSelect: boolean;
  selectOnTab: boolean;
  clearOnEscape: boolean;
  submitOnEnter: boolean;

  showIcon: boolean;
  showClear: boolean;
  showSubmit: boolean;
  showFilters: boolean;
  position: 'auto' | 'top' | 'bottom';
  maxHeight: number;
  theme: string;

  labels: SearchBarEnhancedLabels;

  onSearch:
    | ((query: string, results: SearchBarEnhancedSourceItem[], instance: SearchBarEnhanced) => void)
    | null;
  onSelect: ((item: SearchBarEnhancedSourceItem, instance: SearchBarEnhanced) => void) | null;
  onSubmit:
    | ((
        query: string,
        selectedItem: SearchBarEnhancedSourceItem | null,
        instance: SearchBarEnhanced,
      ) => void)
    | null;
  onChange: ((query: string, instance: SearchBarEnhanced) => void) | null;
  onFocus: ((instance: SearchBarEnhanced) => void) | null;
  onBlur: ((instance: SearchBarEnhanced) => void) | null;
  onClear: ((instance: SearchBarEnhanced) => void) | null;
  onOpen: ((instance: SearchBarEnhanced) => void) | null;
  onClose: ((instance: SearchBarEnhanced) => void) | null;
}

/** Internal component state. */
interface SearchBarEnhancedState {
  isOpen: boolean;
  isLoading: boolean;
  query: string;
  results: SearchBarEnhancedSourceItem[];
  filteredResults: SearchBarEnhancedSourceItem[];
  highlightedIndex: number;
  selectedItem: SearchBarEnhancedSourceItem | null;
  recentSearches: string[];
  cache: Map<string, SearchBarEnhancedSourceItem[]>;
  activeFilters: Set<string>;
  page: number;
  hasMore: boolean;
  lastSearch: string | null;
  selectedCategory?: string;
}

/** Entry stored in the handler tracking map. */
interface HandlerEntry {
  event: string;
  handler: EventListener;
}

/** Shape of a paginated API response. */
interface PaginatedApiResponse {
  results: SearchBarEnhancedSourceItem[];
  hasMore?: boolean;
}

// ---------------------------------------------------------------------------
// Window augmentation for SpeechRecognition & global registry
// ---------------------------------------------------------------------------

/** Minimal SpeechRecognition instance shape used by this component. */
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
  start(): void;
  stop(): void;
}

/** Minimal SpeechRecognition event shape. */
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

/** SpeechRecognition constructor type. */
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SearchBarEnhanced?: typeof SearchBarEnhanced;
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

// ---------------------------------------------------------------------------
// Component Implementation
// ---------------------------------------------------------------------------

/**
 * Enhanced search bar component with autocomplete, voice search, filters,
 * recent/popular searches, fuzzy matching, and comprehensive memory management.
 *
 * @example
 * ```ts
 * const el = document.querySelector('#search-container');
 * const search = new SearchBarEnhanced(el, {
 *   source: ['Apple', 'Banana', 'Cherry'],
 *   onSelect: (item) => console.log('Selected:', item),
 * });
 * ```
 */
class SearchBarEnhanced {
  public element: HTMLElement | null;
  public options: SearchBarEnhancedResolvedOptions | null;

  // Memory management collections
  private handlers: Map<EventTarget, HandlerEntry[]>;
  private timers: Set<ReturnType<typeof setTimeout>>;
  private createdElements: Set<HTMLElement>;
  private abortControllers: Set<AbortController>;
  private observers: Set<MutationObserver>;

  // State
  private state!: SearchBarEnhancedState;

  // Debounce timer
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null;

  // DOM references — set during init() called from constructor
  private wrapper!: HTMLDivElement;
  private input!: HTMLInputElement;
  private resultsContainer!: HTMLDivElement;
  private resultsList!: HTMLDivElement;
  private noResults!: HTMLDivElement;
  private loading!: HTMLDivElement;
  private error!: HTMLDivElement;
  private liveRegion!: HTMLDivElement;

  // Optional DOM references (created conditionally)
  private clearBtn: HTMLButtonElement | null;
  private submitBtn: HTMLButtonElement | null;
  private voiceBtn: HTMLButtonElement | null;
  private recentSection: HTMLDivElement | null;
  private recentList: HTMLDivElement | null;
  private popularSection: HTMLDivElement | null;
  private filtersContainer: HTMLDivElement | null;
  private filtersToggle: HTMLButtonElement | null;
  private filtersPanel: HTMLDivElement | null;

  // Voice recognition
  private recognition: SpeechRecognitionInstance | null;

  // Fetch controller for in-flight requests
  private _fetchController: AbortController | null;

  constructor(element: HTMLElement, options: SearchBarEnhancedOptions = {}) {
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
      source: options.source || null,
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
      searchOperators: options.searchOperators || false,
      wildcards: options.wildcards || false,

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
      position: options.position || 'auto',
      maxHeight: options.maxHeight || 400,
      theme: options.theme || 'light',

      // Labels (i18n)
      labels: {
        voiceSearch: 'Voice search',
        clearSearch: 'Clear search',
        submit: 'Search',
        recentSearches: 'Recent Searches',
        clearRecent: 'Clear',
        popularSearches: 'Popular Searches',
        filters: 'Filters',
        resultsAvailable: (count: number): string => `${count} results available`,
        voiceSearchFailed: 'Voice search failed',
        voiceLang: 'en-US',
        ...(options.labels || {}),
      },

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

    // Optional DOM references
    this.clearBtn = null;
    this.submitBtn = null;
    this.voiceBtn = null;
    this.recentSection = null;
    this.recentList = null;
    this.popularSection = null;
    this.filtersContainer = null;
    this.filtersToggle = null;
    this.filtersPanel = null;

    // Voice recognition
    this.recognition = null;

    // Fetch controller
    this._fetchController = null;

    this.init();
  }

  private init(): void {
    this.loadRecentSearches();
    this.createSearchBar();
    this.bindEvents();
    this.setupAccessibility();

    // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null during init
    if (this.options!.voice) {
      this.setupVoiceSearch();
    }

    // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null during init
    if (this.options!.filters) {
      this.createFilters();
    }
  }

  private createSearchBar(): void {
    // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null during init
    const opts = this.options!;

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'aiab-search-bar-enhanced';
    if (opts.theme) {
      wrapper.classList.add(`aiab-search-bar-theme-${opts.theme}`);
    }

    // Create input container
    const inputContainer = document.createElement('div');
    inputContainer.className = 'aiab-search-bar-input-container';

    // Search icon
    if (opts.showIcon) {
      const icon = document.createElement('span');
      icon.className = 'aiab-search-bar-icon';
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
    input.className = 'aiab-search-bar-input';
    input.placeholder = opts.placeholder;
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-controls', 'search-results');

    // Voice button
    if (opts.voice && this.hasVoiceSupport()) {
      const voiceBtn = document.createElement('button');
      voiceBtn.type = 'button';
      voiceBtn.className = 'aiab-search-bar-voice';
      voiceBtn.innerHTML = '🎤';
      voiceBtn.setAttribute('aria-label', opts.labels.voiceSearch);
      inputContainer.appendChild(voiceBtn);
      this.voiceBtn = voiceBtn;
    }

    // Clear button
    if (opts.showClear) {
      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'aiab-search-bar-clear';
      clearBtn.innerHTML = '×';
      clearBtn.style.display = 'none';
      clearBtn.setAttribute('aria-label', opts.labels.clearSearch);
      inputContainer.appendChild(clearBtn);
      this.clearBtn = clearBtn;
    }

    // Submit button
    if (opts.showSubmit) {
      const submitBtn = document.createElement('button');
      submitBtn.type = 'button';
      submitBtn.className = 'aiab-search-bar-submit';
      submitBtn.textContent = opts.labels.submit;
      inputContainer.appendChild(submitBtn);
      this.submitBtn = submitBtn;
    }

    inputContainer.appendChild(input);

    // Create results container
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'aiab-search-bar-results';
    resultsContainer.id = 'search-results';
    resultsContainer.setAttribute('role', 'listbox');
    resultsContainer.style.display = 'none';

    // Sections
    const sectionsContainer = document.createElement('div');
    sectionsContainer.className = 'aiab-search-bar-sections';

    // Recent searches section
    if (opts.recentSearches) {
      const recentSection = document.createElement('div');
      recentSection.className = 'aiab-search-bar-section aiab-search-bar-recent';
      recentSection.style.display = 'none';

      const recentHeader = document.createElement('div');
      recentHeader.className = 'aiab-search-bar-section-header';
      const recentTitle = document.createElement('span');
      recentTitle.textContent = opts.labels.recentSearches;
      const clearRecentBtn = document.createElement('button');
      clearRecentBtn.type = 'button';
      clearRecentBtn.className = 'aiab-search-bar-clear-recent';
      clearRecentBtn.textContent = opts.labels.clearRecent;
      recentHeader.appendChild(recentTitle);
      recentHeader.appendChild(clearRecentBtn);

      const recentList = document.createElement('div');
      recentList.className = 'aiab-search-bar-recent-list';

      recentSection.appendChild(recentHeader);
      recentSection.appendChild(recentList);
      sectionsContainer.appendChild(recentSection);

      this.recentSection = recentSection;
      this.recentList = recentList;
    }

    // Popular searches section
    if (opts.popularSearches) {
      const popularSection = document.createElement('div');
      popularSection.className = 'aiab-search-bar-section aiab-search-bar-popular';

      const popularHeader = document.createElement('div');
      popularHeader.className = 'aiab-search-bar-section-header';
      popularHeader.textContent = opts.labels.popularSearches;

      const popularList = document.createElement('div');
      popularList.className = 'aiab-search-bar-popular-list';

      opts.popularSearches.forEach((term: string) => {
        const item = document.createElement('div');
        item.className = 'aiab-search-bar-popular-item';
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
    resultsList.className = 'aiab-search-bar-results-list';

    // No results message
    const noResults = document.createElement('div');
    noResults.className = 'aiab-search-bar-no-results';
    noResults.textContent = opts.noResultsText;
    noResults.style.display = 'none';

    // Loading indicator
    const loading = document.createElement('div');
    loading.className = 'aiab-search-bar-loading';
    loading.innerHTML = `
      <span class="aiab-search-bar-spinner"></span>
      ${opts.loadingText}
    `;
    loading.style.display = 'none';

    // Error message
    const errorEl = document.createElement('div');
    errorEl.className = 'aiab-search-bar-error';
    errorEl.textContent = opts.errorText;
    errorEl.style.display = 'none';

    resultsContainer.appendChild(sectionsContainer);
    resultsContainer.appendChild(resultsList);
    resultsContainer.appendChild(noResults);
    resultsContainer.appendChild(loading);
    resultsContainer.appendChild(errorEl);

    // Assemble wrapper
    wrapper.appendChild(inputContainer);
    wrapper.appendChild(resultsContainer);

    // Add to DOM
    // biome-ignore lint/style/noNonNullAssertion: element is guaranteed non-null during init
    this.element!.appendChild(wrapper);

    // Store references
    this.wrapper = wrapper;
    this.input = input;
    this.resultsContainer = resultsContainer;
    this.resultsList = resultsList;
    this.noResults = noResults;
    this.loading = loading;
    this.error = errorEl;

    this.createdElements.add(wrapper);
  }

  private createFilters(): void {
    // biome-ignore lint/style/noNonNullAssertion: options and options.filters are checked non-null by caller
    const filters = this.options!.filters!;

    const filtersContainer = document.createElement('div');
    filtersContainer.className = 'aiab-search-bar-filters';

    const filtersToggle = document.createElement('button');
    filtersToggle.type = 'button';
    filtersToggle.className = 'aiab-search-bar-filters-toggle';
    // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null during init
    filtersToggle.textContent = this.options!.labels.filters;

    const filtersPanel = document.createElement('div');
    filtersPanel.className = 'aiab-search-bar-filters-panel';
    filtersPanel.style.display = 'none';

    filters.forEach((filter: SearchBarEnhancedFilter) => {
      const filterGroup = document.createElement('div');
      filterGroup.className = 'aiab-search-bar-filter-group';

      const label = document.createElement('label');
      label.textContent = filter.label;

      if (filter.type === 'checkbox') {
        filter.options.forEach((option: SearchBarEnhancedFilterOption) => {
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

        filter.options.forEach((option: SearchBarEnhancedFilterOption) => {
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

    filtersPanel
      .querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select')
      .forEach((filter: HTMLInputElement | HTMLSelectElement) => {
        this.addHandler(filter, 'change', () => this.applyFilters());
      });
  }

  private bindEvents(): void {
    // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null during init
    const opts = this.options!;

    // Input events
    this.addHandler(this.input, 'input', (e: Event) => {
      this.state.query = (e.target as HTMLInputElement).value;

      if (this.clearBtn) {
        this.clearBtn.style.display = this.state.query ? 'block' : 'none';
      }

      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer);
        this.timers.delete(this.searchDebounceTimer);
      }

      if (this.state.query.length >= opts.minChars || this.state.query === '') {
        this.searchDebounceTimer = setTimeout(() => {
          this.search(this.state.query);
        }, opts.debounceDelay);

        this.timers.add(this.searchDebounceTimer);
      } else {
        this.showSuggestions();
      }

      if (opts.onChange) {
        opts.onChange(this.state.query, this);
      }
    });

    // Focus/Blur
    this.addHandler(this.input, 'focus', () => {
      if (opts.searchOnFocus && this.state.query) {
        this.search(this.state.query);
      } else {
        this.showSuggestions();
      }

      if (opts.onFocus) {
        opts.onFocus(this);
      }
    });

    this.addHandler(this.input, 'blur', () => {
      const timer = setTimeout(() => {
        if (!this.wrapper.contains(document.activeElement)) {
          this.close();
        }
      }, 200);

      this.timers.add(timer);

      if (opts.onBlur) {
        opts.onBlur(this);
      }
    });

    // Keyboard navigation
    this.addHandler(this.input, 'keydown', (e: Event) => this.handleKeydown(e as KeyboardEvent));

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
      const clearRecentBtn = this.recentSection.querySelector<HTMLButtonElement>(
        '.aiab-search-bar-clear-recent',
      );
      if (clearRecentBtn) {
        this.addHandler(clearRecentBtn, 'click', () => this.clearRecentSearches());
      }
    }

    // Click outside to close
    this.addHandler(document, 'click', (e: Event) => {
      if (!this.wrapper.contains(e.target as Node) && this.state.isOpen) {
        this.close();
      }
    });

    // Results scroll for infinite loading
    if (opts.source && typeof opts.source === 'string') {
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

  private setupAccessibility(): void {
    // ARIA live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.className = 'aiab-sr-only';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    this.wrapper.appendChild(liveRegion);
    this.liveRegion = liveRegion;

    // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null during init
    const opts = this.options!;

    // Update ARIA attributes
    const updateAria = (): void => {
      const resultCount = this.state.filteredResults.length;
      if (resultCount > 0) {
        this.liveRegion.textContent = opts.labels.resultsAvailable(resultCount);
      } else if (this.state.query) {
        this.liveRegion.textContent = opts.noResultsText;
      }
    };

    // Observer for results changes
    const observer = new MutationObserver(updateAria);
    observer.observe(this.resultsList, { childList: true });
    this.observers.add(observer);
  }

  private setupVoiceSearch(): void {
    if (!this.hasVoiceSupport()) return;

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    this.recognition = new SpeechRecognitionCtor();
    // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null during init
    this.recognition.lang = this.options!.labels.voiceLang;
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      this.input.value = transcript;
      this.state.query = transcript;
      this.search(transcript);
    };

    this.recognition.onerror = () => {
      // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null during voice setup
      this.showError(this.options!.labels.voiceSearchFailed);
    };
  }

  private handleKeydown(e: KeyboardEvent): void {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (this.state.highlightedIndex >= 0) {
          const item = this.state.filteredResults[this.state.highlightedIndex];
          if (item) this.selectItem(item);
          // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null during event handling
        } else if (this.options!.submitOnEnter) {
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
        // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null during event handling
        if (this.options!.clearOnEscape && this.state.query) {
          e.preventDefault();
          this.clear();
        } else {
          this.close();
        }
        break;

      case 'Tab':
        // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null during event handling
        if (this.options!.selectOnTab && this.state.highlightedIndex >= 0) {
          e.preventDefault();
          const item = this.state.filteredResults[this.state.highlightedIndex];
          if (item) this.selectItem(item);
        }
        break;
    }
  }

  private navigate(direction: 1 | -1): void {
    const maxIndex = this.state.filteredResults.length - 1;

    if (direction === 1) {
      this.state.highlightedIndex = Math.min(this.state.highlightedIndex + 1, maxIndex);
    } else {
      this.state.highlightedIndex = Math.max(this.state.highlightedIndex - 1, -1);
    }

    this.updateHighlight();
  }

  private updateHighlight(): void {
    this.resultsContainer
      .querySelectorAll<HTMLElement>('.aiab-search-bar-result')
      .forEach((el: HTMLElement, index: number) => {
        if (index === this.state.highlightedIndex) {
          el.classList.add('aiab-search-bar-result--highlighted');
          el.scrollIntoView({ block: 'nearest' });
        } else {
          el.classList.remove('aiab-search-bar-result--highlighted');
        }
      });
  }

  public async search(query: string): Promise<void> {
    // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null during search
    const opts = this.options!;

    if (!query && !opts.searchOnFocus) {
      this.showSuggestions();
      return;
    }

    // Check cache
    if (opts.cache && this.state.cache.has(query)) {
      // biome-ignore lint/style/noNonNullAssertion: cache.has() guarantees the key exists
      this.state.results = this.state.cache.get(query)!;
      this.renderResults();
      return;
    }

    this.state.isLoading = true;
    this.showLoading();

    try {
      let results: SearchBarEnhancedSourceItem[] = [];

      if (typeof opts.source === 'function') {
        results = await opts.source(query);
      } else if (typeof opts.source === 'string') {
        results = await this.fetchResults(query);
      } else if (Array.isArray(opts.source)) {
        results = this.searchLocal(query);
      }

      // Cache results
      if (opts.cache) {
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

      if (opts.onSearch) {
        opts.onSearch(query, results, this);
      }
    } catch (error: unknown) {
      // Silently ignore aborted requests (superseded by a newer search or timeout)
      if (error instanceof Error && error.name === 'AbortError') return;
      this.showError();
    } finally {
      this.state.isLoading = false;
    }
  }

  private async fetchResults(query: string): Promise<SearchBarEnhancedSourceItem[]> {
    // Abort any in-flight fetch request before starting a new one
    if (this._fetchController) {
      this._fetchController.abort();
      this.abortControllers.delete(this._fetchController);
    }

    const controller = new AbortController();
    this._fetchController = controller;
    this.abortControllers.add(controller);

    // Auto-abort after 5 seconds
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    this.timers.add(timeoutId);

    // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null during fetch
    const opts = this.options!;

    try {
      const url = new URL(opts.source as string);
      url.searchParams.set('q', query);

      if (this.state.page > 1) {
        url.searchParams.set('page', String(this.state.page));
      }

      // Add filters to URL
      this.state.activeFilters.forEach((filter: string) => {
        url.searchParams.append('filter', filter);
      });

      const response = await fetch(url.toString(), {
        method: opts.method,
        headers: opts.headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: SearchBarEnhancedSourceItem[] | PaginatedApiResponse = await response.json();

      // Assume the API returns { results: [], hasMore: bool }
      if (
        typeof data === 'object' &&
        !Array.isArray(data) &&
        (data as PaginatedApiResponse).results
      ) {
        const paginated = data as PaginatedApiResponse;
        this.state.hasMore = paginated.hasMore || false;
        return paginated.results;
      }

      return data as SearchBarEnhancedSourceItem[];
    } finally {
      clearTimeout(timeoutId);
      this.timers.delete(timeoutId);
      this.abortControllers.delete(controller);
      this._fetchController = null;
    }
  }

  private searchLocal(query: string): SearchBarEnhancedSourceItem[] {
    // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null during search
    const opts = this.options!;
    const source = opts.source as SearchBarEnhancedSourceItem[];
    const lowerQuery = query.toLowerCase();

    const results = source.filter((item: SearchBarEnhancedSourceItem) => {
      const searchText =
        typeof item === 'string'
          ? item
          : (item as SearchBarEnhancedResultObject).text ||
            (item as SearchBarEnhancedResultObject).label ||
            '';

      if (opts.fuzzySearch) {
        return this.fuzzyMatch(searchText.toLowerCase(), lowerQuery);
      }
      return searchText.toLowerCase().includes(lowerQuery);
    });

    return results.slice(0, opts.maxResults);
  }

  private fuzzyMatch(str: string, pattern: string): boolean {
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

  private applyFilters(): void {
    // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null
    const opts = this.options!;
    let results: SearchBarEnhancedSourceItem[] = [...this.state.results];

    // Apply active filters
    if (this.filtersPanel) {
      this.state.activeFilters.clear();

      this.filtersPanel
        .querySelectorAll<HTMLInputElement | HTMLSelectElement>('input:checked, select')
        .forEach((filter: HTMLInputElement | HTMLSelectElement) => {
          if (filter.value) {
            this.state.activeFilters.add(filter.value);

            // Filter results based on filter logic
            if (filter.dataset.filterField) {
              const field = filter.dataset.filterField;
              results = results.filter((item: SearchBarEnhancedSourceItem) => {
                if (typeof item === 'string') return true;
                return (item as SearchBarEnhancedResultObject)[field] === filter.value;
              });
            }
          }
        });
    }

    // Apply categories
    if (opts.categories && this.state.selectedCategory) {
      results = results.filter((item: SearchBarEnhancedSourceItem) => {
        if (typeof item === 'string') return true;
        return (item as SearchBarEnhancedResultObject).category === this.state.selectedCategory;
      });
    }

    // Sort results
    if (opts.sortBy) {
      results = this.sortResults(results);
    }

    // Group results
    if (opts.groupBy) {
      results = this.groupResults(results);
    }

    // Limit results
    results = results.slice(0, opts.maxResults);

    this.state.filteredResults = results;
    this.renderResults();
  }

  private sortResults(results: SearchBarEnhancedSourceItem[]): SearchBarEnhancedSourceItem[] {
    // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null
    const sortBy = this.options!.sortBy;

    if (typeof sortBy === 'function') {
      return results.sort(sortBy);
    }

    if (typeof sortBy === 'string') {
      const key = sortBy;
      return results.sort((a: SearchBarEnhancedSourceItem, b: SearchBarEnhancedSourceItem) => {
        const aVal = typeof a === 'string' ? a : (a as SearchBarEnhancedResultObject)[key];
        const bVal = typeof b === 'string' ? b : (b as SearchBarEnhancedResultObject)[key];
        if ((aVal as string) < (bVal as string)) return -1;
        if ((aVal as string) > (bVal as string)) return 1;
        return 0;
      });
    }

    return results;
  }

  private groupResults(results: SearchBarEnhancedSourceItem[]): SearchBarEnhancedSourceItem[] {
    // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null
    const groupByOpt = this.options!.groupBy;
    const groups = new Map<string, SearchBarEnhancedSourceItem[]>();

    results.forEach((item: SearchBarEnhancedSourceItem) => {
      let groupKey: string;
      if (typeof groupByOpt === 'function') {
        groupKey = groupByOpt(item as SearchBarEnhancedResultObject);
      } else {
        groupKey =
          typeof item === 'string'
            ? ''
            : String((item as SearchBarEnhancedResultObject)[groupByOpt as string] ?? '');
      }

      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }

      // biome-ignore lint/style/noNonNullAssertion: groups.has() guarantees the key exists
      groups.get(groupKey)!.push(item);
    });

    // Flatten groups
    const grouped: SearchBarEnhancedSourceItem[] = [];
    groups.forEach((items: SearchBarEnhancedSourceItem[], groupName: string) => {
      grouped.push({ type: 'group', name: groupName } as SearchBarEnhancedResultObject);
      grouped.push(...items);
    });

    return grouped;
  }

  private renderResults(): void {
    this.resultsList.innerHTML = '';
    this.state.highlightedIndex = -1;

    if (this.state.filteredResults.length === 0) {
      this.showNoResults();
      return;
    }

    this.state.filteredResults.forEach((item: SearchBarEnhancedSourceItem, index: number) => {
      if (typeof item !== 'string' && (item as SearchBarEnhancedResultObject).type === 'group') {
        const groupHeader = document.createElement('div');
        groupHeader.className = 'aiab-search-bar-group-header';
        groupHeader.textContent = (item as SearchBarEnhancedResultObject).name || '';
        this.resultsList.appendChild(groupHeader);
      } else {
        const resultEl = this.createResultElement(item, index);
        this.resultsList.appendChild(resultEl);
      }
    });

    this.open();
  }

  private createResultElement(item: SearchBarEnhancedSourceItem, index: number): HTMLDivElement {
    // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null
    const opts = this.options!;

    const resultEl = document.createElement('div');
    resultEl.className = 'aiab-search-bar-result';
    resultEl.setAttribute('role', 'option');
    resultEl.dataset.index = String(index);

    if (opts.resultTemplate) {
      resultEl.innerHTML = sanitizeHTML(opts.resultTemplate(item, this.state.query, this));
    } else {
      const itemObj = item as SearchBarEnhancedResultObject;
      const text =
        typeof item === 'string' ? item : itemObj.text || itemObj.label || itemObj.title || '';
      const displayText = opts.highlight
        ? this.highlightQuery(text, this.state.query)
        : escapeHTML(text);

      resultEl.innerHTML = `
        <div class="aiab-search-bar-result-text">${displayText}</div>
        ${typeof item !== 'string' && itemObj.description ? `<div class="aiab-search-bar-result-description">${escapeHTML(itemObj.description)}</div>` : ''}
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

  private highlightQuery(text: string, query: string): string {
    const escaped = escapeHTML(text);
    if (!query) return escaped;

    const escapedQuery = escapeHTML(query);
    const regex = new RegExp(`(${this.escapeRegex(escapedQuery)})`, 'gi');
    return escaped.replace(regex, '<mark>$1</mark>');
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private selectItem(item: SearchBarEnhancedSourceItem): void {
    // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null
    const opts = this.options!;

    this.state.selectedItem = item;

    const itemObj = item as SearchBarEnhancedResultObject;
    const text =
      typeof item === 'string' ? item : itemObj.text || itemObj.label || itemObj.title || '';
    this.input.value = text;
    this.state.query = text;

    if (opts.onSelect) {
      opts.onSelect(item, this);
    }

    if (opts.closeOnSelect) {
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

  private showSuggestions(): void {
    this.resultsList.innerHTML = '';

    let hasSuggestions = false;

    // Show recent searches
    // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null
    if (this.options!.recentSearches && this.state.recentSearches.length > 0) {
      this.renderRecentSearches();
      hasSuggestions = true;
    }

    // Show popular searches
    // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null
    if (this.options!.popularSearches && this.popularSection) {
      this.popularSection.style.display = 'block';
      hasSuggestions = true;
    }

    if (hasSuggestions) {
      this.open();
    } else {
      this.close();
    }
  }

  private renderRecentSearches(): void {
    if (!this.recentSection || !this.recentList) return;

    this.recentList.innerHTML = '';

    this.state.recentSearches.forEach((search: string) => {
      const item = document.createElement('div');
      item.className = 'aiab-search-bar-recent-item';
      item.innerHTML = `
        <span class="aiab-search-bar-recent-text">🕐 ${escapeHTML(search)}</span>
        <button type="button" class="aiab-search-bar-recent-remove" data-search="${escapeHTML(search)}">×</button>
      `;

      const textEl = item.querySelector<HTMLSpanElement>('.aiab-search-bar-recent-text');
      if (textEl) {
        this.addHandler(textEl, 'click', () => {
          this.input.value = search;
          this.state.query = search;
          this.search(search);
        });
      }

      const removeEl = item.querySelector<HTMLButtonElement>('.aiab-search-bar-recent-remove');
      if (removeEl) {
        this.addHandler(removeEl, 'click', (e: Event) => {
          e.stopPropagation();
          this.removeRecentSearch(search);
        });
      }

      this.recentList!.appendChild(item);
    });

    this.recentSection.style.display = 'block';
  }

  private loadMore(): void {
    if (this.state.isLoading || !this.state.hasMore) return;

    this.state.page++;
    if (this.state.lastSearch !== null) {
      this.search(this.state.lastSearch);
    }
  }

  private submit(): void {
    // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null
    if (this.options!.onSubmit) {
      // biome-ignore lint/style/noNonNullAssertion: checked above
      this.options!.onSubmit(this.state.query, this.state.selectedItem, this);
    }

    this.close();
  }

  public clear(): void {
    this.input.value = '';
    this.state.query = '';
    this.state.selectedItem = null;
    this.state.highlightedIndex = -1;

    if (this.clearBtn) {
      this.clearBtn.style.display = 'none';
    }

    this.close();

    // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null
    if (this.options!.onClear) {
      // biome-ignore lint/style/noNonNullAssertion: checked above
      this.options!.onClear(this);
    }
  }

  public open(): void {
    if (this.state.isOpen) return;

    this.state.isOpen = true;
    this.resultsContainer.style.display = 'block';
    this.input.setAttribute('aria-expanded', 'true');

    this.updatePosition();

    // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null
    if (this.options!.onOpen) {
      // biome-ignore lint/style/noNonNullAssertion: checked above
      this.options!.onOpen(this);
    }
  }

  public close(): void {
    if (!this.state.isOpen) return;

    this.state.isOpen = false;
    this.resultsContainer.style.display = 'none';
    this.input.setAttribute('aria-expanded', 'false');

    this.state.highlightedIndex = -1;

    // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null
    if (this.options!.onClose) {
      // biome-ignore lint/style/noNonNullAssertion: checked above
      this.options!.onClose(this);
    }
  }

  private updatePosition(): void {
    // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null
    const opts = this.options!;

    if (opts.position === 'auto') {
      const rect = this.input.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      this.resultsContainer.classList.remove(
        'aiab-search-bar-results--top',
        'aiab-search-bar-results--bottom',
      );

      if (spaceBelow < opts.maxHeight && spaceAbove > spaceBelow) {
        this.resultsContainer.classList.add('aiab-search-bar-results--top');
      } else {
        this.resultsContainer.classList.add('aiab-search-bar-results--bottom');
      }
    }
  }

  private showLoading(): void {
    this.loading.style.display = 'block';
    this.noResults.style.display = 'none';
    this.error.style.display = 'none';
    this.resultsList.innerHTML = '';
    this.open();
  }

  private showNoResults(): void {
    this.loading.style.display = 'none';
    this.noResults.style.display = 'block';
    this.error.style.display = 'none';
    this.open();
  }

  private showError(message?: string): void {
    this.loading.style.display = 'none';
    this.noResults.style.display = 'none';
    this.error.style.display = 'block';
    if (message) {
      this.error.textContent = message;
    }
    this.open();
  }

  private startVoiceSearch(): void {
    if (this.recognition) {
      this.recognition.start();
      if (this.voiceBtn) {
        this.voiceBtn.classList.add('aiab-search-bar-voice--active');
      }

      this.recognition.onend = () => {
        if (this.voiceBtn) {
          this.voiceBtn.classList.remove('aiab-search-bar-voice--active');
        }
      };
    }
  }

  private hasVoiceSupport(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  private loadRecentSearches(): void {
    // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null during init
    if (!this.options!.persistRecent) return;

    try {
      const saved = localStorage.getItem('amphibious-recent-searches');
      if (saved) {
        this.state.recentSearches = JSON.parse(saved) as string[];
      }
    } catch (_e: unknown) {
      // Ignore errors
    }
  }

  private saveRecentSearches(): void {
    // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null
    if (!this.options!.persistRecent) return;

    try {
      localStorage.setItem('amphibious-recent-searches', JSON.stringify(this.state.recentSearches));
    } catch (_e: unknown) {
      // Ignore errors
    }
  }

  private removeRecentSearch(search: string): void {
    this.state.recentSearches = this.state.recentSearches.filter((s: string) => s !== search);
    this.saveRecentSearches();
    this.renderRecentSearches();

    if (this.state.recentSearches.length === 0 && this.recentSection) {
      this.recentSection.style.display = 'none';
    }
  }

  private clearRecentSearches(): void {
    this.state.recentSearches = [];
    this.saveRecentSearches();
    if (this.recentSection) {
      this.recentSection.style.display = 'none';
    }
  }

  // Helper methods
  private addHandler(element: EventTarget, event: string, handler: EventListener): void {
    element.addEventListener(event, handler);

    if (!this.handlers.has(element)) {
      this.handlers.set(element, []);
    }

    // biome-ignore lint/style/noNonNullAssertion: handlers.has() check above guarantees the key exists
    this.handlers.get(element)!.push({ event, handler });
  }

  // Public API
  public getValue(): string {
    return this.state.query;
  }

  public setValue(value: string): void {
    this.input.value = value;
    this.state.query = value;
    if (this.clearBtn) {
      this.clearBtn.style.display = value ? 'block' : 'none';
    }
  }

  public getSelected(): SearchBarEnhancedSourceItem | null {
    return this.state.selectedItem;
  }

  public setSource(source: SearchBarEnhancedSource): void {
    // biome-ignore lint/style/noNonNullAssertion: options is guaranteed non-null for public API
    this.options!.source = source;
    this.state.cache.clear();
  }

  public refresh(): void {
    if (this.state.query) {
      this.search(this.state.query);
    }
  }

  public focus(): void {
    this.input.focus();
  }

  /**
   * Comprehensive destroy method — releases all resources.
   */
  public destroy(): void {
    // Cancel any pending operations
    if (this._fetchController) {
      this._fetchController.abort();
      this._fetchController = null;
    }
    this.abortControllers.forEach((controller: AbortController) => controller.abort());
    this.abortControllers.clear();

    // Clear all timers
    this.timers.forEach((timer: ReturnType<typeof setTimeout>) => clearTimeout(timer));
    this.timers.clear();

    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    // Remove all event listeners
    this.handlers.forEach((handlerList: HandlerEntry[], element: EventTarget) => {
      handlerList.forEach(({ event, handler }: HandlerEntry) => {
        element.removeEventListener(event, handler);
      });
    });
    this.handlers.clear();

    // Disconnect observers
    this.observers.forEach((observer: MutationObserver) => observer.disconnect());
    this.observers.clear();

    // Clean up voice recognition
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }

    // Remove created elements
    this.createdElements.forEach((element: HTMLElement) => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.createdElements.clear();

    // Clear state
    this.state.cache.clear();
    // biome-ignore lint/suspicious/noExplicitAny: nullifying state on destroy for GC
    this.state = null as any;

    // Clear references
    this.element = null;
    // biome-ignore lint/suspicious/noExplicitAny: nullifying DOM references on destroy for GC
    this.wrapper = null as any;
    // biome-ignore lint/suspicious/noExplicitAny: nullifying DOM references on destroy for GC
    this.input = null as any;
    // biome-ignore lint/suspicious/noExplicitAny: nullifying DOM references on destroy for GC
    this.resultsContainer = null as any;
    // biome-ignore lint/suspicious/noExplicitAny: nullifying DOM references on destroy for GC
    this.resultsList = null as any;
    // biome-ignore lint/suspicious/noExplicitAny: nullifying DOM references on destroy for GC
    this.noResults = null as any;
    // biome-ignore lint/suspicious/noExplicitAny: nullifying DOM references on destroy for GC
    this.loading = null as any;
    // biome-ignore lint/suspicious/noExplicitAny: nullifying DOM references on destroy for GC
    this.error = null as any;
    this.clearBtn = null;
    this.submitBtn = null;
    this.voiceBtn = null;
    this.recentSection = null;
    this.recentList = null;
    this.popularSection = null;
    this.filtersContainer = null;
    this.filtersToggle = null;
    this.filtersPanel = null;
    // biome-ignore lint/suspicious/noExplicitAny: nullifying DOM references on destroy for GC
    this.liveRegion = null as any;
    this.options = null;
  }
}

// Register with component registry if available
if (window.AmphibiousRegistry) {
  // biome-ignore lint/suspicious/noExplicitAny: constructor type variance for registry
  window.AmphibiousRegistry.registerComponent('aiab-search-bar', SearchBarEnhanced as any, {
    selector: '[data-search-bar]',
    autoInit: true,
  });
}

// Export
window.SearchBarEnhanced = SearchBarEnhanced;
export default SearchBarEnhanced;
export { SearchBarEnhanced };
