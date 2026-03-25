/**
 * Amphibious 2.0 - Main JavaScript Entry Point
 * Initializes all interactive components
 */

// Import components
import ModalComponent from './modal.js';
import NavigationComponent from './navigation.js';
import toast from './toast.js';

// Initialize components when DOM is ready
const init = () => {
  try {
    // Initialize navigation
    window.amphibiousNav = new NavigationComponent();

    // Initialize modals
    window.amphibiousModal = new ModalComponent();
  } catch (error) {
    console.error('[Amphibious] Component init failed:', error);
  }
};

// Check if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for module usage
export { NavigationComponent, ModalComponent, toast };
