/**
 * Amphibious 2.0
 * Modern responsive CSS framework and component library
 *
 * The evolution of A.mphibio.us - rebuilt with modern tooling
 * while preserving the elegant responsive patterns.
 */

// Import core styles
import './css/main.css';

// Import Lucide icons
import { createIcons, icons } from 'lucide';

// Import navigation dropdown enhancement
import { initNavigationDropdowns } from './js/navigation-dropdown.js';

// Import navigation component
import NavigationComponent from './js/navigation-component.js';

// Simple initialization without complex TypeScript dependencies
console.log('Amphibious 2.0 loaded successfully');

// Initialize basic functionality
document.addEventListener('DOMContentLoaded', () => {
  console.log('Amphibious 2.0 initialized');

  // Initialize Lucide icons
  createIcons({ icons });
  const iconElements = document.querySelectorAll('[data-lucide]');
  console.log(`Initialized ${iconElements.length} Lucide icons`);

  // Initialize navigation dropdowns
  initNavigationDropdowns();
  console.log(`Enhanced navigation dropdowns`);

  // Basic tooltip initialization
  const tooltips = document.querySelectorAll('[data-tooltip]');
  console.log(`Found ${tooltips.length} tooltips`);
});

// Export simple namespace
window.amp = {
  version: '2.0.0',
  initialized: true,
  // Expose Lucide for dynamic icon creation
  icons: {
    refresh: () => createIcons({ icons }),
  },
};
