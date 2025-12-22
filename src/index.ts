/**
 * Amphibious 2.0 - Production Entry Point
 * Modern CSS Framework with Design Excellence
 */

// Core CSS imports in proper cascade order
import './css/tokens/design-tokens.css';
import './css/normalize.css';
import './css/typography.css';
import './css/grid-modern.css';
import './css/main.css';

// Navigation component and JavaScript
import './js/navigation.js';

// Export version and initialization
export const VERSION = '2.0.0';

export function init() {
  // Initialize navigation if not already done
  if (!window.amphibiousNav && typeof NavigationComponent !== 'undefined') {
    window.amphibiousNav = new NavigationComponent();
  }

  // Add data attribute for CSS feature detection
  document.documentElement.setAttribute('data-amphibious', VERSION);

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.documentElement.classList.add('reduced-motion');
  }

  // Check for dark mode preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) {
    document.documentElement.classList.add('dark-mode');
  }

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
