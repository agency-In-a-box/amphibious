/**
 * Carousel Component
 * TypeScript integration for Splide.js with Amphibious framework
 */

import { Splide } from '@splidejs/splide';
import type { Options as SplideOptions } from '@splidejs/splide';

// Default icons (using SVG strings for better performance)
const DEFAULT_ICONS = {
  prev: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M15 18l-6-6 6-6"/>
  </svg>`,
  next: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M9 18l6-6-6-6"/>
  </svg>`
};

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

export class AmphibiousCarousel {
  private splide!: Splide;
  private element: HTMLElement;
  private options: AmphibiousCarouselOptions;

  constructor(selector: string | HTMLElement, options: AmphibiousCarouselOptions = {}) {
    this.element = typeof selector === 'string'
      ? document.querySelector(selector) as HTMLElement
      : selector;

    if (!this.element) {
      throw new Error(`Carousel element not found: ${selector}`);
    }

    this.options = {
      type: 'slide',
      perPage: 3,
      perMove: 1,
      gap: '1rem',
      padding: '0',
      arrows: true,
      pagination: 'dots' as any,
      wheel: false,
      keyboard: 'global',
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
      ...options
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
    this.element.classList.add('amp-carousel');

    // Add variant class
    if (this.options.variant && this.options.variant !== 'default') {
      this.element.classList.add(`amp-carousel--${this.options.variant}`);
    }

    // Add size class
    if (this.options.size) {
      this.element.classList.add(`amp-carousel--${this.options.size}`);
    }

    // Add pagination variant class
    if (this.options.pagination === 'progress') {
      this.element.classList.add('amp-carousel--progress');
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
        const slides = Array.from(this.element.children).filter(child =>
          !child.classList.contains('splide__track') &&
          !child.classList.contains('splide__arrows') &&
          !child.classList.contains('splide__pagination')
        );

        slides.forEach(slide => {
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
        perPage: Math.max(1, Math.floor((this.options.perPage as number || 3) * 0.6)),
        gap: '0.5rem',
      },
      480: {
        perPage: 1,
        gap: '0.25rem',
        arrows: false,
      }
    };

    // Convert our custom pagination options to Splide format
    const { selector, autoInit, variant, size, customIcons, pagination, ...splideOptions } = this.options;

    // Handle pagination conversion
    if (pagination === 'dots') {
      splideOptions.pagination = true;
    } else if (pagination === 'progress' || pagination === 'none') {
      splideOptions.pagination = false;
    } else if (typeof pagination === 'boolean') {
      splideOptions.pagination = pagination;
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
      ...this.options.customIcons
    };

    this.splide.on('mounted', () => {
      const prevButton = this.element.querySelector('.splide__arrow--prev');
      const nextButton = this.element.querySelector('.splide__arrow--next');

      if (prevButton) {
        prevButton.innerHTML = icons.prev;
      }
      if (nextButton) {
        nextButton.innerHTML = icons.next;
      }
    });
  }

  private setupAccessibility(): void {
    this.splide.on('mounted', () => {
      // Ensure slides have proper ARIA labels
      const slides = this.element.querySelectorAll('.splide__slide');
      slides.forEach((slide, index) => {
        if (!slide.getAttribute('aria-label')) {
          slide.setAttribute('aria-label', `Slide ${index + 1} of ${slides.length}`);
        }
        slide.setAttribute('role', 'tabpanel');
      });

      // Add role to pagination
      const pagination = this.element.querySelector('.splide__pagination');
      if (pagination) {
        pagination.setAttribute('role', 'tablist');
        pagination.setAttribute('aria-label', 'Carousel pagination');
      }
    });
  }

  public mount(): Splide {
    return this.splide.mount();
  }

  public destroy(): void {
    if (this.splide) {
      this.splide.destroy();
    }
  }

  public go(control: number | string): void {
    this.splide.go(control);
  }

  public play(): void {
    this.splide.Components.Autoplay?.play();
  }

  public pause(): void {
    this.splide.Components.Autoplay?.pause();
  }

  public refresh(): void {
    this.splide.refresh();
  }

  public getSplide(): Splide {
    return this.splide;
  }

  // Static method for auto-initialization
  static autoInit(selector: string = '.amp-carousel[data-carousel]'): AmphibiousCarousel[] {
    const elements = document.querySelectorAll<HTMLElement>(selector);
    const carousels: AmphibiousCarousel[] = [];

    elements.forEach(element => {
      const options: AmphibiousCarouselOptions = {};

      // Parse data attributes
      const dataset = element.dataset;

      if (dataset.carouselType) options.type = dataset.carouselType as any;
      if (dataset.carouselPerPage) options.perPage = parseInt(dataset.carouselPerPage);
      if (dataset.carouselGap) options.gap = dataset.carouselGap;
      if (dataset.carouselVariant) options.variant = dataset.carouselVariant as any;
      if (dataset.carouselSize) options.size = dataset.carouselSize as any;
      if (dataset.carouselPagination) options.pagination = dataset.carouselPagination as any;
      if (dataset.carouselArrows) options.arrows = dataset.carouselArrows === 'true';
      if (dataset.carouselAutoplay) options.autoplay = dataset.carouselAutoplay === 'true';
      if (dataset.carouselInterval) options.interval = parseInt(dataset.carouselInterval);

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
      createCarousel: (selector: string | HTMLElement, options?: AmphibiousCarouselOptions) => AmphibiousCarousel;
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