/**
 * Dark Mode Toggle Component - Amphibious 2.0
 *
 * System-aware dark mode with manual override capability.
 * Persists user preference in localStorage and supports smooth transitions.
 *
 * @packageDocumentation
 */

/**
 * Available theme values.
 *
 * - `'light'` — Forces light mode regardless of system preference.
 * - `'dark'` — Forces dark mode regardless of system preference.
 * - `'system'` — Follows the operating system's color-scheme preference.
 */
export type DarkModeTheme = 'light' | 'dark' | 'system';

/** Resolved theme value (always `'light'` or `'dark'`, never `'system'`). */
export type DarkModeEffectiveTheme = 'light' | 'dark';

/** Anchor corner for the floating toggle button. */
export type DarkModeTogglePosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

/**
 * Payload passed to the {@link DarkModeToggleOptions.onChange} callback.
 *
 * @property theme - The user's stored preference (`'light'`, `'dark'`, or `'system'`).
 * @property effectiveTheme - The resolved theme actually applied to the page.
 */
export interface DarkModeChangeEvent {
  theme: DarkModeTheme;
  effectiveTheme: DarkModeEffectiveTheme;
}

/**
 * Configuration options for the {@link DarkModeToggle} component.
 *
 * @property storageKey - localStorage key for persisting the theme. Defaults to `'amphibious-theme'`.
 * @property defaultTheme - Initial theme when no stored preference exists. Defaults to `'system'`.
 * @property showToggle - Whether to render the floating toggle button. Defaults to `true`.
 * @property togglePosition - Corner placement of the toggle button. Defaults to `'bottom-right'`.
 * @property transitionDuration - Duration in ms for the theme-switch transition class. Defaults to `200`.
 * @property onChange - Callback fired after every theme change.
 */
export interface DarkModeToggleOptions {
  storageKey?: string;
  defaultTheme?: DarkModeTheme;
  showToggle?: boolean;
  togglePosition?: DarkModeTogglePosition;
  transitionDuration?: number;
  onChange?: (event: DarkModeChangeEvent) => void;
  labels?: {
    toggleDarkMode?: string;
    toggleHint?: string;
    status?: (mode: string) => string;
  };
}

/** Internal defaults merged with user-supplied options. */
interface ResolvedOptions {
  storageKey: string;
  defaultTheme: DarkModeTheme;
  showToggle: boolean;
  togglePosition: DarkModeTogglePosition;
  transitionDuration: number;
  onChange: ((event: DarkModeChangeEvent) => void) | null;
  labels: {
    toggleDarkMode: string;
    toggleHint: string;
    status: (mode: string) => string;
  };
}

/** Position CSS map for the toggle button. */
const POSITION_STYLES: Record<DarkModeTogglePosition, Partial<CSSStyleDeclaration>> = {
  'bottom-right': { bottom: '24px', right: '24px' },
  'bottom-left': { bottom: '24px', left: '24px' },
  'top-right': { top: '24px', right: '24px' },
  'top-left': { top: '24px', left: '24px' },
};

/** SVG markup for the sun (light-mode) icon. */
const SUN_ICON = `<svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="5"></circle>
  <line x1="12" y1="1" x2="12" y2="3"></line>
  <line x1="12" y1="21" x2="12" y2="23"></line>
  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
  <line x1="1" y1="12" x2="3" y2="12"></line>
  <line x1="21" y1="12" x2="23" y2="12"></line>
  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
</svg>`;

/** SVG markup for the moon (dark-mode) icon. */
const MOON_ICON = `<svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
</svg>`;

/**
 * Parses {@link DarkModeToggleOptions} from `data-*` attributes on the given element.
 *
 * Supported attributes (all optional):
 * - `data-dm-storage-key` — {@link DarkModeToggleOptions.storageKey}
 * - `data-dm-default-theme` — {@link DarkModeToggleOptions.defaultTheme}
 * - `data-dm-show-toggle` — {@link DarkModeToggleOptions.showToggle} (`"true"` / `"false"`)
 * - `data-dm-position` — {@link DarkModeToggleOptions.togglePosition}
 * - `data-dm-transition` — {@link DarkModeToggleOptions.transitionDuration} (number string)
 */
function parseDataAttributes(element: HTMLElement): DarkModeToggleOptions {
  const opts: DarkModeToggleOptions = {};

  const storageKey = element.dataset.dmStorageKey;
  if (storageKey) opts.storageKey = storageKey;

  const defaultTheme = element.dataset.dmDefaultTheme;
  if (defaultTheme && ['light', 'dark', 'system'].includes(defaultTheme)) {
    opts.defaultTheme = defaultTheme as DarkModeTheme;
  }

  const showToggle = element.dataset.dmShowToggle;
  if (showToggle !== undefined) opts.showToggle = showToggle !== 'false';

  const position = element.dataset.dmPosition;
  if (position && position in POSITION_STYLES) {
    opts.togglePosition = position as DarkModeTogglePosition;
  }

  const transition = element.dataset.dmTransition;
  if (transition) {
    const parsed = Number.parseInt(transition, 10);
    if (!Number.isNaN(parsed)) opts.transitionDuration = parsed;
  }

  return opts;
}

/**
 * System-aware dark mode toggle with localStorage persistence.
 *
 * Supports three theme states — `'light'`, `'dark'`, and `'system'` (follows OS) —
 * with smooth CSS transitions, a floating toggle button, keyboard shortcut
 * (`Cmd+Shift+D` / `Ctrl+Shift+D`), and automatic system-preference tracking.
 *
 * The component sets `data-theme` on `<html>` and updates `<meta name="theme-color">`
 * for mobile browser chrome.
 *
 * @fires theme-change - Dispatched on `document` when the theme changes.
 *
 * @example
 * ```ts
 * // Auto-initialize via HTML attribute (uses data-* options)
 * // <body data-dark-mode-toggle data-dm-position="top-right">
 *
 * // Programmatic initialization
 * import { DarkModeToggle } from '@agency-in-a-box/amphibious';
 *
 * const toggle = new DarkModeToggle({
 *   defaultTheme: 'system',
 *   togglePosition: 'bottom-right',
 *   onChange: ({ theme, effectiveTheme }) => {
 *     console.log(`Theme: ${theme}, effective: ${effectiveTheme}`);
 *   },
 * });
 *
 * // Programmatic control
 * toggle.setTheme('dark');
 * console.log(toggle.getTheme());           // 'dark'
 * console.log(toggle.getEffectiveTheme());  // 'dark'
 * toggle.toggle();                           // cycles to 'system'
 *
 * // Cleanup
 * toggle.destroy();
 * ```
 */
export class DarkModeToggle {
  private options: ResolvedOptions;
  private currentTheme: DarkModeTheme;
  private systemPreference: DarkModeEffectiveTheme;
  private toggleButton: HTMLButtonElement | null = null;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(options: DarkModeToggleOptions = {}) {
    this.options = {
      storageKey: 'amphibious-theme',
      defaultTheme: 'system',
      showToggle: true,
      togglePosition: 'bottom-right',
      transitionDuration: 200,
      onChange: null,
      ...options,
      labels: {
        toggleDarkMode: 'Toggle dark mode',
        toggleHint: 'Toggle dark mode (\u2318+Shift+D)',
        status: (mode: string) => `Dark mode: ${mode}. Click to toggle.`,
        ...(options.labels || {}),
      },
    };

    this.currentTheme = this.loadTheme();
    this.systemPreference = this.detectSystemPreference();

    // Bind methods for use as event handlers
    this.toggle = this.toggle.bind(this);
    this.handleSystemChange = this.handleSystemChange.bind(this);

    this.init();
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  private init(): void {
    this.applyTheme(this.currentTheme);

    if (this.options.showToggle) {
      this.createToggleButton();
    }

    this.attachSystemListener();
    this.attachKeyboardShortcuts();
  }

  /**
   * Tears down the toggle: removes the button, detaches listeners,
   * and clears the `data-theme` attribute from `<html>`.
   */
  destroy(): void {
    if (this.toggleButton) {
      this.toggleButton.removeEventListener('click', this.toggle);
      this.toggleButton.remove();
      this.toggleButton = null;
    }

    // Remove system listener
    if (window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      if (mq.removeEventListener) {
        mq.removeEventListener('change', this.handleSystemChange);
      }
    }

    // Remove keyboard listener
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }

    document.documentElement.removeAttribute('data-theme');
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Returns the stored theme preference (`'light'`, `'dark'`, or `'system'`).
   */
  getTheme(): DarkModeTheme {
    return this.currentTheme;
  }

  /**
   * Returns the effective (resolved) theme — always `'light'` or `'dark'`.
   * When the stored theme is `'system'`, this reflects the OS preference.
   */
  getEffectiveTheme(): DarkModeEffectiveTheme {
    if (this.currentTheme === 'system') {
      return this.systemPreference;
    }
    return this.currentTheme;
  }

  /**
   * Sets the theme and persists it to localStorage.
   *
   * @param theme - The theme to apply.
   */
  setTheme(theme: DarkModeTheme): void {
    if (!['light', 'dark', 'system'].includes(theme)) {
      console.warn(`DarkModeToggle: invalid theme "${theme}"`);
      return;
    }

    this.saveTheme(theme);
    this.applyTheme(theme);
  }

  /**
   * Cycles through themes: `system` → `light` / `dark` → opposite → `system`.
   */
  toggle(): void {
    const effective = this.getEffectiveTheme();
    let next: DarkModeTheme;

    if (this.currentTheme === 'system') {
      next = effective === 'dark' ? 'light' : 'dark';
    } else if (this.currentTheme === 'light') {
      next = 'dark';
    } else {
      next = 'system';
    }

    this.setTheme(next);
  }

  // ---------------------------------------------------------------------------
  // Storage
  // ---------------------------------------------------------------------------

  private loadTheme(): DarkModeTheme {
    const stored = localStorage.getItem(this.options.storageKey);
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored as DarkModeTheme;
    }
    return this.options.defaultTheme;
  }

  private saveTheme(theme: DarkModeTheme): void {
    localStorage.setItem(this.options.storageKey, theme);
    this.currentTheme = theme;
  }

  // ---------------------------------------------------------------------------
  // System preference
  // ---------------------------------------------------------------------------

  private detectSystemPreference(): DarkModeEffectiveTheme {
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  private handleSystemChange(e: MediaQueryListEvent): void {
    this.systemPreference = e.matches ? 'dark' : 'light';

    if (this.currentTheme === 'system') {
      this.applyTheme('system');
    }
  }

  private attachSystemListener(): void {
    if (!window.matchMedia) return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) {
      mq.addEventListener('change', this.handleSystemChange);
    }
  }

  // ---------------------------------------------------------------------------
  // Theme application
  // ---------------------------------------------------------------------------

  private applyTheme(theme: DarkModeTheme): void {
    const root = document.documentElement;
    const body = document.body;

    body.classList.add('aiab-theme-transition');

    const effectiveTheme: DarkModeEffectiveTheme =
      theme === 'system' ? this.systemPreference : theme;

    if (theme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', effectiveTheme);
    }

    // Update <meta name="theme-color"> for mobile browser chrome
    this.updateMetaThemeColor(effectiveTheme);

    this.updateToggleButton();

    setTimeout(() => {
      body.classList.remove('aiab-theme-transition');
    }, this.options.transitionDuration);

    if (this.options.onChange) {
      this.options.onChange({ theme: this.currentTheme, effectiveTheme });
    }
  }

  private updateMetaThemeColor(effectiveTheme: DarkModeEffectiveTheme): void {
    const color = effectiveTheme === 'dark' ? '#000000' : '#ffffff';
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

    if (meta) {
      meta.content = color;
    } else {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = color;
      document.head.appendChild(meta);
    }
  }

  // ---------------------------------------------------------------------------
  // Toggle button
  // ---------------------------------------------------------------------------

  private createToggleButton(): void {
    const existing = document.querySelector('.aiab-dark-mode-toggle');
    if (existing) existing.remove();

    const button = document.createElement('button');
    button.className = 'aiab-dark-mode-toggle';
    button.setAttribute('aria-label', this.options.labels.toggleDarkMode);
    button.setAttribute('title', this.options.labels.toggleHint);

    const positionStyle =
      POSITION_STYLES[this.options.togglePosition] ?? POSITION_STYLES['bottom-right'];
    Object.assign(button.style, positionStyle);

    button.innerHTML = `${SUN_ICON}${MOON_ICON}`;

    button.addEventListener('click', this.toggle);
    document.body.appendChild(button);

    this.toggleButton = button;
    this.updateToggleButton();
  }

  private updateToggleButton(): void {
    if (!this.toggleButton) return;

    const effectiveTheme = this.getEffectiveTheme();
    const statusText =
      this.currentTheme === 'system'
        ? `System (${effectiveTheme})`
        : effectiveTheme.charAt(0).toUpperCase() + effectiveTheme.slice(1);

    this.toggleButton.setAttribute('aria-label', this.options.labels.status(statusText));
    this.toggleButton.setAttribute('title', `${statusText} — ${this.options.labels.toggleHint}`);
  }

  // ---------------------------------------------------------------------------
  // Keyboard shortcuts
  // ---------------------------------------------------------------------------

  private attachKeyboardShortcuts(): void {
    this.keydownHandler = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Shift + D
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.toggle();
      }
    };
    document.addEventListener('keydown', this.keydownHandler);
  }
}

// ---------------------------------------------------------------------------
// Auto-initialization
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  try {
    if (document.body?.dataset.darkModeToggle !== undefined) {
      const dataOpts = parseDataAttributes(document.body);
      (window as Window & { darkModeToggle?: DarkModeToggle }).darkModeToggle = new DarkModeToggle(
        dataOpts,
      );
    }
  } catch (error) {
    console.error('[Amphibious] DarkModeToggle auto-init failed:', error);
  }
});

// Register with component registry if available
// biome-ignore lint/suspicious/noExplicitAny: window augmentation for global registration
const win = window as any;
if (win.AmphibiousRegistry?.registerComponent) {
  win.AmphibiousRegistry.registerComponent('dark-mode-toggle', DarkModeToggle);
}

// Make available on window for plain-JS consumers
win.DarkModeToggle = DarkModeToggle;

export default DarkModeToggle;
