/**
 * Amphibious 2.0 - Main JavaScript Entry Point
 * Initializes all interactive components
 */

// Import components
import ModalComponent from './modal';
import NavigationComponent from './navigation';
import toast from './toast';

// Initialize components when DOM is ready
const init = (): void => {
  try {
    // biome-ignore lint/suspicious/noExplicitAny: window global augmentation
    (window as any).amphibiousNav = new NavigationComponent();

    // Export Modal class for on-demand instantiation (requires an element)
    // biome-ignore lint/suspicious/noExplicitAny: window global augmentation
    (window as any).amphibiousModal = ModalComponent;
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
