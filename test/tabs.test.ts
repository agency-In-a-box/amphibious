/**
 * Tabs Module Tests
 * Tests for tab switching, keyboard navigation, and ARIA attributes
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { Tabs } from '../src/js/tabs';

describe('Tabs Module', () => {
  let tabs: Tabs;
  let container: HTMLElement;

  beforeEach(() => {
    // Setup DOM structure
    document.body.innerHTML = `
      <div class="tabs">
        <div class="tabs__list" role="tablist">
          <button class="tabs__tab" role="tab">Tab 1</button>
          <button class="tabs__tab" role="tab">Tab 2</button>
          <button class="tabs__tab" role="tab">Tab 3</button>
        </div>
        <div class="tabs__panel" role="tabpanel">Panel 1 Content</div>
        <div class="tabs__panel" role="tabpanel">Panel 2 Content</div>
        <div class="tabs__panel" role="tabpanel">Panel 3 Content</div>
      </div>

      <!-- Legacy tabs for testing backward compatibility -->
      <div>
        <button amp-tab-content="#legacy1" amp-tab-group="legacy">Legacy Tab 1</button>
        <button amp-tab-content="#legacy2" amp-tab-group="legacy">Legacy Tab 2</button>
        <div id="legacy1">Legacy Panel 1</div>
        <div id="legacy2">Legacy Panel 2</div>
      </div>
    `;

    container = document.querySelector('.tabs') as HTMLElement;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
    it('should initialize without errors', () => {
      tabs = new Tabs();
      expect(() => tabs.init()).not.toThrow();
    });

    it('should set initial ARIA attributes', () => {
      tabs = new Tabs();
      tabs.init();

      const tabElements = container.querySelectorAll('[role="tab"]');
      const panels = container.querySelectorAll('[role="tabpanel"]');

      // First tab should be active
      expect(tabElements[0].getAttribute('aria-selected')).toBe('true');
      expect(tabElements[0].getAttribute('tabindex')).toBe('0');

      // Other tabs should be inactive
      expect(tabElements[1].getAttribute('aria-selected')).toBe('false');
      expect(tabElements[1].getAttribute('tabindex')).toBe('-1');

      // Panels should have proper ARIA relationships
      expect(panels[0].getAttribute('aria-labelledby')).toBeTruthy();
      expect(tabElements[0].getAttribute('aria-controls')).toBeTruthy();
    });

    it('should show first panel and hide others initially', () => {
      tabs = new Tabs();
      tabs.init();

      const panels = container.querySelectorAll('.tabs__panel') as NodeListOf<HTMLElement>;

      expect(panels[0].style.display).not.toBe('none');
      expect(panels[1].style.display).toBe('none');
      expect(panels[2].style.display).toBe('none');
    });
  });

  describe('Tab Selection', () => {
    it('should switch tabs on click', () => {
      tabs = new Tabs();
      tabs.init();

      const tabElements = container.querySelectorAll('[role="tab"]') as NodeListOf<HTMLElement>;
      const panels = container.querySelectorAll('.tabs__panel') as NodeListOf<HTMLElement>;

      // Click second tab
      tabElements[1].click();

      // Check tab states
      expect(tabElements[0].getAttribute('aria-selected')).toBe('false');
      expect(tabElements[1].getAttribute('aria-selected')).toBe('true');

      // Check panel visibility
      expect(panels[0].style.display).toBe('none');
      expect(panels[1].style.display).toBe('block');
    });

    it('should dispatch custom event on tab change', () => {
      tabs = new Tabs();
      tabs.init();

      let eventFired = false;
      let eventDetail: any = null;

      container.addEventListener('tab:change', (e: Event) => {
        eventFired = true;
        eventDetail = (e as CustomEvent).detail;
      });

      const tabElements = container.querySelectorAll('[role="tab"]') as NodeListOf<HTMLElement>;
      tabElements[1].click();

      expect(eventFired).toBe(true);
      expect(eventDetail).toBeTruthy();
      expect(eventDetail.tab).toBe(tabElements[1]);
    });

    it('should select tab programmatically by index', () => {
      tabs = new Tabs();
      tabs.init();

      tabs.selectTabByIndex('.tabs', 2);

      const tabElements = container.querySelectorAll('[role="tab"]');
      const panels = container.querySelectorAll('.tabs__panel') as NodeListOf<HTMLElement>;

      expect(tabElements[2].getAttribute('aria-selected')).toBe('true');
      expect(panels[2].style.display).toBe('block');
    });

    it('should return active tab', () => {
      tabs = new Tabs();
      tabs.init();

      const tabElements = container.querySelectorAll('[role="tab"]') as NodeListOf<HTMLElement>;
      tabElements[1].click();

      const activeTab = tabs.getActiveTab('.tabs');
      expect(activeTab).toBe(tabElements[1]);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate with arrow keys', () => {
      tabs = new Tabs();
      tabs.init();

      const tabElements = container.querySelectorAll('[role="tab"]') as NodeListOf<HTMLElement>;

      // Focus first tab
      tabElements[0].focus();

      // Arrow right
      const arrowRightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      tabElements[0].dispatchEvent(arrowRightEvent);

      expect(tabElements[1].getAttribute('aria-selected')).toBe('true');
      expect(document.activeElement).toBe(tabElements[1]);
    });

    it('should wrap navigation at boundaries', () => {
      tabs = new Tabs();
      tabs.init();

      const tabElements = container.querySelectorAll('[role="tab"]') as NodeListOf<HTMLElement>;

      // Focus last tab
      tabs.selectTabByIndex('.tabs', 2);
      tabElements[2].focus();

      // Arrow right should wrap to first
      const arrowRightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      tabElements[2].dispatchEvent(arrowRightEvent);

      expect(tabElements[0].getAttribute('aria-selected')).toBe('true');
    });

    it('should navigate to first/last with Home/End keys', () => {
      tabs = new Tabs();
      tabs.init();

      const tabElements = container.querySelectorAll('[role="tab"]') as NodeListOf<HTMLElement>;

      // Select middle tab
      tabs.selectTabByIndex('.tabs', 1);

      // Press End key
      const endEvent = new KeyboardEvent('keydown', { key: 'End' });
      tabElements[1].dispatchEvent(endEvent);
      expect(tabElements[2].getAttribute('aria-selected')).toBe('true');

      // Press Home key
      const homeEvent = new KeyboardEvent('keydown', { key: 'Home' });
      tabElements[2].dispatchEvent(homeEvent);
      expect(tabElements[0].getAttribute('aria-selected')).toBe('true');
    });

    it('should handle vertical navigation with arrow up/down', () => {
      tabs = new Tabs();
      tabs.init();

      const tabElements = container.querySelectorAll('[role="tab"]') as NodeListOf<HTMLElement>;

      // Arrow down
      const arrowDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      tabElements[0].dispatchEvent(arrowDownEvent);
      expect(tabElements[1].getAttribute('aria-selected')).toBe('true');

      // Arrow up
      const arrowUpEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      tabElements[1].dispatchEvent(arrowUpEvent);
      expect(tabElements[0].getAttribute('aria-selected')).toBe('true');
    });
  });

  describe('Legacy Tab Support', () => {
    it('should support amp-tab-content attributes', () => {
      tabs = new Tabs();
      tabs.init();

      const legacyTab1 = document.querySelector('[amp-tab-content="#legacy1"]') as HTMLElement;
      const legacyTab2 = document.querySelector('[amp-tab-content="#legacy2"]') as HTMLElement;
      const legacyPanel1 = document.querySelector('#legacy1') as HTMLElement;
      const legacyPanel2 = document.querySelector('#legacy2') as HTMLElement;

      // First tab should be active by default
      expect(legacyPanel1.style.display).toBe('block');
      expect(legacyPanel2.style.display).toBe('none');

      // Click second tab
      legacyTab2.click();

      expect(legacyPanel1.style.display).toBe('none');
      expect(legacyPanel2.style.display).toBe('block');
      expect(legacyTab2.classList.contains('active')).toBe(true);
    });

    it('should respect amp-tab-group attribute', () => {
      tabs = new Tabs();
      tabs.init();

      const legacyTabs = document.querySelectorAll('[amp-tab-group="legacy"]');
      expect(legacyTabs.length).toBe(2);

      // Tabs in same group should affect each other
      const tab1 = legacyTabs[0] as HTMLElement;
      const tab2 = legacyTabs[1] as HTMLElement;

      tab2.click();
      expect(tab1.classList.contains('active')).toBe(false);
      expect(tab2.classList.contains('active')).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should maintain focus on active tab', () => {
      tabs = new Tabs();
      tabs.init();

      const tabElements = container.querySelectorAll('[role="tab"]') as NodeListOf<HTMLElement>;

      tabElements[1].click();
      expect(document.activeElement).toBe(tabElements[1]);
    });

    it('should set proper tabindex values', () => {
      tabs = new Tabs();
      tabs.init();

      const tabElements = container.querySelectorAll('[role="tab"]');

      // Only active tab should be tabbable
      expect(tabElements[0].getAttribute('tabindex')).toBe('0');
      expect(tabElements[1].getAttribute('tabindex')).toBe('-1');
      expect(tabElements[2].getAttribute('tabindex')).toBe('-1');

      // After switching
      (tabElements[1] as HTMLElement).click();
      expect(tabElements[0].getAttribute('tabindex')).toBe('-1');
      expect(tabElements[1].getAttribute('tabindex')).toBe('0');
    });

    it('should have proper ARIA relationships', () => {
      tabs = new Tabs();
      tabs.init();

      const tabElements = container.querySelectorAll('[role="tab"]');
      const panels = container.querySelectorAll('[role="tabpanel"]');

      tabElements.forEach((tab, index) => {
        const controlsId = tab.getAttribute('aria-controls');
        const labelledBy = panels[index].getAttribute('aria-labelledby');

        expect(controlsId).toBe(panels[index].id);
        expect(labelledBy).toBe(tab.id);
      });
    });
  });
});