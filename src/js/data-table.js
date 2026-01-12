/**
 * Data Table Component
 * Advanced table with sorting, filtering, and pagination
 * Part of Amphibious 2.0 Component Library
 */

class DataTableComponent {
  constructor(element, options = {}) {
    this.element = element;
    this.table = element.querySelector('table') || element;
    this.config = {
      sortable: true,
      filterable: true,
      searchable: true,
      paginate: true,
      pageSize: 10,
      selectable: false,
      expandable: false,
      ...options
    };

    this.data = [];
    this.filteredData = [];
    this.currentPage = 1;
    this.sortColumn = null;
    this.sortDirection = null;
    this.searchTerm = '';
    this.filters = {};

    this.init();
  }

  /**
   * Initialize the data table
   */
  init() {
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
   * Extract data from existing HTML table
   */
  extractDataFromTable() {
    const headers = Array.from(this.table.querySelectorAll('thead th')).map(th => ({
      key: th.dataset.key || th.textContent.trim().toLowerCase().replace(/\s+/g, '_'),
      label: th.textContent.trim(),
      sortable: th.classList.contains('sortable') || this.config.sortable,
      type: th.dataset.type || 'string'
    }));

    const rows = Array.from(this.table.querySelectorAll('tbody tr'));
    this.data = rows.map((row, index) => {
      const cells = Array.from(row.querySelectorAll('td'));
      const rowData = { _index: index, _element: row };

      cells.forEach((cell, i) => {
        if (headers[i]) {
          rowData[headers[i].key] = cell.textContent.trim();
        }
      });

      return rowData;
    });

    this.config.columns = headers;
  }

  /**
   * Build the complete table structure with controls
   */
  buildTableStructure() {
    // Wrap table if needed
    if (!this.element.classList.contains('data-table-container')) {
      const container = document.createElement('div');
      container.className = 'data-table-container';
      this.table.parentNode.insertBefore(container, this.table);
      container.appendChild(this.table);
      this.element = container;
    }

    // Add table class
    this.table.classList.add('data-table');

    // Create header controls
    this.createHeaderControls();

    // Create footer
    this.createFooterControls();

    // Wrap table for responsive scrolling
    const wrapper = document.createElement('div');
    wrapper.className = 'data-table-wrapper';
    this.table.parentNode.insertBefore(wrapper, this.table);
    wrapper.appendChild(this.table);
  }

  /**
   * Create header controls (search, filters)
   */
  createHeaderControls() {
    const header = document.createElement('div');
    header.className = 'data-table-header';

    const headerTop = document.createElement('div');
    headerTop.className = 'data-table-header__top';

    // Title
    if (this.config.title) {
      const title = document.createElement('h3');
      title.className = 'data-table-header__title';
      title.textContent = this.config.title;
      headerTop.appendChild(title);
    }

    // Actions container
    const actions = document.createElement('div');
    actions.className = 'data-table-header__actions';

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
   * Create search box
   */
  createSearchBox() {
    const container = document.createElement('div');
    container.className = 'data-table-search';

    const icon = document.createElement('span');
    icon.className = 'data-table-search__icon';
    icon.innerHTML = '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="5"/><path d="m15 15-4.35-4.35"/></svg>';

    const input = document.createElement('input');
    input.className = 'data-table-search__input';
    input.type = 'text';
    input.placeholder = this.config.searchPlaceholder || 'Search...';

    container.appendChild(icon);
    container.appendChild(input);

    this.searchInput = input;
    return container;
  }

  /**
   * Create filter buttons
   */
  createFilters() {
    const container = document.createElement('div');
    container.className = 'data-table-filters';

    this.config.filters.forEach(filter => {
      const button = document.createElement('button');
      button.className = 'data-table-filter';
      button.dataset.filterKey = filter.key;
      button.dataset.filterValue = filter.value;

      const label = document.createElement('span');
      label.textContent = filter.label;
      button.appendChild(label);

      if (filter.count !== undefined) {
        const badge = document.createElement('span');
        badge.className = 'data-table-filter__badge';
        badge.textContent = filter.count;
        button.appendChild(badge);
      }

      container.appendChild(button);
    });

    return container;
  }

  /**
   * Create footer controls (pagination, info)
   */
  createFooterControls() {
    const footer = document.createElement('div');
    footer.className = 'data-table-footer';

    // Info
    const info = document.createElement('div');
    info.className = 'data-table-info';
    footer.appendChild(info);
    this.infoElement = info;

    // Pagination
    if (this.config.paginate) {
      const pagination = this.createPagination();
      footer.appendChild(pagination);
      this.paginationElement = pagination;
    }

    this.element.appendChild(footer);
  }

  /**
   * Create pagination controls
   */
  createPagination() {
    const container = document.createElement('div');
    container.className = 'data-table-pagination';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'data-table-pagination__button';
    prevBtn.innerHTML = '← Previous';
    container.appendChild(prevBtn);
    this.prevButton = prevBtn;

    // Page numbers
    const pages = document.createElement('div');
    pages.className = 'data-table-pagination__pages';
    container.appendChild(pages);
    this.pagesElement = pages;

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'data-table-pagination__button';
    nextBtn.innerHTML = 'Next →';
    container.appendChild(nextBtn);
    this.nextButton = nextBtn;

    return container;
  }

  /**
   * Initialize sorting functionality
   */
  initializeSorting() {
    const headers = this.table.querySelectorAll('thead th');

    headers.forEach((header, index) => {
      const column = this.config.columns?.[index];
      if (column?.sortable !== false) {
        header.classList.add('sortable', 'sortable--both');
        header.addEventListener('click', () => {
          this.sortBy(column?.key || index);
        });
      }
    });
  }

  /**
   * Initialize search functionality
   */
  initializeSearch() {
    if (this.searchInput) {
      let searchTimeout;
      this.searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.searchTerm = e.target.value.toLowerCase();
          this.currentPage = 1;
          this.update();
        }, 300);
      });
    }
  }

  /**
   * Initialize filter functionality
   */
  initializeFilters() {
    const filterButtons = this.element.querySelectorAll('.data-table-filter');

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const key = button.dataset.filterKey;
        const value = button.dataset.filterValue;

        if (button.classList.contains('data-table-filter--active')) {
          button.classList.remove('data-table-filter--active');
          delete this.filters[key];
        } else {
          // Remove active from other filters in same group
          filterButtons.forEach(btn => {
            if (btn.dataset.filterKey === key) {
              btn.classList.remove('data-table-filter--active');
            }
          });
          button.classList.add('data-table-filter--active');
          this.filters[key] = value;
        }

        this.currentPage = 1;
        this.update();
      });
    });
  }

  /**
   * Initialize pagination
   */
  initializePagination() {
    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.update();
        }
      });
    }

    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => {
        const totalPages = Math.ceil(this.filteredData.length / this.config.pageSize);
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.update();
        }
      });
    }
  }

  /**
   * Initialize row selection
   */
  initializeSelection() {
    // Add checkbox column header
    const thead = this.table.querySelector('thead tr');
    const checkAllTh = document.createElement('th');
    checkAllTh.innerHTML = '<input type="checkbox" class="data-table__checkbox" data-check-all>';
    thead.insertBefore(checkAllTh, thead.firstChild);

    // Add checkbox to each row
    const tbody = this.table.querySelector('tbody');
    tbody.querySelectorAll('tr').forEach(row => {
      const checkTd = document.createElement('td');
      checkTd.innerHTML = '<input type="checkbox" class="data-table__checkbox">';
      row.insertBefore(checkTd, row.firstChild);
    });

    // Handle check all
    const checkAll = this.table.querySelector('[data-check-all]');
    checkAll?.addEventListener('change', (e) => {
      const checkboxes = this.table.querySelectorAll('tbody .data-table__checkbox');
      checkboxes.forEach(cb => cb.checked = e.target.checked);
    });
  }

  /**
   * Sort data by column
   */
  sortBy(column) {
    // Toggle sort direction
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    // Update header classes
    this.table.querySelectorAll('thead th').forEach(th => {
      th.classList.remove('sort--asc', 'sort--desc');
    });

    const columnIndex = this.config.columns?.findIndex(c => c.key === column) ?? column;
    const header = this.table.querySelectorAll('thead th')[columnIndex];
    if (header) {
      header.classList.add(`sort--${this.sortDirection}`);
    }

    this.update();
  }

  /**
   * Filter and sort data
   */
  filterAndSortData() {
    let data = [...this.data];

    // Apply search filter
    if (this.searchTerm) {
      data = data.filter(row => {
        return Object.values(row).some(value =>
          String(value).toLowerCase().includes(this.searchTerm)
        );
      });
    }

    // Apply custom filters
    Object.entries(this.filters).forEach(([key, value]) => {
      data = data.filter(row => row[key] === value);
    });

    // Apply sorting
    if (this.sortColumn !== null) {
      data.sort((a, b) => {
        const aVal = a[this.sortColumn];
        const bVal = b[this.sortColumn];

        // Handle numeric sorting
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return this.sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // String sorting
        const comparison = String(aVal).localeCompare(String(bVal));
        return this.sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    this.filteredData = data;
  }

  /**
   * Update table display
   */
  update() {
    this.filterAndSortData();

    // Calculate pagination
    const totalPages = Math.ceil(this.filteredData.length / this.config.pageSize);
    const startIndex = (this.currentPage - 1) * this.config.pageSize;
    const endIndex = startIndex + this.config.pageSize;
    const pageData = this.config.paginate
      ? this.filteredData.slice(startIndex, endIndex)
      : this.filteredData;

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
   * Render table rows
   */
  renderRows(data) {
    const tbody = this.table.querySelector('tbody');
    if (!tbody) return;

    // Clear existing rows
    tbody.innerHTML = '';

    if (data.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = this.config.columns?.length || 1;
      cell.className = 'data-table-empty';
      cell.innerHTML = `
        <div class="data-table-empty__icon">📊</div>
        <div class="data-table-empty__title">No data available</div>
        <div class="data-table-empty__message">Try adjusting your filters or search term</div>
      `;
      row.appendChild(cell);
      tbody.appendChild(row);
      return;
    }

    // Render data rows
    data.forEach(rowData => {
      const row = document.createElement('tr');

      // Add checkbox if selectable
      if (this.config.selectable) {
        const checkTd = document.createElement('td');
        checkTd.innerHTML = '<input type="checkbox" class="data-table__checkbox">';
        row.appendChild(checkTd);
      }

      // Add data cells
      this.config.columns?.forEach(column => {
        const cell = document.createElement('td');
        const value = rowData[column.key];

        // Apply cell formatting
        if (column.render) {
          cell.innerHTML = column.render(value, rowData);
        } else {
          cell.textContent = value;
        }

        // Apply cell classes
        if (column.type === 'numeric' || column.type === 'currency') {
          cell.classList.add('data-table__cell--numeric');
        }

        row.appendChild(cell);
      });

      tbody.appendChild(row);
    });
  }

  /**
   * Update pagination controls
   */
  updatePagination(totalPages) {
    // Update buttons
    if (this.prevButton) {
      this.prevButton.disabled = this.currentPage === 1;
    }

    if (this.nextButton) {
      this.nextButton.disabled = this.currentPage === totalPages;
    }

    // Update page numbers
    if (this.pagesElement) {
      this.pagesElement.innerHTML = '';

      // Calculate page range
      const maxButtons = 5;
      let startPage = Math.max(1, this.currentPage - Math.floor(maxButtons / 2));
      let endPage = Math.min(totalPages, startPage + maxButtons - 1);

      if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
      }

      // Create page buttons
      for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement('button');
        button.className = 'data-table-pagination__button';
        button.textContent = i;

        if (i === this.currentPage) {
          button.classList.add('data-table-pagination__button--active');
        }

        button.addEventListener('click', () => {
          this.currentPage = i;
          this.update();
        });

        this.pagesElement.appendChild(button);
      }
    }
  }

  /**
   * Update info display
   */
  updateInfo(startIndex, endIndex) {
    if (this.infoElement) {
      const total = this.filteredData.length;
      const showing = Math.min(endIndex, total) - startIndex;

      if (total === 0) {
        this.infoElement.textContent = 'No entries to show';
      } else if (this.config.paginate) {
        this.infoElement.textContent = `Showing ${startIndex + 1} to ${Math.min(endIndex, total)} of ${total} entries`;
      } else {
        this.infoElement.textContent = `Showing ${total} entries`;
      }

      // Add filtered indicator
      if (this.searchTerm || Object.keys(this.filters).length > 0) {
        this.infoElement.textContent += ` (filtered from ${this.data.length} total)`;
      }
    }
  }

  /**
   * Public API Methods
   */

  /**
   * Set new data
   */
  setData(data) {
    this.data = data;
    this.currentPage = 1;
    this.update();
  }

  /**
   * Add filter
   */
  addFilter(key, value) {
    this.filters[key] = value;
    this.currentPage = 1;
    this.update();
  }

  /**
   * Clear filters
   */
  clearFilters() {
    this.filters = {};
    this.searchTerm = '';
    if (this.searchInput) {
      this.searchInput.value = '';
    }
    this.currentPage = 1;
    this.update();
  }

  /**
   * Get selected rows
   */
  getSelected() {
    const checkboxes = this.table.querySelectorAll('tbody .data-table__checkbox:checked');
    const indices = Array.from(checkboxes).map(cb => {
      const row = cb.closest('tr');
      return Array.from(row.parentNode.children).indexOf(row);
    });

    return indices.map(i => this.filteredData[i]).filter(Boolean);
  }

  /**
   * Export data
   */
  exportData(format = 'csv') {
    const data = this.filteredData.length > 0 ? this.filteredData : this.data;

    if (format === 'csv') {
      const headers = this.config.columns.map(c => c.label).join(',');
      const rows = data.map(row =>
        this.config.columns.map(c => `"${row[c.key] || ''}"`).join(',')
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
}

// Auto-initialize tables with data-table attribute
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-table]').forEach(element => {
    const options = element.dataset.table ? JSON.parse(element.dataset.table) : {};
    new DataTableComponent(element, options);
  });
});

// Export for module usage
export default DataTableComponent;
export { DataTableComponent };