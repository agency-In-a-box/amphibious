/**
 * Amphibious 2.0
 * Modern responsive CSS framework and component library
 *
 * The evolution of A.mphibio.us - rebuilt with modern tooling
 * while preserving the elegant responsive patterns.
 */

// Import core styles
import './css/main.css';

// Simple initialization without complex TypeScript dependencies
console.log('🐸 Amphibious 2.0 loaded successfully');

// Initialize basic functionality
document.addEventListener('DOMContentLoaded', () => {
  console.log('🐸 Amphibious 2.0 initialized');

  // Basic tooltip initialization
  const tooltips = document.querySelectorAll('[data-tooltip]');
  console.log(`Found ${tooltips.length} tooltips`);

  // Basic icon initialization
  const icons = document.querySelectorAll('[data-lucide]');
  console.log(`Found ${icons.length} icons`);

  // Initialize Lucide icons if available
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

// Export simple namespace
window.amp = {
  version: '2.0.0',
  initialized: true
};