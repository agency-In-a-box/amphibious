/**
 * Data Table Component Tests
 * Tests for sorting, filtering, pagination, search, selection, and public API
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { DataTableComponent } from '../src/js/data-table.js';

const TABLE_HTML = `
  <div id="table-container">
    <table>
      <thead>
        <tr>
          <th data-key="name" data-type="string">Name</th>
          <th data-key="age" data-type="numeric">Age</th>
          <th data-key="city">City</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Alice</td><td>30</td><td>New York</td></tr>
        <tr><td>Bob</td><td>25</td><td>London</td></tr>
        <tr><td>Charlie</td><td>35</td><td>Paris</td></tr>
        <tr><td>Diana</td><td>28</td><td>Tokyo</td></tr>
        <tr><td>Eve</td><td>32</td><td>Berlin</td></tr>
        <tr><td>Frank</td><td>22</td><td>Madrid</td></tr>
        <tr><td>Grace</td><td>40</td><td>Rome</td></tr>
        <tr><td>Henry</td><td>27</td><td>Seoul</td></tr>
        <tr><td>Ivy</td><td>33</td><td>Sydney</td></tr>
        <tr><td>Jack</td><td>29</td><td>Dubai</td></tr>
        <tr><td>Kate</td><td>31</td><td>Toronto</td></tr>
        <tr><td>Leo</td><td>26</td><td>Mumbai</td></tr>
      </tbody>
    </table>
  </div>
`;

describe('Data Table Component', () => {
  let container: HTMLElement;
  // biome-ignore lint/suspicious/noExplicitAny: JS component instance
  let dataTable: any;

  beforeEach(() => {
    document.body.innerHTML = TABLE_HTML;
    container = document.querySelector('#table-container') as HTMLElement;
  });

  afterEach(() => {
    if (dataTable) {
      dataTable.destroy();
      dataTable = null;
    }
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
    it('should wrap table in aiab-data-table-container', () => {
      dataTable = new DataTableComponent(container);
      const wrapper = document.querySelector('.aiab-data-table-container') as HTMLElement;
      expect(wrapper).toBeTruthy();
    });

    it('should add aiab-data-table class to the table', () => {
      dataTable = new DataTableComponent(container);
      const table = document.querySelector('table') as HTMLElement;
      expect(table.classList.contains('aiab-data-table')).toBe(true);
    });

    it('should extract data from existing table rows', () => {
      dataTable = new DataTableComponent(container);
      expect(dataTable.data.length).toBe(12);
    });

    it('should extract column definitions from thead', () => {
      dataTable = new DataTableComponent(container);
      expect(dataTable.config.columns.length).toBe(3);
      expect(dataTable.config.columns[0].key).toBe('name');
      expect(dataTable.config.columns[1].key).toBe('age');
      expect(dataTable.config.columns[2].key).toBe('city');
    });

    it('should preserve column data types from data-type attribute', () => {
      dataTable = new DataTableComponent(container);
      expect(dataTable.config.columns[0].type).toBe('string');
      expect(dataTable.config.columns[1].type).toBe('numeric');
    });

    it('should create header controls section', () => {
      dataTable = new DataTableComponent(container);
      const header = document.querySelector('.aiab-data-table-header') as HTMLElement;
      expect(header).toBeTruthy();
    });

    it('should create footer controls section', () => {
      dataTable = new DataTableComponent(container);
      const footer = document.querySelector('.aiab-data-table-footer') as HTMLElement;
      expect(footer).toBeTruthy();
    });

    it('should wrap table in a responsive scrolling wrapper', () => {
      dataTable = new DataTableComponent(container);
      const wrapper = document.querySelector('.aiab-data-table-wrapper') as HTMLElement;
      expect(wrapper).toBeTruthy();
      expect(wrapper.querySelector('table')).toBeTruthy();
    });
  });

  describe('Search', () => {
    it('should create a search input when searchable is true (default)', () => {
      dataTable = new DataTableComponent(container);
      const searchInput = document.querySelector(
        '.aiab-data-table-search__input',
      ) as HTMLInputElement;
      expect(searchInput).toBeTruthy();
    });

    it('should not create a search input when searchable is false', () => {
      dataTable = new DataTableComponent(container, { searchable: false });
      const searchInput = document.querySelector(
        '.aiab-data-table-search__input',
      ) as HTMLInputElement;
      expect(searchInput).toBeNull();
    });

    it('should filter data based on search term across all columns', () => {
      dataTable = new DataTableComponent(container);
      dataTable.searchTerm = 'tokyo';
      dataTable.update();
      expect(dataTable.filteredData.length).toBe(1);
      expect(dataTable.filteredData[0].name).toBe('Diana');
    });
  });

  describe('Sorting', () => {
    it('should add sortable class to sortable column headers', () => {
      dataTable = new DataTableComponent(container);
      const headers = document.querySelectorAll('thead th');
      headers.forEach((header) => {
        expect((header as HTMLElement).classList.contains('sortable')).toBe(true);
      });
    });

    it('should sort data ascending on first click', () => {
      dataTable = new DataTableComponent(container);
      dataTable.sortBy('name');
      expect(dataTable.sortColumn).toBe('name');
      expect(dataTable.sortDirection).toBe('asc');
      expect(dataTable.filteredData[0].name).toBe('Alice');
    });

    it('should toggle sort direction on subsequent clicks', () => {
      dataTable = new DataTableComponent(container);
      dataTable.sortBy('name');
      expect(dataTable.sortDirection).toBe('asc');
      dataTable.sortBy('name');
      expect(dataTable.sortDirection).toBe('desc');
    });

    it('should reset sort direction when changing columns', () => {
      dataTable = new DataTableComponent(container);
      dataTable.sortBy('name');
      dataTable.sortBy('name'); // desc
      dataTable.sortBy('age');
      expect(dataTable.sortDirection).toBe('asc');
    });

    it('should sort numeric columns numerically', () => {
      dataTable = new DataTableComponent(container);
      dataTable.sortBy('age');
      expect(dataTable.filteredData[0].age).toBe('22');
      dataTable.sortBy('age'); // desc
      expect(dataTable.filteredData[0].age).toBe('40');
    });

    it('should add sort--asc class to active sort column header', () => {
      dataTable = new DataTableComponent(container);
      dataTable.sortBy('name');
      const headers = document.querySelectorAll('thead th');
      expect((headers[0] as HTMLElement).classList.contains('sort--asc')).toBe(true);
    });

    it('should remove sort classes from non-active column headers', () => {
      dataTable = new DataTableComponent(container);
      dataTable.sortBy('name');
      dataTable.sortBy('age');
      const headers = document.querySelectorAll('thead th');
      expect((headers[0] as HTMLElement).classList.contains('sort--asc')).toBe(false);
      expect((headers[1] as HTMLElement).classList.contains('sort--asc')).toBe(true);
    });
  });

  describe('Pagination', () => {
    it('should create pagination controls with prev/next buttons', () => {
      dataTable = new DataTableComponent(container);
      const pagination = document.querySelector('.aiab-data-table-pagination') as HTMLElement;
      expect(pagination).toBeTruthy();
      expect(dataTable.prevButton).toBeTruthy();
      expect(dataTable.nextButton).toBeTruthy();
    });

    it('should show only pageSize rows at a time', () => {
      dataTable = new DataTableComponent(container, { pageSize: 5 });
      const rows = document.querySelectorAll('tbody tr');
      expect(rows.length).toBe(5);
    });

    it('should disable previous button on first page and enable next', () => {
      dataTable = new DataTableComponent(container, { pageSize: 5 });
      expect(dataTable.prevButton.disabled).toBe(true);
      expect(dataTable.nextButton.disabled).toBe(false);
    });

    it('should navigate between pages with next/prev buttons', () => {
      dataTable = new DataTableComponent(container, { pageSize: 5 });
      dataTable.nextButton.click();
      expect(dataTable.currentPage).toBe(2);
      dataTable.prevButton.click();
      expect(dataTable.currentPage).toBe(1);
    });

    it('should not go below page 1 or beyond total pages', () => {
      dataTable = new DataTableComponent(container, { pageSize: 5 });
      dataTable.prevButton.click();
      expect(dataTable.currentPage).toBe(1);
      // Total pages = ceil(12/5) = 3
      dataTable.currentPage = 3;
      dataTable.update();
      dataTable.nextButton.click();
      expect(dataTable.currentPage).toBe(3);
    });

    it('should create page number buttons with active state', () => {
      dataTable = new DataTableComponent(container, { pageSize: 5 });
      const pageButtons = document.querySelectorAll('.aiab-data-table-pagination__pages button');
      expect(pageButtons.length).toBeGreaterThanOrEqual(1);
      const activeBtn = document.querySelector(
        '.aiab-data-table-pagination__button--active',
      ) as HTMLElement;
      expect(activeBtn).toBeTruthy();
      expect(activeBtn.textContent).toBe('1');
    });
  });

  describe('Info Display', () => {
    it('should show entry count and "No entries" for empty data', () => {
      dataTable = new DataTableComponent(container, { pageSize: 5 });
      const info = document.querySelector('.aiab-data-table-info') as HTMLElement;
      expect(info.textContent).toContain('Showing');
      expect(info.textContent).toContain('12');

      dataTable.data = [];
      dataTable.update();
      expect(info.textContent).toContain('No entries to show');
    });

    it('should show filtered indicator when search is active', () => {
      dataTable = new DataTableComponent(container);
      dataTable.searchTerm = 'alice';
      dataTable.update();
      const info = document.querySelector('.aiab-data-table-info') as HTMLElement;
      expect(info.textContent).toContain('filtered from');
    });
  });

  describe('Empty State', () => {
    it('should show empty state message when no data matches', () => {
      dataTable = new DataTableComponent(container);
      dataTable.searchTerm = 'zzzznonexistent';
      dataTable.update();
      const emptyState = document.querySelector('.aiab-data-table-empty') as HTMLElement;
      expect(emptyState).toBeTruthy();
      expect(emptyState.textContent).toContain('No data available');
    });
  });

  describe('Filters', () => {
    it('should create filter buttons when filters config is provided', () => {
      dataTable = new DataTableComponent(container, {
        filters: [
          { key: 'city', value: 'London', label: 'London' },
          { key: 'city', value: 'Paris', label: 'Paris' },
        ],
      });
      const filterButtons = document.querySelectorAll('.aiab-data-table-filter');
      expect(filterButtons.length).toBe(2);
    });

    it('should toggle active class on filter button click', () => {
      dataTable = new DataTableComponent(container, {
        filters: [{ key: 'city', value: 'London', label: 'London' }],
      });
      const filterBtn = document.querySelector('.aiab-data-table-filter') as HTMLElement;
      filterBtn.click();
      expect(filterBtn.classList.contains('aiab-data-table-filter--active')).toBe(true);
    });

    it('should deactivate filter on second click', () => {
      dataTable = new DataTableComponent(container, {
        filters: [{ key: 'city', value: 'London', label: 'London' }],
      });
      const filterBtn = document.querySelector('.aiab-data-table-filter') as HTMLElement;
      filterBtn.click();
      filterBtn.click();
      expect(filterBtn.classList.contains('aiab-data-table-filter--active')).toBe(false);
    });

    it('should apply filter to data', () => {
      dataTable = new DataTableComponent(container);
      dataTable.addFilter('city', 'London');
      expect(dataTable.filteredData.length).toBe(1);
      expect(dataTable.filteredData[0].name).toBe('Bob');
    });
  });

  describe('Selection', () => {
    it('should add checkbox column and row checkboxes when selectable is true', () => {
      dataTable = new DataTableComponent(container, { selectable: true });
      const checkAll = document.querySelector('[data-check-all]') as HTMLInputElement;
      expect(checkAll).toBeTruthy();
      const checkboxes = document.querySelectorAll('tbody .aiab-data-table__checkbox');
      expect(checkboxes.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Public API', () => {
    it('should set new data with setData()', () => {
      dataTable = new DataTableComponent(container);
      const newData = [
        { name: 'Zara', age: '21', city: 'Cairo' },
        { name: 'Yuki', age: '24', city: 'Osaka' },
      ];
      dataTable.setData(newData);
      expect(dataTable.data.length).toBe(2);
      expect(dataTable.currentPage).toBe(1);
    });

    it('should add a filter with addFilter()', () => {
      dataTable = new DataTableComponent(container);
      dataTable.addFilter('city', 'Paris');
      expect(dataTable.filters.city).toBe('Paris');
      expect(dataTable.filteredData.length).toBe(1);
    });

    it('should clear all filters and search with clearFilters()', () => {
      dataTable = new DataTableComponent(container);
      dataTable.addFilter('city', 'Paris');
      dataTable.searchTerm = 'test';
      dataTable.clearFilters();
      expect(Object.keys(dataTable.filters).length).toBe(0);
      expect(dataTable.searchTerm).toBe('');
      expect(dataTable.filteredData.length).toBe(12);
    });

    it('should return selected rows with getSelected()', () => {
      dataTable = new DataTableComponent(container, { selectable: true });
      // getSelected should return an array (even if empty)
      const selected = dataTable.getSelected();
      expect(Array.isArray(selected)).toBe(true);
    });
  });

  describe('Title', () => {
    it('should render title when config.title is provided', () => {
      dataTable = new DataTableComponent(container, { title: 'Users Table' });
      const title = document.querySelector('.aiab-data-table-header__title') as HTMLElement;
      expect(title).toBeTruthy();
      expect(title.textContent).toBe('Users Table');
    });
  });

  describe('Destroy / Cleanup', () => {
    it('should null out data references after destroy()', () => {
      dataTable = new DataTableComponent(container);
      dataTable.destroy();
      expect(dataTable.data).toBeNull();
      expect(dataTable.filteredData).toBeNull();
      expect(dataTable.config).toBeNull();
      dataTable = null;
    });

    it('should clear event listeners array after destroy()', () => {
      dataTable = new DataTableComponent(container);
      dataTable.destroy();
      expect(dataTable._eventListeners.length).toBe(0);
      dataTable = null;
    });
  });
});
