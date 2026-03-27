/**
 * Data Table Component
 * Advanced table with sorting, filtering, and pagination
 * Part of Amphibious 2.0 Component Library
 *
 * @module data-table
 */

import { sanitizeHTML } from '../utils/sanitize';

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

/** Sort direction for column headers. */
export type SortDirection = 'asc' | 'desc';

/** Column data type hint used for sort behaviour and cell styling. */
export type ColumnType = 'string' | 'numeric' | 'currency' | 'date';

/**
 * Column definition for the data table.
 *
 * @property key      - Property name used to look up the value in each row object.
 * @property label    - Human-readable header text.
 * @property sortable - Whether this column can be sorted (defaults to the table-level `sortable` flag).
 * @property type     - Data type hint (`'string'`, `'numeric'`, `'currency'`, `'date'`).
 * @property render   - Optional callback that returns an HTML string for the cell.
 *                      The returned HTML is sanitised via DOMPurify before insertion.
 */
export interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: ColumnType | string;
  render?: (value: string | undefined, rowData: DataTableRow) => string;
}

/**
 * Filter button configuration.
 *
 * @property key   - Row property to match against.
 * @property value - Value that must match for the row to pass the filter.
 * @property label - Visible button text.
 * @property count - Optional badge count displayed next to the label.
 */
export interface DataTableFilter {
  key: string;
  value: string;
  label: string;
  count?: number | string;
}

/**
 * Localisation labels for UI strings.
 */
export interface DataTableLabels {
  search: string;
  previous: string;
  next: string;
  noEntries: string;
  showing: (start: number, end: number, total: number) => string;
  showingAll: (total: number) => string;
  filtered: (total: number) => string;
}

/**
 * A single row of data.
 *
 * Indexed by column key.  Internal properties `_index` and `_element` are
 * added when data is extracted from an existing HTML table.
 */
export interface DataTableRow {
  // biome-ignore lint/suspicious/noExplicitAny: rows carry arbitrary column values
  [key: string]: any;
  _index?: number;
  _element?: HTMLTableRowElement;
}

/**
 * Options accepted by the {@link DataTableComponent} constructor.
 */
export interface DataTableOptions {
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  paginate?: boolean;
  pageSize?: number;
  selectable?: boolean;
  expandable?: boolean;
  exportable?: boolean;
  title?: string;
  searchPlaceholder?: string;
  labels?: Partial<DataTableLabels>;
  columns?: DataTableColumn[];
  filters?: DataTableFilter[];
  data?: DataTableRow[];
}

/** Resolved configuration where defaults have been applied. */
interface DataTableConfig {
  sortable: boolean;
  filterable: boolean;
  searchable: boolean;
  paginate: boolean;
  pageSize: number;
  selectable: boolean;
  expandable: boolean;
  exportable?: boolean;
  title?: string;
  searchPlaceholder?: string;
  labels: DataTableLabels;
  columns?: DataTableColumn[];
  filters?: DataTableFilter[];
  data?: DataTableRow[];
}

/** Internal bookkeeping for tracked event listeners. */
interface TrackedListener {
  element: HTMLElement & { _isPageButton?: boolean };
  type: string;
  handler: EventListener;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

class DataTableComponent {
  element: HTMLElement;
  table: HTMLTableElement;
  config: DataTableConfig | null;

  data: DataTableRow[] | null;
  filteredData: DataTableRow[] | null;
  currentPage: number;
  sortColumn: string | number | null;
  sortDirection: SortDirection | null;
  searchTerm: string;
  filters: Record<string, string>;

  searchInput?: HTMLInputElement;
  infoElement?: HTMLDivElement;
  paginationElement?: HTMLDivElement;
  pagesElement?: HTMLDivElement;
  prevButton?: HTMLButtonElement;
  nextButton?: HTMLButtonElement;

  private _eventListeners: TrackedListener[];
  private _searchTimeout: ReturnType<typeof setTimeout> | null;

  constructor(element: HTMLElement, options: DataTableOptions = {}) {
    this.element = element;
    this.table = (element.querySelector('table') as HTMLTableElement) || (element as unknown as HTMLTableElement);
    this.config = {
      sortable: true,
      filterable: true,
      searchable: true,
      paginate: true,
      pageSize: 10,
      selectable: false,
      expandable: false,
      labels: {
        search: 'Search...',
        previous: '\u2190 Previous',
        next: 'Next \u2192',
        noEntries: 'No entries to show',
        showing: (start: number, end: number, total: number) =>
          `Showing ${start} to ${end} of ${total} entries`,
        showingAll: (total: number) => `Showing ${total} entries`,
        filtered: (total: number) => `(filtered from ${total} total)`,
        ...(options.labels || {}),
      },
      ...options,
    } as DataTableConfig;

    this.data = [];
    this.filteredData = [];
    this.currentPage = 1;
    this.sortColumn = null;
    this.sortDirection = null;
    this.searchTerm = '';
    this.filters = {};
    this._eventListeners = [];
    this._searchTimeout = null;

    this.init();
  }

  /**
   * Add event listener with cleanup tracking.
   */
  private _addEventListener(
    element: HTMLElement & { _isPageButton?: boolean },
    type: string,
    handler: EventListener,
  ): void {
    element.addEventListener(type, handler);
    this._eventListeners.push({ element, type, handler });
  }

  /**
   * Remove tracked listeners for dynamically created page buttons.
   */
  private _removePageButtonListeners(): void {
    this._eventListeners = this._eventListeners.filter((entry) => {
      if (entry.element._isPageButton) {
        entry.element.removeEventListener(entry.type, entry.handler);
        return false;
      }
      return true;
    });
  }

  /**
   * Initialize the data table.
   */
  private init(): void {
    if (!this.config) return;

    // Extract data from existing table or use provided data
    if (this.config.data) {
      this.data = this.config.data;
    } else {
      this.extractDataFromTable();
    }

    // Build the complete table structure
    this.buildTableStructure();

    // Initialize features
    if (this.config.sortable) {
      this.initializeSorting();
    }

    if (this.config.searchable) {
      this.initializeSearch();
    }

    if (this.config.filterable && this.config.filters) {
      this.initializeFilters();
    }

    if (this.config.paginate) {
      this.initializePagination();
    }

    if (this.config.selectable) {
      this.initializeSelection();
    }

    // Initial render
    this.update();
  }

  /**
   * Extract data from existing HTML table.
   */
  private extractDataFromTable(): void {
    if (!this.config) return;

    const headers: DataTableColumn[] = Array.from(
      this.table.querySelectorAll('thead th'),
    ).map((th) => {
      const el = th as HTMLTableCellElement;
      return {
        key:
          el.dataset.key ||
          (el.textContent || '').trim().toLowerCase().replace(/\s+/g, '_'),
        label: (el.textContent || '').trim(),
        sortable: el.classList.contains('sortable') || this.config!.sortable,
        type: el.dataset.type || 'string',
      };
    });

    const rows = Array.from(this.table.querySelectorAll('tbody tr'));
    this.data = rows.map((row, index) => {
      const cells = Array.from(
        (row as HTMLTableRowElement).querySelectorAll('td'),
      );
      const rowData: DataTableRow = {
        _index: index,
        _element: row as HTMLTableRowElement,
      };

      cells.forEach((cell, i) => {
        if (headers[i]) {
          rowData[headers[i].key] = (cell.textContent || '').trim();
        }
      });

      return rowData;
    });

    this.config.columns = headers;
  }

  /**
   * Build the complete table structure with controls.
   */
  private buildTableStructure(): void {
    // Wrap table if needed
    if (!this.element.classList.contains('aiab-data-table-container')) {
      const container = document.createElement('div');
      container.className = 'aiab-data-table-container';
      this.table.parentNode!.insertBefore(container, this.table);
      container.appendChild(this.table);
      this.element = container;
    }

    // Add table class
    this.table.classList.add('aiab-data-table');

    // Create header controls
    this.createHeaderControls();

    // Create footer
    this.createFooterControls();

    // Wrap table for responsive scrolling
    const wrapper = document.createElement('div');
    wrapper.className = 'aiab-data-table-wrapper';
    this.table.parentNode!.insertBefore(wrapper, this.table);
    wrapper.appendChild(this.table);
  }

  /**
   * Create header controls (search, filters).
   */
  private createHeaderControls(): void {
    if (!this.config) return;

    const header = document.createElement('div');
    header.className = 'aiab-data-table-header';

    const headerTop = document.createElement('div');
    headerTop.className = 'aiab-data-table-header__top';

    // Title
    if (this.config.title) {
      const title = document.createElement('h3');
      title.className = 'aiab-data-table-header__title';
      title.textContent = this.config.title;
      headerTop.appendChild(title);
    }

    // Actions container
    const actions = document.createElement('div');
    actions.className = 'aiab-data-table-header__actions';

    // Search box
    if (this.config.searchable) {
      const searchBox = this.createSearchBox();
      actions.appendChild(searchBox);
    }

    // Export buttons
    if (this.config.exportable) {
      const exportBtn = this.createExportButton();
      actions.appendChild(exportBtn);
    }

    headerTop.appendChild(actions);
    header.appendChild(headerTop);

    // Filters
    if (this.config.filterable && this.config.filters) {
      const filters = this.createFilters();
      header.appendChild(filters);
    }

    this.element.insertBefore(header, this.element.firstChild);
  }

  /**
   * Create search box.
   */
  private createSearchBox(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'aiab-data-table-search';

    const icon = document.createElement('span');
    icon.className = 'aiab-data-table-search__icon';
    icon.innerHTML =
      '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="5"/><path d="m15 15-4.35-4.35"/></svg>';

    const input = document.createElement('input');
    input.className = 'aiab-data-table-search__input';
    input.type = 'text';
    input.placeholder =
      this.config?.searchPlaceholder || this.config?.labels.search || 'Search...';

    container.appendChild(icon);
    container.appendChild(input);

    this.searchInput = input;
    return container;
  }

  /**
   * Create filter buttons.
   */
  private createFilters(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'aiab-data-table-filters';

    this.config?.filters?.forEach((filter) => {
      const button = document.createElement('button');
      button.className = 'aiab-data-table-filter';
      button.dataset.filterKey = filter.key;
      button.dataset.filterValue = filter.value;

      const label = document.createElement('span');
      label.textContent = filter.label;
      button.appendChild(label);

      if (filter.count !== undefined) {
        const badge = document.createElement('span');
        badge.className = 'aiab-data-table-filter__badge';
        badge.textContent = String(filter.count);
        button.appendChild(badge);
      }

      container.appendChild(button);
    });

    return container;
  }

  /**
   * Create export button.
   * Called when `config.exportable` is true.
   */
  private createExportButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'aiab-data-table-export';
    button.textContent = 'Export';
    this._addEventListener(button, 'click', () => {
      this.exportData('csv');
    });
    return button;
  }

  /**
   * Create footer controls (pagination, info).
   */
  private createFooterControls(): void {
    const footer = document.createElement('div');
    footer.className = 'aiab-data-table-footer';

    // Info
    const info = document.createElement('div') as HTMLDivElement;
    info.className = 'aiab-data-table-info';
    footer.appendChild(info);
    this.infoElement = info;

    // Pagination
    if (this.config?.paginate) {
      const pagination = this.createPagination();
      footer.appendChild(pagination);
      this.paginationElement = pagination;
    }

    this.element.appendChild(footer);
  }

  /**
   * Create pagination controls.
   */
  private createPagination(): HTMLDivElement {
    const container = document.createElement('div') as HTMLDivElement;
    container.className = 'aiab-data-table-pagination';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'aiab-data-table-pagination__button';
    prevBtn.innerHTML = this.config?.labels.previous || '\u2190 Previous';
    container.appendChild(prevBtn);
    this.prevButton = prevBtn;

    // Page numbers
    const pages = document.createElement('div') as HTMLDivElement;
    pages.className = 'aiab-data-table-pagination__pages';
    container.appendChild(pages);
    this.pagesElement = pages;

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'aiab-data-table-pagination__button';
    nextBtn.innerHTML = this.config?.labels.next || 'Next \u2192';
    container.appendChild(nextBtn);
    this.nextButton = nextBtn;

    return container;
  }

  /**
   * Initialize sorting functionality.
   */
  private initializeSorting(): void {
    const headers = this.table.querySelectorAll('thead th');

    headers.forEach((header, index) => {
      const column = this.config?.columns?.[index];
      if (column?.sortable !== false) {
        header.classList.add('sortable', 'sortable--both');
        this._addEventListener(header as HTMLElement, 'click', () => {
          this.sortBy(column?.key || index);
        });
      }
    });
  }

  /**
   * Initialize search functionality.
   */
  private initializeSearch(): void {
    if (this.searchInput) {
      this._addEventListener(this.searchInput, 'input', (e: Event) => {
        if (this._searchTimeout) {
          clearTimeout(this._searchTimeout);
        }
        this._searchTimeout = setTimeout(() => {
          this.searchTerm = (
            (e.target as HTMLInputElement).value || ''
          ).toLowerCase();
          this.currentPage = 1;
          this.update();
        }, 300);
      });
    }
  }

  /**
   * Initialize filter functionality.
   */
  private initializeFilters(): void {
    const filterButtons = this.element.querySelectorAll(
      '.aiab-data-table-filter',
    );

    filterButtons.forEach((button) => {
      this._addEventListener(button as HTMLElement, 'click', () => {
        const btn = button as HTMLElement;
        const key = btn.dataset.filterKey;
        const value = btn.dataset.filterValue;

        if (!key || !value) return;

        if (btn.classList.contains('aiab-data-table-filter--active')) {
          btn.classList.remove('aiab-data-table-filter--active');
          delete this.filters[key];
        } else {
          // Remove active from other filters in same group
          filterButtons.forEach((otherBtn) => {
            if ((otherBtn as HTMLElement).dataset.filterKey === key) {
              otherBtn.classList.remove('aiab-data-table-filter--active');
            }
          });
          btn.classList.add('aiab-data-table-filter--active');
          this.filters[key] = value;
        }

        this.currentPage = 1;
        this.update();
      });
    });
  }

  /**
   * Initialize pagination.
   */
  private initializePagination(): void {
    if (this.prevButton) {
      this._addEventListener(this.prevButton, 'click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.update();
        }
      });
    }

    if (this.nextButton) {
      this._addEventListener(this.nextButton, 'click', () => {
        const totalPages = Math.ceil(
          (this.filteredData?.length || 0) / (this.config?.pageSize || 10),
        );
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.update();
        }
      });
    }
  }

  /**
   * Initialize row selection.
   */
  private initializeSelection(): void {
    // Add checkbox column header
    const thead = this.table.querySelector('thead tr');
    if (!thead) return;

    const checkAllTh = document.createElement('th');
    checkAllTh.innerHTML =
      '<input type="checkbox" class="aiab-data-table__checkbox" data-check-all>';
    thead.insertBefore(checkAllTh, thead.firstChild);

    // Add checkbox to each row
    const tbody = this.table.querySelector('tbody');
    if (tbody) {
      tbody.querySelectorAll('tr').forEach((row) => {
        const checkTd = document.createElement('td');
        checkTd.innerHTML =
          '<input type="checkbox" class="aiab-data-table__checkbox">';
        row.insertBefore(checkTd, row.firstChild);
      });
    }

    // Handle check all
    const checkAll = this.table.querySelector(
      '[data-check-all]',
    ) as HTMLInputElement | null;
    if (checkAll) {
      this._addEventListener(checkAll, 'change', (e: Event) => {
        const checkboxes = this.table.querySelectorAll(
          'tbody .aiab-data-table__checkbox',
        ) as NodeListOf<HTMLInputElement>;
        checkboxes.forEach((cb) => {
          cb.checked = (e.target as HTMLInputElement).checked;
        });
      });
    }
  }

  /**
   * Sort data by column.
   */
  sortBy(column: string | number): void {
    // Toggle sort direction
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    // Update header classes
    this.table.querySelectorAll('thead th').forEach((th) => {
      th.classList.remove('sort--asc', 'sort--desc');
    });

    const columnIndex =
      this.config?.columns?.findIndex((c) => c.key === column) ?? column;
    const header = this.table.querySelectorAll('thead th')[
      columnIndex as number
    ];
    if (header) {
      header.classList.add(`sort--${this.sortDirection}`);
    }

    this.update();
  }

  /**
   * Filter and sort data.
   */
  private filterAndSortData(): void {
    let data = [...(this.data || [])];

    // Apply search filter
    if (this.searchTerm) {
      data = data.filter((row) => {
        return Object.values(row).some((value) =>
          String(value).toLowerCase().includes(this.searchTerm),
        );
      });
    }

    // Apply custom filters
    Object.entries(this.filters).forEach(([key, value]) => {
      data = data.filter((row) => row[key] === value);
    });

    // Apply sorting
    if (this.sortColumn !== null) {
      const sortCol = this.sortColumn;
      const sortDir = this.sortDirection;
      data.sort((a, b) => {
        const aVal = a[sortCol];
        const bVal = b[sortCol];

        // Handle numeric sorting
        const aNum = Number.parseFloat(aVal);
        const bNum = Number.parseFloat(bVal);
        if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
          return sortDir === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // String sorting
        const comparison = String(aVal).localeCompare(String(bVal));
        return sortDir === 'asc' ? comparison : -comparison;
      });
    }

    this.filteredData = data;
  }

  /**
   * Update table display.
   */
  update(): void {
    if (!this.config) return;

    this.filterAndSortData();

    // Calculate pagination
    const totalPages = Math.ceil(
      (this.filteredData?.length || 0) / this.config.pageSize,
    );
    const startIndex = (this.currentPage - 1) * this.config.pageSize;
    const endIndex = startIndex + this.config.pageSize;
    const pageData = this.config.paginate
      ? (this.filteredData || []).slice(startIndex, endIndex)
      : (this.filteredData || []);

    // Render table rows
    this.renderRows(pageData);

    // Update pagination
    if (this.config.paginate) {
      this.updatePagination(totalPages);
    }

    // Update info
    this.updateInfo(startIndex, endIndex);
  }

  /**
   * Render table rows.
   */
  private renderRows(data: DataTableRow[]): void {
    const tbody = this.table.querySelector('tbody');
    if (!tbody) return;

    // Clear existing rows
    tbody.innerHTML = '';

    if (data.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = this.config?.columns?.length || 1;
      cell.className = 'aiab-data-table-empty';
      cell.innerHTML = `
        <div class="aiab-data-table-empty__icon">\uD83D\uDCCA</div>
        <div class="aiab-data-table-empty__title">No data available</div>
        <div class="aiab-data-table-empty__message">Try adjusting your filters or search term</div>
      `;
      row.appendChild(cell);
      tbody.appendChild(row);
      return;
    }

    // Render data rows
    data.forEach((rowData) => {
      const row = document.createElement('tr');

      // Add checkbox if selectable
      if (this.config?.selectable) {
        const checkTd = document.createElement('td');
        checkTd.innerHTML =
          '<input type="checkbox" class="aiab-data-table__checkbox">';
        row.appendChild(checkTd);
      }

      // Add data cells
      this.config?.columns?.forEach((column) => {
        const cell = document.createElement('td');
        const value = rowData[column.key];

        // Apply cell formatting
        // column.render: (value, rowData) => HTML -- sanitized via DOMPurify
        if (column.render) {
          cell.innerHTML = sanitizeHTML(column.render(value, rowData));
        } else {
          cell.textContent = value;
        }

        // Apply cell classes
        if (column.type === 'numeric' || column.type === 'currency') {
          cell.classList.add('aiab-data-table__cell--numeric');
        }

        row.appendChild(cell);
      });

      tbody.appendChild(row);
    });
  }

  /**
   * Update pagination controls.
   */
  private updatePagination(totalPages: number): void {
    // Update buttons
    if (this.prevButton) {
      this.prevButton.disabled = this.currentPage === 1;
    }

    if (this.nextButton) {
      this.nextButton.disabled = this.currentPage === totalPages;
    }

    // Update page numbers
    if (this.pagesElement) {
      // Remove tracked listeners for old page buttons before clearing
      this._removePageButtonListeners();
      this.pagesElement.innerHTML = '';

      // Calculate page range
      const maxButtons = 5;
      let startPage = Math.max(
        1,
        this.currentPage - Math.floor(maxButtons / 2),
      );
      const endPage = Math.min(totalPages, startPage + maxButtons - 1);

      if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
      }

      // Create page buttons
      for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement('button') as HTMLButtonElement & {
          _isPageButton?: boolean;
        };
        button.className = 'aiab-data-table-pagination__button';
        button.textContent = String(i);

        if (i === this.currentPage) {
          button.classList.add('aiab-data-table-pagination__button--active');
        }

        this._addEventListener(button, 'click', () => {
          this.currentPage = i;
          this.update();
        });
        button._isPageButton = true;

        this.pagesElement.appendChild(button);
      }
    }
  }

  /**
   * Update info display.
   */
  private updateInfo(startIndex: number, endIndex: number): void {
    if (!this.infoElement || !this.config) return;

    const total = this.filteredData?.length || 0;
    const _showing = Math.min(endIndex, total) - startIndex;

    if (total === 0) {
      this.infoElement.textContent = this.config.labels.noEntries;
    } else if (this.config.paginate) {
      this.infoElement.textContent = this.config.labels.showing(
        startIndex + 1,
        Math.min(endIndex, total),
        total,
      );
    } else {
      this.infoElement.textContent = this.config.labels.showingAll(total);
    }

    // Add filtered indicator
    if (this.searchTerm || Object.keys(this.filters).length > 0) {
      this.infoElement.textContent += ` ${this.config.labels.filtered(this.data?.length || 0)}`;
    }
  }

  // -------------------------------------------------------------------------
  // Public API Methods
  // -------------------------------------------------------------------------

  /**
   * Set new data.
   */
  setData(data: DataTableRow[]): void {
    this.data = data;
    this.currentPage = 1;
    this.update();
  }

  /**
   * Add filter.
   */
  addFilter(key: string, value: string): void {
    this.filters[key] = value;
    this.currentPage = 1;
    this.update();
  }

  /**
   * Clear filters.
   */
  clearFilters(): void {
    this.filters = {};
    this.searchTerm = '';
    if (this.searchInput) {
      this.searchInput.value = '';
    }
    this.currentPage = 1;
    this.update();
  }

  /**
   * Get selected rows.
   */
  getSelected(): DataTableRow[] {
    const checkboxes = this.table.querySelectorAll(
      'tbody .aiab-data-table__checkbox:checked',
    );
    const indices = Array.from(checkboxes).map((cb) => {
      const row = (cb as HTMLElement).closest('tr');
      if (!row || !row.parentNode) return -1;
      return Array.from(row.parentNode.children).indexOf(row);
    });

    return indices
      .map((i) => (this.filteredData || [])[i])
      .filter(Boolean) as DataTableRow[];
  }

  /**
   * Export data.
   */
  exportData(format: string = 'csv'): void {
    if (!this.config?.columns) return;

    const data =
      (this.filteredData?.length || 0) > 0 ? this.filteredData! : this.data || [];

    if (format === 'csv') {
      const headers = this.config.columns.map((c) => c.label).join(',');
      const rows = data.map((row) =>
        this.config!.columns!.map((c) => `"${row[c.key] || ''}"`).join(','),
      );
      const csv = [headers, ...rows].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `data-export-${Date.now()}.csv`;
      link.click();
    }
  }

  /**
   * Clean up and destroy the component.
   */
  destroy(): void {
    // Clear search debounce timeout
    if (this._searchTimeout) {
      clearTimeout(this._searchTimeout);
      this._searchTimeout = null;
    }

    // Remove all tracked event listeners
    this._eventListeners.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    this._eventListeners = [];

    // Clear data references
    this.data = null;
    this.filteredData = null;
    this.config = null;
  }
}

// ---------------------------------------------------------------------------
// Window global
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    DataTable: typeof DataTableComponent;
  }
}

if (typeof window !== 'undefined') {
  window.DataTable = DataTableComponent;
}

// ---------------------------------------------------------------------------
// Auto-init
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  try {
    document.querySelectorAll('[data-table]').forEach((element) => {
      const el = element as HTMLElement;
      const options: DataTableOptions = el.dataset.table
        ? JSON.parse(el.dataset.table)
        : {};
      new DataTableComponent(el, options);
    });
  } catch (error) {
    console.error('[Amphibious] DataTable auto-init failed:', error);
  }
});

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default DataTableComponent;
export { DataTableComponent };
