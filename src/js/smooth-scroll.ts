/**
 * Smooth Scroll Module - Amphibious 2.0
 * Provides smooth scrolling to anchors and page sections
 */

export class SmoothScroll {
  private duration: number;
  private offset: number;
  private selector: string;

  constructor(
    options: {
      duration?: number;
      offset?: number;
      selector?: string;
    } = {},
  ) {
    this.duration = options.duration || 800;
    this.offset = options.offset || 0;
    this.selector = options.selector || 'a[href*="#"]:not([href="#"])';
  }

  /**
   * Initialize smooth scroll functionality
   */
  init(): void {
    this.setupScrollLinks();
    this.handleHashChange();
  }

  /**
   * Setup smooth scroll on anchor links
   */
  private setupScrollLinks(): void {
    const links = document.querySelectorAll(this.selector);

    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        const target = this.getTargetElement(link as HTMLAnchorElement);

        if (target) {
          e.preventDefault();
          this.scrollToElement(target);

          // Update URL hash without jumping
          const hash = (link as HTMLAnchorElement).hash;
          if (hash && history.pushState) {
            history.pushState(null, '', hash);
          }
        }
      });
    });
  }

  /**
   * Handle direct hash navigation
   */
  private handleHashChange(): void {
    // Scroll to hash on load
    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) {
        setTimeout(() => {
          this.scrollToElement(target as HTMLElement, 0);
        }, 100);
      }
    }

    // Handle hash change events
    window.addEventListener('hashchange', () => {
      const target = document.querySelector(window.location.hash);
      if (target) {
        this.scrollToElement(target as HTMLElement);
      }
    });
  }

  /**
   * Get target element from anchor link
   */
  private getTargetElement(link: HTMLAnchorElement): HTMLElement | null {
    const href = link.getAttribute('href');
    if (!href || href === '#') return null;

    try {
      const hash = href.substring(href.indexOf('#'));
      return document.querySelector(hash);
    } catch (error) {
      return null;
    }
  }

  /**
   * Scroll to element with easing
   */
  public scrollToElement(target: HTMLElement, duration: number = this.duration): void {
    const targetPosition = target.getBoundingClientRect().top + window.scrollY;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition - this.offset;
    let startTime: number | null = null;

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = this.easeInOutCubic(progress);

      window.scrollTo(0, startPosition + distance * ease);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        // Focus target for accessibility
        if (target.hasAttribute('tabindex')) {
          target.focus();
        } else {
          target.setAttribute('tabindex', '-1');
          target.focus();
          target.removeAttribute('tabindex');
        }
      }
    };

    requestAnimationFrame(animation);
  }

  /**
   * Easing function for smooth animation
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * Scroll to top of page
   */
  public scrollToTop(duration?: number): void {
    const startPosition = window.scrollY;
    let startTime: number | null = null;
    const animDuration = duration || this.duration;

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / animDuration, 1);
      const ease = this.easeInOutCubic(progress);

      window.scrollTo(0, startPosition * (1 - ease));

      if (timeElapsed < animDuration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  }

  /**
   * Check if element is in viewport
   */
  public isInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
}

export default SmoothScroll;
