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

// Core CSS imports - main.css includes all components
import './css/main.css';

// Side-effect imports (auto-initialize on load)
import './js/navigation';
import './js/dark-mode-toggle.js';

// --- Component exports ---
export type { AmphibiousCarouselOptions } from './js/carousel';
export { AmphibiousCarousel } from './js/carousel';
export { Forms } from './js/forms';
export type { IconOptions } from './js/icons';
export { EcommerceIcons, Icon } from './js/icons';
export {
  createIcon,
  getAvailableIcons,
  hasIcon,
  initializeIcons,
} from './js/icons-lightweight';
export type { ModalOptions } from './js/modal';
export { Modal, ModalManager } from './js/modal';
export { Navigation } from './js/navigation';
export { SmoothScroll } from './js/smooth-scroll';
export { Tabs } from './js/tabs';
export type { TooltipOptions } from './js/tooltip';
export { EcommerceTooltips, Tooltip } from './js/tooltip';

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
export const VERSION = '2.0.2';

// Extend window interface for global utilities
declare global {
  interface Window {
    amphibiousNav?: { initMobileDropdowns?: () => void };
    __amphibiousEscapeHTML?: (str: string) => string;
    __amphibiousSanitizeHTML?: (html: string) => string;
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

export default { VERSION, init };
