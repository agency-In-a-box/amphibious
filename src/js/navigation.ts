/**
 * Navigation Module - Amphibious 2.0
 * Handles navigation interactions including mobile menu toggle
 */

export class Navigation {
  private navElement: HTMLElement | null;
  private eventListeners: Array<{
    element: Element | Document | Window;
    type: string;
    handler: EventListener;
  }> = [];
  private resizeTimer: ReturnType<typeof setTimeout> | null = null;
  private tabKeyHandler: ((e: KeyboardEvent) => void) | null = null;

  private toggleButton: HTMLElement | null;
  private mobileBreakpoint = 768;
  private isOpen = false;

  constructor() {
    this.navElement = document.querySelector('.aiab-nav, .navigation, nav');
    this.toggleButton = document.querySelector('#nav_toggle, .nav__toggle, .aiab-nav-toggle');
  }

  /**
   * Add event listener with cleanup tracking
   */
  private addEventListener(
    element: Element | Document | Window,
    type: string,
    handler: EventListener,
  ): void {
    element.addEventListener(type, handler);
    this.eventListeners.push({ element, type, handler });
  }

  /**
   * Clean up all event listeners
   */
  public destroy(): void {
    // Clear resize timer
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }

    // Remove tab key handler if it exists
    if (this.tabKeyHandler) {
      document.removeEventListener('keydown', this.tabKeyHandler);
    }

    // Remove all tracked event listeners
    this.eventListeners.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    this.eventListeners = [];

    // Close menu if open
    if (this.isOpen) {
      this.closeMenu();
    }
  }

  /**
   * Initialize navigation functionality
   */
  init(): void {
    this.setActiveStates();
    this.setupMobileToggle();
    this.setupDropdowns();
    this.setupKeyboardNav();
    this.initMobileDropdowns();
    this.handleResize();
  }

  /**
   * Set active states based on current page URL
   */
  setActiveStates(): void {
    const currentPath = window.location.pathname;
    const currentHash = window.location.hash;

    // Remove all active classes and aria-current
    document.querySelectorAll('.aiab-horizontal li').forEach((li) => {
      li.classList.remove('aiab-active');
    });
    document.querySelectorAll('.aiab-horizontal a').forEach((link) => {
      link.removeAttribute('aria-current');
    });

    // Find and set the active navigation item
    document.querySelectorAll('.aiab-horizontal a').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      const linkPath = href.split('#')[0];
      const isExactMatch = linkPath === currentPath;
      const isParentMatch = currentPath.startsWith(linkPath) && linkPath !== '/';
      const isHome = currentPath === '/' && (linkPath === '/' || linkPath === '/index.html');

      if (isExactMatch || isParentMatch || isHome) {
        const parentLi = link.closest('.aiab-horizontal > li');
        if (parentLi) {
          parentLi.classList.add('aiab-active');
          const topLevelLink = parentLi.querySelector(':scope > a');
          if (topLevelLink) {
            topLevelLink.setAttribute('aria-current', 'page');
          }
        }
      }

      // Check for hash matches in sub-navigation
      if (currentHash && href.includes(currentHash)) {
        link.classList.add('aiab-active');
      }
    });
  }

  /**
   * Initialize mobile dropdown expand/collapse behavior
   */
  initMobileDropdowns(): void {
    if (window.innerWidth >= 960) return;

    document.querySelectorAll('.aiab-horizontal > li').forEach((li) => {
      const hasDropdown = li.querySelector('ul');
      if (!hasDropdown) return;

      const link = li.querySelector(':scope > a');
      if (!link) return;

      const handler = (e: Event) => {
        if (window.innerWidth < 960) {
          e.preventDefault();
          li.classList.toggle('aiab-is-expanded');
        }
      };
      this.addEventListener(link, 'click', handler);
    });
  }

  /**
   * Setup mobile navigation toggle
   */
  private setupMobileToggle(): void {
    if (!this.toggleButton) return;

    // Set initial ARIA state
    this.toggleButton.setAttribute('aria-expanded', 'false');
    this.toggleButton.setAttribute('aria-label', 'Toggle navigation menu');

    const toggleHandler = (e: Event) => {
      e.preventDefault();
      this.toggleMenu();
    };
    this.addEventListener(this.toggleButton, 'click', toggleHandler);

    // Close menu when clicking outside
    const clickOutsideHandler = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        this.isOpen &&
        !this.navElement?.contains(target) &&
        !this.toggleButton?.contains(target)
      ) {
        this.closeMenu();
      }
    };
    this.addEventListener(document, 'click', clickOutsideHandler);

    // Close menu on Escape key
    const escapeHandler = (e: Event) => {
      if ((e as KeyboardEvent).key === 'Escape' && this.isOpen) {
        this.closeMenu();
        this.toggleButton?.focus();
      }
    };
    this.addEventListener(document, 'keydown', escapeHandler);
  }

  /**
   * Toggle mobile menu
   */
  private toggleMenu(): void {
    this.isOpen = !this.isOpen;

    if (this.navElement) {
      this.navElement.classList.toggle('aiab-is-open');
      this.navElement.classList.toggle('aiab-nav--open');
    }

    if (this.toggleButton) {
      this.toggleButton.classList.toggle('aiab-is-active');
      this.toggleButton.setAttribute('aria-expanded', String(this.isOpen));
    }

    // Animate hamburger icon
    const hamburger = this.toggleButton?.querySelector('.aiab-nav__hamburger, .hamburger');
    if (hamburger) {
      hamburger.classList.toggle('aiab-is-active');
    }

    // Manage focus trap for accessibility
    if (this.isOpen) {
      this.trapFocus();
    }
  }

  /**
   * Close mobile menu
   */
  private closeMenu(): void {
    this.isOpen = false;

    if (this.navElement) {
      this.navElement.classList.remove('aiab-is-open', 'aiab-nav--open');
    }

    if (this.toggleButton) {
      this.toggleButton.classList.remove('aiab-is-active');
      this.toggleButton.setAttribute('aria-expanded', 'false');
    }

    const hamburger = this.toggleButton?.querySelector('.aiab-nav__hamburger, .hamburger');
    if (hamburger) {
      hamburger.classList.remove('aiab-is-active');
    }
  }

  /**
   * Setup dropdown menus
   */
  private setupDropdowns(): void {
    const dropdowns = document.querySelectorAll('.aiab-nav__dropdown, .aiab-dropdown');

    dropdowns.forEach((dropdown) => {
      const trigger = dropdown.querySelector('a, button');
      if (!trigger) return;

      // Mouse interactions
      this.addEventListener(dropdown, 'mouseenter', () => {
        dropdown.classList.add('aiab-is-open');
      });

      this.addEventListener(dropdown, 'mouseleave', () => {
        dropdown.classList.remove('aiab-is-open');
      });

      // Keyboard interactions
      this.addEventListener(trigger, 'click', (e) => {
        const isMobile = window.innerWidth < this.mobileBreakpoint;
        if (isMobile) {
          e.preventDefault();
          dropdown.classList.toggle('aiab-is-open');
        }
      });
    });
  }

  /**
   * Setup keyboard navigation
   */
  private setupKeyboardNav(): void {
    if (!this.navElement) return;

    const links = this.navElement.querySelectorAll('a, button');

    links.forEach((link, index) => {
      this.addEventListener(link, 'keydown', (e) => {
        const key = (e as KeyboardEvent).key;

        switch (key) {
          case 'ArrowRight':
          case 'ArrowDown': {
            e.preventDefault();
            const nextIndex = (index + 1) % links.length;
            (links[nextIndex] as HTMLElement).focus();
            break;
          }

          case 'ArrowLeft':
          case 'ArrowUp': {
            e.preventDefault();
            const prevIndex = (index - 1 + links.length) % links.length;
            (links[prevIndex] as HTMLElement).focus();
            break;
          }
        }
      });
    });
  }

  /**
   * Handle window resize
   */
  private handleResize(): void {
    const resizeHandler = () => {
      if (this.resizeTimer) clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        const isMobile = window.innerWidth < this.mobileBreakpoint;
        if (!isMobile && this.isOpen) {
          this.closeMenu();
        }
      }, 250);
    };
    this.addEventListener(window, 'resize', resizeHandler);
  }

  /**
   * Trap focus within mobile menu for accessibility
   */
  private trapFocus(): void {
    if (!this.navElement) return;

    const focusableElements = this.navElement.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])',
    );

    if (focusableElements.length === 0) return;

    // Remove previous tab key handler if it exists to prevent leaks on repeated opens
    if (this.tabKeyHandler) {
      document.removeEventListener('keydown', this.tabKeyHandler);
    }

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    this.tabKeyHandler = handleTabKey;
    document.addEventListener('keydown', this.tabKeyHandler);
  }
}

// Auto-initialize navigation when DOM is ready
function initNavigation() {
  const nav = new Navigation();
  nav.init();
  window.amphibiousNav = { initMobileDropdowns: () => nav.initMobileDropdowns() };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavigation);
} else {
  initNavigation();
}

// Re-initialize mobile dropdowns on resize
let _navResizeTimer: ReturnType<typeof setTimeout>;
window.addEventListener('resize', () => {
  clearTimeout(_navResizeTimer);
  _navResizeTimer = setTimeout(() => {
    if (window.amphibiousNav?.initMobileDropdowns) {
      window.amphibiousNav.initMobileDropdowns();
    }
  }, 250);
});

export default Navigation;
