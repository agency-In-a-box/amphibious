/**
 * Enhanced Dropdown Component TypeScript
 * Advanced select functionality with complete cleanup and rich features
 * Part of Amphibious 2.0 Component Library
 */

import { escapeHTML, sanitizeHTML } from '../utils/sanitize';

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

/** A single dropdown item parsed from a native `<select>` or `data-options`. */
export interface DropdownItem {
  value: string;
  text: string;
  selected?: boolean;
  disabled?: boolean;
  group?: string;
  element?: HTMLOptionElement;
  [key: string]: unknown;
}

/** Internationalisation / label strings. */
export interface DropdownLabels {
  search?: string;
  searchOptions?: string;
  noResults?: string;
  loading?: string;
  errorLoading?: string;
}

/** Fully-resolved labels with all defaults applied. */
interface ResolvedDropdownLabels {
  search: string;
  searchOptions: string;
  noResults: string;
  loading: string;
  errorLoading: string;
}

/**
 * Public options accepted by the {@link DropdownEnhanced} constructor.
 * Every property is optional; sensible defaults are applied internally.
 */
export interface DropdownEnhancedOptions {
  // Basic
  searchable?: boolean;
  multiple?: boolean;
  placeholder?: string;
  maxItems?: number | null;

  // Advanced
  allowCreate?: boolean;
  createText?: string;
  clearable?: boolean;
  disabled?: boolean;
  closeOnSelect?: boolean;

  // Data
  source?: ((term: string) => Promise<DropdownItem[]>) | string | null;
  ajax?: boolean;
  cacheResults?: boolean;
  minChars?: number;

  // Display
  optionRenderer?: ((item: DropdownItem, instance: DropdownEnhanced) => string) | null;
  selectedRenderer?: ((item: DropdownItem, instance: DropdownEnhanced) => string) | null;
  groupBy?: ((item: DropdownItem) => string) | string | null;
  sortBy?: ((a: DropdownItem, b: DropdownItem) => number) | string | null;

  // Behavior
  openOnFocus?: boolean;
  selectOnTab?: boolean;
  highlightFirst?: boolean;
  virtualScroll?: boolean;
  pageSize?: number;

  // Labels (i18n)
  labels?: DropdownLabels;

  // Callbacks
  onChange?: ((value: string | string[] | null, instance: DropdownEnhanced) => void) | null;
  onOpen?: ((instance: DropdownEnhanced) => void) | null;
  onClose?: ((instance: DropdownEnhanced) => void) | null;
  onCreate?: ((item: DropdownItem, instance: DropdownEnhanced) => void) | null;
  onSearch?: ((term: string, items: DropdownItem[], instance: DropdownEnhanced) => void) | null;
  onSelect?: ((item: DropdownItem, instance: DropdownEnhanced) => void) | null;
  onRemove?: ((item: DropdownItem, instance: DropdownEnhanced) => void) | null;
}

/** Internal fully-resolved options with all defaults applied. */
interface ResolvedDropdownEnhancedOptions {
  searchable: boolean;
  multiple: boolean;
  placeholder: string;
  maxItems: number | null;

  allowCreate: boolean;
  createText: string;
  clearable: boolean;
  disabled: boolean;
  closeOnSelect: boolean;

  source: ((term: string) => Promise<DropdownItem[]>) | string | null;
  ajax: boolean;
  cacheResults: boolean;
  minChars: number;

  optionRenderer: ((item: DropdownItem, instance: DropdownEnhanced) => string) | null;
  selectedRenderer: ((item: DropdownItem, instance: DropdownEnhanced) => string) | null;
  groupBy: ((item: DropdownItem) => string) | string | null;
  sortBy: ((a: DropdownItem, b: DropdownItem) => number) | string | null;

  openOnFocus: boolean;
  selectOnTab: boolean;
  highlightFirst: boolean;
  virtualScroll: boolean;
  pageSize: number;

  labels: ResolvedDropdownLabels;

  onChange: ((value: string | string[] | null, instance: DropdownEnhanced) => void) | null;
  onOpen: ((instance: DropdownEnhanced) => void) | null;
  onClose: ((instance: DropdownEnhanced) => void) | null;
  onCreate: ((item: DropdownItem, instance: DropdownEnhanced) => void) | null;
  onSearch: ((term: string, items: DropdownItem[], instance: DropdownEnhanced) => void) | null;
  onSelect: ((item: DropdownItem, instance: DropdownEnhanced) => void) | null;
  onRemove: ((item: DropdownItem, instance: DropdownEnhanced) => void) | null;
}

/** Internal component state. */
interface DropdownEnhancedState {
  isOpen: boolean;
  selectedValues: string[];
  selectedItems: DropdownItem[];
  filteredItems: DropdownItem[];
  allItems: DropdownItem[];
  highlightedIndex: number;
  searchTerm: string;
  loading: boolean;
  cache: Map<string, DropdownItem[]>;
  page: number;
  hasMore: boolean;
}

/** Stored event handler entry for cleanup. */
interface HandlerEntry {
  event: string;
  handler: EventListener;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

class DropdownEnhanced {
  private element!: HTMLElement | null;
  private options!: ResolvedDropdownEnhancedOptions | null;
  private state!: DropdownEnhancedState | null;

  // Memory management
  private handlers: Map<EventTarget, HandlerEntry[]>;
  private timers: Set<ReturnType<typeof setTimeout>>;
  private createdElements: Set<HTMLElement>;
  private observers: Set<MutationObserver | ResizeObserver | IntersectionObserver>;

  // Debounce timer for search
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null;

  // DOM references — set in init() called from constructor
  private nativeSelect?: HTMLSelectElement | null;
  private wrapper!: HTMLDivElement;
  private selectBtn!: HTMLDivElement;
  private valueDisplay!: HTMLDivElement;
  private valueText?: HTMLSpanElement;
  private searchInput?: HTMLInputElement;
  private clearBtn?: HTMLButtonElement;
  private menu!: HTMLDivElement;
  private itemsContainer!: HTMLDivElement;
  private noResults!: HTMLDivElement;
  private loading!: HTMLDivElement;

  // Virtual scroll DOM
  private viewport?: HTMLDivElement;
  private spacer?: HTMLDivElement;

  // Abort controller for remote fetch
  private fetchController?: AbortController | null;

  constructor(element: HTMLElement, options: DropdownEnhancedOptions = {}) {
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
      maxItems:
        options.maxItems ||
        Number.parseInt(element.dataset.maxItems as string, 10) ||
        null,

      // Advanced options
      allowCreate: options.allowCreate || false,
      createText: options.createText || 'Create: ',
      clearable: options.clearable !== false,
      disabled: options.disabled || false,
      closeOnSelect: options.closeOnSelect !== false,

      // Data options
      source: options.source || null,
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

      // Labels (i18n)
      labels: {
        search: 'Search...',
        searchOptions: 'Search options',
        noResults: 'No results found',
        loading: 'Loading...',
        errorLoading: 'Error loading data',
        ...(options.labels || {}),
      },

      // Callbacks
      onChange: options.onChange || null,
      onOpen: options.onOpen || null,
      onClose: options.onClose || null,
      onCreate: options.onCreate || null,
      onSearch: options.onSearch || null,
      onSelect: options.onSelect || null,
      onRemove: options.onRemove || null,

      ...options,
    } as ResolvedDropdownEnhancedOptions;

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

  private init(): void {
    this.parseNativeSelect();
    this.createDropdown();
    this.bindEvents();
    this.setInitialValue();

    if (this.options!.disabled) {
      this.disable();
    }
  }

  private parseNativeSelect(): void {
    // Find native select if exists
    const nativeSelect = this.element!.querySelector('select');
    if (!nativeSelect) {
      // Use data-options if no native select
      this.parseDataOptions();
      return;
    }

    this.nativeSelect = nativeSelect;
    nativeSelect.style.display = 'none';

    const items: DropdownItem[] = [];
    const optgroups = nativeSelect.querySelectorAll('optgroup');

    if (optgroups.length > 0) {
      optgroups.forEach((group) => {
        const groupLabel = group.label;
        const groupOptions = group.querySelectorAll('option');

        groupOptions.forEach((option) => {
          items.push({
            value: option.value,
            text: option.textContent || '',
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
            text: option.textContent || '',
            selected: option.selected,
            disabled: option.disabled,
            element: option,
          });
        }
      });
    }

    this.state!.allItems = items;
    this.state!.filteredItems = [...items];
  }

  private parseDataOptions(): void {
    const optionsData = this.element!.dataset.options;
    if (optionsData) {
      try {
        this.state!.allItems = JSON.parse(optionsData) as DropdownItem[];
        this.state!.filteredItems = [...this.state!.allItems];
      } catch (_e) {
        this.state!.allItems = [];
        this.state!.filteredItems = [];
      }
    }
  }

  private createDropdown(): void {
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'aiab-dropdown-enhanced';
    if (this.options!.multiple) {
      wrapper.classList.add('aiab-dropdown-enhanced--multi');
    }

    // Create select button
    const selectBtn = document.createElement('div');
    selectBtn.className = 'aiab-dropdown-select';
    selectBtn.setAttribute('role', 'combobox');
    selectBtn.setAttribute('aria-expanded', 'false');
    selectBtn.setAttribute('aria-haspopup', 'listbox');
    selectBtn.setAttribute('tabindex', '0');

    // Value display
    const valueDisplay = document.createElement('div');
    valueDisplay.className = 'aiab-dropdown-value';

    if (this.options!.searchable && !this.options!.multiple) {
      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.className = 'aiab-dropdown-search-inline';
      searchInput.placeholder = this.options!.placeholder;
      valueDisplay.appendChild(searchInput);
      this.searchInput = searchInput;
    } else {
      const valueText = document.createElement('span');
      valueText.className = 'aiab-dropdown-value-text aiab-dropdown-placeholder';
      valueText.textContent = this.options!.placeholder;
      valueDisplay.appendChild(valueText);
      this.valueText = valueText;
    }

    // Icons container
    const icons = document.createElement('div');
    icons.className = 'aiab-dropdown-icons';

    // Clear button
    if (this.options!.clearable) {
      const clearBtn = document.createElement('button');
      clearBtn.className = 'aiab-dropdown-clear';
      clearBtn.type = 'button';
      clearBtn.innerHTML = '\u00d7';
      clearBtn.style.display = 'none';
      icons.appendChild(clearBtn);
      this.clearBtn = clearBtn;
    }

    // Dropdown arrow
    const arrow = document.createElement('span');
    arrow.className = 'aiab-dropdown-arrow';
    arrow.innerHTML = '\u25bc';
    icons.appendChild(arrow);

    selectBtn.appendChild(valueDisplay);
    selectBtn.appendChild(icons);

    // Create menu
    const menu = document.createElement('div');
    menu.className = 'aiab-dropdown-menu';
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('aria-hidden', 'true');

    // Search box (for multiple or when searchable)
    if (this.options!.searchable && this.options!.multiple) {
      const searchContainer = document.createElement('div');
      searchContainer.className = 'aiab-dropdown-search';

      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.className = 'aiab-dropdown-search-input';
      searchInput.placeholder = this.options!.labels.search;
      searchInput.setAttribute('aria-label', this.options!.labels.searchOptions);

      searchContainer.appendChild(searchInput);
      menu.appendChild(searchContainer);
      this.searchInput = searchInput;
    }

    // Options container
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'aiab-dropdown-items';

    if (this.options!.virtualScroll) {
      itemsContainer.classList.add('aiab-dropdown-items--virtual');
      this.setupVirtualScroll(itemsContainer);
    }

    menu.appendChild(itemsContainer);

    // No results message
    const noResults = document.createElement('div');
    noResults.className = 'aiab-dropdown-no-results';
    noResults.textContent = this.options!.labels.noResults;
    noResults.style.display = 'none';
    menu.appendChild(noResults);

    // Loading indicator
    const loadingEl = document.createElement('div');
    loadingEl.className = 'aiab-dropdown-loading';
    loadingEl.innerHTML = `<span class="dropdown-spinner"></span> ${escapeHTML(this.options!.labels.loading)}`;
    loadingEl.style.display = 'none';
    menu.appendChild(loadingEl);

    // Add to wrapper
    wrapper.appendChild(selectBtn);
    wrapper.appendChild(menu);

    // Replace element
    this.element!.appendChild(wrapper);

    // Store references
    this.wrapper = wrapper;
    this.selectBtn = selectBtn;
    this.valueDisplay = valueDisplay;
    this.menu = menu;
    this.itemsContainer = itemsContainer;
    this.noResults = noResults;
    this.loading = loadingEl;

    this.createdElements.add(wrapper);

    // Initial render
    this.renderItems();
  }

  private setupVirtualScroll(container: HTMLDivElement): void {
    // Create viewport
    const viewport = document.createElement('div');
    viewport.className = 'aiab-dropdown-viewport';

    // Create spacer for scrollbar
    const spacer = document.createElement('div');
    spacer.className = 'aiab-dropdown-spacer';

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

  private renderItems(searchTerm = ''): void {
    // Filter items
    let items = this.state!.allItems;

    if (searchTerm) {
      items = this.filterItems(searchTerm);
    }

    // Sort items
    if (this.options!.sortBy) {
      items = this.sortItems(items);
    }

    // Group items
    if (this.options!.groupBy) {
      items = this.groupItems(items);
    }

    this.state!.filteredItems = items;

    // Render based on virtual scroll
    if (this.options!.virtualScroll) {
      this.renderVirtualItems();
    } else {
      this.renderNormalItems();
    }

    // Show/hide no results
    this.noResults.style.display = items.length === 0 ? 'block' : 'none';
  }

  private renderNormalItems(): void {
    this.itemsContainer.innerHTML = '';

    let currentGroup: string | null = null;

    this.state!.filteredItems.forEach((item, index) => {
      // Render group header
      if (item.group && item.group !== currentGroup) {
        const groupHeader = document.createElement('div');
        groupHeader.className = 'aiab-dropdown-group-header';
        groupHeader.textContent = item.group;
        this.itemsContainer.appendChild(groupHeader);
        currentGroup = item.group;
      }

      // Render item
      const itemEl = this.createItemElement(item, index);
      this.itemsContainer.appendChild(itemEl);
    });
  }

  private renderVirtualItems(): void {
    const scrollTop = this.itemsContainer.scrollTop;
    const containerHeight = this.itemsContainer.clientHeight;
    const itemHeight = 40; // Approximate item height

    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      this.state!.filteredItems.length,
    );

    // Update spacer height
    this.spacer!.style.height = `${this.state!.filteredItems.length * itemHeight}px`;

    // Clear viewport
    this.viewport!.innerHTML = '';
    this.viewport!.style.transform = `translateY(${startIndex * itemHeight}px)`;

    // Render visible items
    for (let i = startIndex; i < endIndex; i++) {
      const item = this.state!.filteredItems[i];
      if (item) {
        const itemEl = this.createItemElement(item, i);
        this.viewport!.appendChild(itemEl);
      }
    }
  }

  private createItemElement(item: DropdownItem, index: number): HTMLDivElement {
    const itemEl = document.createElement('div');
    itemEl.className = 'aiab-dropdown-item';
    itemEl.setAttribute('role', 'option');
    itemEl.dataset.value = item.value;
    itemEl.dataset.index = String(index);

    if (item.disabled) {
      itemEl.classList.add('aiab-dropdown-item--disabled');
      itemEl.setAttribute('aria-disabled', 'true');
    }

    if (this.isSelected(item.value)) {
      itemEl.classList.add('aiab-dropdown-item--selected');
      itemEl.setAttribute('aria-selected', 'true');
    }

    if (index === this.state!.highlightedIndex) {
      itemEl.classList.add('aiab-dropdown-item--highlighted');
    }

    // Custom renderer or default
    if (this.options!.optionRenderer) {
      itemEl.innerHTML = sanitizeHTML(this.options!.optionRenderer(item, this));
    } else {
      // Checkbox for multiple
      if (this.options!.multiple) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'aiab-dropdown-checkbox';
        checkbox.checked = this.isSelected(item.value);
        checkbox.onclick = (e: Event) => e.stopPropagation();
        itemEl.appendChild(checkbox);
      }

      // Text
      const text = document.createElement('span');
      text.className = 'aiab-dropdown-item-text';
      text.textContent = item.text;
      itemEl.appendChild(text);

      // Highlight search term
      if (this.state!.searchTerm) {
        this.highlightSearchTerm(text, this.state!.searchTerm);
      }
    }

    // Bind events
    if (!item.disabled) {
      const selectHandler = (e: Event): void => {
        e.stopPropagation();
        this.selectItem(item);
      };

      const hoverHandler = (): void => {
        this.state!.highlightedIndex = index;
        this.updateHighlight();
      };

      this.addHandler(itemEl, 'click', selectHandler);
      this.addHandler(itemEl, 'mouseenter', hoverHandler);
    }

    return itemEl;
  }

  private bindEvents(): void {
    // Toggle dropdown
    const toggleHandler = (): void => this.toggle();
    this.addHandler(this.selectBtn, 'click', toggleHandler);

    // Keyboard navigation
    const keyHandler = (e: Event): void => this.handleKeydown(e as KeyboardEvent);
    this.addHandler(this.selectBtn, 'keydown', keyHandler);
    this.addHandler(this.menu, 'keydown', keyHandler);

    // Search input
    if (this.searchInput) {
      const searchHandler = (e: Event): void => {
        const target = e.target as HTMLInputElement;
        this.state!.searchTerm = target.value;

        if (this.searchDebounceTimer) {
          clearTimeout(this.searchDebounceTimer);
        }

        this.searchDebounceTimer = setTimeout(
          () => {
            this.handleSearch(target.value);
          },
          this.options!.ajax ? 300 : 0,
        );

        this.timers.add(this.searchDebounceTimer);
      };

      this.addHandler(this.searchInput, 'input', searchHandler);

      // Prevent dropdown from closing when clicking search
      const preventClose = (e: Event): void => e.stopPropagation();
      this.addHandler(this.searchInput, 'click', preventClose);
    }

    // Clear button
    if (this.clearBtn) {
      const clearHandler = (e: Event): void => {
        e.stopPropagation();
        this.clear();
      };
      this.addHandler(this.clearBtn, 'click', clearHandler);
    }

    // Focus events
    if (this.options!.openOnFocus) {
      const focusHandler = (): void => this.open();
      this.addHandler(this.selectBtn, 'focus', focusHandler);
    }

    // Click outside to close
    const outsideHandler = (e: Event): void => {
      if (!this.wrapper.contains(e.target as Node) && this.state!.isOpen) {
        this.close();
      }
    };
    this.addHandler(document, 'click', outsideHandler);

    // ESC key to close
    const escHandler = (e: Event): void => {
      const keyEvent = e as KeyboardEvent;
      if (keyEvent.key === 'Escape' && this.state!.isOpen) {
        this.close();
        this.selectBtn.focus();
      }
    };
    this.addHandler(document, 'keydown', escHandler);

    // Window resize
    const resizeHandler = (): void => this.updatePosition();
    this.addHandler(window, 'resize', resizeHandler);

    // Handle native select changes
    if (this.nativeSelect) {
      const changeHandler = (): void => this.syncFromNative();
      this.addHandler(this.nativeSelect, 'change', changeHandler);
    }
  }

  private handleKeydown(e: KeyboardEvent): void {
    const items = this.state!.filteredItems.filter((i) => !i.disabled);

    switch (e.key) {
      case 'Enter':
        if (this.state!.isOpen && this.state!.highlightedIndex >= 0) {
          e.preventDefault();
          const item = items[this.state!.highlightedIndex];
          if (item) this.selectItem(item);
        } else {
          e.preventDefault();
          this.open();
        }
        break;

      case ' ':
        if (!this.searchInput || e.target !== this.searchInput) {
          e.preventDefault();
          if (this.state!.isOpen && this.state!.highlightedIndex >= 0) {
            const item = items[this.state!.highlightedIndex];
            if (item) this.selectItem(item);
          } else {
            this.open();
          }
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!this.state!.isOpen) {
          this.open();
        } else {
          this.state!.highlightedIndex = Math.min(
            this.state!.highlightedIndex + 1,
            items.length - 1,
          );
          this.updateHighlight();
          this.scrollToHighlighted();
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (this.state!.isOpen) {
          this.state!.highlightedIndex = Math.max(this.state!.highlightedIndex - 1, 0);
          this.updateHighlight();
          this.scrollToHighlighted();
        }
        break;

      case 'Home':
        if (this.state!.isOpen) {
          e.preventDefault();
          this.state!.highlightedIndex = 0;
          this.updateHighlight();
          this.scrollToHighlighted();
        }
        break;

      case 'End':
        if (this.state!.isOpen) {
          e.preventDefault();
          this.state!.highlightedIndex = items.length - 1;
          this.updateHighlight();
          this.scrollToHighlighted();
        }
        break;

      case 'Tab':
        if (
          this.state!.isOpen &&
          this.options!.selectOnTab &&
          this.state!.highlightedIndex >= 0
        ) {
          const item = items[this.state!.highlightedIndex];
          if (item) {
            e.preventDefault();
            this.selectItem(item);
          }
        }
        break;
    }
  }

  private handleSearch(searchTerm: string): void {
    if (this.options!.ajax && this.options!.source) {
      this.loadRemoteData(searchTerm);
    } else {
      this.renderItems(searchTerm);

      if (this.options!.onSearch) {
        this.options!.onSearch(searchTerm, this.state!.filteredItems, this);
      }
    }
  }

  private async loadRemoteData(searchTerm: string): Promise<void> {
    // Check cache
    if (this.options!.cacheResults && this.state!.cache.has(searchTerm)) {
      this.state!.allItems = this.state!.cache.get(searchTerm)!;
      this.renderItems();
      return;
    }

    this.state!.loading = true;
    this.loading.style.display = 'block';

    // Abort any in-flight request before starting a new one
    if (this.fetchController) {
      this.fetchController.abort();
    }

    const controller = new AbortController();
    this.fetchController = controller;
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      let data: DropdownItem[];

      if (typeof this.options!.source === 'function') {
        data = await this.options!.source(searchTerm);
      } else {
        const response = await fetch(
          `${this.options!.source}?q=${encodeURIComponent(searchTerm)}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error(`Dropdown data request failed: ${response.status}`);
        }
        data = (await response.json()) as DropdownItem[];
      }

      // Cache results
      if (this.options!.cacheResults) {
        this.state!.cache.set(searchTerm, data);
      }

      this.state!.allItems = data;
      this.renderItems();
    } catch (error: unknown) {
      // Silently ignore aborted requests (superseded by a newer search)
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      this.noResults.textContent = this.options!.labels.errorLoading;
      this.noResults.style.display = 'block';
    } finally {
      clearTimeout(timeoutId);
      this.state!.loading = false;
      this.loading.style.display = 'none';
    }
  }

  private filterItems(searchTerm: string): DropdownItem[] {
    const term = searchTerm.toLowerCase();

    return this.state!.allItems.filter((item) => {
      const text = item.text.toLowerCase();
      const value = item.value.toString().toLowerCase();

      return text.includes(term) || value.includes(term);
    });
  }

  private sortItems(items: DropdownItem[]): DropdownItem[] {
    const sortBy = this.options!.sortBy;

    if (typeof sortBy === 'function') {
      return items.sort(sortBy);
    }

    if (typeof sortBy === 'string') {
      return items.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];

        if (aVal != null && bVal != null && aVal < bVal) return -1;
        if (aVal != null && bVal != null && aVal > bVal) return 1;
        return 0;
      });
    }

    return items;
  }

  private groupItems(items: DropdownItem[]): DropdownItem[] {
    const groups = new Map<string, DropdownItem[]>();

    for (const item of items) {
      const groupKey: string =
        typeof this.options!.groupBy === 'function'
          ? this.options!.groupBy(item)
          : (item[this.options!.groupBy as string] as string);

      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }

      groups.get(groupKey)!.push(item);
    }

    // Flatten groups
    const grouped: DropdownItem[] = [];
    groups.forEach((groupItems, groupName) => {
      for (const item of groupItems) {
        grouped.push({ ...item, group: groupName });
      }
    });

    return grouped;
  }

  private highlightSearchTerm(element: HTMLElement, term: string): void {
    const text = escapeHTML(element.textContent || '');
    const escapedTerm = escapeHTML(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    const highlighted = text.replace(regex, '<mark>$1</mark>');
    element.innerHTML = highlighted;
  }

  private selectItem(item: DropdownItem): void {
    if (this.options!.multiple) {
      const index = this.state!.selectedValues.indexOf(item.value);

      if (index > -1) {
        // Remove
        this.state!.selectedValues.splice(index, 1);
        this.state!.selectedItems.splice(index, 1);

        if (this.options!.onRemove) {
          this.options!.onRemove(item, this);
        }
      } else {
        // Add
        if (
          !this.options!.maxItems ||
          this.state!.selectedValues.length < this.options!.maxItems
        ) {
          this.state!.selectedValues.push(item.value);
          this.state!.selectedItems.push(item);

          if (this.options!.onSelect) {
            this.options!.onSelect(item, this);
          }
        }
      }

      this.renderItems(this.state!.searchTerm);
    } else {
      this.state!.selectedValues = [item.value];
      this.state!.selectedItems = [item];

      if (this.options!.onSelect) {
        this.options!.onSelect(item, this);
      }

      if (this.options!.closeOnSelect) {
        this.close();
      }
    }

    this.updateDisplay();
    this.updateNativeSelect();

    if (this.options!.onChange) {
      this.options!.onChange(this.getValue(), this);
    }
  }

  private updateDisplay(): void {
    if (this.state!.selectedItems.length === 0) {
      if (this.valueText) {
        this.valueText.className = 'aiab-dropdown-value-text aiab-dropdown-placeholder';
        this.valueText.textContent = this.options!.placeholder;
      }

      if (this.clearBtn) {
        this.clearBtn.style.display = 'none';
      }
    } else {
      if (this.options!.multiple && this.valueText) {
        // Multi-select display
        this.valueText.className = 'aiab-dropdown-value-text';
        this.valueText.innerHTML = '';

        this.state!.selectedItems.forEach((item) => {
          const tag = document.createElement('span');
          tag.className = 'aiab-dropdown-tag';

          const tagText = document.createElement('span');
          tagText.textContent = item.text;

          const removeBtn = document.createElement('button');
          removeBtn.className = 'aiab-dropdown-tag-remove';
          removeBtn.innerHTML = '\u00d7';
          removeBtn.onclick = (e: MouseEvent): void => {
            e.stopPropagation();
            this.removeItem(item);
          };

          tag.appendChild(tagText);
          tag.appendChild(removeBtn);
          this.valueText!.appendChild(tag);
        });
      } else if (this.valueText) {
        // Single select display
        const item = this.state!.selectedItems[0];

        if (this.options!.selectedRenderer) {
          this.valueText.innerHTML = sanitizeHTML(
            this.options!.selectedRenderer(item, this),
          );
        } else {
          this.valueText.className = 'aiab-dropdown-value-text';
          this.valueText.textContent = item.text;
        }
      } else if (this.searchInput && !this.options!.multiple) {
        // Searchable single select
        this.searchInput.value = this.state!.selectedItems[0].text;
      }

      if (this.clearBtn) {
        this.clearBtn.style.display = 'block';
      }
    }
  }

  private updateNativeSelect(): void {
    if (!this.nativeSelect) return;

    this.nativeSelect.querySelectorAll('option').forEach((option) => {
      option.selected = this.state!.selectedValues.includes(option.value);
    });

    // Trigger change event
    const event = new Event('change', { bubbles: true });
    this.nativeSelect.dispatchEvent(event);
  }

  private updateHighlight(): void {
    this.itemsContainer.querySelectorAll('.aiab-dropdown-item').forEach((item, index) => {
      if (index === this.state!.highlightedIndex) {
        item.classList.add('aiab-dropdown-item--highlighted');
      } else {
        item.classList.remove('aiab-dropdown-item--highlighted');
      }
    });
  }

  private scrollToHighlighted(): void {
    const highlighted = this.itemsContainer.querySelector(
      '.aiab-dropdown-item--highlighted',
    );
    if (highlighted) {
      highlighted.scrollIntoView({ block: 'nearest' });
    }
  }

  private updatePosition(): void {
    if (!this.state!.isOpen) return;

    const rect = this.selectBtn.getBoundingClientRect();
    const menuHeight = this.menu.offsetHeight;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    this.menu.classList.remove('aiab-dropdown-menu--top', 'aiab-dropdown-menu--bottom');

    if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
      this.menu.classList.add('aiab-dropdown-menu--top');
    } else {
      this.menu.classList.add('aiab-dropdown-menu--bottom');
    }
  }

  private removeItem(item: DropdownItem): void {
    const index = this.state!.selectedValues.indexOf(item.value);
    if (index > -1) {
      this.state!.selectedValues.splice(index, 1);
      this.state!.selectedItems.splice(index, 1);

      this.updateDisplay();
      this.updateNativeSelect();
      this.renderItems(this.state!.searchTerm);

      if (this.options!.onRemove) {
        this.options!.onRemove(item, this);
      }

      if (this.options!.onChange) {
        this.options!.onChange(this.getValue(), this);
      }
    }
  }

  private isSelected(value: string): boolean {
    return this.state!.selectedValues.includes(value);
  }

  private setInitialValue(): void {
    const selectedItems = this.state!.allItems.filter((item) => item.selected);

    if (selectedItems.length > 0) {
      this.state!.selectedValues = selectedItems.map((item) => item.value);
      this.state!.selectedItems = selectedItems;
      this.updateDisplay();
    }
  }

  private syncFromNative(): void {
    if (!this.nativeSelect) return;

    const selectedOptions = Array.from(this.nativeSelect.selectedOptions);
    this.state!.selectedValues = selectedOptions.map((opt) => opt.value);
    this.state!.selectedItems = this.state!.allItems.filter((item) =>
      this.state!.selectedValues.includes(item.value),
    );

    this.updateDisplay();
    this.renderItems(this.state!.searchTerm);
  }

  open(): void {
    if (this.state!.isOpen || this.options!.disabled) return;

    this.state!.isOpen = true;
    this.wrapper.classList.add('aiab-dropdown-enhanced--open');
    this.selectBtn.setAttribute('aria-expanded', 'true');
    this.menu.setAttribute('aria-hidden', 'false');

    this.updatePosition();

    // Focus search or highlight first
    if (this.searchInput) {
      if (this.options!.multiple || !this.state!.selectedItems.length) {
        this.searchInput.focus();
      }
    }

    if (this.options!.highlightFirst && !this.state!.highlightedIndex) {
      const firstEnabled = this.state!.filteredItems.findIndex((i) => !i.disabled);
      if (firstEnabled >= 0) {
        this.state!.highlightedIndex = firstEnabled;
        this.updateHighlight();
      }
    }

    if (this.options!.onOpen) {
      this.options!.onOpen(this);
    }
  }

  close(): void {
    if (!this.state!.isOpen) return;

    this.state!.isOpen = false;
    this.wrapper.classList.remove('aiab-dropdown-enhanced--open');
    this.selectBtn.setAttribute('aria-expanded', 'false');
    this.menu.setAttribute('aria-hidden', 'true');

    // Clear search
    if (this.searchInput) {
      this.searchInput.value = '';
      this.state!.searchTerm = '';
      this.renderItems();
    }

    this.state!.highlightedIndex = -1;

    if (this.options!.onClose) {
      this.options!.onClose(this);
    }
  }

  toggle(): void {
    if (this.state!.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  clear(): void {
    this.state!.selectedValues = [];
    this.state!.selectedItems = [];

    this.updateDisplay();
    this.updateNativeSelect();
    this.renderItems(this.state!.searchTerm);

    if (this.options!.onChange) {
      this.options!.onChange(null, this);
    }
  }

  disable(): void {
    this.options!.disabled = true;
    this.wrapper.classList.add('aiab-dropdown-enhanced--disabled');
    this.selectBtn.setAttribute('aria-disabled', 'true');
    this.selectBtn.setAttribute('tabindex', '-1');
    this.close();
  }

  enable(): void {
    this.options!.disabled = false;
    this.wrapper.classList.remove('aiab-dropdown-enhanced--disabled');
    this.selectBtn.setAttribute('aria-disabled', 'false');
    this.selectBtn.setAttribute('tabindex', '0');
  }

  // Helper methods
  private addHandler(element: EventTarget, event: string, handler: EventListener): void {
    element.addEventListener(event, handler);

    if (!this.handlers.has(element)) {
      this.handlers.set(element, []);
    }

    this.handlers.get(element)!.push({ event, handler });
  }

  private debounce<T extends (...args: unknown[]) => void>(
    func: T,
    wait: number,
  ): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    return function executedFunction(...args: Parameters<T>): void {
      const later = (): void => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Public API

  getValue(): string | string[] | null {
    if (this.options!.multiple) {
      return this.state!.selectedValues;
    }
    return this.state!.selectedValues[0] || null;
  }

  getItems(): DropdownItem | DropdownItem[] | null {
    if (this.options!.multiple) {
      return this.state!.selectedItems;
    }
    return this.state!.selectedItems[0] || null;
  }

  setValue(value: string | string[]): void {
    if (this.options!.multiple && Array.isArray(value)) {
      this.state!.selectedValues = value;
      this.state!.selectedItems = this.state!.allItems.filter((item) =>
        value.includes(item.value),
      );
    } else if (value) {
      const single = value as string;
      this.state!.selectedValues = [single];
      this.state!.selectedItems = this.state!.allItems.filter(
        (item) => item.value === single,
      );
    } else {
      this.clear();
    }

    this.updateDisplay();
    this.updateNativeSelect();
    this.renderItems();
  }

  addOption(option: DropdownItem): void {
    this.state!.allItems.push(option);
    this.renderItems(this.state!.searchTerm);
  }

  removeOption(value: string): void {
    this.state!.allItems = this.state!.allItems.filter(
      (item) => item.value !== value,
    );
    this.removeItem({ value, text: '' });
    this.renderItems(this.state!.searchTerm);
  }

  refresh(): void {
    this.parseNativeSelect();
    this.renderItems(this.state!.searchTerm);
    this.setInitialValue();
  }

  /**
   * Comprehensive destroy method
   */
  destroy(): void {
    // Close if open
    this.close();

    // Abort any in-flight fetch request
    if (this.fetchController) {
      this.fetchController.abort();
      this.fetchController = null;
    }

    // Clear all timers
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();

    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    // Remove all event listeners
    this.handlers.forEach((handlerList, element) => {
      for (const { event, handler } of handlerList) {
        element.removeEventListener(event, handler);
      }
    });
    this.handlers.clear();

    // Disconnect observers
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();

    // Remove created elements
    this.createdElements.forEach((el) => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
    this.createdElements.clear();

    // Show native select if it exists
    if (this.nativeSelect) {
      this.nativeSelect.style.display = '';
    }

    // Clear all references
    this.element = null;
    this.wrapper = null as unknown as HTMLDivElement;
    this.selectBtn = null as unknown as HTMLDivElement;
    this.valueDisplay = null as unknown as HTMLDivElement;
    this.valueText = undefined;
    this.searchInput = undefined;
    this.clearBtn = undefined;
    this.menu = null as unknown as HTMLDivElement;
    this.itemsContainer = null as unknown as HTMLDivElement;
    this.noResults = null as unknown as HTMLDivElement;
    this.loading = null as unknown as HTMLDivElement;
    this.viewport = undefined;
    this.spacer = undefined;
    this.nativeSelect = null;

    // Clear state
    this.state = null;
    this.options = null;
  }
}

// ---------------------------------------------------------------------------
// Global declarations & registration
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    DropdownEnhanced: typeof DropdownEnhanced;
  }
}

// Register with component registry if available
if (window.AmphibiousRegistry) {
  // biome-ignore lint/suspicious/noExplicitAny: constructor type variance for registry
  window.AmphibiousRegistry.registerComponent('dropdown', DropdownEnhanced as any, {
    selector: '[data-dropdown]',
    autoInit: true,
  });
}

// Export
window.DropdownEnhanced = DropdownEnhanced;
export default DropdownEnhanced;
export { DropdownEnhanced };
