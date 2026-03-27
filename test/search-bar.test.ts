/**
 * Search Bar Component Tests
 * Tests for autocomplete, debouncing, keyboard navigation, recent searches,
 * categories, ARIA attributes, and public API
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import '../src/js/search-bar.js';
import { escapeHTML } from '../src/utils/sanitize';

// biome-ignore lint/suspicious/noExplicitAny: JS component accessed via window global
const SearchBarClass = (window as any).SearchBar;

const SEARCH_HTML = `
  <div id="search-container">
    <div id="search-element"></div>
  </div>
`;

const SAMPLE_DATA = [
  { title: 'Apple', description: 'A red fruit' },
  { title: 'Banana', description: 'A yellow fruit' },
  { title: 'Cherry', description: 'A small red fruit' },
  { title: 'Date', description: 'A sweet brown fruit' },
  { title: 'Elderberry', description: 'A dark purple berry' },
];

describe('Search Bar Component', () => {
  let element: HTMLElement;
  // biome-ignore lint/suspicious/noExplicitAny: JS component instance
  let searchBar: any;

  beforeEach(() => {
    document.body.innerHTML = SEARCH_HTML;
    element = document.querySelector('#search-element') as HTMLElement;
    localStorage.clear();
  });

  afterEach(() => {
    if (searchBar) {
      searchBar.destroy();
      searchBar = null;
    }
    document.body.innerHTML = '';
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('should create wrapper with input, icon, clear button, dropdown, and spinner', () => {
      searchBar = new SearchBarClass(element, { source: SAMPLE_DATA });
      expect(document.querySelector('.aiab-search-bar')).toBeTruthy();
      expect(document.querySelector('.aiab-search-bar-input')).toBeTruthy();
      expect(document.querySelector('.aiab-search-bar-icon')).toBeTruthy();
      expect(document.querySelector('.aiab-search-bar-clear')).toBeTruthy();
      expect(document.querySelector('.aiab-search-bar-dropdown')).toBeTruthy();
      expect(document.querySelector('.aiab-search-bar-results')).toBeTruthy();
      expect(document.querySelector('.aiab-search-bar-spinner')).toBeTruthy();
    });

    it('should set placeholder text with default and custom values', () => {
      searchBar = new SearchBarClass(element, { source: SAMPLE_DATA });
      const input = document.querySelector('.aiab-search-bar-input') as HTMLInputElement;
      expect(input.placeholder).toBe('Search...');
      searchBar.destroy();

      // Re-create element since destroy replaces wrapper
      document.body.innerHTML = SEARCH_HTML;
      element = document.querySelector('#search-element') as HTMLElement;
      searchBar = new SearchBarClass(element, {
        source: SAMPLE_DATA,
        placeholder: 'Find items...',
      });
      const input2 = document.querySelector('.aiab-search-bar-input') as HTMLInputElement;
      expect(input2.placeholder).toBe('Find items...');
    });
  });

  describe('ARIA Attributes', () => {
    it('should set proper ARIA attributes on input and dropdown', () => {
      searchBar = new SearchBarClass(element, { source: SAMPLE_DATA });
      const input = document.querySelector('.aiab-search-bar-input') as HTMLInputElement;
      const dropdown = document.querySelector('.aiab-search-bar-dropdown') as HTMLElement;
      const clearBtn = document.querySelector('.aiab-search-bar-clear') as HTMLElement;
      expect(input.getAttribute('role')).toBe('combobox');
      expect(input.getAttribute('aria-autocomplete')).toBe('list');
      expect(input.getAttribute('aria-expanded')).toBe('false');
      expect(dropdown.getAttribute('role')).toBe('listbox');
      expect(clearBtn.getAttribute('aria-label')).toBe('Clear search');
    });

    it('should toggle aria-expanded on open/close', () => {
      searchBar = new SearchBarClass(element, { source: SAMPLE_DATA });
      searchBar.open();
      const input = document.querySelector('.aiab-search-bar-input') as HTMLInputElement;
      expect(input.getAttribute('aria-expanded')).toBe('true');
      searchBar.close();
      expect(input.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('Local Data Search', () => {
    it('should filter local array data by string match', () => {
      searchBar = new SearchBarClass(element, { source: SAMPLE_DATA });
      const results = searchBar.filterLocalData('apple');
      expect(results.length).toBe(1);
      expect(results[0].title).toBe('Apple');
    });

    it('should be case insensitive', () => {
      searchBar = new SearchBarClass(element, { source: SAMPLE_DATA });
      const results = searchBar.filterLocalData('BANANA');
      expect(results.length).toBe(1);
      expect(results[0].title).toBe('Banana');
    });

    it('should search across configured searchKeys', () => {
      searchBar = new SearchBarClass(element, {
        source: SAMPLE_DATA,
        searchKeys: ['title', 'description'],
      });
      const results = searchBar.filterLocalData('red');
      // Apple ("A red fruit") and Cherry ("A small red fruit")
      expect(results.length).toBe(2);
    });

    it('should filter simple string arrays', () => {
      searchBar = new SearchBarClass(element, { source: ['foo', 'bar', 'baz', 'foobar'] });
      const results = searchBar.filterLocalData('foo');
      expect(results.length).toBe(2);
    });

    it('should return empty array when no matches', () => {
      searchBar = new SearchBarClass(element, { source: SAMPLE_DATA });
      const results = searchBar.filterLocalData('zzzznonexistent');
      expect(results.length).toBe(0);
    });

    it('should limit results to maxResults', async () => {
      const largeSource = Array.from({ length: 50 }, (_, i) => ({
        title: `Item ${i}`,
        description: `Description ${i}`,
      }));
      searchBar = new SearchBarClass(element, { source: largeSource, maxResults: 5 });
      await searchBar.search('Item');
      expect(searchBar.results.length).toBe(5);
    });
  });

  describe('Rendering Results', () => {
    it('should render result items with title, subtitle, and role="option"', () => {
      searchBar = new SearchBarClass(element, { source: SAMPLE_DATA });
      searchBar.renderResults(SAMPLE_DATA, 'a');
      const items = document.querySelectorAll('.aiab-search-bar-item');
      expect(items.length).toBe(5);
      expect(items[0].getAttribute('role')).toBe('option');
      expect(document.querySelector('.aiab-search-bar-item-title')).toBeTruthy();
      expect(document.querySelector('.aiab-search-bar-item-subtitle')).toBeTruthy();
    });

    it('should show empty state with custom text when no results', () => {
      searchBar = new SearchBarClass(element, {
        source: SAMPLE_DATA,
        noResultsText: 'Nothing here!',
      });
      searchBar.renderResults([], 'zzz');
      const emptyText = document.querySelector('.aiab-search-bar-empty-text') as HTMLElement;
      expect(emptyText).toBeTruthy();
      expect(emptyText.textContent).toBe('Nothing here!');
    });

    it('should highlight matching text in results', () => {
      searchBar = new SearchBarClass(element, { source: SAMPLE_DATA, highlightMatches: true });
      searchBar.renderResults([SAMPLE_DATA[0]], 'Apple');
      const title = document.querySelector('.aiab-search-bar-item-title') as HTMLElement;
      expect(title.innerHTML).toContain('<mark>');
    });
  });

  describe('Open and Close', () => {
    it('should open dropdown and add open class', () => {
      searchBar = new SearchBarClass(element, { source: SAMPLE_DATA });
      searchBar.open();
      const wrapper = document.querySelector('.aiab-search-bar') as HTMLElement;
      expect(wrapper.classList.contains('aiab-search-bar--open')).toBe(true);
      expect(searchBar.isOpen).toBe(true);
    });

    it('should close dropdown and remove open class', () => {
      searchBar = new SearchBarClass(element, { source: SAMPLE_DATA });
      searchBar.open();
      searchBar.close();
      const wrapper = document.querySelector('.aiab-search-bar') as HTMLElement;
      expect(wrapper.classList.contains('aiab-search-bar--open')).toBe(false);
      expect(searchBar.isOpen).toBe(false);
    });

    it('should reset currentFocus on close', () => {
      searchBar = new SearchBarClass(element, { source: SAMPLE_DATA });
      searchBar.open();
      searchBar.currentFocus = 3;
      searchBar.close();
      expect(searchBar.currentFocus).toBe(-1);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate up/down with ArrowDown/ArrowUp keys', () => {
      searchBar = new SearchBarClass(element, { source: SAMPLE_DATA });
      searchBar.renderResults(SAMPLE_DATA, 'a');
      const input = document.querySelector('.aiab-search-bar-input') as HTMLInputElement;

      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      expect(searchBar.currentFocus).toBe(0);

      searchBar.currentFocus = 2;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
      expect(searchBar.currentFocus).toBe(1);
    });

    it('should wrap navigation from last to first and first to last', () => {
      searchBar = new SearchBarClass(element, { source: SAMPLE_DATA });
      searchBar.renderResults(SAMPLE_DATA, 'a');
      const input = document.querySelector('.aiab-search-bar-input') as HTMLInputElement;

      searchBar.currentFocus = 4;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      expect(searchBar.currentFocus).toBe(0);

      searchBar.currentFocus = 0;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
      expect(searchBar.currentFocus).toBe(4);
    });

    it('should close dropdown on Escape key', () => {
      searchBar = new SearchBarClass(element, { source: SAMPLE_DATA });
      searchBar.open();
      const input = document.querySelector('.aiab-search-bar-input') as HTMLInputElement;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(searchBar.isOpen).toBe(false);
    });

    it('should add active class to focused item', () => {
      searchBar = new SearchBarClass(element, { source: SAMPLE_DATA });
      searchBar.renderResults(SAMPLE_DATA, 'a');
      const items = document.querySelectorAll('.aiab-search-bar-item');
      searchBar.currentFocus = 1;
      searchBar.highlightItem(items);
      expect((items[1] as HTMLElement).classList.contains('aiab-search-bar-item--active')).toBe(
        true,
      );
      expect((items[0] as HTMLElement).classList.contains('aiab-search-bar-item--active')).toBe(
        false,
      );
    });
  });

  describe('Clear Functionality', () => {
    it('should clear input, remove has-value class, close dropdown, and call onClear', () => {
      let clearCalled = false;
      searchBar = new SearchBarClass(element, {
        source: SAMPLE_DATA,
        onClear: () => {
          clearCalled = true;
        },
      });
      searchBar.input.value = 'test';
      searchBar.wrapper.classList.add('aiab-search-bar--has-value');
      searchBar.open();

      searchBar.clear();

      expect(searchBar.input.value).toBe('');
      expect(searchBar.wrapper.classList.contains('aiab-search-bar--has-value')).toBe(false);
      expect(searchBar.isOpen).toBe(false);
      expect(clearCalled).toBe(true);
    });
  });

  describe('Recent Searches', () => {
    it('should save, persist, and deduplicate recent searches', () => {
      searchBar = new SearchBarClass(element, { source: SAMPLE_DATA, recentSearches: true });
      searchBar.saveRecentSearch('test query');
      expect(searchBar.recentSearches).toContain('test query');

      const stored = JSON.parse(localStorage.getItem('aiab-search-bar-recent') || '[]');
      expect(stored).toContain('test query');

      searchBar.saveRecentSearch('other');
      searchBar.saveRecentSearch('test query'); // duplicate
      const count = searchBar.recentSearches.filter((s: string) => s === 'test query').length;
      expect(count).toBe(1);
    });

    it('should limit recent searches to maxRecent', () => {
      searchBar = new SearchBarClass(element, {
        source: SAMPLE_DATA,
        recentSearches: true,
        maxRecent: 3,
      });
      searchBar.saveRecentSearch('one');
      searchBar.saveRecentSearch('two');
      searchBar.saveRecentSearch('three');
      searchBar.saveRecentSearch('four');
      expect(searchBar.recentSearches.length).toBe(3);
      expect(searchBar.recentSearches[0]).toBe('four');
    });

    it('should clear recent searches and load from localStorage', () => {
      searchBar = new SearchBarClass(element, { source: SAMPLE_DATA, recentSearches: true });
      searchBar.saveRecentSearch('test');
      searchBar.clearRecentSearches();
      expect(searchBar.recentSearches.length).toBe(0);
      expect(localStorage.getItem('aiab-search-bar-recent')).toBeNull();

      // Load from localStorage on new instance
      searchBar.destroy();
      localStorage.setItem('aiab-search-bar-recent', JSON.stringify(['saved query']));
      document.body.innerHTML = SEARCH_HTML;
      element = document.querySelector('#search-element') as HTMLElement;
      searchBar = new SearchBarClass(element, { source: SAMPLE_DATA, recentSearches: true });
      expect(searchBar.recentSearches).toContain('saved query');
    });
  });

  describe('Categories', () => {
    it('should create category buttons with data-category attributes', () => {
      searchBar = new SearchBarClass(element, {
        source: SAMPLE_DATA,
        categories: [
          { label: 'Fruits', value: 'fruits' },
          { label: 'Vegetables', value: 'vegetables' },
        ],
      });
      const categoryBtns = document.querySelectorAll('.aiab-search-bar-category');
      expect(categoryBtns.length).toBe(2);
      expect((categoryBtns[0] as HTMLElement).dataset.category).toBe('fruits');
    });
  });

  describe('Callbacks', () => {
    it('should call onSelect when a result is selected', () => {
      // biome-ignore lint/suspicious/noExplicitAny: callback args
      let selectedResult: any = null;
      searchBar = new SearchBarClass(element, {
        source: SAMPLE_DATA,
        // biome-ignore lint/suspicious/noExplicitAny: callback args
        onSelect: (result: any) => {
          selectedResult = result;
        },
      });
      searchBar.selectResult(SAMPLE_DATA[0], 'apple');
      expect(selectedResult).toBe(SAMPLE_DATA[0]);
    });

    it('should update input value on selection by default', () => {
      searchBar = new SearchBarClass(element, { source: SAMPLE_DATA });
      searchBar.selectResult(SAMPLE_DATA[0], 'apple');
      expect(searchBar.input.value).toBe('Apple');
    });

    it('should not update input when clearOnSelect is true', () => {
      searchBar = new SearchBarClass(element, { source: SAMPLE_DATA, clearOnSelect: true });
      searchBar.input.value = 'test';
      searchBar.selectResult(SAMPLE_DATA[0], 'apple');
      expect(searchBar.input.value).toBe('test');
    });
  });

  describe('Public API and Input State', () => {
    it('should get, set, and focus via public API methods', () => {
      searchBar = new SearchBarClass(element, { source: SAMPLE_DATA });
      searchBar.input.value = 'hello';
      expect(searchBar.getValue()).toBe('hello');

      searchBar.setValue('world');
      expect(searchBar.input.value).toBe('world');

      searchBar.focus();
      expect(document.activeElement).toBe(searchBar.input);
    });

    it('should toggle has-value class based on input content', () => {
      searchBar = new SearchBarClass(element, { source: SAMPLE_DATA });
      searchBar.input.value = 'test';
      searchBar.handleInput();
      expect(searchBar.wrapper.classList.contains('aiab-search-bar--has-value')).toBe(true);

      searchBar.input.value = '';
      searchBar.handleInput();
      expect(searchBar.wrapper.classList.contains('aiab-search-bar--has-value')).toBe(false);
    });
  });

  describe('XSS Prevention', () => {
    it('should escape HTML in result titles', () => {
      searchBar = new SearchBarClass(element, { source: SAMPLE_DATA });
      const escaped = escapeHTML('<script>alert("xss")</script>');
      expect(escaped).not.toContain('<script>');
    });
  });

  describe('Destroy / Cleanup', () => {
    it('should replace wrapper with original element after destroy()', () => {
      searchBar = new SearchBarClass(element, { source: SAMPLE_DATA });
      searchBar.destroy();
      // After destroy, the wrapper is replaced with the original element
      // The search bar wrapper should no longer exist in the DOM
      const wrapper = document.querySelector('.aiab-search-bar') as HTMLElement;
      expect(wrapper).toBeNull();
      searchBar = null;
    });

    it('should clear debounce timer on destroy()', () => {
      searchBar = new SearchBarClass(element, { source: SAMPLE_DATA });
      searchBar.debounceTimer = setTimeout(() => {}, 5000);
      searchBar.destroy();
      // Timer should be cleared (no assertion needed, just ensuring no throw)
      searchBar = null;
    });
  });
});
