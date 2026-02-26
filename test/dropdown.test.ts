/**
 * Dropdown Component Tests
 * Tests for custom dropdown with search, multi-select, keyboard nav, and ARIA
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import '../src/js/dropdown.js';

// biome-ignore lint/suspicious/noExplicitAny: JS component accessed via window global
const Dropdown = (window as any).Dropdown;

const DROPDOWN_HTML = `
  <div id="dropdown-container">
    <select>
      <option value="apple">Apple</option>
      <option value="banana">Banana</option>
      <option value="cherry">Cherry</option>
    </select>
  </div>
`;

describe('Dropdown Component', () => {
  let container: HTMLElement;
  // biome-ignore lint/suspicious/noExplicitAny: JS component instance
  let dropdown: any;

  beforeEach(() => {
    document.body.innerHTML = DROPDOWN_HTML;
    container = document.querySelector('#dropdown-container') as HTMLElement;
  });

  afterEach(() => {
    if (dropdown) {
      dropdown.destroy();
      dropdown = null;
    }
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
    it('should create .aiab-dropdown element inside the container', () => {
      dropdown = new Dropdown(container);
      const dropdownEl = container.querySelector('.aiab-dropdown');
      expect(dropdownEl).toBeTruthy();
    });

    it('should create .aiab-dropdown-select button', () => {
      dropdown = new Dropdown(container);
      const selectBtn = container.querySelector('.aiab-dropdown-select');
      expect(selectBtn).toBeTruthy();
      expect(selectBtn!.getAttribute('type')).toBe('button');
    });

    it('should create .aiab-dropdown-menu with role=listbox', () => {
      dropdown = new Dropdown(container);
      const menu = container.querySelector('.aiab-dropdown-menu');
      expect(menu).toBeTruthy();
      expect(menu!.getAttribute('role')).toBe('listbox');
    });

    it('should set aria-expanded="false" and aria-haspopup="listbox" on button', () => {
      dropdown = new Dropdown(container);
      const selectBtn = container.querySelector('.aiab-dropdown-select') as HTMLElement;
      expect(selectBtn.getAttribute('aria-expanded')).toBe('false');
      expect(selectBtn.getAttribute('aria-haspopup')).toBe('listbox');
    });

    it('should display the placeholder text when no option is pre-selected', () => {
      // Use a select where no option is explicitly selected and add an empty placeholder option
      document.body.innerHTML = `
        <div id="dropdown-container">
          <select>
            <option value="">-- Choose --</option>
            <option value="apple">Apple</option>
            <option value="banana">Banana</option>
          </select>
        </div>
      `;
      container = document.querySelector('#dropdown-container') as HTMLElement;
      dropdown = new Dropdown(container, { placeholder: 'Pick a fruit' });
      const valueSpan = container.querySelector('.aiab-dropdown-value') as HTMLElement;
      expect(valueSpan.textContent).toBe('Pick a fruit');
      expect(valueSpan.classList.contains('aiab-dropdown-placeholder')).toBe(true);
    });
  });

  describe('Native Select Parsing', () => {
    it('should hide the native select element', () => {
      dropdown = new Dropdown(container);
      const nativeSelect = container.querySelector('select') as HTMLSelectElement;
      expect(nativeSelect.style.display).toBe('none');
    });

    it('should render dropdown items with role=option for each native option', () => {
      dropdown = new Dropdown(container);
      const items = container.querySelectorAll('.aiab-dropdown-item');
      expect(items.length).toBe(3);

      items.forEach((item: Element) => {
        expect(item.getAttribute('role')).toBe('option');
      });
    });

    it('should set data-value on each dropdown item matching native option values', () => {
      dropdown = new Dropdown(container);
      const items = container.querySelectorAll('.aiab-dropdown-item') as NodeListOf<HTMLElement>;

      expect(items[0].dataset.value).toBe('apple');
      expect(items[1].dataset.value).toBe('banana');
      expect(items[2].dataset.value).toBe('cherry');
    });
  });

  describe('Open / Close', () => {
    it('should open on button click (adds "open" class, aria-expanded=true)', () => {
      dropdown = new Dropdown(container);
      const selectBtn = container.querySelector('.aiab-dropdown-select') as HTMLElement;
      const dropdownEl = container.querySelector('.aiab-dropdown') as HTMLElement;

      selectBtn.click();

      expect(dropdownEl.classList.contains('open')).toBe(true);
      expect(selectBtn.getAttribute('aria-expanded')).toBe('true');
    });

    it('should close on second button click', () => {
      dropdown = new Dropdown(container);
      const selectBtn = container.querySelector('.aiab-dropdown-select') as HTMLElement;
      const dropdownEl = container.querySelector('.aiab-dropdown') as HTMLElement;

      selectBtn.click(); // open
      selectBtn.click(); // close

      expect(dropdownEl.classList.contains('open')).toBe(false);
      expect(selectBtn.getAttribute('aria-expanded')).toBe('false');
    });

    it('should close when clicking outside the dropdown', () => {
      dropdown = new Dropdown(container);
      const selectBtn = container.querySelector('.aiab-dropdown-select') as HTMLElement;
      const dropdownEl = container.querySelector('.aiab-dropdown') as HTMLElement;

      selectBtn.click(); // open
      expect(dropdownEl.classList.contains('open')).toBe(true);

      // Click outside
      document.body.click();

      expect(dropdownEl.classList.contains('open')).toBe(false);
    });
  });

  describe('Single Select', () => {
    it('should select an item on click and update display', () => {
      dropdown = new Dropdown(container);
      const selectBtn = container.querySelector('.aiab-dropdown-select') as HTMLElement;

      selectBtn.click(); // open

      const items = container.querySelectorAll('.aiab-dropdown-item') as NodeListOf<HTMLElement>;
      items[1].click(); // select banana

      const valueSpan = container.querySelector('.aiab-dropdown-value') as HTMLElement;
      expect(valueSpan.textContent).toBe('Banana');
      expect(items[1].classList.contains('selected')).toBe(true);
      expect(items[1].getAttribute('aria-selected')).toBe('true');
    });

    it('should close the dropdown after selecting in single mode', () => {
      dropdown = new Dropdown(container);
      const selectBtn = container.querySelector('.aiab-dropdown-select') as HTMLElement;
      const dropdownEl = container.querySelector('.aiab-dropdown') as HTMLElement;

      selectBtn.click(); // open
      const items = container.querySelectorAll('.aiab-dropdown-item') as NodeListOf<HTMLElement>;
      items[0].click(); // select apple

      expect(dropdownEl.classList.contains('open')).toBe(false);
    });

    it('should deselect previous item when selecting a new one', () => {
      dropdown = new Dropdown(container);
      const selectBtn = container.querySelector('.aiab-dropdown-select') as HTMLElement;

      selectBtn.click();
      const items = container.querySelectorAll('.aiab-dropdown-item') as NodeListOf<HTMLElement>;
      items[0].click(); // select apple

      // Reopen and select banana
      selectBtn.click();
      const updatedItems = container.querySelectorAll(
        '.aiab-dropdown-item',
      ) as NodeListOf<HTMLElement>;
      updatedItems[1].click();

      expect(dropdown.getValue()).toBe('banana');
    });

    it('should update the native select value', () => {
      dropdown = new Dropdown(container);
      const selectBtn = container.querySelector('.aiab-dropdown-select') as HTMLElement;
      const nativeSelect = container.querySelector('select') as HTMLSelectElement;

      selectBtn.click();
      const items = container.querySelectorAll('.aiab-dropdown-item') as NodeListOf<HTMLElement>;
      items[2].click(); // select cherry

      const selectedOption = nativeSelect.querySelector(
        'option[value="cherry"]',
      ) as HTMLOptionElement;
      expect(selectedOption.selected).toBe(true);
    });
  });

  describe('Multi Select', () => {
    it('should allow multiple items to be selected', () => {
      dropdown = new Dropdown(container, { multiple: true });
      // Reset to clear implicit first-option selection from native <select>
      dropdown.reset();

      const selectBtn = container.querySelector('.aiab-dropdown-select') as HTMLElement;

      selectBtn.click();
      const items = container.querySelectorAll('.aiab-dropdown-item') as NodeListOf<HTMLElement>;
      items[0].click(); // select apple
      items[1].click(); // select banana

      const value = dropdown.getValue();
      expect(value).toEqual(['apple', 'banana']);
    });

    it('should add aiab-dropdown--multi class when multiple option is set', () => {
      dropdown = new Dropdown(container, { multiple: true });
      const dropdownEl = container.querySelector('.aiab-dropdown') as HTMLElement;
      expect(dropdownEl.classList.contains('aiab-dropdown--multi')).toBe(true);
    });

    it('should deselect an already selected item on second click in multi mode', () => {
      dropdown = new Dropdown(container, { multiple: true });
      // Reset to clear implicit first-option selection from native <select>
      dropdown.reset();

      const selectBtn = container.querySelector('.aiab-dropdown-select') as HTMLElement;

      selectBtn.click();
      const items = container.querySelectorAll('.aiab-dropdown-item') as NodeListOf<HTMLElement>;
      items[0].click(); // select apple
      items[0].click(); // deselect apple

      expect(dropdown.getValue()).toEqual([]);
    });
  });

  describe('Search', () => {
    it('should render a search input when searchable=true', () => {
      dropdown = new Dropdown(container, { searchable: true });
      const searchInput = container.querySelector('.aiab-dropdown-search-input');
      expect(searchInput).toBeTruthy();
    });

    it('should filter items based on search input', () => {
      dropdown = new Dropdown(container, { searchable: true });
      const selectBtn = container.querySelector('.aiab-dropdown-select') as HTMLElement;
      selectBtn.click();

      const searchInput = container.querySelector(
        '.aiab-dropdown-search-input',
      ) as HTMLInputElement;

      // Type a search term
      searchInput.value = 'ban';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));

      const visibleItems = container.querySelectorAll('.aiab-dropdown-item');
      expect(visibleItems.length).toBe(1);
      expect((visibleItems[0] as HTMLElement).dataset.value).toBe('banana');
    });

    it('should not render search input when searchable is not set', () => {
      dropdown = new Dropdown(container);
      const searchInput = container.querySelector('.aiab-dropdown-search-input');
      expect(searchInput).toBeNull();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should open dropdown on Enter key press on the button', () => {
      dropdown = new Dropdown(container);
      const selectBtn = container.querySelector('.aiab-dropdown-select') as HTMLElement;
      const dropdownEl = container.querySelector('.aiab-dropdown') as HTMLElement;

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      selectBtn.dispatchEvent(enterEvent);

      expect(dropdownEl.classList.contains('open')).toBe(true);
    });

    it('should open dropdown on ArrowDown when closed', () => {
      dropdown = new Dropdown(container);
      const selectBtn = container.querySelector('.aiab-dropdown-select') as HTMLElement;
      const dropdownEl = container.querySelector('.aiab-dropdown') as HTMLElement;

      const arrowDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
      selectBtn.dispatchEvent(arrowDownEvent);

      expect(dropdownEl.classList.contains('open')).toBe(true);
    });

    it('should close dropdown on Escape key', () => {
      dropdown = new Dropdown(container);
      const selectBtn = container.querySelector('.aiab-dropdown-select') as HTMLElement;
      const dropdownEl = container.querySelector('.aiab-dropdown') as HTMLElement;

      selectBtn.click(); // open
      expect(dropdownEl.classList.contains('open')).toBe(true);

      const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      document.dispatchEvent(escEvent);

      expect(dropdownEl.classList.contains('open')).toBe(false);
    });
  });

  describe('Public API', () => {
    it('should return selected value with getValue() in single mode', () => {
      dropdown = new Dropdown(container);
      dropdown.setValue('banana');
      expect(dropdown.getValue()).toBe('banana');
    });

    it('should return selected values array with getValue() in multi mode', () => {
      dropdown = new Dropdown(container, { multiple: true });
      dropdown.setValue(['apple', 'cherry']);
      expect(dropdown.getValue()).toEqual(['apple', 'cherry']);
    });

    it('should set value and update display with setValue()', () => {
      dropdown = new Dropdown(container);
      dropdown.setValue('cherry');

      const valueSpan = container.querySelector('.aiab-dropdown-value') as HTMLElement;
      expect(valueSpan.textContent).toBe('Cherry');
    });

    it('should clear selection with reset()', () => {
      dropdown = new Dropdown(container);
      dropdown.setValue('apple');
      dropdown.reset();

      const valueSpan = container.querySelector('.aiab-dropdown-value') as HTMLElement;
      expect(valueSpan.textContent).toBe('Select an option');
      expect(valueSpan.classList.contains('aiab-dropdown-placeholder')).toBe(true);
    });
  });

  describe('Callbacks', () => {
    it('should call onChange when an item is selected', () => {
      // biome-ignore lint/suspicious/noExplicitAny: callback value
      let calledValues: any = null;
      dropdown = new Dropdown(container, {
        onChange: (values: string[]) => {
          calledValues = values;
        },
      });

      const selectBtn = container.querySelector('.aiab-dropdown-select') as HTMLElement;
      selectBtn.click();
      const items = container.querySelectorAll('.aiab-dropdown-item') as NodeListOf<HTMLElement>;
      items[0].click();

      expect(calledValues).toEqual(['apple']);
    });

    it('should call onOpen when dropdown opens', () => {
      let opened = false;
      dropdown = new Dropdown(container, {
        onOpen: () => {
          opened = true;
        },
      });

      const selectBtn = container.querySelector('.aiab-dropdown-select') as HTMLElement;
      selectBtn.click();

      expect(opened).toBe(true);
    });

    it('should call onClose when dropdown closes', () => {
      let closed = false;
      dropdown = new Dropdown(container, {
        onClose: () => {
          closed = true;
        },
      });

      const selectBtn = container.querySelector('.aiab-dropdown-select') as HTMLElement;
      selectBtn.click(); // open
      selectBtn.click(); // close

      expect(closed).toBe(true);
    });
  });

  describe('Destroy / Cleanup', () => {
    it('should remove the custom dropdown from the DOM on destroy', () => {
      dropdown = new Dropdown(container);
      const dropdownEl = container.querySelector('.aiab-dropdown');
      expect(dropdownEl).toBeTruthy();

      dropdown.destroy();
      dropdown = null;

      expect(container.querySelector('.aiab-dropdown')).toBeNull();
    });

    it('should restore the native select visibility on destroy', () => {
      dropdown = new Dropdown(container);
      const nativeSelect = container.querySelector('select') as HTMLSelectElement;
      expect(nativeSelect.style.display).toBe('none');

      dropdown.destroy();
      dropdown = null;

      expect(nativeSelect.style.display).toBe('');
    });
  });
});
