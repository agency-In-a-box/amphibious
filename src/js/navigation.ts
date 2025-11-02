/**
 * Navigation Module - Amphibious 2.0
 * Handles navigation interactions including mobile menu toggle
 */

export class Navigation {
  private navElement: HTMLElement | null;
  private toggleButton: HTMLElement | null;
  private mobileBreakpoint = 768;
  private isOpen = false;

  constructor() {
    this.navElement = document.querySelector('.nav, .navigation, nav');
    this.toggleButton = document.querySelector('#nav_toggle, .nav__toggle, .nav-toggle');
  }

  /**
   * Initialize navigation functionality
   */
  init(): void {
    this.setupMobileToggle();
    this.setupDropdowns();
    this.setupKeyboardNav();
    this.handleResize();
  }

  /**
   * Setup mobile navigation toggle
   */
  private setupMobileToggle(): void {
    if (!this.toggleButton) return;

    this.toggleButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleMenu();
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (
        this.isOpen &&
        !this.navElement?.contains(target) &&
        !this.toggleButton?.contains(target)
      ) {
        this.closeMenu();
      }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeMenu();
        this.toggleButton?.focus();
      }
    });
  }

  /**
   * Toggle mobile menu
   */
  private toggleMenu(): void {
    this.isOpen = !this.isOpen;

    if (this.navElement) {
      this.navElement.classList.toggle('is-open');
      this.navElement.classList.toggle('nav--open');
    }

    if (this.toggleButton) {
      this.toggleButton.classList.toggle('is-active');
      this.toggleButton.setAttribute('aria-expanded', String(this.isOpen));
    }

    // Animate hamburger icon
    const hamburger = this.toggleButton?.querySelector('.nav__hamburger, .hamburger');
    if (hamburger) {
      hamburger.classList.toggle('is-active');
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
      this.navElement.classList.remove('is-open', 'nav--open');
    }

    if (this.toggleButton) {
      this.toggleButton.classList.remove('is-active');
      this.toggleButton.setAttribute('aria-expanded', 'false');
    }

    const hamburger = this.toggleButton?.querySelector('.nav__hamburger, .hamburger');
    if (hamburger) {
      hamburger.classList.remove('is-active');
    }
  }

  /**
   * Setup dropdown menus
   */
  private setupDropdowns(): void {
    const dropdowns = document.querySelectorAll('.nav__dropdown, .dropdown');

    dropdowns.forEach((dropdown) => {
      const trigger = dropdown.querySelector('a, button');
      if (!trigger) return;

      // Mouse interactions
      dropdown.addEventListener('mouseenter', () => {
        dropdown.classList.add('is-open');
      });

      dropdown.addEventListener('mouseleave', () => {
        dropdown.classList.remove('is-open');
      });

      // Keyboard interactions
      trigger.addEventListener('click', (e) => {
        const isMobile = window.innerWidth < this.mobileBreakpoint;
        if (isMobile) {
          e.preventDefault();
          dropdown.classList.toggle('is-open');
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
      link.addEventListener('keydown', (e) => {
        const key = (e as KeyboardEvent).key;

        switch (key) {
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault();
            const nextIndex = (index + 1) % links.length;
            (links[nextIndex] as HTMLElement).focus();
            break;

          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            const prevIndex = (index - 1 + links.length) % links.length;
            (links[prevIndex] as HTMLElement).focus();
            break;
        }
      });
    });
  }

  /**
   * Handle window resize
   */
  private handleResize(): void {
    let resizeTimer: ReturnType<typeof setTimeout>;

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const isMobile = window.innerWidth < this.mobileBreakpoint;
        if (!isMobile && this.isOpen) {
          this.closeMenu();
        }
      }, 250);
    });
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

    document.addEventListener('keydown', handleTabKey);
  }
}

export default Navigation;
