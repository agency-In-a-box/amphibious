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

/** Supported color output formats. */
export type ColorFormat = 'hex' | 'rgb' | 'hsl';

/** Input mode tab identifier (matches `data-format` attribute). */
export type InputMode = 'hex' | 'rgb' | 'hsl';

/** Drag target identifier, or `false` when not dragging. */
type DragTarget = 'spectrum' | 'hue' | 'alpha' | false;

/**
 * Internal HSV + alpha representation of a color.
 *
 * @property h - Hue in degrees (0-360).
 * @property s - Saturation percentage (0-100).
 * @property v - Value / brightness percentage (0-100).
 * @property a - Alpha channel (0-1).
 */
export interface HSVColor {
  h: number;
  s: number;
  v: number;
  a: number;
}

/** RGB color with integer channels (0-255). */
export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/** HSL color with hue in degrees (0-360), saturation and lightness as percentages (0-100). */
export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

/**
 * Localizable UI label strings used by the color picker.
 *
 * @property pick - Label for the picker heading.
 * @property save - Label for the save button.
 * @property cancel - Label for the cancel button.
 * @property eyeDropper - Tooltip for the eyedropper button.
 */
export interface ColorPickerLabels {
  pick: string;
  save: string;
  cancel: string;
  eyeDropper: string;
}

/**
 * Color change callback signature.
 * @param color - The formatted color string in the active format.
 */
export type ColorChangeCallback = (color: string) => void;

/**
 * Public options accepted by the {@link ColorPicker} constructor.
 * All properties are optional; sensible defaults are applied internally.
 *
 * @property value - Initial color value (hex, rgb, or hsl string).
 * @property format - Output color format.
 * @property alpha - Enable alpha channel support.
 * @property inline - Render inline instead of as a dropdown popup.
 * @property presets - Array of preset color strings.
 * @property showPresets - Show preset color swatches.
 * @property showRecent - Show recently used color swatches.
 * @property maxRecent - Maximum number of recent colors to track.
 * @property showInput - Show color input fields (HEX/RGB/HSL).
 * @property showButtons - Show Save/Cancel buttons.
 * @property closeOnSelect - Close the picker when a preset/recent swatch is clicked.
 * @property eyeDropper - Enable the EyeDropper API button (when supported).
 * @property labels - Translatable UI label strings.
 * @property onChange - Callback fired on every color change.
 * @property onSave - Callback fired when the user clicks Save.
 * @property onCancel - Callback fired when the user clicks Cancel.
 */
export interface ColorPickerOptions {
  value?: string;
  format?: ColorFormat;
  alpha?: boolean;
  inline?: boolean;
  presets?: string[];
  showPresets?: boolean;
  showRecent?: boolean;
  maxRecent?: number;
  showInput?: boolean;
  showButtons?: boolean;
  closeOnSelect?: boolean;
  eyeDropper?: boolean;
  labels?: Partial<ColorPickerLabels>;
  onChange?: ColorChangeCallback | null;
  onSave?: ColorChangeCallback | null;
  onCancel?: (() => void) | null;
}

/** Fully resolved internal options with all defaults applied. */
interface ResolvedOptions {
  value: string;
  format: ColorFormat;
  alpha: boolean;
  inline: boolean;
  presets: string[];
  showPresets: boolean;
  showRecent: boolean;
  maxRecent: number;
  showInput: boolean;
  showButtons: boolean;
  closeOnSelect: boolean;
  eyeDropper: boolean;
  labels: ColorPickerLabels;
  onChange: ColorChangeCallback | null;
  onSave: ColorChangeCallback | null;
  onCancel: (() => void) | null;
}

/** Internal mutable state for the color picker. */
interface ColorPickerState {
  isOpen: boolean;
  color: HSVColor;
  recentColors: string[];
  isDragging: DragTarget;
  activeInput: InputMode;
}

/** Stored event handler entry for cleanup. */
interface HandlerEntry {
  element: HTMLElement | Document;
  type: string;
  handler: EventListener;
}

/**
 * EyeDropper API result (Web API, not in all TS libs).
 */
interface EyeDropperResult {
  sRGBHex: string;
}

/**
 * EyeDropper API constructor (Web API, not in all TS libs).
 */
interface EyeDropperConstructor {
  new (): { open(): Promise<EyeDropperResult> };
}

declare global {
  interface Window {
    ColorPicker: typeof ColorPicker;
    EyeDropper?: EyeDropperConstructor;
  }
}

/** Default preset colors. */
const DEFAULT_PRESETS: string[] = [
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
];

/**
 * Comprehensive color picker component with spectrum, hue/alpha sliders,
 * HEX/RGB/HSL input modes, preset and recent color swatches, and
 * EyeDropper API support.
 *
 * @example
 * ```ts
 * const picker = new ColorPicker(document.querySelector('#color-input')!, {
 *   format: 'hex',
 *   alpha: true,
 *   onChange: (color) => console.log('Color:', color),
 * });
 * ```
 */
export class ColorPicker {
  private element: HTMLInputElement;
  private options: ResolvedOptions;
  private state: ColorPickerState;

  /** Map of handler keys to their registration info for cleanup. */
  private handlers: Map<string, HandlerEntry>;
  /** Active timer IDs for cleanup. */
  private timers: Set<ReturnType<typeof setTimeout>>;
  /** DOM elements created by this component for cleanup. */
  private createdElements: Set<HTMLElement>;

  // DOM references set during init() -> setupDOM()
  private wrapper!: HTMLDivElement;
  private picker!: HTMLDivElement;
  private spectrum!: HTMLElement;
  private spectrumCursor!: HTMLElement;
  private hueSlider!: HTMLElement;
  private hueCursor!: HTMLElement;
  private trigger?: HTMLButtonElement;
  private alphaSlider?: HTMLElement | null;
  private alphaCursor?: HTMLElement | null;

  /**
   * @param element - The `<input>` element to attach the color picker to.
   * @param options - Configuration options merged with sensible defaults.
   */
  constructor(element: HTMLInputElement, options: ColorPickerOptions = {}) {
    this.element = element;
    this.options = {
      value: options.value || element.value || '#ed8b00',
      format: options.format || 'hex',
      alpha: options.alpha !== false,
      inline: options.inline || false,
      presets: options.presets || DEFAULT_PRESETS,
      showPresets: options.showPresets !== false,
      showRecent: options.showRecent !== false,
      maxRecent: options.maxRecent || 8,
      showInput: options.showInput !== false,
      showButtons: options.showButtons !== false,
      closeOnSelect: options.closeOnSelect !== false,
      eyeDropper: options.eyeDropper !== false && 'EyeDropper' in window,
      labels: {
        pick: options.labels?.pick || 'Pick Color',
        save: options.labels?.save || 'Save',
        cancel: options.labels?.cancel || 'Cancel',
        eyeDropper: options.labels?.eyeDropper || 'Pick from screen',
        ...options.labels,
      },
      onChange: options.onChange || null,
      onSave: options.onSave || null,
      onCancel: options.onCancel || null,
    };

    // State
    this.state = {
      isOpen: false,
      color: this.parseColor(this.options.value) || { h: 0, s: 100, v: 100, a: 1 },
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

  private init(): void {
    this.setupDOM();
    this.attachEvents();
    this.updateUI();

    // Set initial value
    if (this.element.value) {
      this.setValue(this.element.value);
    }
  }

  private setupDOM(): void {
    // Hide original input if not inline
    if (!this.options.inline) {
      this.element.type = 'hidden';
    }

    // Create wrapper
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'aiab-color-picker-wrapper';
    if (this.options.inline) {
      this.wrapper.classList.add('inline');
    }

    // Create trigger button (for non-inline mode)
    if (!this.options.inline) {
      this.trigger = document.createElement('button');
      this.trigger.className = 'aiab-color-picker-trigger';
      this.trigger.type = 'button';
      this.trigger.innerHTML = `
        <span class="aiab-color-preview"></span>
        <span class="aiab-color-value">${this.formatColor(this.state.color)}</span>
      `;
      this.wrapper.appendChild(this.trigger);
      this.createdElements.add(this.trigger);
    }

    // Create picker container
    this.picker = document.createElement('div');
    this.picker.className = 'aiab-color-picker';
    if (!this.options.inline) {
      this.picker.classList.add('dropdown');
    }

    // Build picker UI
    this.picker.innerHTML = `
      <div class="aiab-color-picker-header">
        ${
          this.options.eyeDropper
            ? `
          <button type="button" class="aiab-eyedropper-btn" title="${this.options.labels.eyeDropper}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M15 15l-2 5L9 9l11 4-5 2z"/>
            </svg>
          </button>
        `
            : ''
        }
      </div>

      <div class="aiab-color-picker-body">
        <!-- Color spectrum -->
        <div class="aiab-color-spectrum-wrapper">
          <div class="aiab-color-spectrum">
            <div class="aiab-spectrum-cursor"></div>
          </div>
        </div>

        <!-- Hue slider -->
        <div class="aiab-hue-slider-wrapper">
          <div class="aiab-hue-slider">
            <div class="aiab-hue-cursor"></div>
          </div>
        </div>

        ${
          this.options.alpha
            ? `
          <!-- Alpha slider -->
          <div class="aiab-alpha-slider-wrapper">
            <div class="aiab-alpha-slider">
              <div class="aiab-alpha-cursor"></div>
            </div>
          </div>
        `
            : ''
        }

        <!-- Color inputs -->
        ${
          this.options.showInput
            ? `
          <div class="aiab-color-inputs">
            <div class="aiab-input-tabs">
              <button type="button" class="aiab-tab-btn aiab-active" data-format="hex">HEX</button>
              <button type="button" class="aiab-tab-btn" data-format="rgb">RGB</button>
              <button type="button" class="aiab-tab-btn" data-format="hsl">HSL</button>
            </div>

            <div class="aiab-input-fields">
              <!-- HEX input -->
              <div class="aiab-input-group aiab-active" data-format="hex">
                <input type="text" class="hex-input" placeholder="#000000">
              </div>

              <!-- RGB inputs -->
              <div class="aiab-input-group" data-format="rgb">
                <div class="aiab-field">
                  <label>R</label>
                  <input type="number" class="r-input" min="0" max="255">
                </div>
                <div class="aiab-field">
                  <label>G</label>
                  <input type="number" class="g-input" min="0" max="255">
                </div>
                <div class="aiab-field">
                  <label>B</label>
                  <input type="number" class="b-input" min="0" max="255">
                </div>
                ${
                  this.options.alpha
                    ? `
                  <div class="aiab-field">
                    <label>A</label>
                    <input type="number" class="a-input" min="0" max="1" step="0.01">
                  </div>
                `
                    : ''
                }
              </div>

              <!-- HSL inputs -->
              <div class="aiab-input-group" data-format="hsl">
                <div class="aiab-field">
                  <label>H</label>
                  <input type="number" class="h-input" min="0" max="360">
                </div>
                <div class="aiab-field">
                  <label>S</label>
                  <input type="number" class="s-input" min="0" max="100">
                </div>
                <div class="aiab-field">
                  <label>L</label>
                  <input type="number" class="l-input" min="0" max="100">
                </div>
                ${
                  this.options.alpha
                    ? `
                  <div class="aiab-field">
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
          <div class="aiab-color-presets">
            <div class="aiab-preset-label">Presets</div>
            <div class="aiab-preset-colors">
              ${this.options.presets
                .map(
                  (color: string) => `
                <button type="button" class="aiab-color-swatch" data-color="${color}" style="background: ${color}"></button>
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
          <div class="aiab-color-recent">
            <div class="aiab-recent-label">Recent</div>
            <div class="aiab-recent-colors">
              ${this.state.recentColors
                .map(
                  (color: string) => `
                <button type="button" class="aiab-color-swatch" data-color="${color}" style="background: ${color}"></button>
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
        <div class="aiab-color-picker-footer">
          <button type="button" class="aiab-btn-cancel">${this.options.labels.cancel}</button>
          <button type="button" class="aiab-btn-save">${this.options.labels.save}</button>
        </div>
      `
          : ''
      }
    `;

    this.wrapper.appendChild(this.picker);
    this.createdElements.add(this.picker);

    // Get references to elements
    this.spectrum = this.picker.querySelector('.aiab-color-spectrum') as HTMLElement;
    this.spectrumCursor = this.picker.querySelector('.aiab-spectrum-cursor') as HTMLElement;
    this.hueSlider = this.picker.querySelector('.aiab-hue-slider') as HTMLElement;
    this.hueCursor = this.picker.querySelector('.aiab-hue-cursor') as HTMLElement;

    if (this.options.alpha) {
      this.alphaSlider = this.picker.querySelector('.aiab-alpha-slider');
      this.alphaCursor = this.picker.querySelector('.aiab-alpha-cursor');
    }

    // Insert into DOM
    this.element.parentNode?.insertBefore(this.wrapper, this.element.nextSibling);
    this.createdElements.add(this.wrapper);

    // Show picker if inline
    if (this.options.inline) {
      this.picker.style.display = 'block';
      this.state.isOpen = true;
    }
  }

  private attachEvents(): void {
    // Trigger button
    if (this.trigger) {
      const triggerHandler: EventListener = () => this.toggle();
      this.trigger.addEventListener('click', triggerHandler);
      this.handlers.set('trigger-click', {
        element: this.trigger,
        type: 'click',
        handler: triggerHandler,
      });
    }

    // Spectrum interaction
    const spectrumMouseDown: EventListener = (e) => this.handleSpectrumStart(e as MouseEvent);
    this.spectrum.addEventListener('mousedown', spectrumMouseDown);
    this.handlers.set('spectrum-mousedown', {
      element: this.spectrum,
      type: 'mousedown',
      handler: spectrumMouseDown,
    });

    // Hue slider interaction
    const hueMouseDown: EventListener = (e) => this.handleHueStart(e as MouseEvent);
    this.hueSlider.addEventListener('mousedown', hueMouseDown);
    this.handlers.set('hue-mousedown', {
      element: this.hueSlider,
      type: 'mousedown',
      handler: hueMouseDown,
    });

    // Alpha slider interaction
    if (this.alphaSlider) {
      const alphaMouseDown: EventListener = (e) => this.handleAlphaStart(e as MouseEvent);
      this.alphaSlider.addEventListener('mousedown', alphaMouseDown);
      this.handlers.set('alpha-mousedown', {
        element: this.alphaSlider,
        type: 'mousedown',
        handler: alphaMouseDown,
      });
    }

    // Input tabs
    const tabBtns = this.picker.querySelectorAll<HTMLElement>('.aiab-tab-btn');
    tabBtns.forEach((btn: HTMLElement, index: number) => {
      const tabHandler: EventListener = () =>
        this.switchInputMode((btn.dataset.format as InputMode) || 'hex');
      btn.addEventListener('click', tabHandler);
      this.handlers.set(`tab-${index}`, { element: btn, type: 'click', handler: tabHandler });
    });

    // Color inputs
    this.attachInputEvents();

    // Preset swatches
    const presetSwatches = this.picker.querySelectorAll<HTMLElement>(
      '.aiab-preset-colors .aiab-color-swatch',
    );
    presetSwatches.forEach((swatch: HTMLElement, index: number) => {
      const swatchHandler: EventListener = () => this.selectColor(swatch.dataset.color || '');
      swatch.addEventListener('click', swatchHandler);
      this.handlers.set(`preset-${index}`, {
        element: swatch,
        type: 'click',
        handler: swatchHandler,
      });
    });

    // Recent swatches
    const recentSwatches = this.picker.querySelectorAll<HTMLElement>(
      '.aiab-recent-colors .aiab-color-swatch',
    );
    recentSwatches.forEach((swatch: HTMLElement, index: number) => {
      const swatchHandler: EventListener = () => this.selectColor(swatch.dataset.color || '');
      swatch.addEventListener('click', swatchHandler);
      this.handlers.set(`recent-${index}`, {
        element: swatch,
        type: 'click',
        handler: swatchHandler,
      });
    });

    // Eyedropper
    const eyedropperBtn = this.picker.querySelector('.aiab-eyedropper-btn') as HTMLElement | null;
    if (eyedropperBtn) {
      const eyedropperHandler: EventListener = () => this.pickFromScreen();
      eyedropperBtn.addEventListener('click', eyedropperHandler);
      this.handlers.set('eyedropper', {
        element: eyedropperBtn,
        type: 'click',
        handler: eyedropperHandler,
      });
    }

    // Buttons
    const cancelBtn = this.picker.querySelector('.aiab-btn-cancel') as HTMLElement | null;
    if (cancelBtn) {
      const cancelHandler: EventListener = () => this.cancel();
      cancelBtn.addEventListener('click', cancelHandler);
      this.handlers.set('cancel', { element: cancelBtn, type: 'click', handler: cancelHandler });
    }

    const saveBtn = this.picker.querySelector('.aiab-btn-save') as HTMLElement | null;
    if (saveBtn) {
      const saveHandler: EventListener = () => this.save();
      saveBtn.addEventListener('click', saveHandler);
      this.handlers.set('save', { element: saveBtn, type: 'click', handler: saveHandler });
    }

    // Click outside to close
    if (!this.options.inline) {
      const outsideHandler: EventListener = (e: Event) => {
        if (!this.wrapper.contains(e.target as Node) && this.state.isOpen) {
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
    const keyHandler: EventListener = (e: Event) => this.handleKeyboard(e as KeyboardEvent);
    this.picker.addEventListener('keydown', keyHandler);
    this.handlers.set('keyboard', { element: this.picker, type: 'keydown', handler: keyHandler });
  }

  private attachInputEvents(): void {
    // HEX input
    const hexInput = this.picker.querySelector('.hex-input') as HTMLInputElement | null;
    if (hexInput) {
      const hexHandler: EventListener = () => this.handleHexInput(hexInput.value);
      hexInput.addEventListener('input', hexHandler);
      this.handlers.set('hex-input', { element: hexInput, type: 'input', handler: hexHandler });
    }

    // RGB inputs
    const rgbChannels: string[] = ['r', 'g', 'b'];
    if (this.options.alpha) rgbChannels.push('a');

    rgbChannels.forEach((channel: string) => {
      const input = this.picker.querySelector(`.${channel}-input`) as HTMLInputElement | null;
      if (input) {
        const rgbHandler: EventListener = () => this.handleRGBInput();
        input.addEventListener('input', rgbHandler);
        this.handlers.set(`rgb-${channel}`, {
          element: input,
          type: 'input',
          handler: rgbHandler,
        });
      }
    });

    // HSL inputs
    const hslChannels: string[] = ['h', 's', 'l'];
    if (this.options.alpha) hslChannels.push('a2');

    hslChannels.forEach((channel: string) => {
      const input = this.picker.querySelector(`.${channel}-input`) as HTMLInputElement | null;
      if (input) {
        const hslHandler: EventListener = () => this.handleHSLInput();
        input.addEventListener('input', hslHandler);
        this.handlers.set(`hsl-${channel}`, {
          element: input,
          type: 'input',
          handler: hslHandler,
        });
      }
    });
  }

  // --- Spectrum interaction handlers ---

  private handleSpectrumStart(e: MouseEvent): void {
    e.preventDefault();
    this.state.isDragging = 'spectrum';
    this.handleSpectrumMove(e);

    const moveHandler = (ev: MouseEvent): void => this.handleSpectrumMove(ev);
    const upHandler = (): void => {
      this.state.isDragging = false;
      document.removeEventListener('mousemove', moveHandler as EventListener);
      document.removeEventListener('mouseup', upHandler as EventListener);
    };

    document.addEventListener('mousemove', moveHandler as EventListener);
    document.addEventListener('mouseup', upHandler as EventListener);
  }

  private handleSpectrumMove(e: MouseEvent): void {
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

  // --- Hue slider handlers ---

  private handleHueStart(e: MouseEvent): void {
    e.preventDefault();
    this.state.isDragging = 'hue';
    this.handleHueMove(e);

    const moveHandler = (ev: MouseEvent): void => this.handleHueMove(ev);
    const upHandler = (): void => {
      this.state.isDragging = false;
      document.removeEventListener('mousemove', moveHandler as EventListener);
      document.removeEventListener('mouseup', upHandler as EventListener);
    };

    document.addEventListener('mousemove', moveHandler as EventListener);
    document.addEventListener('mouseup', upHandler as EventListener);
  }

  private handleHueMove(e: MouseEvent): void {
    if (!this.state.isDragging && e.type === 'mousemove') return;

    const rect = this.hueSlider.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const h = (x / rect.width) * 360;

    this.state.color.h = h;
    this.updateFromHSV();
  }

  // --- Alpha slider handlers ---

  private handleAlphaStart(e: MouseEvent): void {
    e.preventDefault();
    this.state.isDragging = 'alpha';
    this.handleAlphaMove(e);

    const moveHandler = (ev: MouseEvent): void => this.handleAlphaMove(ev);
    const upHandler = (): void => {
      this.state.isDragging = false;
      document.removeEventListener('mousemove', moveHandler as EventListener);
      document.removeEventListener('mouseup', upHandler as EventListener);
    };

    document.addEventListener('mousemove', moveHandler as EventListener);
    document.addEventListener('mouseup', upHandler as EventListener);
  }

  private handleAlphaMove(e: MouseEvent): void {
    if (!this.state.isDragging && e.type === 'mousemove') return;

    // biome-ignore lint/style/noNonNullAssertion: alphaSlider is guaranteed when handleAlphaStart fires
    const rect = this.alphaSlider!.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const a = x / rect.width;

    this.state.color.a = a;
    this.updateFromHSV();
  }

  // --- Input handlers ---

  private handleHexInput(value: string): void {
    const color = this.parseColor(value);
    if (color) {
      this.state.color = color;
      this.updateUI();
    }
  }

  private handleRGBInput(): void {
    const r =
      Number.parseInt(
        (this.picker.querySelector('.r-input') as HTMLInputElement)?.value ?? '0',
        10,
      ) || 0;
    const g =
      Number.parseInt(
        (this.picker.querySelector('.g-input') as HTMLInputElement)?.value ?? '0',
        10,
      ) || 0;
    const b =
      Number.parseInt(
        (this.picker.querySelector('.b-input') as HTMLInputElement)?.value ?? '0',
        10,
      ) || 0;
    const a = this.options.alpha
      ? Number.parseFloat(
          (this.picker.querySelector('.a-input') as HTMLInputElement)?.value ?? '1',
        ) || 1
      : 1;

    const hsv = this.rgbToHsv(r, g, b);
    this.state.color = { ...hsv, a };
    this.updateUI();
  }

  private handleHSLInput(): void {
    const h =
      Number.parseInt(
        (this.picker.querySelector('.h-input') as HTMLInputElement)?.value ?? '0',
        10,
      ) || 0;
    const s =
      Number.parseInt(
        (this.picker.querySelector('.s-input') as HTMLInputElement)?.value ?? '0',
        10,
      ) || 0;
    const l =
      Number.parseInt(
        (this.picker.querySelector('.l-input') as HTMLInputElement)?.value ?? '0',
        10,
      ) || 0;
    const a = this.options.alpha
      ? Number.parseFloat(
          (this.picker.querySelector('.a2-input') as HTMLInputElement)?.value ?? '1',
        ) || 1
      : 1;

    const rgb = this.hslToRgb(h, s, l);
    const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b);
    this.state.color = { ...hsv, a };
    this.updateUI();
  }

  // --- Keyboard navigation ---

  private handleKeyboard(e: KeyboardEvent): void {
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

  // --- UI Updates ---

  private updateUI(): void {
    // Update spectrum cursor
    const spectrumRect = this.spectrum.getBoundingClientRect();
    this.spectrumCursor.style.left = `${(this.state.color.s / 100) * spectrumRect.width}px`;
    this.spectrumCursor.style.top = `${((100 - this.state.color.v) / 100) * spectrumRect.height}px`;

    // Update hue cursor
    const hueRect = this.hueSlider.getBoundingClientRect();
    this.hueCursor.style.left = `${(this.state.color.h / 360) * hueRect.width}px`;

    // Update alpha cursor
    if (this.alphaCursor) {
      // biome-ignore lint/style/noNonNullAssertion: alphaCursor and alphaSlider are always set together
      const alphaRect = this.alphaSlider!.getBoundingClientRect();
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
      const preview = this.trigger.querySelector('.aiab-color-preview') as HTMLElement | null;
      const value = this.trigger.querySelector('.aiab-color-value') as HTMLElement | null;
      if (preview) {
        preview.style.background = this.formatColor(this.state.color);
      }
      if (value) {
        value.textContent = this.formatColor(this.state.color);
      }
    }
  }

  private updateInputs(): void {
    const rgb = this.hsvToRgb(this.state.color.h, this.state.color.s, this.state.color.v);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);

    // Update HEX input
    const hexInput = this.picker.querySelector('.hex-input') as HTMLInputElement | null;
    if (hexInput && document.activeElement !== hexInput) {
      hexInput.value = this.rgbToHex(rgb.r, rgb.g, rgb.b);
    }

    // Update RGB inputs
    const rInput = this.picker.querySelector('.r-input') as HTMLInputElement | null;
    const gInput = this.picker.querySelector('.g-input') as HTMLInputElement | null;
    const bInput = this.picker.querySelector('.b-input') as HTMLInputElement | null;
    const aInput = this.picker.querySelector('.a-input') as HTMLInputElement | null;

    if (rInput && document.activeElement !== rInput) rInput.value = String(rgb.r);
    if (gInput && document.activeElement !== gInput) gInput.value = String(rgb.g);
    if (bInput && document.activeElement !== bInput) bInput.value = String(rgb.b);
    if (aInput && document.activeElement !== aInput) aInput.value = this.state.color.a.toFixed(2);

    // Update HSL inputs
    const hInput = this.picker.querySelector('.h-input') as HTMLInputElement | null;
    const sInput = this.picker.querySelector('.s-input') as HTMLInputElement | null;
    const lInput = this.picker.querySelector('.l-input') as HTMLInputElement | null;
    const a2Input = this.picker.querySelector('.a2-input') as HTMLInputElement | null;

    if (hInput && document.activeElement !== hInput) hInput.value = String(Math.round(hsl.h));
    if (sInput && document.activeElement !== sInput) sInput.value = String(Math.round(hsl.s));
    if (lInput && document.activeElement !== lInput) lInput.value = String(Math.round(hsl.l));
    if (a2Input && document.activeElement !== a2Input)
      a2Input.value = this.state.color.a.toFixed(2);
  }

  private updateFromHSV(): void {
    this.updateUI();

    // Update hidden input
    this.element.value = this.formatColor(this.state.color);

    // Trigger change event
    if (this.options.onChange) {
      this.options.onChange(this.formatColor(this.state.color));
    }

    this.element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // --- Color selection ---

  private selectColor(color: string): void {
    const parsed = this.parseColor(color);
    if (parsed) {
      this.state.color = parsed;
      this.updateUI();

      if (this.options.closeOnSelect && !this.options.inline) {
        this.save();
      }
    }
  }

  // --- Eye dropper ---

  private async pickFromScreen(): Promise<void> {
    if (!('EyeDropper' in window)) return;

    try {
      // biome-ignore lint/suspicious/noExplicitAny: EyeDropper API is not in all TS libs
      const eyeDropper = new (window as any).EyeDropper();
      const result: EyeDropperResult = await eyeDropper.open();
      this.selectColor(result.sRGBHex);
    } catch (_e: unknown) {
      // User cancelled
    }
  }

  // --- Input mode switching ---

  private switchInputMode(format: InputMode): void {
    this.state.activeInput = format;

    // Update tabs
    this.picker.querySelectorAll<HTMLElement>('.aiab-tab-btn').forEach((btn: HTMLElement) => {
      btn.classList.toggle('aiab-active', btn.dataset.format === format);
    });

    // Update input groups
    this.picker.querySelectorAll<HTMLElement>('.aiab-input-group').forEach((group: HTMLElement) => {
      group.classList.toggle('aiab-active', group.dataset.format === format);
    });
  }

  // --- Color conversion functions ---

  private parseColor(color: string): HSVColor | null {
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
      const r = Number.parseInt(rgb[1], 10);
      const g = Number.parseInt(rgb[2], 10);
      const b = Number.parseInt(rgb[3], 10);
      const a = rgb[4] ? Number.parseFloat(rgb[4]) : 1;
      return { ...this.rgbToHsv(r, g, b), a };
    }

    return null;
  }

  private formatColor(color: HSVColor): string {
    const rgb = this.hsvToRgb(color.h, color.s, color.v);

    switch (this.options.format) {
      case 'rgb':
        if (this.options.alpha && color.a < 1) {
          return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${color.a.toFixed(2)})`;
        }
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

      case 'hsl': {
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        if (this.options.alpha && color.a < 1) {
          return `hsla(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%, ${color.a.toFixed(2)})`;
        }
        return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
      }

      default: {
        // hex
        const hexStr = this.rgbToHex(rgb.r, rgb.g, rgb.b);
        if (this.options.alpha && color.a < 1) {
          const alphaHex = Math.round(color.a * 255)
            .toString(16)
            .padStart(2, '0');
          return hexStr + alphaHex;
        }
        return hexStr;
      }
    }
  }

  private rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
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

  private hsvToRgb(h: number, s: number, v: number): RGBColor {
    h /= 360;
    s /= 100;
    v /= 100;

    let r = 0;
    let g = 0;
    let b = 0;

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

  private rgbToHsl(r: number, g: number, b: number): HSLColor {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

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

  private hslToRgb(h: number, s: number, l: number): RGBColor {
    h /= 360;
    s /= 100;
    l /= 100;

    let r = 0;
    let g = 0;
    let b = 0;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number): number => {
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

  private rgbToHex(r: number, g: number, b: number): string {
    return `#${[r, g, b]
      .map((x: number) => {
        const hex = x.toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
      })
      .join('')}`;
  }

  // --- Recent colors management ---

  private loadRecentColors(): string[] {
    try {
      const stored = localStorage.getItem('aiab-color-picker-recent');
      return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
      return [];
    }
  }

  private saveRecentColor(color: string): void {
    const recent = this.state.recentColors.filter((c: string) => c !== color);
    recent.unshift(color);
    this.state.recentColors = recent.slice(0, this.options.maxRecent);

    try {
      localStorage.setItem('aiab-color-picker-recent', JSON.stringify(this.state.recentColors));
    } catch {
      // Ignore storage errors
    }
  }

  // --- Public API ---

  /** Toggle the picker between open and closed states. */
  public toggle(): void {
    if (this.state.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /** Open the color picker dropdown. No-ops if inline or already open. */
  public open(): void {
    if (this.options.inline || this.state.isOpen) return;

    this.picker.style.display = 'block';
    this.state.isOpen = true;
    this.picker.classList.add('open');

    // Focus first input
    const firstInput = this.picker.querySelector('input') as HTMLElement | null;
    if (firstInput) {
      firstInput.focus();
    }
  }

  /** Close the color picker dropdown. No-ops if inline or already closed. */
  public close(): void {
    if (this.options.inline || !this.state.isOpen) return;

    this.picker.style.display = 'none';
    this.state.isOpen = false;
    this.picker.classList.remove('open');
  }

  /** Save the current color, add to recents, update the input, and close. */
  public save(): void {
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

  /** Cancel changes, reset to the element's current value, and close. */
  public cancel(): void {
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

  /** Get the current color as a formatted string. */
  public getValue(): string {
    return this.formatColor(this.state.color);
  }

  /** Programmatically set the color from a string value. */
  public setValue(value: string): void {
    const color = this.parseColor(value);
    if (color) {
      this.state.color = color;
      this.updateUI();
      this.element.value = this.formatColor(color);
    }
  }

  /** Change the output color format. */
  public setFormat(format: ColorFormat): void {
    this.options.format = format;
    this.updateUI();
  }

  /** Tear down the component: remove event listeners, timers, and created DOM elements. */
  public destroy(): void {
    // Remove event listeners
    this.handlers.forEach(({ element, type, handler }: HandlerEntry) => {
      element.removeEventListener(type, handler);
    });
    this.handlers.clear();

    // Clear timers
    this.timers.forEach((timer: ReturnType<typeof setTimeout>) => clearTimeout(timer));
    this.timers.clear();

    // Remove created elements
    this.createdElements.forEach((element: HTMLElement) => {
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
  document.querySelectorAll<HTMLInputElement>('[data-color-picker]').forEach((element) => {
    new ColorPicker(element);
  });
});

// Register with component registry if available
if (window.AmphibiousRegistry) {
  // biome-ignore lint/suspicious/noExplicitAny: registry accepts generic constructor signature
  window.AmphibiousRegistry.registerComponent('aiab-color-picker', ColorPicker as any);
}

// Export
window.ColorPicker = ColorPicker;
export default ColorPicker;
export { ColorPicker as ColorPickerComponent };
