/**
 * Tooltip Module Tests
 * Tests for tooltip lifecycle, positioning, triggers,
 * ARIA attributes, keyboard support, and static methods
 */

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { EcommerceTooltips, Tooltip } from '../src/js/tooltip';

describe('Tooltip Module', () => {
  let triggerElement: HTMLElement;

  beforeEach(() => {
    // Set viewport dimensions so position adjustment doesn't interfere
    Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 1080, configurable: true });

    document.body.innerHTML = `
      <button id="trigger" title="Tooltip text">Hover me</button>
      <button id="trigger2" data-tooltip="Data tooltip">Another</button>
      <button id="no-title">No tooltip</button>
    `;
    triggerElement = document.getElementById('trigger') as HTMLElement;

    // Position trigger in center of viewport so tooltip position adjustment doesn't fire
    const centerRect = {
      top: 400,
      left: 800,
      bottom: 440,
      right: 900,
      width: 100,
      height: 40,
      x: 800,
      y: 400,
      toJSON: () => ({}),
    };
    triggerElement.getBoundingClientRect = () => centerRect as DOMRect;
  });

  afterEach(() => {
    Tooltip.destroyAll();
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
    it('should initialize with default options', () => {
      const tooltip = new Tooltip(triggerElement);
      expect(tooltip).toBeDefined();
    });

    it('should accept string selector', () => {
      const tooltip = new Tooltip('#trigger');
      expect(tooltip).toBeDefined();
    });

    it('should throw on invalid selector', () => {
      expect(() => new Tooltip('#nonexistent')).toThrow();
    });

    it('should read content from title attribute', () => {
      const tooltip = new Tooltip(triggerElement, { delay: 0 });
      tooltip.show();
      const tooltipEl = document.querySelector('.aiab-tooltip');
      expect(tooltipEl?.textContent).toBe('Tooltip text');
    });

    it('should remove title attribute to prevent native tooltip', () => {
      new Tooltip(triggerElement);
      expect(triggerElement.hasAttribute('title')).toBe(false);
    });

    it('should read content from data-tooltip attribute', () => {
      const el = document.getElementById('trigger2') as HTMLElement;
      const tooltip = new Tooltip(el, { delay: 0 });
      tooltip.show();
      const tooltipEl = document.querySelector('.aiab-tooltip');
      expect(tooltipEl?.textContent).toBe('Data tooltip');
    });

    it('should call onMount callback', () => {
      const onMount = mock(() => {});
      new Tooltip(triggerElement, { onMount });
      expect(onMount).toHaveBeenCalledTimes(1);
    });

    it('should register in static instances map', () => {
      new Tooltip(triggerElement);
      expect(Tooltip.getInstance(triggerElement)).toBeDefined();
    });
  });

  describe('Show and Hide', () => {
    it('should show tooltip', () => {
      const tooltip = new Tooltip(triggerElement, { delay: 0 });
      tooltip.show();

      const tooltipEl = document.querySelector('.aiab-tooltip');
      expect(tooltipEl).toBeTruthy();
      expect(tooltipEl?.classList.contains('aiab-tooltip--visible')).toBe(true);
      expect(tooltipEl?.getAttribute('aria-hidden')).toBe('false');
    });

    it('should set role=tooltip on tooltip element', () => {
      const tooltip = new Tooltip(triggerElement, { delay: 0 });
      tooltip.show();

      const tooltipEl = document.querySelector('.aiab-tooltip');
      expect(tooltipEl?.getAttribute('role')).toBe('tooltip');
    });

    it('should hide tooltip', () => {
      const tooltip = new Tooltip(triggerElement, { delay: 0, hideDelay: 0 });
      tooltip.show();
      tooltip.hide();

      const tooltipEl = document.querySelector('.aiab-tooltip');
      expect(tooltipEl?.classList.contains('aiab-tooltip--hidden')).toBe(true);
      expect(tooltipEl?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should not show if already visible', () => {
      const onShow = mock(() => {});
      const tooltip = new Tooltip(triggerElement, { delay: 0, onShow });
      tooltip.show();
      tooltip.show();
      expect(onShow).toHaveBeenCalledTimes(1);
    });

    it('should not hide if already hidden', () => {
      const onHide = mock(() => {});
      const tooltip = new Tooltip(triggerElement, { delay: 0, onHide });
      tooltip.hide();
      expect(onHide).not.toHaveBeenCalled();
    });

    it('should toggle visibility', () => {
      const tooltip = new Tooltip(triggerElement, { delay: 0, hideDelay: 0 });

      tooltip.toggle();
      expect(document.querySelector('.aiab-tooltip--visible')).toBeTruthy();

      tooltip.toggle();
      expect(document.querySelector('.aiab-tooltip--hidden')).toBeTruthy();
    });

    it('should call onShow callback', () => {
      const onShow = mock(() => {});
      const tooltip = new Tooltip(triggerElement, { delay: 0, onShow });
      tooltip.show();
      expect(onShow).toHaveBeenCalledTimes(1);
    });

    it('should call onHide callback', () => {
      const onHide = mock(() => {});
      const tooltip = new Tooltip(triggerElement, { delay: 0, hideDelay: 0, onHide });
      tooltip.show();
      tooltip.hide();
      expect(onHide).toHaveBeenCalledTimes(1);
    });

    it('should not show tooltip with empty content', () => {
      const el = document.getElementById('no-title') as HTMLElement;
      const tooltip = new Tooltip(el, { delay: 0, content: '' });
      tooltip.show();
      // Tooltip element should not be created for empty content
      const tooltipEl = document.querySelector('.aiab-tooltip');
      expect(tooltipEl).toBeNull();
    });
  });

  describe('CSS Classes', () => {
    it('should add position class', () => {
      const tooltip = new Tooltip(triggerElement, { delay: 0, position: 'bottom' });
      tooltip.show();

      const tooltipEl = document.querySelector('.aiab-tooltip');
      expect(tooltipEl?.classList.contains('aiab-tooltip--bottom')).toBe(true);
    });

    it('should add variant class', () => {
      const tooltip = new Tooltip(triggerElement, { delay: 0, variant: 'danger' });
      tooltip.show();

      const tooltipEl = document.querySelector('.aiab-tooltip');
      expect(tooltipEl?.classList.contains('aiab-tooltip--danger')).toBe(true);
    });

    it('should add size class', () => {
      const tooltip = new Tooltip(triggerElement, { delay: 0, size: 'lg' });
      tooltip.show();

      const tooltipEl = document.querySelector('.aiab-tooltip');
      expect(tooltipEl?.classList.contains('aiab-tooltip--lg')).toBe(true);
    });

    it('should add interactive class', () => {
      const tooltip = new Tooltip(triggerElement, { delay: 0, interactive: true });
      tooltip.show();

      const tooltipEl = document.querySelector('.aiab-tooltip');
      expect(tooltipEl?.classList.contains('aiab-tooltip--interactive')).toBe(true);
    });

    it('should add custom className', () => {
      const tooltip = new Tooltip(triggerElement, { delay: 0, className: 'my-custom-class' });
      tooltip.show();

      const tooltipEl = document.querySelector('.aiab-tooltip');
      expect(tooltipEl?.classList.contains('my-custom-class')).toBe(true);
    });

    it('should preserve variant and size classes when position adjusts', () => {
      // Position trigger near top edge so tooltip flips from top to bottom
      const topEdgeRect = {
        top: 5,
        left: 800,
        bottom: 45,
        right: 900,
        width: 100,
        height: 40,
        x: 800,
        y: 5,
        toJSON: () => ({}),
      };
      triggerElement.getBoundingClientRect = () => topEdgeRect as DOMRect;

      const tooltip = new Tooltip(triggerElement, {
        delay: 0,
        position: 'top',
        variant: 'danger',
        size: 'lg',
      });
      tooltip.show();

      const tooltipEl = document.querySelector('.aiab-tooltip') as HTMLElement;
      // Position should have flipped to bottom
      expect(tooltipEl?.classList.contains('aiab-tooltip--bottom')).toBe(true);
      // Variant and size must survive
      expect(tooltipEl?.classList.contains('aiab-tooltip--danger')).toBe(true);
      expect(tooltipEl?.classList.contains('aiab-tooltip--lg')).toBe(true);
    });

    it('should clean up stale position class when position flips back', () => {
      const tooltip = new Tooltip(triggerElement, {
        delay: 0,
        hideDelay: 0,
        position: 'top',
        variant: 'primary',
      });

      // First show: trigger near top edge → flips to bottom
      const topEdgeRect = {
        top: 5,
        left: 800,
        bottom: 45,
        right: 900,
        width: 100,
        height: 40,
        x: 800,
        y: 5,
        toJSON: () => ({}),
      };
      triggerElement.getBoundingClientRect = () => topEdgeRect as DOMRect;
      tooltip.show();

      let tooltipEl = document.querySelector('.aiab-tooltip') as HTMLElement;
      expect(tooltipEl?.classList.contains('aiab-tooltip--bottom')).toBe(true);
      expect(tooltipEl?.classList.contains('aiab-tooltip--top')).toBe(false);

      // Now move trigger to center so top fits again
      const centerRect = {
        top: 400,
        left: 800,
        bottom: 440,
        right: 900,
        width: 100,
        height: 40,
        x: 800,
        y: 400,
        toJSON: () => ({}),
      };
      triggerElement.getBoundingClientRect = () => centerRect as DOMRect;

      // Simulate resize/scroll triggering updatePosition
      window.dispatchEvent(new Event('resize'));

      tooltipEl = document.querySelector('.aiab-tooltip') as HTMLElement;
      // Should have top, not bottom
      expect(tooltipEl?.classList.contains('aiab-tooltip--top')).toBe(true);
      expect(tooltipEl?.classList.contains('aiab-tooltip--bottom')).toBe(false);
      // Variant must still be intact
      expect(tooltipEl?.classList.contains('aiab-tooltip--primary')).toBe(true);
    });
  });

  describe('Styling', () => {
    it('should set maxWidth', () => {
      const tooltip = new Tooltip(triggerElement, { delay: 0, maxWidth: 200 });
      tooltip.show();

      const tooltipEl = document.querySelector('.aiab-tooltip') as HTMLElement;
      expect(tooltipEl?.style.maxWidth).toBe('200px');
    });

    it('should set zIndex', () => {
      const tooltip = new Tooltip(triggerElement, { delay: 0, zIndex: 9999 });
      tooltip.show();

      const tooltipEl = document.querySelector('.aiab-tooltip') as HTMLElement;
      expect(tooltipEl?.style.zIndex).toBe('9999');
    });
  });

  describe('Trigger Events', () => {
    it('should show on mouseenter for hover trigger', () => {
      new Tooltip(triggerElement, { delay: 0 });
      triggerElement.dispatchEvent(new MouseEvent('mouseenter'));

      const tooltipEl = document.querySelector('.aiab-tooltip');
      expect(tooltipEl).toBeTruthy();
    });

    it('should hide on mouseleave for hover trigger', () => {
      const tooltip = new Tooltip(triggerElement, { delay: 0, hideDelay: 0 });
      tooltip.show();
      triggerElement.dispatchEvent(new MouseEvent('mouseleave'));

      const tooltipEl = document.querySelector('.aiab-tooltip');
      expect(tooltipEl?.classList.contains('aiab-tooltip--hidden')).toBe(true);
    });

    it('should show on focus for hover trigger', () => {
      new Tooltip(triggerElement, { delay: 0 });
      triggerElement.dispatchEvent(new Event('focus'));

      const tooltipEl = document.querySelector('.aiab-tooltip');
      expect(tooltipEl).toBeTruthy();
    });

    it('should toggle on click for click trigger', () => {
      new Tooltip(triggerElement, { trigger: 'click', delay: 0 });
      triggerElement.dispatchEvent(new MouseEvent('click'));

      const tooltipEl = document.querySelector('.aiab-tooltip');
      expect(tooltipEl).toBeTruthy();
    });

    it('should show on focus for focus trigger', () => {
      new Tooltip(triggerElement, { trigger: 'focus', delay: 0 });
      triggerElement.dispatchEvent(new Event('focus'));

      const tooltipEl = document.querySelector('.aiab-tooltip');
      expect(tooltipEl).toBeTruthy();
    });

    it('should hide on blur for focus trigger', () => {
      const tooltip = new Tooltip(triggerElement, {
        trigger: 'focus',
        delay: 0,
        hideDelay: 0,
      });
      tooltip.show();
      triggerElement.dispatchEvent(new Event('blur'));

      const tooltipEl = document.querySelector('.aiab-tooltip');
      expect(tooltipEl?.classList.contains('aiab-tooltip--hidden')).toBe(true);
    });
  });

  describe('Keyboard Support', () => {
    it('should hide on Escape key', () => {
      const onHide = mock(() => {});
      const tooltip = new Tooltip(triggerElement, { delay: 0, hideDelay: 0, onHide });
      tooltip.show();

      triggerElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

      expect(onHide).toHaveBeenCalledTimes(1);
    });

    it('should not hide on non-Escape keys', () => {
      const tooltip = new Tooltip(triggerElement, { delay: 0 });
      tooltip.show();

      triggerElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

      const tooltipEl = document.querySelector('.aiab-tooltip');
      expect(tooltipEl?.classList.contains('aiab-tooltip--visible')).toBe(true);
    });
  });

  describe('Content Update', () => {
    it('should update text content', () => {
      const tooltip = new Tooltip(triggerElement, { delay: 0 });
      tooltip.show();
      tooltip.updateContent('New text');

      const tooltipEl = document.querySelector('.aiab-tooltip');
      expect(tooltipEl?.textContent).toBe('New text');
    });

    it('should update options', () => {
      const tooltip = new Tooltip(triggerElement, { delay: 0, variant: 'default' });
      tooltip.show();
      tooltip.updateOptions({ variant: 'success' });

      const tooltipEl = document.querySelector('.aiab-tooltip');
      expect(tooltipEl?.classList.contains('aiab-tooltip--success')).toBe(true);
    });
  });

  describe('Destroy', () => {
    it('should remove from instances map', () => {
      const tooltip = new Tooltip(triggerElement);
      tooltip.destroy();
      expect(Tooltip.getInstance(triggerElement)).toBeUndefined();
    });

    it('should call onDestroy callback', () => {
      const onDestroy = mock(() => {});
      const tooltip = new Tooltip(triggerElement, { onDestroy });
      tooltip.destroy();
      expect(onDestroy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Static Methods', () => {
    it('should get instance from element', () => {
      const tooltip = new Tooltip(triggerElement);
      expect(Tooltip.getInstance(triggerElement)).toBe(tooltip);
    });

    it('should initialize from data attributes', () => {
      Tooltip.initFromData();
      const el = document.getElementById('trigger2') as HTMLElement;
      expect(Tooltip.getInstance(el)).toBeDefined();
    });

    it('should destroy all instances', () => {
      new Tooltip(triggerElement);
      const el = document.getElementById('trigger2') as HTMLElement;
      new Tooltip(el);

      Tooltip.destroyAll();

      expect(Tooltip.getInstance(triggerElement)).toBeUndefined();
      expect(Tooltip.getInstance(el)).toBeUndefined();
    });
  });

  describe('EcommerceTooltips', () => {
    it('should create product info tooltip', () => {
      const tooltip = EcommerceTooltips.productInfo(triggerElement, {
        name: 'Test Product',
        price: '$29.99',
        description: 'A great product',
      });
      expect(tooltip).toBeDefined();
      expect(Tooltip.getInstance(triggerElement)).toBeDefined();
    });

    it('should create stock status tooltip with correct variant', () => {
      // In stock
      const tooltip1 = EcommerceTooltips.stockStatus(triggerElement, 10);
      expect(tooltip1).toBeDefined();

      // Clean up for next test
      tooltip1.destroy();

      // Low stock
      const tooltip2 = EcommerceTooltips.stockStatus(triggerElement, 3);
      expect(tooltip2).toBeDefined();
      tooltip2.destroy();

      // Out of stock
      const tooltip3 = EcommerceTooltips.stockStatus(triggerElement, 0);
      expect(tooltip3).toBeDefined();
    });

    it('should create shipping info tooltip', () => {
      const tooltip = EcommerceTooltips.shippingInfo(triggerElement, {
        method: 'Express',
        cost: '$9.99',
        time: '2-3 days',
      });
      expect(tooltip).toBeDefined();
    });
  });
});
