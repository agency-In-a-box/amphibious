/**
 * Smooth Scroll Module - Amphibious 2.0
 * Provides smooth scrolling to anchors and page sections
 */

/**
 * Smooth scrolling utility for anchor links and programmatic scroll control.
 * Uses `requestAnimationFrame` with an ease-in-out cubic easing function
 * for fluid animations. Supports configurable duration, fixed offset
 * (e.g., for sticky headers), and hash-based navigation.
 *
 * @example
 * ```ts
 * const scroller = new SmoothScroll({ duration: 600, offset: 64 });
 * scroller.init();
 *
 * // Programmatic scroll
 * scroller.scrollToElement(document.getElementById('section-2')!);
 * scroller.scrollToTop();
 * ```
 */
export class SmoothScroll {
  private duration: number;
  private offset: number;
  private selector: string;
  private abortController: AbortController;

  /**
   * @param options - Configuration for scroll behavior.
   * @param options.duration - Animation duration in milliseconds. Defaults to `800`. Use `0` for instant scrolling.
   * @param options.offset - Pixel offset from the target (useful for fixed headers). Defaults to `0`.
   * @param options.selector - CSS selector for anchor links to enhance. Defaults to `'a[href*="#"]:not([href="#"])'`.
   */
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
    this.abortController = new AbortController();
  }

  /**
   * Initialize smooth scroll by attaching click handlers to matching anchor links
   * and handling initial hash navigation on page load.
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
      link.addEventListener(
        'click',
        (e) => {
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
        },
        { signal: this.abortController.signal },
      );
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
          this.scrollToElement(target as HTMLElement, this.duration);
        }, 100);
      }
    }

    // Handle hash change events
    window.addEventListener(
      'hashchange',
      () => {
        const target = document.querySelector(window.location.hash);
        if (target) {
          this.scrollToElement(target as HTMLElement, this.duration);
        }
      },
      { signal: this.abortController.signal },
    );
  }

  /**
   * Resolve the target element from an anchor link's `href` hash fragment.
   * @param link - The anchor element to extract the target from.
   * @returns The matching DOM element, or `null` if not found or invalid.
   */
  private getTargetElement(link: HTMLAnchorElement): HTMLElement | null {
    const href = link.getAttribute('href');
    if (!href || href === '#') return null;

    try {
      const hash = href.substring(href.indexOf('#'));
      return document.querySelector(hash);
    } catch (_error) {
      return null;
    }
  }

  /**
   * Smoothly scroll to the given element using ease-in-out cubic easing.
   * After scrolling completes, the target element receives focus for accessibility.
   *
   * @param target - The DOM element to scroll into view.
   * @param duration - Override animation duration in ms. Pass `0` for instant scroll.
   */
  public scrollToElement(target: HTMLElement, duration: number = this.duration): void {
    const targetPosition = target.getBoundingClientRect().top + window.scrollY;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition - this.offset;

    // Instant scroll if duration is 0
    if (duration === 0) {
      window.scrollTo(0, targetPosition - this.offset);
      // Focus target for accessibility
      if (target.hasAttribute('tabindex')) {
        target.focus();
      } else {
        target.setAttribute('tabindex', '-1');
        target.focus();
        target.removeAttribute('tabindex');
      }
      return;
    }

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
   * Ease-in-out cubic easing function.
   * @param t - Progress value between 0 and 1.
   * @returns Eased value between 0 and 1.
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
  }

  /**
   * Smoothly scroll to the top of the page.
   * @param duration - Override animation duration in ms. Defaults to the instance duration. Pass `0` for instant scroll.
   */
  public scrollToTop(duration?: number): void {
    const startPosition = window.scrollY;
    const animDuration = duration !== undefined ? duration : this.duration;

    // Instant scroll if duration is 0
    if (animDuration === 0) {
      window.scrollTo(0, 0);
      return;
    }

    let startTime: number | null = null;

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
   * Check whether an element is fully visible within the current viewport.
   * @param element - The DOM element to check.
   * @returns `true` if the entire element bounding rect is within the viewport.
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

  /**
   * Remove all event listeners registered by this instance.
   * Safe to call multiple times.
   */
  public destroy(): void {
    this.abortController.abort();
  }
}

export default SmoothScroll;
