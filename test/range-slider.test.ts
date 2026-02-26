/**
 * Range Slider Component Tests
 * Tests for single/dual handle modes, keyboard navigation, ARIA attributes,
 * formatting, snap values, and public API
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import '../src/js/range-slider.js';

// biome-ignore lint/suspicious/noExplicitAny: JS component accessed via window global
const RangeSliderClass = (window as any).RangeSlider;

const SLIDER_HTML = `
  <div id="slider-container">
    <input type="range" id="test-slider" min="0" max="100" value="50" step="1">
  </div>
`;

describe('Range Slider Component', () => {
  let input: HTMLInputElement;
  // biome-ignore lint/suspicious/noExplicitAny: JS component instance
  let slider: any;

  beforeEach(() => {
    document.body.innerHTML = SLIDER_HTML;
    input = document.querySelector('#test-slider') as HTMLInputElement;
  });

  afterEach(() => {
    if (slider) {
      slider.destroy();
      slider = null;
    }
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
    it('should hide the original input and create wrapper with track', () => {
      slider = new RangeSliderClass(input);
      expect(input.type).toBe('hidden');
      expect(document.querySelector('.aiab-range-slider')).toBeTruthy();
      expect(document.querySelector('.aiab-range-slider-track')).toBeTruthy();
      expect(document.querySelector('.aiab-range-slider-container')).toBeTruthy();
    });

    it('should create a fill element by default and skip when showFill is false', () => {
      slider = new RangeSliderClass(input);
      expect(document.querySelector('.aiab-range-slider-fill')).toBeTruthy();
      slider.destroy();

      slider = new RangeSliderClass(input, { showFill: false });
      expect(document.querySelector('.aiab-range-slider-fill')).toBeNull();
    });

    it('should create a single handle for default mode', () => {
      slider = new RangeSliderClass(input);
      const handle = document.querySelector('.aiab-range-slider-handle.single') as HTMLElement;
      expect(handle).toBeTruthy();
    });

    it('should read min/max/value/step from input attributes', () => {
      slider = new RangeSliderClass(input);
      expect(slider.options.min).toBe(0);
      expect(slider.options.max).toBe(100);
      expect(slider.options.value).toBe(50);
      expect(slider.options.step).toBe(1);
    });

    it('should allow overriding options via constructor', () => {
      slider = new RangeSliderClass(input, { min: 10, max: 200, value: 75, step: 5 });
      expect(slider.options.min).toBe(10);
      expect(slider.options.max).toBe(200);
      expect(slider.options.value).toBe(75);
      expect(slider.options.step).toBe(5);
    });
  });

  describe('ARIA Attributes', () => {
    it('should set role, tabindex, and aria-value attributes on the handle', () => {
      slider = new RangeSliderClass(input);
      const handle = document.querySelector('.aiab-range-slider-handle') as HTMLElement;
      expect(handle.getAttribute('role')).toBe('slider');
      expect(handle.getAttribute('tabindex')).toBe('0');
      expect(handle.getAttribute('aria-valuemin')).toBe('0');
      expect(handle.getAttribute('aria-valuemax')).toBe('100');
      expect(handle.getAttribute('aria-valuenow')).toBe('50');
    });

    it('should update aria-valuenow when value changes', () => {
      slider = new RangeSliderClass(input);
      slider.setValue(75);
      const handle = document.querySelector('.aiab-range-slider-handle') as HTMLElement;
      expect(handle.getAttribute('aria-valuenow')).toBe('75');
    });
  });

  describe('Tooltip', () => {
    it('should create tooltip by default and update text on value change', () => {
      slider = new RangeSliderClass(input);
      const tooltip = document.querySelector('.aiab-range-slider-tooltip') as HTMLElement;
      expect(tooltip).toBeTruthy();
      slider.setValue(80);
      expect(tooltip.textContent).toBe('80');
    });

    it('should not create tooltip when showTooltip is false', () => {
      slider = new RangeSliderClass(input, { showTooltip: false });
      expect(document.querySelector('.aiab-range-slider-tooltip')).toBeNull();
    });
  });

  describe('Dual Handle Mode', () => {
    it('should create min and max handles with dual class on wrapper', () => {
      slider = new RangeSliderClass(input, { dual: true, values: [20, 80] });
      expect(document.querySelector('.aiab-range-slider-handle.min')).toBeTruthy();
      expect(document.querySelector('.aiab-range-slider-handle.max')).toBeTruthy();
      const wrapper = document.querySelector('.aiab-range-slider') as HTMLElement;
      expect(wrapper.classList.contains('dual')).toBe(true);
    });

    it('should set ARIA attributes on both handles', () => {
      slider = new RangeSliderClass(input, { dual: true, values: [20, 80] });
      const minHandle = document.querySelector('.aiab-range-slider-handle.min') as HTMLElement;
      const maxHandle = document.querySelector('.aiab-range-slider-handle.max') as HTMLElement;
      expect(minHandle.getAttribute('role')).toBe('slider');
      expect(maxHandle.getAttribute('role')).toBe('slider');
      expect(minHandle.getAttribute('aria-valuenow')).toBe('20');
      expect(maxHandle.getAttribute('aria-valuenow')).toBe('80');
    });

    it('should return array from getValue() and update via setValues()', () => {
      slider = new RangeSliderClass(input, { dual: true, values: [20, 80] });
      const value = slider.getValue();
      expect(Array.isArray(value)).toBe(true);
      expect(value[0]).toBe(20);
      expect(value[1]).toBe(80);

      slider.setValues([30, 70]);
      const updated = slider.getValue();
      expect(updated[0]).toBe(30);
      expect(updated[1]).toBe(70);
    });

    it('should enforce gap between handles', () => {
      slider = new RangeSliderClass(input, { dual: true, values: [50, 55], gap: 10 });
      const value = slider.getValue();
      expect(value[1] - value[0]).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should decrease value on ArrowLeft and increase on ArrowRight', () => {
      slider = new RangeSliderClass(input, { value: 50 });
      const handle = document.querySelector('.aiab-range-slider-handle') as HTMLElement;

      handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      expect(slider.state.value).toBe(49);

      handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      expect(slider.state.value).toBe(50);
    });

    it('should jump to min on Home and max on End', () => {
      slider = new RangeSliderClass(input, { value: 50 });
      const handle = document.querySelector('.aiab-range-slider-handle') as HTMLElement;

      handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
      expect(slider.state.value).toBe(0);

      handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
      expect(slider.state.value).toBe(100);
    });

    it('should clamp to min/max bounds', () => {
      slider = new RangeSliderClass(input, { value: 0 });
      const handle = document.querySelector('.aiab-range-slider-handle') as HTMLElement;
      handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      expect(slider.state.value).toBe(0);

      slider.setValue(100);
      handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      expect(slider.state.value).toBe(100);
    });

    it('should step by 10x with Shift+Arrow', () => {
      slider = new RangeSliderClass(input, { value: 50, step: 1 });
      const handle = document.querySelector('.aiab-range-slider-handle') as HTMLElement;
      handle.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          shiftKey: true,
          bubbles: true,
        }),
      );
      expect(slider.state.value).toBe(60);
    });
  });

  describe('Value Formatting', () => {
    it('should format value with prefix and suffix', () => {
      slider = new RangeSliderClass(input, { prefix: '$', suffix: 'k' });
      expect(slider.formatValue(50)).toBe('$50k');
    });

    it('should apply custom format function', () => {
      // biome-ignore lint/suspicious/noExplicitAny: custom format function
      slider = new RangeSliderClass(input, { format: (v: any) => `${v} units` });
      expect(slider.formatValue(50)).toBe('50 units');
    });
  });

  describe('Scale, Ticks, and Labels', () => {
    it('should create scale labels when showScale is true', () => {
      slider = new RangeSliderClass(input, { showScale: true, scaleSteps: 5 });
      const scaleLabels = document.querySelectorAll('.aiab-range-slider-scale-label');
      expect(scaleLabels.length).toBe(6); // 5 steps + 1 for start
    });

    it('should create tick marks when showTicks is true', () => {
      slider = new RangeSliderClass(input, { showTicks: true, tickSteps: 10 });
      const ticks = document.querySelectorAll('.aiab-range-slider-tick');
      expect(ticks.length).toBe(11); // 0,10,20,...,100
    });

    it('should create min/max labels when showLabels is true', () => {
      slider = new RangeSliderClass(input, { showLabels: true });
      const labels = document.querySelector('.aiab-range-slider-labels') as HTMLElement;
      expect(labels).toBeTruthy();
      expect(labels.querySelector('.aiab-range-slider-label.min')).toBeTruthy();
      expect(labels.querySelector('.aiab-range-slider-label.max')).toBeTruthy();
    });
  });

  describe('Snap Values', () => {
    it('should find closest snap value', () => {
      slider = new RangeSliderClass(input, { snap: true, snapValues: [0, 25, 50, 75, 100] });
      expect(slider.findClosestSnap(27)).toBe(25);
      expect(slider.findClosestSnap(50)).toBe(50);
    });
  });

  describe('Public API', () => {
    it('should get and set value correctly', () => {
      slider = new RangeSliderClass(input, { value: 42 });
      expect(slider.getValue()).toBe(42);
      slider.setValue(75);
      expect(slider.state.value).toBe(75);
    });

    it('should clamp value to min/max range in setValue()', () => {
      slider = new RangeSliderClass(input);
      slider.setValue(200);
      expect(slider.state.value).toBe(100);
      slider.setValue(-50);
      expect(slider.state.value).toBe(0);
    });

    it('should disable and enable the slider', () => {
      slider = new RangeSliderClass(input);
      slider.disable();
      const wrapper = document.querySelector('.aiab-range-slider') as HTMLElement;
      const handle = document.querySelector('.aiab-range-slider-handle') as HTMLElement;
      expect(wrapper.classList.contains('disabled')).toBe(true);
      expect(handle.getAttribute('disabled')).toBe('true');

      slider.enable();
      expect(wrapper.classList.contains('disabled')).toBe(false);
      expect(handle.getAttribute('disabled')).toBeNull();
    });

    it('should update min and max with setMin/setMax', () => {
      slider = new RangeSliderClass(input);
      slider.setMin(20);
      expect(slider.options.min).toBe(20);
      slider.setMax(200);
      expect(slider.options.max).toBe(200);
    });
  });

  describe('Callbacks', () => {
    it('should call onChange when value changes', () => {
      let changedValue = null;
      slider = new RangeSliderClass(input, {
        value: 50,
        // biome-ignore lint/suspicious/noExplicitAny: callback value
        onChange: (v: any) => {
          changedValue = v;
        },
      });
      slider.setValue(75);
      expect(changedValue).toBe(75);
    });

    it('should call onChange with array in dual mode', () => {
      // biome-ignore lint/suspicious/noExplicitAny: callback value
      let changedValue: any = null;
      slider = new RangeSliderClass(input, {
        dual: true,
        values: [20, 80],
        // biome-ignore lint/suspicious/noExplicitAny: callback value
        onChange: (v: any) => {
          changedValue = v;
        },
      });
      slider.setValues([30, 70]);
      expect(Array.isArray(changedValue)).toBe(true);
      expect(changedValue[0]).toBe(30);
      expect(changedValue[1]).toBe(70);
    });
  });

  describe('Focus and Orientation', () => {
    it('should add/remove focused class on handle focus/blur', () => {
      slider = new RangeSliderClass(input);
      const handle = document.querySelector('.aiab-range-slider-handle') as HTMLElement;
      handle.dispatchEvent(new Event('focus'));
      expect(handle.classList.contains('focused')).toBe(true);
      handle.dispatchEvent(new Event('blur'));
      expect(handle.classList.contains('focused')).toBe(false);
    });

    it('should set orientation class on wrapper', () => {
      slider = new RangeSliderClass(input);
      expect(
        (document.querySelector('.aiab-range-slider') as HTMLElement).classList.contains(
          'horizontal',
        ),
      ).toBe(true);
      slider.destroy();

      slider = new RangeSliderClass(input, { orientation: 'vertical' });
      expect(
        (document.querySelector('.aiab-range-slider') as HTMLElement).classList.contains(
          'vertical',
        ),
      ).toBe(true);
    });
  });

  describe('Destroy / Cleanup', () => {
    it('should restore input, remove wrapper, and clear handlers/timers', () => {
      slider = new RangeSliderClass(input);
      slider.destroy();
      expect(input.type).toBe('range');
      expect(document.querySelector('.aiab-range-slider')).toBeNull();
      expect(slider.handlers.size).toBe(0);
      expect(slider.timers.size).toBe(0);
      slider = null;
    });
  });
});
