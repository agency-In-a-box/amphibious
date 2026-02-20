/**
 * Amphibious 2.0 - Production Entry Point
 * Modern CSS Framework with Design Excellence
 */

// Core CSS imports - main.css includes all components
import './css/main.css';

// Navigation component and JavaScript
import './js/navigation.js';

// Dark mode toggle
import './js/dark-mode-toggle.js';

// Register sanitizeHTML globally for plain JS components
import { sanitizeHTML } from './utils/sanitize';

// Export version and initialization
export const VERSION = '2.0.0';

// Extend window interface for global utilities
declare global {
  interface Window {
    amphibiousNav?: any;
    __amphibiousSanitizeHTML?: (html: string) => string;
  }
}

// Make sanitizeHTML available to plain JS components via window
window.__amphibiousSanitizeHTML = sanitizeHTML;

export function init() {
  // Initialize navigation if not already done
  // Navigation component is loaded via script tag

  // Add data attribute for CSS feature detection
  document.documentElement.setAttribute('data-amphibious', VERSION);

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.documentElement.classList.add('reduced-motion');
  }

  // Dark mode is handled by dark-mode-toggle.js via data-theme attribute
  // and @media (prefers-color-scheme: dark) in CSS

  console.info(`Amphibious ${VERSION} initialized`);
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for manual initialization
export default { VERSION, init };
