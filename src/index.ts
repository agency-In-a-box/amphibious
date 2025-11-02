/**
 * Amphibious 2.0
 * Modern responsive CSS framework and component library
 *
 * The evolution of A.mphibio.us - rebuilt with modern tooling
 * while preserving the elegant responsive patterns.
 */

// Import core styles
import './css/main.css';

// Import JavaScript modules
import { Navigation } from './js/navigation';
import { SmoothScroll } from './js/smooth-scroll';
import { Tabs } from './js/tabs';
import { Forms } from './js/forms';
import { Modal, ModalManager } from './js/modal';
import { Icon, EcommerceIcons } from './js/icons';

// Initialize modules
let navigation: Navigation | null = null;
let smoothScroll: SmoothScroll | null = null;
let tabs: Tabs | null = null;
let forms: Forms | null = null;

// Amphibious namespace
export const amp = {
  version: '2.0.0',

  // Module references
  modules: {
    navigation: null as Navigation | null,
    smoothScroll: null as SmoothScroll | null,
    tabs: null as Tabs | null,
    forms: null as Forms | null,
    modalManager: ModalManager,
    icon: Icon,
    ecommerceIcons: EcommerceIcons,
  },

  /**
   * Initialize Amphibious framework
   */
  init(
    options: {
      navigation?: boolean;
      smoothScroll?: boolean | { duration?: number; offset?: number };
      tabs?: boolean;
      forms?: boolean;
    } = {},
  ): void {
    console.log('🐸 Amphibious 2.0 initialized');

    // Core initialization
    this.detectDevice();

    // Initialize icons
    Icon.init();

    // Initialize modules based on options (all enabled by default)
    const defaults = {
      navigation: true,
      smoothScroll: true,
      tabs: true,
      forms: true,
      ...options,
    };

    // Navigation module
    if (defaults.navigation) {
      navigation = new Navigation();
      navigation.init();
      this.modules.navigation = navigation;
    }

    // Smooth scroll module
    if (defaults.smoothScroll) {
      const scrollOptions = typeof defaults.smoothScroll === 'object' ? defaults.smoothScroll : {};
      smoothScroll = new SmoothScroll(scrollOptions);
      smoothScroll.init();
      this.modules.smoothScroll = smoothScroll;
    }

    // Tabs module
    if (defaults.tabs) {
      tabs = new Tabs();
      tabs.init();
      this.modules.tabs = tabs;
    }

    // Forms module
    if (defaults.forms) {
      forms = new Forms();
      forms.init();
      this.modules.forms = forms;
    }
  },

  /**
   * Detect device type and add classes
   */
  detectDevice(): void {
    const html = document.documentElement;

    // Feature detection
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (hasTouch) {
      html.classList.add('touch');
    } else {
      html.classList.add('no-touch');
    }

    // Viewport width detection
    const updateViewport = () => {
      const width = window.innerWidth;
      html.classList.remove('mobile', 'tablet', 'desktop');

      if (width < 768) {
        html.classList.add('mobile');
      } else if (width < 1024) {
        html.classList.add('tablet');
      } else {
        html.classList.add('desktop');
      }
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
  },

  /**
   * Utility: Scroll to top
   */
  scrollToTop(duration?: number): void {
    if (this.modules.smoothScroll) {
      this.modules.smoothScroll.scrollToTop(duration);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },

  /**
   * Utility: Select tab by index
   */
  selectTab(containerSelector: string, index: number): void {
    if (this.modules.tabs) {
      this.modules.tabs.selectTabByIndex(containerSelector, index);
    }
  },

  /**
   * Utility: Validate form
   */
  validateForm(formSelector: string): boolean {
    if (this.modules.forms) {
      return this.modules.forms.validate(formSelector);
    }
    return false;
  },

  /**
   * Utility: Reset form
   */
  resetForm(formSelector: string): void {
    if (this.modules.forms) {
      this.modules.forms.reset(formSelector);
    }
  },

  /**
   * Utility: Add custom validation rule
   */
  addValidationRule(name: string, validator: (value: string) => boolean): void {
    if (this.modules.forms) {
      this.modules.forms.addRule(name, validator);
    }
  },

  /**
   * Utility: Create modal
   */
  createModal(id: string, element: string | HTMLElement, options?: any): Modal {
    return ModalManager.create(id, element, options);
  },

  /**
   * Utility: Show alert modal
   */
  alert(message: string, type?: 'success' | 'error' | 'warning' | 'info'): Promise<void> {
    return ModalManager.alert(message, type);
  },

  /**
   * Utility: Show confirm modal
   */
  confirm(message: string, confirmText?: string, cancelText?: string): Promise<boolean> {
    return ModalManager.confirm(message, confirmText, cancelText);
  },

  /**
   * Utility: Create icon
   */
  createIcon(name: string, options?: any): HTMLElement | null {
    return Icon.create(name, options);
  },

  /**
   * Utility: Create icon button
   */
  createIconButton(name: string, options?: any): HTMLButtonElement {
    return Icon.createButton(name, options);
  },

  /**
   * Utility: Create shopping cart icon
   */
  createCart(count?: number, options?: any): HTMLElement {
    return EcommerceIcons.cart(count, options);
  },

  /**
   * Utility: Create rating stars
   */
  createRating(rating: number, maxRating?: number, options?: any): HTMLElement {
    return EcommerceIcons.rating(rating, maxRating, options);
  },
};

// Auto-initialize on DOM ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => amp.init());
  } else {
    amp.init();
  }
}

// Export modules for direct access
export { Navigation, SmoothScroll, Tabs, Forms, Modal, ModalManager, Icon, EcommerceIcons };

// Export for module usage
export default amp;
