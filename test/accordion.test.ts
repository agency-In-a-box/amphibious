/**
 * Accordion Component Tests
 * Tests for expand/collapse, keyboard navigation, ARIA attributes, and public API
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import '../src/js/accordion';

// biome-ignore lint/suspicious/noExplicitAny: JS component accessed via window global
const Accordion = (window as any).Accordion;

const ACCORDION_HTML = `
  <div class="aiab-accordion">
    <div class="aiab-accordion-item">
      <div class="aiab-accordion-header">Header 1</div>
      <div class="aiab-accordion-content">Content 1</div>
    </div>
    <div class="aiab-accordion-item">
      <div class="aiab-accordion-header">Header 2</div>
      <div class="aiab-accordion-content">Content 2</div>
    </div>
    <div class="aiab-accordion-item">
      <div class="aiab-accordion-header">Header 3</div>
      <div class="aiab-accordion-content">Content 3</div>
    </div>
  </div>
`;

describe('Accordion Component', () => {
  let container: HTMLElement;
  // biome-ignore lint/suspicious/noExplicitAny: JS component instance
  let accordion: any;

  beforeEach(() => {
    document.body.innerHTML = ACCORDION_HTML;
    container = document.querySelector('.aiab-accordion') as HTMLElement;
  });

  afterEach(() => {
    if (accordion) {
      accordion.destroy();
      accordion = null;
    }
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
    it('should set role="presentation" on the accordion container', () => {
      accordion = new Accordion(container);
      expect(container.getAttribute('role')).toBe('presentation');
    });

    it('should set aria-expanded="false" on all headers by default', () => {
      accordion = new Accordion(container);
      const headers = container.querySelectorAll('.aiab-accordion-header');

      headers.forEach((header: Element) => {
        expect(header.getAttribute('aria-expanded')).toBe('false');
      });
    });

    it('should set aria-hidden="true" on all content panels by default', () => {
      accordion = new Accordion(container);
      const contents = container.querySelectorAll('.aiab-accordion-content');

      contents.forEach((content: Element) => {
        expect(content.getAttribute('aria-hidden')).toBe('true');
      });
    });

    it('should make headers focusable with tabindex=0', () => {
      accordion = new Accordion(container);
      const headers = container.querySelectorAll('.aiab-accordion-header');

      headers.forEach((header: Element) => {
        expect(header.getAttribute('tabindex')).toBe('0');
      });
    });

    it('should set aria-controls on headers linking to content ids', () => {
      accordion = new Accordion(container);
      const headers = container.querySelectorAll('.aiab-accordion-header');
      const contents = container.querySelectorAll('.aiab-accordion-content');

      headers.forEach((header: Element, index: number) => {
        const controlsId = header.getAttribute('aria-controls');
        expect(controlsId).toBeTruthy();
        expect(controlsId).toBe(contents[index].getAttribute('id'));
      });
    });

    it('should set aria-labelledby on content panels linking to header ids', () => {
      accordion = new Accordion(container);
      const headers = container.querySelectorAll('.aiab-accordion-header');
      const contents = container.querySelectorAll('.aiab-accordion-content');

      contents.forEach((content: Element, index: number) => {
        const labelledBy = content.getAttribute('aria-labelledby');
        expect(labelledBy).toBeTruthy();
        expect(labelledBy).toBe(headers[index].getAttribute('id'));
      });
    });
  });

  describe('Toggle Behavior', () => {
    it('should open an item when its header is clicked', () => {
      accordion = new Accordion(container);
      const header = container.querySelector('.aiab-accordion-header') as HTMLElement;
      const item = container.querySelector('.aiab-accordion-item') as HTMLElement;
      const content = item.querySelector('.aiab-accordion-content') as HTMLElement;

      header.click();

      expect(item.classList.contains('aiab-active')).toBe(true);
      expect(header.getAttribute('aria-expanded')).toBe('true');
      expect(content.getAttribute('aria-hidden')).toBe('false');
    });

    it('should close an open item when its header is clicked again', () => {
      accordion = new Accordion(container);
      const header = container.querySelector('.aiab-accordion-header') as HTMLElement;
      const item = container.querySelector('.aiab-accordion-item') as HTMLElement;
      const content = item.querySelector('.aiab-accordion-content') as HTMLElement;

      // Open
      header.click();
      expect(header.getAttribute('aria-expanded')).toBe('true');

      // Close
      header.click();
      expect(item.classList.contains('aiab-active')).toBe(false);
      expect(header.getAttribute('aria-expanded')).toBe('false');
      expect(content.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('Single Mode (allowMultiple=false)', () => {
    it('should close other items when a new one is opened', () => {
      accordion = new Accordion(container, { allowMultiple: false });
      const headers = container.querySelectorAll(
        '.aiab-accordion-header',
      ) as NodeListOf<HTMLElement>;
      const items = container.querySelectorAll('.aiab-accordion-item') as NodeListOf<HTMLElement>;

      // Open first
      headers[0].click();
      expect(items[0].classList.contains('aiab-active')).toBe(true);

      // Open second — first should close
      headers[1].click();
      expect(items[0].classList.contains('aiab-active')).toBe(false);
      expect(items[1].classList.contains('aiab-active')).toBe(true);
    });
  });

  describe('Multiple Mode (allowMultiple=true)', () => {
    it('should allow multiple items to be open simultaneously', () => {
      accordion = new Accordion(container, { allowMultiple: true });
      const headers = container.querySelectorAll(
        '.aiab-accordion-header',
      ) as NodeListOf<HTMLElement>;
      const items = container.querySelectorAll('.aiab-accordion-item') as NodeListOf<HTMLElement>;

      headers[0].click();
      headers[1].click();

      expect(items[0].classList.contains('aiab-active')).toBe(true);
      expect(items[1].classList.contains('aiab-active')).toBe(true);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should toggle item on Enter key', () => {
      accordion = new Accordion(container);
      const header = container.querySelector('.aiab-accordion-header') as HTMLElement;
      const item = container.querySelector('.aiab-accordion-item') as HTMLElement;

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      header.dispatchEvent(enterEvent);

      expect(item.classList.contains('aiab-active')).toBe(true);
    });

    it('should toggle item on Space key', () => {
      accordion = new Accordion(container);
      const header = container.querySelector('.aiab-accordion-header') as HTMLElement;
      const item = container.querySelector('.aiab-accordion-item') as HTMLElement;

      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
      header.dispatchEvent(spaceEvent);

      expect(item.classList.contains('aiab-active')).toBe(true);
    });

    it('should move focus to next header on ArrowDown', () => {
      accordion = new Accordion(container);
      const headers = container.querySelectorAll(
        '.aiab-accordion-header',
      ) as NodeListOf<HTMLElement>;

      headers[0].focus();
      const arrowDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
      headers[0].dispatchEvent(arrowDownEvent);

      expect(document.activeElement).toBe(headers[1]);
    });

    it('should move focus to previous header on ArrowUp', () => {
      accordion = new Accordion(container);
      const headers = container.querySelectorAll(
        '.aiab-accordion-header',
      ) as NodeListOf<HTMLElement>;

      headers[1].focus();
      const arrowUpEvent = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true });
      headers[1].dispatchEvent(arrowUpEvent);

      expect(document.activeElement).toBe(headers[0]);
    });

    it('should wrap focus from last to first on ArrowDown', () => {
      accordion = new Accordion(container);
      const headers = container.querySelectorAll(
        '.aiab-accordion-header',
      ) as NodeListOf<HTMLElement>;

      headers[2].focus();
      const arrowDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
      headers[2].dispatchEvent(arrowDownEvent);

      expect(document.activeElement).toBe(headers[0]);
    });

    it('should move focus to first header on Home key', () => {
      accordion = new Accordion(container);
      const headers = container.querySelectorAll(
        '.aiab-accordion-header',
      ) as NodeListOf<HTMLElement>;

      headers[2].focus();
      const homeEvent = new KeyboardEvent('keydown', { key: 'Home', bubbles: true });
      headers[2].dispatchEvent(homeEvent);

      expect(document.activeElement).toBe(headers[0]);
    });

    it('should move focus to last header on End key', () => {
      accordion = new Accordion(container);
      const headers = container.querySelectorAll(
        '.aiab-accordion-header',
      ) as NodeListOf<HTMLElement>;

      headers[0].focus();
      const endEvent = new KeyboardEvent('keydown', { key: 'End', bubbles: true });
      headers[0].dispatchEvent(endEvent);

      expect(document.activeElement).toBe(headers[2]);
    });
  });

  describe('defaultOpen Option', () => {
    it('should open a specific item by index when defaultOpen is set', () => {
      accordion = new Accordion(container, { defaultOpen: 1 });
      const items = container.querySelectorAll('.aiab-accordion-item') as NodeListOf<HTMLElement>;
      const headers = container.querySelectorAll(
        '.aiab-accordion-header',
      ) as NodeListOf<HTMLElement>;

      expect(items[0].classList.contains('aiab-active')).toBe(false);
      expect(items[1].classList.contains('aiab-active')).toBe(true);
      expect(headers[1].getAttribute('aria-expanded')).toBe('true');
    });

    it('should open all items when defaultOpen is "all"', () => {
      accordion = new Accordion(container, { defaultOpen: 'all' });
      const items = container.querySelectorAll('.aiab-accordion-item') as NodeListOf<HTMLElement>;

      items.forEach((item: HTMLElement) => {
        expect(item.classList.contains('aiab-active')).toBe(true);
      });
    });
  });

  describe('Callbacks', () => {
    it('should call onOpen with item and content when an item is opened', () => {
      // biome-ignore lint/suspicious/noExplicitAny: callback args
      let calledWith: any[] = [];
      accordion = new Accordion(container, {
        onOpen: (item: HTMLElement, content: HTMLElement) => {
          calledWith = [item, content];
        },
      });

      const header = container.querySelector('.aiab-accordion-header') as HTMLElement;
      const item = container.querySelector('.aiab-accordion-item') as HTMLElement;
      const content = item.querySelector('.aiab-accordion-content') as HTMLElement;

      header.click();

      expect(calledWith[0]).toBe(item);
      expect(calledWith[1]).toBe(content);
    });

    it('should call onClose with item and content when an item is closed', () => {
      // biome-ignore lint/suspicious/noExplicitAny: callback args
      let calledWith: any[] = [];
      accordion = new Accordion(container, {
        onClose: (item: HTMLElement, content: HTMLElement) => {
          calledWith = [item, content];
        },
      });

      const header = container.querySelector('.aiab-accordion-header') as HTMLElement;
      const item = container.querySelector('.aiab-accordion-item') as HTMLElement;
      const content = item.querySelector('.aiab-accordion-content') as HTMLElement;

      // Open then close
      header.click();
      header.click();

      expect(calledWith[0]).toBe(item);
      expect(calledWith[1]).toBe(content);
    });
  });

  describe('Public API', () => {
    it('should open all items with openAll()', () => {
      accordion = new Accordion(container);
      accordion.openAll();

      const items = container.querySelectorAll('.aiab-accordion-item') as NodeListOf<HTMLElement>;
      items.forEach((item: HTMLElement) => {
        expect(item.classList.contains('aiab-active')).toBe(true);
      });
    });

    it('should close all items with closeAll()', () => {
      accordion = new Accordion(container, { defaultOpen: 'all' });
      accordion.closeAll();

      const items = container.querySelectorAll('.aiab-accordion-item') as NodeListOf<HTMLElement>;
      items.forEach((item: HTMLElement) => {
        expect(item.classList.contains('aiab-active')).toBe(false);
      });
    });

    it('should open a specific item by index with openItem()', () => {
      accordion = new Accordion(container);
      accordion.openItem(2);

      const items = container.querySelectorAll('.aiab-accordion-item') as NodeListOf<HTMLElement>;
      expect(items[2].classList.contains('aiab-active')).toBe(true);
      expect(items[0].classList.contains('aiab-active')).toBe(false);
    });

    it('should close a specific item by index with closeItem()', () => {
      accordion = new Accordion(container, { defaultOpen: 'all' });
      accordion.closeItem(1);

      const items = container.querySelectorAll('.aiab-accordion-item') as NodeListOf<HTMLElement>;
      expect(items[0].classList.contains('aiab-active')).toBe(true);
      expect(items[1].classList.contains('aiab-active')).toBe(false);
      expect(items[2].classList.contains('aiab-active')).toBe(true);
    });

    it('should ignore out-of-bounds index for openItem()', () => {
      accordion = new Accordion(container);
      // Should not throw
      expect(() => accordion.openItem(99)).not.toThrow();
      expect(() => accordion.openItem(-1)).not.toThrow();
    });
  });

  describe('Destroy / Cleanup', () => {
    it('should stop responding to clicks after destroy()', () => {
      accordion = new Accordion(container);
      accordion.destroy();

      const header = container.querySelector('.aiab-accordion-header') as HTMLElement;
      const item = container.querySelector('.aiab-accordion-item') as HTMLElement;

      header.click();
      // Item should remain closed because listeners were removed
      expect(item.classList.contains('aiab-active')).toBe(false);

      // Prevent afterEach from calling destroy again
      accordion = null;
    });
  });
});
