/**
 * Amphibious 2.0 - Production Entry Point
 * Modern CSS Framework with Design Excellence
 *
 * @packageDocumentation
 *
 * This is the main entry point for the Amphibious CSS framework and component library.
 * Importing this module:
 * 1. Loads all CSS (via `main.css`)
 * 2. Auto-initializes Navigation and Dark Mode Toggle
 * 3. Exports all public components, utilities, and types
 *
 * @example
 * ```ts
 * // Full library import
 * import { Modal, Tooltip, Forms, VERSION } from '@agency-in-a-box/amphibious';
 *
 * // Individual component import
 * import { AmphibiousCarousel } from '@agency-in-a-box/amphibious';
 * ```
 */

// Core CSS imports - main-lib.css includes all library components (excludes docs page styles)
import './css/main-lib.css';

// Side-effect imports (auto-initialize on load)
import './js/navigation';
import './js/dark-mode-toggle';

// Global convenience API (window.amp) used by the docs and examples
import { amp } from './amp';

export { type Amp, amp } from './amp';
// --- Component exports ---
export type { AmphibiousCarouselOptions } from './js/carousel';
export { AmphibiousCarousel } from './js/carousel';
export type {
  DarkModeChangeEvent,
  DarkModeEffectiveTheme,
  DarkModeTheme,
  DarkModeToggleOptions,
  DarkModeTogglePosition,
} from './js/dark-mode-toggle';
export { DarkModeToggle } from './js/dark-mode-toggle';
export { Forms } from './js/forms';
export type { IconOptions } from './js/icons';
export { EcommerceIcons, Icon } from './js/icons';
export {
  createIcon,
  getAvailableIcons,
  hasIcon,
  iconMarkup,
  initializeIcons,
  registerIcons,
} from './js/icons-lightweight';
export type { ModalOptions } from './js/modal';
export { Modal, ModalManager } from './js/modal';
export type { NavigationOptions } from './js/navigation';
export { Navigation } from './js/navigation';
export type { SidebarOptions } from './js/sidebar';
export { initSidebars, Sidebar } from './js/sidebar';
export { SmoothScroll } from './js/smooth-scroll';
export type { StepsOptions } from './js/steps';
export { Steps } from './js/steps';
export { Tabs } from './js/tabs';
export type { TooltipOptions } from './js/tooltip';
export { EcommerceTooltips, Tooltip } from './js/tooltip';
// --- Dynamic loaders (for lazy loading heavy components) ---
export {
  loadAccordion,
  loadCarousel,
  loadColorPicker,
  loadDarkModeToggle,
  loadDataTable,
  loadDatepicker,
  loadDropdown,
  loadFileUpload,
  loadFormBuilder,
  loadForms,
  loadModal,
  loadNavigation,
  loadRangeSlider,
  loadSearchBar,
  loadSidebar,
  loadSmoothScroll,
  loadSteps,
  loadTabs,
  loadTimeline,
  loadToast,
  loadTooltip,
} from './loaders';
// --- Utility exports ---
export {
  createSafeElement,
  escapeHTML,
  isSafeURL,
  sanitizeAttribute,
  sanitizeHTML,
  setInnerHTML,
} from './utils/sanitize';

/** Semantic version of the Amphibious library. */
export const VERSION = '2.1.0';

// Extend window interface for global utilities
declare global {
  interface Window {
    amphibiousNav?: {
      instance?: import('./js/navigation').Navigation;
      initMobileDropdowns?: () => void;
      setActiveStates?: () => void;
    };
    __amphibiousEscapeHTML?: (str: string) => string;
    __amphibiousSanitizeHTML?: (html: string) => string;
    DarkModeToggle?: typeof import('./js/dark-mode-toggle').DarkModeToggle;
    darkModeToggle?: import('./js/dark-mode-toggle').DarkModeToggle;
  }
}

// Make sanitizeHTML and escapeHTML available to plain JS components via window
import { escapeHTML as _escape, sanitizeHTML as _sanitize } from './utils/sanitize';

window.__amphibiousEscapeHTML = _escape;
window.__amphibiousSanitizeHTML = _sanitize;

/**
 * Initialize the Amphibious framework.
 * Sets the `data-amphibious` attribute on `<html>` with the current version,
 * adds `reduced-motion` class if the user prefers reduced motion, and
 * logs an initialization message to the console.
 *
 * Called automatically on DOM ready; can also be invoked manually for
 * re-initialization after dynamic page updates.
 */
export function init() {
  document.documentElement.setAttribute('data-amphibious', VERSION);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.documentElement.classList.add('reduced-motion');
  }

  console.info(`Amphibious ${VERSION} initialized`);
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Default export = the documented `amp` API, so `import amp from '…'` and
// window.amp behave the same.
export default { ...amp, VERSION, init };
