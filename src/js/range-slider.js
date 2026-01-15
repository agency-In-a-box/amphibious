/**
 * Range Slider Component
 * Advanced slider with single/dual handles, scales, and custom formatting
 * Part of Amphibious 2.0 Component Library
 *
 * Features:
 * - Single or dual handle modes
 * - Custom scales and labels
 * - Snap to values
 * - Tooltips with formatting
 * - Keyboard navigation
 * - Touch support
 * - Vertical orientation option
 */

class RangeSlider {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      // Basic options
      min: options.min !== undefined ? options.min : parseFloat(element.min) || 0,
      max: options.max !== undefined ? options.max : parseFloat(element.max) || 100,
      step: options.step !== undefined ? options.step : parseFloat(element.step) || 1,
      value: options.value || parseFloat(element.value) || 0,

      // Dual handle mode
      dual: options.dual || false,
      values: options.values || [20, 80],
      gap: options.gap || 0, // Minimum gap between handles

      // UI options
      orientation: options.orientation || 'horizontal', // horizontal, vertical
      showTooltip: options.showTooltip !== false,
      showScale: options.showScale || false,
      showLabels: options.showLabels || false,
      showTicks: options.showTicks || false,
      showFill: options.showFill !== false,

      // Scale options
      scaleSteps: options.scaleSteps || 5,
      tickSteps: options.tickSteps || 10,

      // Snap options
      snap: options.snap || false,
      snapValues: options.snapValues || [],

      // Formatting
      format: options.format || ((value) => value.toString()),
      prefix: options.prefix || '',
      suffix: options.suffix || '',

      // Colors
      fillColor: options.fillColor || 'var(--apple-orange-500, #ed8b00)',
      trackColor: options.trackColor || 'var(--apple-gray-200, #e0e0e0)',

      // Labels
      labels: options.labels || {},

      // Callbacks
      onChange: options.onChange || null,
      onSlide: options.onSlide || null,
      onStart: options.onStart || null,
      onEnd: options.onEnd || null,

      ...options
    };

    // State
    this.state = {
      isDragging: false,
      activeHandle: null,
      value: this.options.value,
      values: [...this.options.values],
      lastEmittedValue: null,
      lastEmittedValues: null
    };

    // Track resources for cleanup
    this.handlers = new Map();
    this.timers = new Set();
    this.createdElements = new Set();
    this.rafId = null;

    this.init();
  }

  init() {
    this.setupDOM();
    this.attachEvents();
    this.updateUI();

    // Set initial value
    if (this.options.dual) {
      this.setValues(this.options.values);
    } else {
      this.setValue(this.options.value);
    }
  }

  setupDOM() {
    // Hide original input
    this.element.type = 'hidden';

    // Create wrapper
    this.wrapper = document.createElement('div');
    this.wrapper.className = `range-slider ${this.options.orientation}`;
    if (this.options.dual) {
      this.wrapper.classList.add('dual');
    }

    // Create container
    this.container = document.createElement('div');
    this.container.className = 'range-slider-container';

    // Create track
    this.track = document.createElement('div');
    this.track.className = 'range-slider-track';
    this.track.style.background = this.options.trackColor;

    // Create fill
    if (this.options.showFill) {
      this.fill = document.createElement('div');
      this.fill.className = 'range-slider-fill';
      this.fill.style.background = this.options.fillColor;
      this.track.appendChild(this.fill);
    }

    // Create ticks
    if (this.options.showTicks) {
      this.createTicks();
    }

    // Create handles
    if (this.options.dual) {
      // Create two handles for dual mode
      this.handleMin = this.createHandle('min');
      this.handleMax = this.createHandle('max');
      this.track.appendChild(this.handleMin);
      this.track.appendChild(this.handleMax);
    } else {
      // Create single handle
      this.handle = this.createHandle('single');
      this.track.appendChild(this.handle);
    }

    this.container.appendChild(this.track);

    // Create scale
    if (this.options.showScale) {
      this.scale = this.createScale();
      this.container.appendChild(this.scale);
    }

    // Create labels
    if (this.options.showLabels) {
      this.labels = this.createLabels();
      this.wrapper.appendChild(this.labels);
    }

    this.wrapper.appendChild(this.container);

    // Create value display
    if (!this.options.dual && this.options.showValue !== false) {
      this.valueDisplay = document.createElement('div');
      this.valueDisplay.className = 'range-slider-value';
      this.wrapper.appendChild(this.valueDisplay);
      this.createdElements.add(this.valueDisplay);
    }

    // Insert into DOM
    this.element.parentNode.insertBefore(this.wrapper, this.element.nextSibling);
    this.createdElements.add(this.wrapper);
  }

  createHandle(type) {
    const handle = document.createElement('div');
    handle.className = `range-slider-handle ${type}`;
    handle.setAttribute('role', 'slider');
    handle.setAttribute('tabindex', '0');
    handle.setAttribute('aria-valuemin', this.options.min);
    handle.setAttribute('aria-valuemax', this.options.max);
    handle.setAttribute('aria-valuenow', this.options.value);

    if (this.options.showTooltip) {
      const tooltip = document.createElement('div');
      tooltip.className = 'range-slider-tooltip';
      handle.appendChild(tooltip);
    }

    this.createdElements.add(handle);
    return handle;
  }

  createTicks() {
    const tickContainer = document.createElement('div');
    tickContainer.className = 'range-slider-ticks';

    const range = this.options.max - this.options.min;
    const tickCount = Math.floor(range / this.options.tickSteps) + 1;

    for (let i = 0; i < tickCount; i++) {
      const tick = document.createElement('div');
      tick.className = 'range-slider-tick';

      const value = this.options.min + (i * this.options.tickSteps);
      const percent = ((value - this.options.min) / range) * 100;

      if (this.options.orientation === 'vertical') {
        tick.style.bottom = `${percent}%`;
      } else {
        tick.style.left = `${percent}%`;
      }

      tickContainer.appendChild(tick);
    }

    this.track.appendChild(tickContainer);
    this.createdElements.add(tickContainer);
  }

  createScale() {
    const scale = document.createElement('div');
    scale.className = 'range-slider-scale';

    const range = this.options.max - this.options.min;
    const stepSize = range / this.options.scaleSteps;

    for (let i = 0; i <= this.options.scaleSteps; i++) {
      const value = this.options.min + (i * stepSize);
      const label = document.createElement('div');
      label.className = 'range-slider-scale-label';

      // Format the label
      const formattedValue = this.formatValue(value);
      label.textContent = formattedValue;

      const percent = ((value - this.options.min) / range) * 100;

      if (this.options.orientation === 'vertical') {
        label.style.bottom = `${percent}%`;
      } else {
        label.style.left = `${percent}%`;
      }

      scale.appendChild(label);
    }

    this.createdElements.add(scale);
    return scale;
  }

  createLabels() {
    const labels = document.createElement('div');
    labels.className = 'range-slider-labels';

    const minLabel = document.createElement('div');
    minLabel.className = 'range-slider-label min';
    minLabel.textContent = this.options.labels.min || this.formatValue(this.options.min);

    const maxLabel = document.createElement('div');
    maxLabel.className = 'range-slider-label max';
    maxLabel.textContent = this.options.labels.max || this.formatValue(this.options.max);

    labels.appendChild(minLabel);
    labels.appendChild(maxLabel);

    this.createdElements.add(labels);
    return labels;
  }

  attachEvents() {
    // Track events
    const trackHandler = (e) => this.handleTrackClick(e);
    this.track.addEventListener('click', trackHandler);
    this.handlers.set('track-click', { element: this.track, type: 'click', handler: trackHandler });

    // Handle events
    if (this.options.dual) {
      this.attachHandleEvents(this.handleMin, 'min');
      this.attachHandleEvents(this.handleMax, 'max');
    } else {
      this.attachHandleEvents(this.handle, 'single');
    }

    // Keyboard events
    const keyHandler = (e) => this.handleKeyboard(e);
    this.wrapper.addEventListener('keydown', keyHandler);
    this.handlers.set('keyboard', { element: this.wrapper, type: 'keydown', handler: keyHandler });

    // Window resize
    const resizeHandler = () => this.handleResize();
    window.addEventListener('resize', resizeHandler);
    this.handlers.set('resize', { element: window, type: 'resize', handler: resizeHandler });
  }

  attachHandleEvents(handle, type) {
    // Mouse events
    const mouseDownHandler = (e) => this.handleStart(e, type);
    handle.addEventListener('mousedown', mouseDownHandler);
    this.handlers.set(`${type}-mousedown`, { element: handle, type: 'mousedown', handler: mouseDownHandler });

    // Touch events
    const touchStartHandler = (e) => this.handleStart(e, type);
    handle.addEventListener('touchstart', touchStartHandler, { passive: false });
    this.handlers.set(`${type}-touchstart`, { element: handle, type: 'touchstart', handler: touchStartHandler });

    // Focus events for accessibility
    const focusHandler = () => handle.classList.add('focused');
    const blurHandler = () => handle.classList.remove('focused');
    handle.addEventListener('focus', focusHandler);
    handle.addEventListener('blur', blurHandler);
    this.handlers.set(`${type}-focus`, { element: handle, type: 'focus', handler: focusHandler });
    this.handlers.set(`${type}-blur`, { element: handle, type: 'blur', handler: blurHandler });
  }

  handleStart(e, handleType) {
    e.preventDefault();
    e.stopPropagation();

    this.state.isDragging = true;
    this.state.activeHandle = handleType;

    const handle = handleType === 'min' ? this.handleMin :
                   handleType === 'max' ? this.handleMax : this.handle;
    handle.classList.add('active');

    // Get track dimensions
    this.trackRect = this.track.getBoundingClientRect();

    // Attach move and end events
    const moveHandler = (e) => this.handleMove(e);
    const endHandler = (e) => this.handleEnd(e);

    if (e.type === 'mousedown') {
      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', endHandler);
    } else {
      document.addEventListener('touchmove', moveHandler, { passive: false });
      document.addEventListener('touchend', endHandler);
    }

    // Store handlers for cleanup
    this.moveHandler = moveHandler;
    this.endHandler = endHandler;

    // Trigger start callback
    if (this.options.onStart) {
      const value = this.options.dual ? this.state.values : this.state.value;
      this.options.onStart(value);
    }
  }

  handleMove(e) {
    if (!this.state.isDragging) return;
    e.preventDefault();

    // Use RAF for smooth updates
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    this.rafId = requestAnimationFrame(() => {
      const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

      let percent;
      if (this.options.orientation === 'vertical') {
        const y = this.trackRect.bottom - clientY;
        percent = Math.max(0, Math.min(100, (y / this.trackRect.height) * 100));
      } else {
        const x = clientX - this.trackRect.left;
        percent = Math.max(0, Math.min(100, (x / this.trackRect.width) * 100));
      }

      const range = this.options.max - this.options.min;
      let value = this.options.min + (percent / 100) * range;

      // Apply step
      if (this.options.step) {
        value = Math.round(value / this.options.step) * this.options.step;
      }

      // Apply snap
      if (this.options.snap && this.options.snapValues.length) {
        value = this.findClosestSnap(value);
      }

      // Update value based on handle type
      if (this.options.dual) {
        if (this.state.activeHandle === 'min') {
          value = Math.min(value, this.state.values[1] - this.options.gap);
          this.state.values[0] = value;
        } else {
          value = Math.max(value, this.state.values[0] + this.options.gap);
          this.state.values[1] = value;
        }
      } else {
        this.state.value = value;
      }

      // Update UI
      this.updateUI();

      // Trigger slide callback
      if (this.options.onSlide) {
        const callbackValue = this.options.dual ? [...this.state.values] : this.state.value;
        this.options.onSlide(callbackValue);
      }
    });
  }

  handleEnd(e) {
    if (!this.state.isDragging) return;

    this.state.isDragging = false;
    this.state.activeHandle = null;

    // Remove active class
    if (this.options.dual) {
      this.handleMin.classList.remove('active');
      this.handleMax.classList.remove('active');
    } else {
      this.handle.classList.remove('active');
    }

    // Remove event listeners
    document.removeEventListener('mousemove', this.moveHandler);
    document.removeEventListener('mouseup', this.endHandler);
    document.removeEventListener('touchmove', this.moveHandler);
    document.removeEventListener('touchend', this.endHandler);

    // Cancel RAF
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // Update value and trigger callbacks
    if (this.options.dual) {
      this.updateValue(this.state.values);
    } else {
      this.updateValue(this.state.value);
    }

    // Trigger end callback
    if (this.options.onEnd) {
      const value = this.options.dual ? [...this.state.values] : this.state.value;
      this.options.onEnd(value);
    }
  }

  handleTrackClick(e) {
    if (this.state.isDragging) return;
    if (e.target.classList.contains('range-slider-handle')) return;

    const rect = this.track.getBoundingClientRect();
    let percent;

    if (this.options.orientation === 'vertical') {
      const y = rect.bottom - e.clientY;
      percent = Math.max(0, Math.min(100, (y / rect.height) * 100));
    } else {
      const x = e.clientX - rect.left;
      percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    }

    const range = this.options.max - this.options.min;
    let value = this.options.min + (percent / 100) * range;

    // Apply step
    if (this.options.step) {
      value = Math.round(value / this.options.step) * this.options.step;
    }

    // Apply snap
    if (this.options.snap && this.options.snapValues.length) {
      value = this.findClosestSnap(value);
    }

    // In dual mode, move closest handle
    if (this.options.dual) {
      const distToMin = Math.abs(value - this.state.values[0]);
      const distToMax = Math.abs(value - this.state.values[1]);

      if (distToMin < distToMax) {
        this.state.values[0] = Math.min(value, this.state.values[1] - this.options.gap);
      } else {
        this.state.values[1] = Math.max(value, this.state.values[0] + this.options.gap);
      }

      this.updateValue(this.state.values);
    } else {
      this.state.value = value;
      this.updateValue(value);
    }

    this.updateUI();
  }

  handleKeyboard(e) {
    const handle = e.target;
    if (!handle.classList.contains('range-slider-handle')) return;

    let value;
    let step = e.shiftKey ? this.options.step * 10 : this.options.step;

    if (this.options.dual) {
      const isMin = handle.classList.contains('min');
      const currentValue = isMin ? this.state.values[0] : this.state.values[1];

      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault();
          value = Math.max(this.options.min, currentValue - step);
          if (isMin) {
            value = Math.min(value, this.state.values[1] - this.options.gap);
            this.state.values[0] = value;
          } else {
            value = Math.max(value, this.state.values[0] + this.options.gap);
            this.state.values[1] = value;
          }
          break;

        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault();
          value = Math.min(this.options.max, currentValue + step);
          if (isMin) {
            value = Math.min(value, this.state.values[1] - this.options.gap);
            this.state.values[0] = value;
          } else {
            value = Math.max(value, this.state.values[0] + this.options.gap);
            this.state.values[1] = value;
          }
          break;

        case 'Home':
          e.preventDefault();
          if (isMin) {
            this.state.values[0] = this.options.min;
          } else {
            this.state.values[1] = Math.max(this.options.min, this.state.values[0] + this.options.gap);
          }
          break;

        case 'End':
          e.preventDefault();
          if (isMin) {
            this.state.values[0] = Math.min(this.options.max, this.state.values[1] - this.options.gap);
          } else {
            this.state.values[1] = this.options.max;
          }
          break;

        default:
          return;
      }

      this.updateValue(this.state.values);
    } else {
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault();
          value = Math.max(this.options.min, this.state.value - step);
          break;

        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault();
          value = Math.min(this.options.max, this.state.value + step);
          break;

        case 'Home':
          e.preventDefault();
          value = this.options.min;
          break;

        case 'End':
          e.preventDefault();
          value = this.options.max;
          break;

        default:
          return;
      }

      this.state.value = value;
      this.updateValue(value);
    }

    this.updateUI();
  }

  handleResize() {
    // Debounce resize handler
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }

    this.resizeTimer = setTimeout(() => {
      this.updateUI();
    }, 100);

    this.timers.add(this.resizeTimer);
  }

  updateUI() {
    const range = this.options.max - this.options.min;

    if (this.options.dual) {
      // Update min handle
      const minPercent = ((this.state.values[0] - this.options.min) / range) * 100;
      const maxPercent = ((this.state.values[1] - this.options.min) / range) * 100;

      if (this.options.orientation === 'vertical') {
        this.handleMin.style.bottom = `${minPercent}%`;
        this.handleMax.style.bottom = `${maxPercent}%`;
      } else {
        this.handleMin.style.left = `${minPercent}%`;
        this.handleMax.style.left = `${maxPercent}%`;
      }

      // Update fill
      if (this.fill) {
        if (this.options.orientation === 'vertical') {
          this.fill.style.bottom = `${minPercent}%`;
          this.fill.style.height = `${maxPercent - minPercent}%`;
        } else {
          this.fill.style.left = `${minPercent}%`;
          this.fill.style.width = `${maxPercent - minPercent}%`;
        }
      }

      // Update tooltips
      if (this.options.showTooltip) {
        const minTooltip = this.handleMin.querySelector('.range-slider-tooltip');
        const maxTooltip = this.handleMax.querySelector('.range-slider-tooltip');
        if (minTooltip) minTooltip.textContent = this.formatValue(this.state.values[0]);
        if (maxTooltip) maxTooltip.textContent = this.formatValue(this.state.values[1]);
      }

      // Update ARIA
      this.handleMin.setAttribute('aria-valuenow', this.state.values[0]);
      this.handleMax.setAttribute('aria-valuenow', this.state.values[1]);
    } else {
      // Update single handle
      const percent = ((this.state.value - this.options.min) / range) * 100;

      if (this.options.orientation === 'vertical') {
        this.handle.style.bottom = `${percent}%`;
      } else {
        this.handle.style.left = `${percent}%`;
      }

      // Update fill
      if (this.fill) {
        if (this.options.orientation === 'vertical') {
          this.fill.style.height = `${percent}%`;
        } else {
          this.fill.style.width = `${percent}%`;
        }
      }

      // Update tooltip
      if (this.options.showTooltip) {
        const tooltip = this.handle.querySelector('.range-slider-tooltip');
        if (tooltip) tooltip.textContent = this.formatValue(this.state.value);
      }

      // Update value display
      if (this.valueDisplay) {
        this.valueDisplay.textContent = this.formatValue(this.state.value);
      }

      // Update ARIA
      this.handle.setAttribute('aria-valuenow', this.state.value);
    }
  }

  updateValue(value) {
    if (this.options.dual) {
      // Check if values actually changed
      if (JSON.stringify(value) === JSON.stringify(this.state.lastEmittedValues)) {
        return;
      }

      this.state.lastEmittedValues = [...value];
      this.element.value = value.join(',');

      // Trigger change callback
      if (this.options.onChange) {
        this.options.onChange([...value]);
      }
    } else {
      // Check if value actually changed
      if (value === this.state.lastEmittedValue) {
        return;
      }

      this.state.lastEmittedValue = value;
      this.element.value = value;

      // Trigger change callback
      if (this.options.onChange) {
        this.options.onChange(value);
      }
    }

    // Dispatch native change event
    this.element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  formatValue(value) {
    // Round to step precision
    const precision = this.options.step < 1 ?
      this.options.step.toString().split('.')[1]?.length || 0 : 0;

    value = parseFloat(value.toFixed(precision));

    // Apply custom formatter
    let formatted = this.options.format(value);

    // Add prefix/suffix
    if (this.options.prefix) formatted = this.options.prefix + formatted;
    if (this.options.suffix) formatted = formatted + this.options.suffix;

    return formatted;
  }

  findClosestSnap(value) {
    if (!this.options.snapValues.length) return value;

    let closest = this.options.snapValues[0];
    let minDiff = Math.abs(value - closest);

    for (let snapValue of this.options.snapValues) {
      const diff = Math.abs(value - snapValue);
      if (diff < minDiff) {
        minDiff = diff;
        closest = snapValue;
      }
    }

    return closest;
  }

  // Public API
  getValue() {
    return this.options.dual ? [...this.state.values] : this.state.value;
  }

  setValue(value) {
    if (this.options.dual) {
      console.warn('Use setValues() for dual handle sliders');
      return;
    }

    value = Math.max(this.options.min, Math.min(this.options.max, value));
    this.state.value = value;
    this.updateUI();
    this.updateValue(value);
  }

  setValues(values) {
    if (!this.options.dual) {
      console.warn('Use setValue() for single handle sliders');
      return;
    }

    if (!Array.isArray(values) || values.length !== 2) {
      console.warn('Values must be an array of two numbers');
      return;
    }

    this.state.values[0] = Math.max(this.options.min, Math.min(values[0], this.options.max));
    this.state.values[1] = Math.max(this.options.min, Math.min(values[1], this.options.max));

    // Enforce gap
    if (this.state.values[1] - this.state.values[0] < this.options.gap) {
      this.state.values[1] = this.state.values[0] + this.options.gap;
    }

    this.updateUI();
    this.updateValue(this.state.values);
  }

  setMin(min) {
    this.options.min = min;
    this.updateUI();
  }

  setMax(max) {
    this.options.max = max;
    this.updateUI();
  }

  disable() {
    this.wrapper.classList.add('disabled');
    if (this.options.dual) {
      this.handleMin.setAttribute('disabled', 'true');
      this.handleMax.setAttribute('disabled', 'true');
    } else {
      this.handle.setAttribute('disabled', 'true');
    }
  }

  enable() {
    this.wrapper.classList.remove('disabled');
    if (this.options.dual) {
      this.handleMin.removeAttribute('disabled');
      this.handleMax.removeAttribute('disabled');
    } else {
      this.handle.removeAttribute('disabled');
    }
  }

  destroy() {
    // Cancel animation frame
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    // Remove event listeners
    this.handlers.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    this.handlers.clear();

    // Clear timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();

    // Remove created elements
    this.createdElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.createdElements.clear();

    // Restore original input
    this.element.type = 'range';
  }
}

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-range-slider]').forEach(element => {
    new RangeSlider(element);
  });
});

// Register with component registry if available
if (window.AmphibiousRegistry) {
  window.AmphibiousRegistry.registerComponent('range-slider', RangeSlider);
}

// Export
window.RangeSlider = RangeSlider;
export default RangeSlider;