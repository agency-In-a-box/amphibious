/**
 * Custom Dropdown Component
 * Enhanced select functionality with search and multi-select
 * Part of Amphibious 2.0 Component Library
 */

import { escapeHTML } from '../utils/sanitize';

/**
 * Labels configuration for translatable UI strings.
 *
 * @property search - Placeholder text for the search input. Defaults to `'Search...'`.
 * @property searchOptions - ARIA label for the search input. Defaults to `'Search options'`.
 */
export interface DropdownLabels {
  search: string;
  searchOptions: string;
}

/**
 * Configuration options for the Dropdown component.
 *
 * @property searchable - Enable a search/filter input inside the dropdown menu.
 * @property multiple - Enable multi-select mode (tags for selected values).
 * @property placeholder - Placeholder text when no value is selected.
 * @property maxItems - Maximum number of selectable items in multi-select mode. `null` means unlimited.
 * @property onChange - Callback fired when the selection changes.
 * @property onOpen - Callback fired when the dropdown menu opens.
 * @property onClose - Callback fired when the dropdown menu closes.
 * @property labels - Translatable UI label strings.
 */
export interface DropdownOptions {
  searchable?: boolean;
  multiple?: boolean;
  placeholder?: string;
  maxItems?: number | null;
  onChange?: ((values: string[], dropdown: Dropdown) => void) | null;
  onOpen?: ((dropdown: Dropdown) => void) | null;
  onClose?: ((dropdown: Dropdown) => void) | null;
  labels?: Partial<DropdownLabels>;
}

/**
 * Internal representation of a parsed `<select>` item.
 *
 * Items with `type: 'group'` represent `<optgroup>` labels and carry only
 * the `label` field. Items with `type: 'option'` correspond to `<option>`
 * elements and carry `value`, `text`, `selected`, and `disabled`.
 */
export interface DropdownItem {
  type: 'group' | 'option';
  label?: string;
  value?: string;
  text?: string;
  selected?: boolean;
  disabled?: boolean;
}

/** Resolved internal options with all defaults applied. */
interface ResolvedDropdownOptions {
  searchable: boolean;
  multiple: boolean;
  placeholder: string;
  maxItems: number | null;
  onChange: ((values: string[], dropdown: Dropdown) => void) | null;
  onOpen: ((dropdown: Dropdown) => void) | null;
  onClose: ((dropdown: Dropdown) => void) | null;
  labels: DropdownLabels;
}

/**
 * Enhanced dropdown component with search, multi-select, and keyboard navigation.
 *
 * Wraps a native `<select>` element (if present) with a fully custom UI
 * while keeping the native element in sync for form submissions. Supports
 * `<optgroup>` parsing, searchable filtering, multi-select with tag removal,
 * and full keyboard navigation (Arrow keys, Home, End, Enter, Space, Escape).
 *
 * Uses an `AbortController` for centralized event listener cleanup on {@link destroy}.
 *
 * @example
 * ```ts
 * const dropdown = new Dropdown(document.querySelector('.my-dropdown')!, {
 *   searchable: true,
 *   multiple: true,
 *   maxItems: 3,
 *   onChange: (values) => console.log('Selected:', values),
 * });
 * ```
 */
export class Dropdown {
  private element: HTMLElement;
  private options: ResolvedDropdownOptions;

  private isOpen: boolean;
  private selectedValues: string[];
  private filteredItems: NodeListOf<HTMLElement>;
  private _abortController: AbortController;

  private items: DropdownItem[] = [];
  private nativeSelect: HTMLSelectElement | null = null;
  private searchInput: HTMLInputElement | null = null;

  // DOM references created in createDropdown()
  private dropdown!: HTMLElement;
  private selectBtn!: HTMLButtonElement;
  private valueSpan!: HTMLSpanElement;
  private menu!: HTMLElement;
  private itemsContainer!: HTMLElement;

  /**
   * @param element - The wrapper element containing a native `<select>` or `[data-dropdown]` markup.
   * @param options - Configuration options merged with sensible defaults.
   */
  constructor(element: HTMLElement, options: DropdownOptions = {}) {
    this.element = element;
    this.options = {
      searchable: options.searchable || element.dataset.searchable === 'true',
      multiple: options.multiple || element.dataset.multiple === 'true',
      placeholder: options.placeholder || element.dataset.placeholder || 'Select an option',
      maxItems: options.maxItems || Number.parseInt(element.dataset.maxItems ?? '', 10) || null,
      onChange: options.onChange || null,
      onOpen: options.onOpen || null,
      onClose: options.onClose || null,
      labels: {
        search: 'Search...',
        searchOptions: 'Search options',
        ...(options.labels || {}),
      },
    };

    this.isOpen = false;
    this.selectedValues = [];
    // Initialize with an empty NodeList; populated after renderItems()
    this.filteredItems = document.querySelectorAll<HTMLElement>('.aiab-dropdown-item-nonexistent');
    this._abortController = new AbortController();

    this.init();
  }

  private init(): void {
    this.createDropdown();
    this.bindEvents();
    this.setInitialValue();
  }

  private createDropdown(): void {
    // Hide native select if exists
    const nativeSelect = this.element.querySelector('select') as HTMLSelectElement | null;
    if (nativeSelect) {
      nativeSelect.style.display = 'none';
      this.nativeSelect = nativeSelect;
    }

    // Create dropdown structure
    const dropdown = document.createElement('div');
    dropdown.className = 'aiab-dropdown';
    if (this.options.multiple) {
      dropdown.classList.add('aiab-dropdown--multi');
    }

    // Create select button
    const selectBtn = document.createElement('button');
    selectBtn.className = 'aiab-dropdown-select';
    selectBtn.setAttribute('type', 'button');
    selectBtn.setAttribute('aria-expanded', 'false');
    selectBtn.setAttribute('aria-haspopup', 'listbox');

    const valueSpan = document.createElement('span');
    valueSpan.className = 'aiab-dropdown-value aiab-dropdown-placeholder';
    valueSpan.textContent = this.options.placeholder;
    selectBtn.appendChild(valueSpan);

    // Create dropdown menu
    const menu = document.createElement('div');
    menu.className = 'aiab-dropdown-menu';
    menu.setAttribute('role', 'listbox');

    // Add search if enabled
    if (this.options.searchable) {
      const searchContainer = document.createElement('div');
      searchContainer.className = 'aiab-dropdown-search';

      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.className = 'aiab-dropdown-search-input';
      searchInput.placeholder = this.options.labels.search;
      searchInput.setAttribute('aria-label', this.options.labels.searchOptions);

      searchContainer.appendChild(searchInput);
      menu.appendChild(searchContainer);

      this.searchInput = searchInput;
    }

    // Add items container
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'aiab-dropdown-items';
    menu.appendChild(itemsContainer);

    dropdown.appendChild(selectBtn);
    dropdown.appendChild(menu);

    // Append to wrapper element
    this.element.appendChild(dropdown);

    this.dropdown = dropdown;
    this.selectBtn = selectBtn;
    this.valueSpan = valueSpan;
    this.menu = menu;
    this.itemsContainer = itemsContainer;

    // Parse native options after DOM structure is ready
    if (this.nativeSelect) {
      this.parseNativeOptions();
    }
  }

  private parseNativeOptions(): void {
    if (!this.nativeSelect) return;

    this.items = [];
    const optgroups = this.nativeSelect.querySelectorAll('optgroup');
    const options = this.nativeSelect.querySelectorAll('option');

    if (optgroups.length > 0) {
      optgroups.forEach((group: HTMLOptGroupElement) => {
        const groupLabel = group.label;
        const groupOptions = group.querySelectorAll('option');

        this.items.push({
          type: 'group',
          label: groupLabel,
        });

        groupOptions.forEach((option: HTMLOptionElement) => {
          this.items.push({
            type: 'option',
            value: option.value,
            text: option.textContent ?? '',
            selected: option.selected,
            disabled: option.disabled,
          });
        });
      });
    } else {
      options.forEach((option: HTMLOptionElement) => {
        if (option.value) {
          // Skip empty placeholders
          this.items.push({
            type: 'option',
            value: option.value,
            text: option.textContent ?? '',
            selected: option.selected,
            disabled: option.disabled,
          });
        }
      });
    }

    this.renderItems();
  }

  private renderItems(searchTerm = ''): void {
    this.itemsContainer.innerHTML = '';

    let currentGroup: HTMLElement | null = null;
    const itemsToRender = searchTerm
      ? this.items.filter(
          (item) =>
            item.type === 'option' &&
            (item.text ?? '').toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : this.items;

    itemsToRender.forEach((item) => {
      if (item.type === 'group') {
        currentGroup = document.createElement('div');
        currentGroup.className = 'aiab-dropdown-group';

        const label = document.createElement('div');
        label.className = 'aiab-dropdown-group-label';
        label.textContent = item.label ?? '';

        currentGroup.appendChild(label);
        this.itemsContainer.appendChild(currentGroup);
      } else {
        const button = document.createElement('button');
        button.className = 'aiab-dropdown-item';
        button.setAttribute('type', 'button');
        button.setAttribute('role', 'option');
        button.dataset.value = item.value ?? '';
        button.textContent = item.text ?? '';

        if (item.disabled) {
          button.disabled = true;
          button.classList.add('disabled');
        }

        if (this.selectedValues.includes(item.value ?? '')) {
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

    this.filteredItems = this.itemsContainer.querySelectorAll<HTMLElement>(
      '.aiab-dropdown-item:not(.aiab-disabled)',
    );
  }

  private bindEvents(): void {
    const signal = this._abortController.signal;

    // Toggle dropdown
    this.selectBtn.addEventListener('click', () => this.toggle(), { signal });

    // Handle item selection
    this.itemsContainer.addEventListener(
      'click',
      (e: Event) => {
        const target = e.target as HTMLElement;
        if (
          target.classList.contains('aiab-dropdown-item') &&
          !(target as HTMLButtonElement).disabled
        ) {
          this.selectItem(target);
        }
      },
      { signal },
    );

    // Search functionality
    if (this.searchInput) {
      this.searchInput.addEventListener(
        'input',
        (e: Event) => this.renderItems((e.target as HTMLInputElement).value),
        { signal },
      );
      this.searchInput.addEventListener('click', (e: Event) => e.stopPropagation(), { signal });
    }

    // Handle tag removal via delegation (multi-select)
    this.valueSpan.addEventListener(
      'click',
      (e: Event) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('aiab-dropdown-tag-remove')) {
          e.stopPropagation();
          const value = target.dataset.value;
          if (value === undefined) return;
          const index = this.selectedValues.indexOf(value);
          if (index > -1) {
            this.selectedValues.splice(index, 1);
            this.updateDisplay();
            this.renderItems();

            if (this.options.onChange) {
              this.options.onChange(this.selectedValues, this);
            }
          }
        }
      },
      { signal },
    );

    // Close on outside click
    document.addEventListener(
      'click',
      (e: Event) => {
        if (!this.dropdown.contains(e.target as Node) && this.isOpen) {
          this.close();
        }
      },
      { signal },
    );

    // Keyboard navigation
    this.selectBtn.addEventListener(
      'keydown',
      (e: Event) => this.handleKeydown(e as KeyboardEvent),
      { signal },
    );
    this.menu.addEventListener('keydown', (e: Event) => this.handleKeydown(e as KeyboardEvent), {
      signal,
    });

    // Handle ESC key
    document.addEventListener(
      'keydown',
      (e: Event) => {
        if ((e as KeyboardEvent).key === 'Escape' && this.isOpen) {
          this.close();
          this.selectBtn.focus();
        }
      },
      { signal },
    );
  }

  private handleKeydown(e: KeyboardEvent): void {
    const items = Array.from(this.filteredItems) as HTMLElement[];
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);

    switch (e.key) {
      case 'Enter':
      case ' ':
        if (e.target === this.selectBtn) {
          e.preventDefault();
          this.toggle();
        } else if ((e.target as HTMLElement).classList.contains('aiab-dropdown-item')) {
          e.preventDefault();
          this.selectItem(e.target as HTMLElement);
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

  private selectItem(item: HTMLElement): void {
    const value = item.dataset.value ?? '';

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
      this.filteredItems.forEach((i: HTMLElement) => {
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
      options.forEach((option: HTMLOptionElement) => {
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

  private updateDisplay(): void {
    if (this.selectedValues.length === 0) {
      this.valueSpan.className = 'aiab-dropdown-value aiab-dropdown-placeholder';
      this.valueSpan.textContent = this.options.placeholder;
    } else if (this.options.multiple) {
      this.valueSpan.className = 'aiab-dropdown-value';
      this.valueSpan.innerHTML = '';

      this.selectedValues.forEach((value: string) => {
        const item = this.items.find((i) => i.value === value);
        if (item) {
          const tag = document.createElement('span');
          tag.className = 'aiab-dropdown-tag';
          tag.innerHTML = `
            ${escapeHTML(item.text ?? '')}
            <span class="aiab-dropdown-tag-remove" data-value="${escapeHTML(value)}">×</span>
          `;
          this.valueSpan.appendChild(tag);
        }
      });
    } else {
      const item = this.items.find((i) => i.value === this.selectedValues[0]);
      this.valueSpan.className = 'aiab-dropdown-value';
      this.valueSpan.textContent = item ? (item.text ?? '') : '';
    }
  }

  private setInitialValue(): void {
    const selectedItems = this.items.filter((item) => item.selected);
    if (selectedItems.length > 0) {
      this.selectedValues = selectedItems
        .map((item) => item.value)
        .filter((v): v is string => v !== undefined);
      this.updateDisplay();
      this.renderItems();
    }
  }

  /**
   * Open the dropdown menu.
   * Sets ARIA attributes, adds the `open` class, and optionally focuses
   * the search input. Invokes the `onOpen` callback.
   * No-ops if the dropdown is already open.
   */
  public open(): void {
    if (!this.isOpen) {
      this.isOpen = true;
      this.dropdown.classList.add('open');
      this.selectBtn.setAttribute('aria-expanded', 'true');

      if (this.searchInput) {
        setTimeout(() => this.searchInput?.focus(), 100);
      }

      if (this.options.onOpen) {
        this.options.onOpen(this);
      }
    }
  }

  /**
   * Close the dropdown menu.
   * Clears the search input, resets the item list, updates ARIA attributes,
   * and invokes the `onClose` callback.
   * No-ops if the dropdown is already closed.
   */
  public close(): void {
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

  /**
   * Toggle the dropdown between open and closed states.
   */
  public toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  // --- Public API methods ---

  /**
   * Get the current selected value(s).
   * @returns A single value string in single-select mode, or an array of strings in multi-select mode.
   */
  public getValue(): string | string[] {
    return this.options.multiple ? this.selectedValues : this.selectedValues[0];
  }

  /**
   * Programmatically set the selected value(s).
   * @param value - A single value string, or an array of strings for multi-select mode.
   */
  public setValue(value: string | string[]): void {
    if (this.options.multiple && Array.isArray(value)) {
      this.selectedValues = value;
    } else {
      this.selectedValues = [value as string];
    }
    this.updateDisplay();
    this.renderItems();
  }

  /**
   * Reset the dropdown to its empty/placeholder state.
   */
  public reset(): void {
    this.selectedValues = [];
    this.updateDisplay();
    this.renderItems();
  }

  /**
   * Fully tear down the dropdown: abort all event listeners, remove the
   * custom dropdown DOM, and restore the native `<select>` visibility.
   */
  public destroy(): void {
    this._abortController.abort();
    this.dropdown.remove();
    if (this.nativeSelect) {
      this.nativeSelect.style.display = '';
    }
  }
}

// Auto-initialize dropdowns
document.addEventListener('DOMContentLoaded', () => {
  try {
    const dropdowns = document.querySelectorAll('[data-dropdown="true"]');
    dropdowns.forEach((element) => {
      new Dropdown(element as HTMLElement);
    });
  } catch (error) {
    console.error('[Amphibious] Dropdown auto-init failed:', error);
  }
});

// Add to global scope
// biome-ignore lint/suspicious/noExplicitAny: global window assignment for non-module consumers
(window as any).Dropdown = Dropdown;

export default Dropdown;
export { Dropdown as DropdownComponent };
