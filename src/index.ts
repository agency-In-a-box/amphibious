/**
 * Amphibious 2.0 - Production Entry Point
 * Modern CSS Framework with Design Excellence
 */

// Core CSS imports - main.css includes all components
import './css/main.css';

// Side-effect imports (auto-initialize on load)
import './js/navigation.js';
import './js/dark-mode-toggle.js';

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

// Utility exports
export {
  createSafeElement,
  escapeHTML,
  isSafeURL,
  sanitizeAttribute,
  sanitizeHTML,
  setInnerHTML,
} from './utils/sanitize';

// Version
export const VERSION = '2.0.0';

// Extend window interface for global utilities
declare global {
  interface Window {
    amphibiousNav?: { initMobileDropdowns?: () => void };
    __amphibiousSanitizeHTML?: (html: string) => string;
  }
}

// Make sanitizeHTML available to plain JS components via window
import { sanitizeHTML as _sanitize } from './utils/sanitize';

window.__amphibiousSanitizeHTML = _sanitize;

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
