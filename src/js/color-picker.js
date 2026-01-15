/**
 * Color Picker Component
 * A comprehensive color selection tool with multiple input methods
 * Part of Amphibious 2.0 Component Library
 *
 * Features:
 * - Visual color spectrum picker
 * - RGB/HSL/HEX input modes
 * - Preset color palettes
 * - Recently used colors
 * - Eyedropper tool (where supported)
 * - Alpha channel support
 * - Accessible keyboard navigation
 */

class ColorPicker {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      // Basic options
      value: options.value || element.value || '#ED8B00',
      format: options.format || 'hex', // hex, rgb, hsl
      alpha: options.alpha !== false,
      inline: options.inline || false,

      // Preset colors
      presets: options.presets || [
        '#ED8B00',
        '#FF6900',
        '#FCB900',
        '#7BDCB5',
        '#00D084',
        '#8ED1FC',
        '#0693E3',
        '#ABB8C3',
        '#EB144C',
        '#F78DA7',
        '#9900EF',
        '#000000',
        '#FFFFFF',
      ],

      // Swatches
      showPresets: options.showPresets !== false,
      showRecent: options.showRecent !== false,
      maxRecent: options.maxRecent || 8,

      // UI options
      showInput: options.showInput !== false,
      showButtons: options.showButtons !== false,
      closeOnSelect: options.closeOnSelect !== false,
      eyeDropper: options.eyeDropper !== false && 'EyeDropper' in window,

      // Labels
      labels: {
        pick: options.labels?.pick || 'Pick Color',
        save: options.labels?.save || 'Save',
        cancel: options.labels?.cancel || 'Cancel',
        eyeDropper: options.labels?.eyeDropper || 'Pick from screen',
        ...options.labels,
      },

      // Callbacks
      onChange: options.onChange || null,
      onSave: options.onSave || null,
      onCancel: options.onCancel || null,

      ...options,
    };

    // State
    this.state = {
      isOpen: false,
      color: this.parseColor(this.options.value),
      recentColors: this.loadRecentColors(),
      isDragging: false,
      activeInput: 'hex',
    };

    // Track resources for cleanup
    this.handlers = new Map();
    this.timers = new Set();
    this.createdElements = new Set();

    this.init();
  }

  init() {
    this.setupDOM();
    this.attachEvents();
    this.updateUI();

    // Set initial value
    if (this.element.value) {
      this.setValue(this.element.value);
    }
  }

  setupDOM() {
    // Hide original input if not inline
    if (!this.options.inline) {
      this.element.type = 'hidden';
    }

    // Create wrapper
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'color-picker-wrapper';
    if (this.options.inline) {
      this.wrapper.classList.add('inline');
    }

    // Create trigger button (for non-inline mode)
    if (!this.options.inline) {
      this.trigger = document.createElement('button');
      this.trigger.className = 'color-picker-trigger';
      this.trigger.type = 'button';
      this.trigger.innerHTML = `
        <span class="color-preview"></span>
        <span class="color-value">${this.formatColor(this.state.color)}</span>
      `;
      this.wrapper.appendChild(this.trigger);
      this.createdElements.add(this.trigger);
    }

    // Create picker container
    this.picker = document.createElement('div');
    this.picker.className = 'color-picker';
    if (!this.options.inline) {
      this.picker.classList.add('dropdown');
    }

    // Build picker UI
    this.picker.innerHTML = `
      <div class="color-picker-header">
        ${
          this.options.eyeDropper
            ? `
          <button type="button" class="eyedropper-btn" title="${this.options.labels.eyeDropper}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M15 15l-2 5L9 9l11 4-5 2z"/>
            </svg>
          </button>
        `
            : ''
        }
      </div>

      <div class="color-picker-body">
        <!-- Color spectrum -->
        <div class="color-spectrum-wrapper">
          <div class="color-spectrum">
            <div class="spectrum-cursor"></div>
          </div>
        </div>

        <!-- Hue slider -->
        <div class="hue-slider-wrapper">
          <div class="hue-slider">
            <div class="hue-cursor"></div>
          </div>
        </div>

        ${
          this.options.alpha
            ? `
          <!-- Alpha slider -->
          <div class="alpha-slider-wrapper">
            <div class="alpha-slider">
              <div class="alpha-cursor"></div>
            </div>
          </div>
        `
            : ''
        }

        <!-- Color inputs -->
        ${
          this.options.showInput
            ? `
          <div class="color-inputs">
            <div class="input-tabs">
              <button type="button" class="tab-btn active" data-format="hex">HEX</button>
              <button type="button" class="tab-btn" data-format="rgb">RGB</button>
              <button type="button" class="tab-btn" data-format="hsl">HSL</button>
            </div>

            <div class="input-fields">
              <!-- HEX input -->
              <div class="input-group active" data-format="hex">
                <input type="text" class="hex-input" placeholder="#000000">
              </div>

              <!-- RGB inputs -->
              <div class="input-group" data-format="rgb">
                <div class="field">
                  <label>R</label>
                  <input type="number" class="r-input" min="0" max="255">
                </div>
                <div class="field">
                  <label>G</label>
                  <input type="number" class="g-input" min="0" max="255">
                </div>
                <div class="field">
                  <label>B</label>
                  <input type="number" class="b-input" min="0" max="255">
                </div>
                ${
                  this.options.alpha
                    ? `
                  <div class="field">
                    <label>A</label>
                    <input type="number" class="a-input" min="0" max="1" step="0.01">
                  </div>
                `
                    : ''
                }
              </div>

              <!-- HSL inputs -->
              <div class="input-group" data-format="hsl">
                <div class="field">
                  <label>H</label>
                  <input type="number" class="h-input" min="0" max="360">
                </div>
                <div class="field">
                  <label>S</label>
                  <input type="number" class="s-input" min="0" max="100">
                </div>
                <div class="field">
                  <label>L</label>
                  <input type="number" class="l-input" min="0" max="100">
                </div>
                ${
                  this.options.alpha
                    ? `
                  <div class="field">
                    <label>A</label>
                    <input type="number" class="a2-input" min="0" max="1" step="0.01">
                  </div>
                `
                    : ''
                }
              </div>
            </div>
          </div>
        `
            : ''
        }

        <!-- Preset colors -->
        ${
          this.options.showPresets
            ? `
          <div class="color-presets">
            <div class="preset-label">Presets</div>
            <div class="preset-colors">
              ${this.options.presets
                .map(
                  (color) => `
                <button type="button" class="color-swatch" data-color="${color}" style="background: ${color}"></button>
              `,
                )
                .join('')}
            </div>
          </div>
        `
            : ''
        }

        <!-- Recent colors -->
        ${
          this.options.showRecent && this.state.recentColors.length > 0
            ? `
          <div class="color-recent">
            <div class="recent-label">Recent</div>
            <div class="recent-colors">
              ${this.state.recentColors
                .map(
                  (color) => `
                <button type="button" class="color-swatch" data-color="${color}" style="background: ${color}"></button>
              `,
                )
                .join('')}
            </div>
          </div>
        `
            : ''
        }
      </div>

      <!-- Buttons -->
      ${
        this.options.showButtons && !this.options.inline
          ? `
        <div class="color-picker-footer">
          <button type="button" class="btn-cancel">${this.options.labels.cancel}</button>
          <button type="button" class="btn-save">${this.options.labels.save}</button>
        </div>
      `
          : ''
      }
    `;

    this.wrapper.appendChild(this.picker);
    this.createdElements.add(this.picker);

    // Get references to elements
    this.spectrum = this.picker.querySelector('.color-spectrum');
    this.spectrumCursor = this.picker.querySelector('.spectrum-cursor');
    this.hueSlider = this.picker.querySelector('.hue-slider');
    this.hueCursor = this.picker.querySelector('.hue-cursor');

    if (this.options.alpha) {
      this.alphaSlider = this.picker.querySelector('.alpha-slider');
      this.alphaCursor = this.picker.querySelector('.alpha-cursor');
    }

    // Insert into DOM
    this.element.parentNode.insertBefore(this.wrapper, this.element.nextSibling);
    this.createdElements.add(this.wrapper);

    // Show picker if inline
    if (this.options.inline) {
      this.picker.style.display = 'block';
      this.state.isOpen = true;
    }
  }

  attachEvents() {
    // Trigger button
    if (this.trigger) {
      const triggerHandler = () => this.toggle();
      this.trigger.addEventListener('click', triggerHandler);
      this.handlers.set('trigger-click', {
        element: this.trigger,
        type: 'click',
        handler: triggerHandler,
      });
    }

    // Spectrum interaction
    const spectrumMouseDown = (e) => this.handleSpectrumStart(e);
    this.spectrum.addEventListener('mousedown', spectrumMouseDown);
    this.handlers.set('spectrum-mousedown', {
      element: this.spectrum,
      type: 'mousedown',
      handler: spectrumMouseDown,
    });

    // Hue slider interaction
    const hueMouseDown = (e) => this.handleHueStart(e);
    this.hueSlider.addEventListener('mousedown', hueMouseDown);
    this.handlers.set('hue-mousedown', {
      element: this.hueSlider,
      type: 'mousedown',
      handler: hueMouseDown,
    });

    // Alpha slider interaction
    if (this.alphaSlider) {
      const alphaMouseDown = (e) => this.handleAlphaStart(e);
      this.alphaSlider.addEventListener('mousedown', alphaMouseDown);
      this.handlers.set('alpha-mousedown', {
        element: this.alphaSlider,
        type: 'mousedown',
        handler: alphaMouseDown,
      });
    }

    // Input tabs
    const tabBtns = this.picker.querySelectorAll('.tab-btn');
    tabBtns.forEach((btn, index) => {
      const tabHandler = () => this.switchInputMode(btn.dataset.format);
      btn.addEventListener('click', tabHandler);
      this.handlers.set(`tab-${index}`, { element: btn, type: 'click', handler: tabHandler });
    });

    // Color inputs
    this.attachInputEvents();

    // Preset swatches
    const presetSwatches = this.picker.querySelectorAll('.preset-colors .color-swatch');
    presetSwatches.forEach((swatch, index) => {
      const swatchHandler = () => this.selectColor(swatch.dataset.color);
      swatch.addEventListener('click', swatchHandler);
      this.handlers.set(`preset-${index}`, {
        element: swatch,
        type: 'click',
        handler: swatchHandler,
      });
    });

    // Recent swatches
    const recentSwatches = this.picker.querySelectorAll('.recent-colors .color-swatch');
    recentSwatches.forEach((swatch, index) => {
      const swatchHandler = () => this.selectColor(swatch.dataset.color);
      swatch.addEventListener('click', swatchHandler);
      this.handlers.set(`recent-${index}`, {
        element: swatch,
        type: 'click',
        handler: swatchHandler,
      });
    });

    // Eyedropper
    const eyedropperBtn = this.picker.querySelector('.eyedropper-btn');
    if (eyedropperBtn) {
      const eyedropperHandler = () => this.pickFromScreen();
      eyedropperBtn.addEventListener('click', eyedropperHandler);
      this.handlers.set('eyedropper', {
        element: eyedropperBtn,
        type: 'click',
        handler: eyedropperHandler,
      });
    }

    // Buttons
    const cancelBtn = this.picker.querySelector('.btn-cancel');
    if (cancelBtn) {
      const cancelHandler = () => this.cancel();
      cancelBtn.addEventListener('click', cancelHandler);
      this.handlers.set('cancel', { element: cancelBtn, type: 'click', handler: cancelHandler });
    }

    const saveBtn = this.picker.querySelector('.btn-save');
    if (saveBtn) {
      const saveHandler = () => this.save();
      saveBtn.addEventListener('click', saveHandler);
      this.handlers.set('save', { element: saveBtn, type: 'click', handler: saveHandler });
    }

    // Click outside to close
    if (!this.options.inline) {
      const outsideHandler = (e) => {
        if (!this.wrapper.contains(e.target) && this.state.isOpen) {
          this.close();
        }
      };
      document.addEventListener('click', outsideHandler);
      this.handlers.set('outside-click', {
        element: document,
        type: 'click',
        handler: outsideHandler,
      });
    }

    // Keyboard navigation
    const keyHandler = (e) => this.handleKeyboard(e);
    this.picker.addEventListener('keydown', keyHandler);
    this.handlers.set('keyboard', { element: this.picker, type: 'keydown', handler: keyHandler });
  }

  attachInputEvents() {
    // HEX input
    const hexInput = this.picker.querySelector('.hex-input');
    if (hexInput) {
      const hexHandler = () => this.handleHexInput(hexInput.value);
      hexInput.addEventListener('input', hexHandler);
      this.handlers.set('hex-input', { element: hexInput, type: 'input', handler: hexHandler });
    }

    // RGB inputs
    const rgbInputs = ['r', 'g', 'b'];
    if (this.options.alpha) rgbInputs.push('a');

    rgbInputs.forEach((channel) => {
      const input = this.picker.querySelector(`.${channel}-input`);
      if (input) {
        const rgbHandler = () => this.handleRGBInput();
        input.addEventListener('input', rgbHandler);
        this.handlers.set(`rgb-${channel}`, { element: input, type: 'input', handler: rgbHandler });
      }
    });

    // HSL inputs
    const hslInputs = ['h', 's', 'l'];
    if (this.options.alpha) hslInputs.push('a2');

    hslInputs.forEach((channel) => {
      const input = this.picker.querySelector(`.${channel}-input`);
      if (input) {
        const hslHandler = () => this.handleHSLInput();
        input.addEventListener('input', hslHandler);
        this.handlers.set(`hsl-${channel}`, { element: input, type: 'input', handler: hslHandler });
      }
    });
  }

  // Spectrum interaction handlers
  handleSpectrumStart(e) {
    e.preventDefault();
    this.state.isDragging = 'spectrum';
    this.handleSpectrumMove(e);

    const moveHandler = (e) => this.handleSpectrumMove(e);
    const upHandler = () => {
      this.state.isDragging = false;
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  }

  handleSpectrumMove(e) {
    if (!this.state.isDragging && e.type === 'mousemove') return;

    const rect = this.spectrum.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const s = (x / rect.width) * 100;
    const v = 100 - (y / rect.height) * 100;

    this.state.color.s = s;
    this.state.color.v = v;

    this.updateFromHSV();
  }

  // Hue slider handlers
  handleHueStart(e) {
    e.preventDefault();
    this.state.isDragging = 'hue';
    this.handleHueMove(e);

    const moveHandler = (e) => this.handleHueMove(e);
    const upHandler = () => {
      this.state.isDragging = false;
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  }

  handleHueMove(e) {
    if (!this.state.isDragging && e.type === 'mousemove') return;

    const rect = this.hueSlider.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const h = (x / rect.width) * 360;

    this.state.color.h = h;
    this.updateFromHSV();
  }

  // Alpha slider handlers
  handleAlphaStart(e) {
    e.preventDefault();
    this.state.isDragging = 'alpha';
    this.handleAlphaMove(e);

    const moveHandler = (e) => this.handleAlphaMove(e);
    const upHandler = () => {
      this.state.isDragging = false;
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  }

  handleAlphaMove(e) {
    if (!this.state.isDragging && e.type === 'mousemove') return;

    const rect = this.alphaSlider.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const a = x / rect.width;

    this.state.color.a = a;
    this.updateFromHSV();
  }

  // Input handlers
  handleHexInput(value) {
    const color = this.parseColor(value);
    if (color) {
      this.state.color = color;
      this.updateUI();
    }
  }

  handleRGBInput() {
    const r = Number.parseInt(this.picker.querySelector('.r-input').value) || 0;
    const g = Number.parseInt(this.picker.querySelector('.g-input').value) || 0;
    const b = Number.parseInt(this.picker.querySelector('.b-input').value) || 0;
    const a = this.options.alpha
      ? Number.parseFloat(this.picker.querySelector('.a-input').value) || 1
      : 1;

    const hsv = this.rgbToHsv(r, g, b);
    this.state.color = { ...hsv, a };
    this.updateUI();
  }

  handleHSLInput() {
    const h = Number.parseInt(this.picker.querySelector('.h-input').value) || 0;
    const s = Number.parseInt(this.picker.querySelector('.s-input').value) || 0;
    const l = Number.parseInt(this.picker.querySelector('.l-input').value) || 0;
    const a = this.options.alpha
      ? Number.parseFloat(this.picker.querySelector('.a2-input').value) || 1
      : 1;

    const rgb = this.hslToRgb(h, s, l);
    const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b);
    this.state.color = { ...hsv, a };
    this.updateUI();
  }

  // Keyboard navigation
  handleKeyboard(e) {
    switch (e.key) {
      case 'Escape':
        if (!this.options.inline) {
          this.close();
        }
        break;
      case 'Enter':
        if (!this.options.inline) {
          this.save();
        }
        break;
    }
  }

  // UI Updates
  updateUI() {
    // Update spectrum cursor
    const spectrumRect = this.spectrum.getBoundingClientRect();
    this.spectrumCursor.style.left = `${(this.state.color.s / 100) * spectrumRect.width}px`;
    this.spectrumCursor.style.top = `${((100 - this.state.color.v) / 100) * spectrumRect.height}px`;

    // Update hue cursor
    const hueRect = this.hueSlider.getBoundingClientRect();
    this.hueCursor.style.left = `${(this.state.color.h / 360) * hueRect.width}px`;

    // Update alpha cursor
    if (this.alphaCursor) {
      const alphaRect = this.alphaSlider.getBoundingClientRect();
      this.alphaCursor.style.left = `${this.state.color.a * alphaRect.width}px`;
    }

    // Update spectrum background
    const hueColor = this.hsvToRgb(this.state.color.h, 100, 100);
    this.spectrum.style.background = `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, rgb(${hueColor.r}, ${hueColor.g}, ${hueColor.b}))`;

    // Update alpha slider background
    if (this.alphaSlider) {
      const rgb = this.hsvToRgb(this.state.color.h, this.state.color.s, this.state.color.v);
      this.alphaSlider.style.background = `linear-gradient(to right, transparent, rgb(${rgb.r}, ${rgb.g}, ${rgb.b}))`;
    }

    // Update inputs
    this.updateInputs();

    // Update trigger preview
    if (this.trigger) {
      const preview = this.trigger.querySelector('.color-preview');
      const value = this.trigger.querySelector('.color-value');
      preview.style.background = this.formatColor(this.state.color);
      value.textContent = this.formatColor(this.state.color);
    }
  }

  updateInputs() {
    const rgb = this.hsvToRgb(this.state.color.h, this.state.color.s, this.state.color.v);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);

    // Update HEX input
    const hexInput = this.picker.querySelector('.hex-input');
    if (hexInput && document.activeElement !== hexInput) {
      hexInput.value = this.rgbToHex(rgb.r, rgb.g, rgb.b);
    }

    // Update RGB inputs
    const rInput = this.picker.querySelector('.r-input');
    const gInput = this.picker.querySelector('.g-input');
    const bInput = this.picker.querySelector('.b-input');
    const aInput = this.picker.querySelector('.a-input');

    if (rInput && document.activeElement !== rInput) rInput.value = rgb.r;
    if (gInput && document.activeElement !== gInput) gInput.value = rgb.g;
    if (bInput && document.activeElement !== bInput) bInput.value = rgb.b;
    if (aInput && document.activeElement !== aInput) aInput.value = this.state.color.a.toFixed(2);

    // Update HSL inputs
    const hInput = this.picker.querySelector('.h-input');
    const sInput = this.picker.querySelector('.s-input');
    const lInput = this.picker.querySelector('.l-input');
    const a2Input = this.picker.querySelector('.a2-input');

    if (hInput && document.activeElement !== hInput) hInput.value = Math.round(hsl.h);
    if (sInput && document.activeElement !== sInput) sInput.value = Math.round(hsl.s);
    if (lInput && document.activeElement !== lInput) lInput.value = Math.round(hsl.l);
    if (a2Input && document.activeElement !== a2Input)
      a2Input.value = this.state.color.a.toFixed(2);
  }

  updateFromHSV() {
    this.updateUI();

    // Update hidden input
    this.element.value = this.formatColor(this.state.color);

    // Trigger change event
    if (this.options.onChange) {
      this.options.onChange(this.formatColor(this.state.color));
    }

    this.element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Color selection
  selectColor(color) {
    const parsed = this.parseColor(color);
    if (parsed) {
      this.state.color = parsed;
      this.updateUI();

      if (this.options.closeOnSelect && !this.options.inline) {
        this.save();
      }
    }
  }

  // Eye dropper
  async pickFromScreen() {
    if (!('EyeDropper' in window)) return;

    try {
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      this.selectColor(result.sRGBHex);
    } catch (e) {
      // User cancelled
    }
  }

  // Input mode switching
  switchInputMode(format) {
    this.state.activeInput = format;

    // Update tabs
    this.picker.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.format === format);
    });

    // Update input groups
    this.picker.querySelectorAll('.input-group').forEach((group) => {
      group.classList.toggle('active', group.dataset.format === format);
    });
  }

  // Color conversion functions
  parseColor(color) {
    if (!color) return null;

    // Try to parse as hex
    const hex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(color);
    if (hex) {
      const r = Number.parseInt(hex[1], 16);
      const g = Number.parseInt(hex[2], 16);
      const b = Number.parseInt(hex[3], 16);
      const a = hex[4] ? Number.parseInt(hex[4], 16) / 255 : 1;
      return { ...this.rgbToHsv(r, g, b), a };
    }

    // Try to parse as rgb/rgba
    const rgb = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/.exec(color);
    if (rgb) {
      const r = Number.parseInt(rgb[1]);
      const g = Number.parseInt(rgb[2]);
      const b = Number.parseInt(rgb[3]);
      const a = rgb[4] ? Number.parseFloat(rgb[4]) : 1;
      return { ...this.rgbToHsv(r, g, b), a };
    }

    return null;
  }

  formatColor(color) {
    const rgb = this.hsvToRgb(color.h, color.s, color.v);

    switch (this.options.format) {
      case 'rgb':
        if (this.options.alpha && color.a < 1) {
          return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${color.a.toFixed(2)})`;
        }
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

      case 'hsl':
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        if (this.options.alpha && color.a < 1) {
          return `hsla(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%, ${color.a.toFixed(2)})`;
        }
        return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;

      default: // hex
        const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
        if (this.options.alpha && color.a < 1) {
          const alphaHex = Math.round(color.a * 255)
            .toString(16)
            .padStart(2, '0');
          return hex + alphaHex;
        }
        return hex;
    }
  }

  rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    const s = max === 0 ? 0 : delta / max;
    const v = max;

    if (delta !== 0) {
      if (max === r) {
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
      } else if (max === g) {
        h = ((b - r) / delta + 2) / 6;
      } else {
        h = ((r - g) / delta + 4) / 6;
      }
    }

    return {
      h: h * 360,
      s: s * 100,
      v: v * 100,
    };
  }

  hsvToRgb(h, s, v) {
    h /= 360;
    s /= 100;
    v /= 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = v;
    } else {
      const i = Math.floor(h * 6);
      const f = h * 6 - i;
      const p = v * (1 - s);
      const q = v * (1 - f * s);
      const t = v * (1 - (1 - f) * s);

      switch (i % 6) {
        case 0:
          r = v;
          g = t;
          b = p;
          break;
        case 1:
          r = q;
          g = v;
          b = p;
          break;
        case 2:
          r = p;
          g = v;
          b = t;
          break;
        case 3:
          r = p;
          g = q;
          b = v;
          break;
        case 4:
          r = t;
          g = p;
          b = v;
          break;
        case 5:
          r = v;
          g = p;
          b = q;
          break;
      }
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {
      h: h * 360,
      s: s * 100,
      l: l * 100,
    };
  }

  hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  rgbToHex(r, g, b) {
    return (
      '#' +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
    );
  }

  // Recent colors management
  loadRecentColors() {
    try {
      const stored = localStorage.getItem('color-picker-recent');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveRecentColor(color) {
    const recent = this.state.recentColors.filter((c) => c !== color);
    recent.unshift(color);
    this.state.recentColors = recent.slice(0, this.options.maxRecent);

    try {
      localStorage.setItem('color-picker-recent', JSON.stringify(this.state.recentColors));
    } catch {
      // Ignore storage errors
    }
  }

  // Public API
  toggle() {
    if (this.state.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    if (this.options.inline || this.state.isOpen) return;

    this.picker.style.display = 'block';
    this.state.isOpen = true;
    this.picker.classList.add('open');

    // Focus first input
    const firstInput = this.picker.querySelector('input');
    if (firstInput) {
      firstInput.focus();
    }
  }

  close() {
    if (this.options.inline || !this.state.isOpen) return;

    this.picker.style.display = 'none';
    this.state.isOpen = false;
    this.picker.classList.remove('open');
  }

  save() {
    const color = this.formatColor(this.state.color);

    // Save to recent colors
    this.saveRecentColor(color);

    // Update input value
    this.element.value = color;

    // Trigger save callback
    if (this.options.onSave) {
      this.options.onSave(color);
    }

    this.element.dispatchEvent(new Event('save', { bubbles: true }));

    // Close picker
    if (!this.options.inline) {
      this.close();
    }
  }

  cancel() {
    // Reset to original value
    this.setValue(this.element.value);

    // Trigger cancel callback
    if (this.options.onCancel) {
      this.options.onCancel();
    }

    this.element.dispatchEvent(new Event('cancel', { bubbles: true }));

    // Close picker
    if (!this.options.inline) {
      this.close();
    }
  }

  getValue() {
    return this.formatColor(this.state.color);
  }

  setValue(value) {
    const color = this.parseColor(value);
    if (color) {
      this.state.color = color;
      this.updateUI();
      this.element.value = this.formatColor(color);
    }
  }

  setFormat(format) {
    this.options.format = format;
    this.updateUI();
  }

  destroy() {
    // Remove event listeners
    this.handlers.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    this.handlers.clear();

    // Clear timers
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();

    // Remove created elements
    this.createdElements.forEach((element) => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.createdElements.clear();

    // Restore original input type
    if (!this.options.inline) {
      this.element.type = 'text';
    }
  }
}

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-color-picker]').forEach((element) => {
    new ColorPicker(element);
  });
});

// Register with component registry if available
if (window.AmphibiousRegistry) {
  window.AmphibiousRegistry.registerComponent('color-picker', ColorPicker);
}

// Export
window.ColorPicker = ColorPicker;
export default ColorPicker;
