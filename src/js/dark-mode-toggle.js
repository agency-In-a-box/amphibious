/**
 * Dark Mode Toggle Component
 *
 * Provides system-aware dark mode with manual override capability
 * Persists user preference in localStorage
 * Smooth transitions between themes
 */

class DarkModeToggle {
  constructor(options = {}) {
    this.options = {
      // Default options
      storageKey: options.storageKey || 'amphibious-theme',
      defaultTheme: options.defaultTheme || 'system', // 'light', 'dark', 'system'
      showToggle: options.showToggle !== false,
      togglePosition: options.togglePosition || 'bottom-right', // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
      transitionDuration: options.transitionDuration || 200,
      onChange: options.onChange || null,
      ...options
    };

    // State
    this.currentTheme = this.loadTheme();
    this.systemPreference = this.getSystemPreference();

    // Bind methods
    this.toggle = this.toggle.bind(this);
    this.handleSystemChange = this.handleSystemChange.bind(this);

    // Initialize
    this.init();
  }

  init() {
    // Apply initial theme
    this.applyTheme(this.currentTheme);

    // Create toggle button if needed
    if (this.options.showToggle) {
      this.createToggleButton();
    }

    // Listen for system preference changes
    this.attachSystemListener();

    // Listen for keyboard shortcuts
    this.attachKeyboardShortcuts();
  }

  loadTheme() {
    // Load from localStorage
    const stored = localStorage.getItem(this.options.storageKey);
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored;
    }
    return this.options.defaultTheme;
  }

  saveTheme(theme) {
    localStorage.setItem(this.options.storageKey, theme);
    this.currentTheme = theme;
  }

  getSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  getEffectiveTheme() {
    if (this.currentTheme === 'system') {
      return this.systemPreference;
    }
    return this.currentTheme;
  }

  applyTheme(theme) {
    const root = document.documentElement;
    const body = document.body;

    // Add transition class for smooth switching
    body.classList.add('theme-transition');

    // Determine effective theme
    const effectiveTheme = theme === 'system' ? this.systemPreference : theme;

    // Apply theme
    if (theme === 'system') {
      // Remove manual override, let CSS media query take over
      root.removeAttribute('data-theme');
    } else {
      // Apply manual override
      root.setAttribute('data-theme', effectiveTheme);
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.content = effectiveTheme === 'dark' ? '#000000' : '#ffffff';
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = effectiveTheme === 'dark' ? '#000000' : '#ffffff';
      document.head.appendChild(meta);
    }

    // Update toggle button state
    this.updateToggleButton();

    // Remove transition class after animation
    setTimeout(() => {
      body.classList.remove('theme-transition');
    }, this.options.transitionDuration);

    // Trigger callback
    if (this.options.onChange) {
      this.options.onChange({
        theme: this.currentTheme,
        effectiveTheme: effectiveTheme
      });
    }
  }

  toggle() {
    // Cycle through themes: system -> light -> dark -> system
    let newTheme;
    const effective = this.getEffectiveTheme();

    if (this.currentTheme === 'system') {
      // If system preference is dark, go to light, otherwise go to dark
      newTheme = effective === 'dark' ? 'light' : 'dark';
    } else if (this.currentTheme === 'light') {
      newTheme = 'dark';
    } else {
      newTheme = 'system';
    }

    this.setTheme(newTheme);
  }

  setTheme(theme) {
    if (!['light', 'dark', 'system'].includes(theme)) {
      console.warn(`Invalid theme: ${theme}`);
      return;
    }

    this.saveTheme(theme);
    this.applyTheme(theme);
  }

  createToggleButton() {
    // Remove existing toggle if present
    const existing = document.querySelector('.dark-mode-toggle');
    if (existing) {
      existing.remove();
    }

    // Create toggle button
    const button = document.createElement('button');
    button.className = 'dark-mode-toggle';
    button.setAttribute('aria-label', 'Toggle dark mode');
    button.setAttribute('title', 'Toggle dark mode (⌘+Shift+D)');

    // Position based on options
    const positions = {
      'bottom-right': { bottom: '24px', right: '24px' },
      'bottom-left': { bottom: '24px', left: '24px' },
      'top-right': { top: '24px', right: '24px' },
      'top-left': { top: '24px', left: '24px' }
    };

    const position = positions[this.options.togglePosition] || positions['bottom-right'];
    Object.assign(button.style, position);

    // Add icons
    button.innerHTML = `
      <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
      <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    `;

    // Add click handler
    button.addEventListener('click', this.toggle);

    // Add to DOM
    document.body.appendChild(button);

    // Store reference
    this.toggleButton = button;

    // Update initial state
    this.updateToggleButton();
  }

  updateToggleButton() {
    if (!this.toggleButton) return;

    const effectiveTheme = this.getEffectiveTheme();
    const statusText = this.currentTheme === 'system'
      ? `System (${effectiveTheme})`
      : effectiveTheme.charAt(0).toUpperCase() + effectiveTheme.slice(1);

    this.toggleButton.setAttribute('aria-label', `Dark mode: ${statusText}. Click to toggle.`);
    this.toggleButton.setAttribute('title', `Dark mode: ${statusText} (⌘+Shift+D)`);
  }

  attachSystemListener() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', this.handleSystemChange);
      }
      // Safari < 14
      else if (mediaQuery.addListener) {
        mediaQuery.addListener(this.handleSystemChange);
      }
    }
  }

  handleSystemChange(e) {
    this.systemPreference = e.matches ? 'dark' : 'light';

    // If currently using system theme, update the display
    if (this.currentTheme === 'system') {
      this.applyTheme('system');
    }
  }

  attachKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + Shift + D
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  // Public API
  getTheme() {
    return this.currentTheme;
  }

  getEffectiveThemeValue() {
    return this.getEffectiveTheme();
  }

  destroy() {
    // Remove toggle button
    if (this.toggleButton) {
      this.toggleButton.removeEventListener('click', this.toggle);
      this.toggleButton.remove();
    }

    // Remove system listener
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', this.handleSystemChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(this.handleSystemChange);
      }
    }

    // Clear theme attribute
    document.documentElement.removeAttribute('data-theme');
  }
}

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // Auto-initialize if data attribute is present
  if (document.body.dataset.darkModeToggle !== undefined) {
    window.darkModeToggle = new DarkModeToggle();
  }
});

// Register with component registry if available
if (window.AmphibiousRegistry) {
  window.AmphibiousRegistry.registerComponent('dark-mode-toggle', DarkModeToggle);
}

// Export for module systems
window.DarkModeToggle = DarkModeToggle;
export default DarkModeToggle;