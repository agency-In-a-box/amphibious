/**
 * Carousel Component
 * TypeScript integration for Splide.js with Amphibious framework
 */

import type { Options as SplideOptions } from '@splidejs/splide';
import { Splide } from '@splidejs/splide';
import { sanitizeHTML } from '../utils/sanitize';

// Default icons (using SVG strings for better performance)
const DEFAULT_ICONS = {
  prev: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M15 18l-6-6 6-6"/>
  </svg>`,
  next: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M9 18l6-6-6-6"/>
  </svg>`,
};

/**
 * Extended carousel options combining Splide.js configuration with
 * Amphibious-specific settings for variants, sizing, and custom icons.
 *
 * @property selector - CSS selector used for auto-initialization (internal use).
 * @property autoInit - Whether to auto-mount Splide on construction. Defaults to `true`.
 * @property variant - Visual preset: `'cards'`, `'images'`, `'testimonials'`, `'thumbnails'`, or `'default'`.
 * @property size - Size modifier applied as a CSS class.
 * @property pagination - Pagination style: `'dots'`, `'progress'`, `'none'`, or a boolean.
 * @property navigation - Whether to show arrow navigation.
 * @property customIcons - Custom SVG strings for prev/next arrow buttons.
 *
 * @security Custom icon SVGs are sanitized via `sanitizeHTML()` (DOMPurify)
 * before insertion. Inline event handlers and `<script>` tags are stripped.
 */
export interface AmphibiousCarouselOptions extends Omit<Partial<SplideOptions>, 'pagination'> {
  selector?: string;
  autoInit?: boolean;
  variant?: 'default' | 'cards' | 'images' | 'testimonials' | 'thumbnails';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  pagination?: 'dots' | 'progress' | 'none' | boolean;
  navigation?: boolean;
  customIcons?: {
    prev?: string;
    next?: string;
  };
}

/**
 * Carousel component built on Splide.js with Amphibious framework integration.
 *
 * Handles DOM scaffolding (auto-creates `.splide__track` and `.splide__list`
 * if missing), responsive breakpoints, accessibility attributes, custom arrow
 * icons, and respects `prefers-reduced-motion`.
 *
 * @example
 * ```ts
 * // Programmatic creation
 * const carousel = new AmphibiousCarousel('#hero-slider', {
 *   variant: 'images',
 *   perPage: 1,
 *   autoplay: true,
 * });
 *
 * // Auto-init from data attributes
 * AmphibiousCarousel.autoInit();
 * ```
 */
export class AmphibiousCarousel {
  private splide!: Splide;
  private element: HTMLElement;
  private options: AmphibiousCarouselOptions;
  private prefersReducedMotion = false;

  /**
   * @param selector - CSS selector string or HTMLElement for the carousel container.
   * @param options - Carousel configuration merged with defaults.
   * @throws {Error} If the element is not found in the DOM.
   */
  constructor(selector: string | HTMLElement, options: AmphibiousCarouselOptions = {}) {
    this.element =
      typeof selector === 'string' ? (document.querySelector(selector) as HTMLElement) : selector;

    if (!this.element) {
      throw new Error(`Carousel element not found: ${selector}`);
    }

    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.options = {
      type: 'slide',
      perPage: 3,
      perMove: 1,
      gap: '1rem',
      padding: '0',
      arrows: true,
      pagination: true,
      wheel: false,
      keyboard: 'focused',
      accessibility: {
        carousel: 'carousel',
        slide: 'slide',
        prev: 'Previous slide',
        next: 'Next slide',
        first: 'Go to first slide',
        last: 'Go to last slide',
        slideX: 'Go to slide %s',
        pageX: 'Go to page %s',
        play: 'Start autoplay',
        pause: 'Pause autoplay',
      },
      labels: {
        carousel: 'Carousel',
        slide: (index: number, total: number) => `Slide ${index} of ${total}`,
        pagination: 'Carousel pagination',
        ...(options.labels || {}),
      },
      ...options,
    };

    this.init();
  }

  private init(): void {
    this.setupElement();
    this.setupSplide();
    this.setupCustomIcons();
    this.setupAccessibility();

    if (this.options.autoInit !== false) {
      this.mount();
    }
  }

  private setupElement(): void {
    // Add base carousel class
    this.element.classList.add('aiab-carousel');

    // Add variant class
    if (this.options.variant && this.options.variant !== 'default') {
      this.element.classList.add(`aiab-carousel--${this.options.variant}`);
    }

    // Add size class
    if (this.options.size) {
      this.element.classList.add(`aiab-carousel--${this.options.size}`);
    }

    // Add pagination variant class
    if (this.options.pagination === 'progress') {
      this.element.classList.add('aiab-carousel--progress');
    }

    // Ensure proper structure
    if (!this.element.classList.contains('splide')) {
      this.element.classList.add('splide');
    }

    // Ensure track and list exist
    let track = this.element.querySelector('.splide__track');
    if (!track) {
      track = document.createElement('div');
      track.className = 'splide__track';

      let list = this.element.querySelector('.splide__list');
      if (!list) {
        list = document.createElement('ul');
        list.className = 'splide__list';

        // Move existing slides to list
        const slides = Array.from(this.element.children).filter(
          (child) =>
            !child.classList.contains('splide__track') &&
            !child.classList.contains('splide__arrows') &&
            !child.classList.contains('splide__pagination'),
        );

        slides.forEach((slide) => {
          if (!slide.classList.contains('splide__slide')) {
            slide.classList.add('splide__slide');
          }
          list!.appendChild(slide);
        });
      }

      track.appendChild(list);
      this.element.appendChild(track);
    }
  }

  private setupSplide(): void {
    // Configure responsive breakpoints
    const breakpoints = {
      768: {
        perPage: Math.max(1, Math.floor(((this.options.perPage as number) || 3) * 0.6)),
        gap: '0.5rem',
      },
      480: {
        perPage: 1,
        gap: '0.25rem',
        arrows: false,
      },
    };

    // Convert our custom pagination options to Splide format
    const { selector, autoInit, variant, size, customIcons, pagination, ...splideOptions } =
      this.options;

    // Handle pagination conversion
    if (pagination === 'dots') {
      splideOptions.pagination = true;
    } else if (pagination === 'progress' || pagination === 'none') {
      splideOptions.pagination = false;
    } else if (typeof pagination === 'boolean') {
      splideOptions.pagination = pagination;
    }

    // Disable slide transition animations when user prefers reduced motion
    if (this.prefersReducedMotion) {
      splideOptions.speed = 0;
      splideOptions.rewindSpeed = 0;
    }

    this.splide = new Splide(this.element, {
      ...splideOptions,
      breakpoints,
    });
  }

  private setupCustomIcons(): void {
    if (!this.options.arrows) return;

    const icons = {
      ...DEFAULT_ICONS,
      ...this.options.customIcons,
    };

    this.splide.on('mounted', () => {
      const prevButton = this.element.querySelector('.splide__arrow--prev');
      const nextButton = this.element.querySelector('.splide__arrow--next');

      if (prevButton) {
        prevButton.innerHTML = sanitizeHTML(icons.prev);
      }
      if (nextButton) {
        nextButton.innerHTML = sanitizeHTML(icons.next);
      }
    });
  }

  private setupAccessibility(): void {
    // Make carousel focusable for keyboard navigation (keyboard: 'focused')
    if (!this.element.hasAttribute('tabindex')) {
      this.element.setAttribute('tabindex', '0');
    }
    this.element.setAttribute('role', 'region');
    this.element.setAttribute('aria-roledescription', 'carousel');
    if (!this.element.hasAttribute('aria-label')) {
      this.element.setAttribute('aria-label', this.options.labels.carousel);
    }

    this.splide.on('mounted', () => {
      // Ensure slides have proper ARIA labels
      const slides = this.element.querySelectorAll('.splide__slide');
      slides.forEach((slide, index) => {
        if (!slide.getAttribute('aria-label')) {
          slide.setAttribute('aria-label', this.options.labels.slide(index + 1, slides.length));
        }
        slide.setAttribute('role', 'tabpanel');
      });

      // Add role to pagination
      const pagination = this.element.querySelector('.splide__pagination');
      if (pagination) {
        pagination.setAttribute('role', 'tablist');
        pagination.setAttribute('aria-label', this.options.labels.pagination);
      }
    });
  }

  /**
   * Mount the Splide instance, rendering the carousel into the DOM.
   * Called automatically unless `autoInit` is set to `false`.
   * @returns The mounted Splide instance.
   */
  public mount(): Splide {
    return this.splide.mount();
  }

  /**
   * Destroy the Splide instance and clean up all carousel event listeners.
   */
  public destroy(): void {
    if (this.splide) {
      this.splide.destroy();
    }
  }

  /**
   * Navigate to a specific slide.
   * @param control - Slide index (number) or Splide control string (e.g. `'+1'`, `'-1'`, `'>'`, `'<'`).
   */
  public go(control: number | string): void {
    this.splide.go(control);
  }

  /**
   * Start autoplay. Requires `autoplay: true` in options.
   */
  public play(): void {
    this.splide.Components.Autoplay?.play();
  }

  /**
   * Pause autoplay.
   */
  public pause(): void {
    this.splide.Components.Autoplay?.pause();
  }

  /**
   * Refresh the carousel, recalculating layout and slide positions.
   * Useful after dynamically adding or removing slides.
   */
  public refresh(): void {
    this.splide.refresh();
  }

  /**
   * Get the underlying Splide instance for advanced configuration.
   * @returns The Splide instance.
   */
  public getSplide(): Splide {
    return this.splide;
  }

  /**
   * Auto-initialize carousels from DOM elements matching the selector.
   * Reads configuration from `data-carousel-*` attributes on each element.
   *
   * @param selector - CSS selector to find carousel elements. Defaults to `'.aiab-carousel[data-carousel]'`.
   * @returns Array of created AmphibiousCarousel instances.
   *
   * @example
   * ```html
   * <div class="aiab-carousel" data-carousel
   *      data-carousel-per-page="2" data-carousel-variant="cards">
   *   <div>Slide 1</div>
   *   <div>Slide 2</div>
   * </div>
   * ```
   * ```ts
   * const carousels = AmphibiousCarousel.autoInit();
   * ```
   */
  static autoInit(selector = '.aiab-carousel[data-carousel]'): AmphibiousCarousel[] {
    const elements = document.querySelectorAll<HTMLElement>(selector);
    const carousels: AmphibiousCarousel[] = [];

    elements.forEach((element) => {
      const options: AmphibiousCarouselOptions = {};

      // Parse data attributes
      const dataset = element.dataset;

      if (dataset.carouselType) options.type = dataset.carouselType as SplideOptions['type'];
      if (dataset.carouselPerPage) options.perPage = Number.parseInt(dataset.carouselPerPage, 10);
      if (dataset.carouselGap) options.gap = dataset.carouselGap;
      if (dataset.carouselVariant)
        options.variant = dataset.carouselVariant as AmphibiousCarouselOptions['variant'];
      if (dataset.carouselSize)
        options.size = dataset.carouselSize as AmphibiousCarouselOptions['size'];
      if (dataset.carouselPagination)
        options.pagination = dataset.carouselPagination as AmphibiousCarouselOptions['pagination'];
      if (dataset.carouselArrows) options.arrows = dataset.carouselArrows === 'true';
      if (dataset.carouselAutoplay) options.autoplay = dataset.carouselAutoplay === 'true';
      if (dataset.carouselInterval)
        options.interval = Number.parseInt(dataset.carouselInterval, 10);

      // Keep pagination as string for our custom handling

      try {
        const carousel = new AmphibiousCarousel(element, options);
        carousels.push(carousel);
      } catch (error) {
        console.warn('Failed to initialize carousel:', error);
      }
    });

    return carousels;
  }
}

// Global namespace integration
declare global {
  interface Window {
    amp: {
      Carousel: typeof AmphibiousCarousel;
      createCarousel: (
        selector: string | HTMLElement,
        options?: AmphibiousCarouselOptions,
      ) => AmphibiousCarousel;
    };
  }
}

// Export for module usage
export default AmphibiousCarousel;

// Auto-initialize on DOM ready
if (typeof document !== 'undefined') {
  const initCarousels = () => {
    AmphibiousCarousel.autoInit();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousels);
  } else {
    initCarousels();
  }
}
