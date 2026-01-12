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
  // Initialize navigation
  window.amphibiousNav = new NavigationComponent();

  // Initialize modals
  window.amphibiousModal = new ModalComponent();

  console.log('Amphibious 2.0 components initialized');
};

// Check if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for module usage
export { NavigationComponent, ModalComponent, toast };
