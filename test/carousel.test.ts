/**
 * Carousel Module Tests
 * Tests for carousel initialization, DOM structure setup,
 * CSS classes, data attribute parsing, and options handling.
 *
 * Note: Splide.js internals are not tested here — we test the
 * AmphibiousCarousel wrapper's DOM setup and configuration logic.
 */

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';

// Mock Splide before importing AmphibiousCarousel
const mockMount = mock(() => ({}));
const mockDestroy = mock(() => {});
const mockGo = mock(() => {});
const mockRefresh = mock(() => {});
const mockOn = mock(() => {});

mock.module('@splidejs/splide', () => ({
  Splide: class MockSplide {
    root: HTMLElement;
    options: Record<string, unknown>;
    Components = { Autoplay: { play: mock(() => {}), pause: mock(() => {}) } };

    constructor(element: HTMLElement, options: Record<string, unknown>) {
      this.root = element;
      this.options = options;
    }

    mount = mockMount;
    destroy = mockDestroy;
    go = mockGo;
    refresh = mockRefresh;
    on = mockOn;
  },
}));

// Import after mock is set up
const { AmphibiousCarousel } = await import('../src/js/carousel');

describe('Carousel Module', () => {
  let carouselElement: HTMLElement;

  beforeEach(() => {
    // Reset mocks
    mockMount.mockClear();
    mockDestroy.mockClear();
    mockGo.mockClear();
    mockRefresh.mockClear();
    mockOn.mockClear();

    document.body.innerHTML = `
      <div id="carousel">
        <div class="slide">Slide 1</div>
        <div class="slide">Slide 2</div>
        <div class="slide">Slide 3</div>
      </div>
    `;
    carouselElement = document.getElementById('carousel') as HTMLElement;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
    it('should initialize with default options', () => {
      const carousel = new AmphibiousCarousel(carouselElement);
      expect(carousel).toBeDefined();
    });

    it('should accept string selector', () => {
      const carousel = new AmphibiousCarousel('#carousel');
      expect(carousel).toBeDefined();
    });

    it('should throw on invalid selector', () => {
      expect(() => new AmphibiousCarousel('#nonexistent')).toThrow();
    });

    it('should auto-mount by default', () => {
      new AmphibiousCarousel(carouselElement);
      expect(mockMount).toHaveBeenCalledTimes(1);
    });

    it('should not auto-mount when autoInit is false', () => {
      new AmphibiousCarousel(carouselElement, { autoInit: false });
      expect(mockMount).not.toHaveBeenCalled();
    });
  });

  describe('DOM Structure Setup', () => {
    it('should add amp-carousel class', () => {
      new AmphibiousCarousel(carouselElement);
      expect(carouselElement.classList.contains('amp-carousel')).toBe(true);
    });

    it('should add splide class', () => {
      new AmphibiousCarousel(carouselElement);
      expect(carouselElement.classList.contains('splide')).toBe(true);
    });

    it('should create splide__track wrapper', () => {
      new AmphibiousCarousel(carouselElement);
      const track = carouselElement.querySelector('.splide__track');
      expect(track).toBeTruthy();
    });

    it('should create splide__list wrapper', () => {
      new AmphibiousCarousel(carouselElement);
      const list = carouselElement.querySelector('.splide__list');
      expect(list).toBeTruthy();
    });

    it('should move slides into splide__list', () => {
      new AmphibiousCarousel(carouselElement);
      const list = carouselElement.querySelector('.splide__list');
      expect(list?.children.length).toBe(3);
    });

    it('should add splide__slide class to children', () => {
      new AmphibiousCarousel(carouselElement);
      const slides = carouselElement.querySelectorAll('.splide__slide');
      expect(slides.length).toBe(3);
    });

    it('should not duplicate track if already present', () => {
      carouselElement.innerHTML = `
        <div class="splide__track">
          <ul class="splide__list">
            <li class="splide__slide">Slide 1</li>
          </ul>
        </div>
      `;
      new AmphibiousCarousel(carouselElement);
      const tracks = carouselElement.querySelectorAll('.splide__track');
      expect(tracks.length).toBe(1);
    });
  });

  describe('CSS Classes', () => {
    it('should add variant class', () => {
      new AmphibiousCarousel(carouselElement, { variant: 'cards' });
      expect(carouselElement.classList.contains('amp-carousel--cards')).toBe(true);
    });

    it('should not add default variant class', () => {
      new AmphibiousCarousel(carouselElement, { variant: 'default' });
      expect(carouselElement.classList.contains('amp-carousel--default')).toBe(false);
    });

    it('should add size class', () => {
      new AmphibiousCarousel(carouselElement, { size: 'lg' });
      expect(carouselElement.classList.contains('amp-carousel--lg')).toBe(true);
    });

    it('should add progress class for progress pagination', () => {
      new AmphibiousCarousel(carouselElement, { pagination: 'progress' });
      expect(carouselElement.classList.contains('amp-carousel--progress')).toBe(true);
    });
  });

  describe('Public Methods', () => {
    it('should expose mount method', () => {
      const carousel = new AmphibiousCarousel(carouselElement, { autoInit: false });
      carousel.mount();
      expect(mockMount).toHaveBeenCalledTimes(1);
    });

    it('should expose destroy method', () => {
      const carousel = new AmphibiousCarousel(carouselElement);
      carousel.destroy();
      expect(mockDestroy).toHaveBeenCalledTimes(1);
    });

    it('should expose go method', () => {
      const carousel = new AmphibiousCarousel(carouselElement);
      carousel.go(2);
      expect(mockGo).toHaveBeenCalledWith(2);
    });

    it('should expose refresh method', () => {
      const carousel = new AmphibiousCarousel(carouselElement);
      carousel.refresh();
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('should expose getSplide method', () => {
      const carousel = new AmphibiousCarousel(carouselElement);
      const splide = carousel.getSplide();
      expect(splide).toBeDefined();
    });
  });

  describe('Static autoInit', () => {
    it('should auto-initialize carousels with data-carousel attribute', () => {
      document.body.innerHTML = `
        <div class="amp-carousel" data-carousel>
          <div>Slide A</div>
          <div>Slide B</div>
        </div>
        <div class="amp-carousel" data-carousel>
          <div>Slide C</div>
          <div>Slide D</div>
        </div>
      `;

      const carousels = AmphibiousCarousel.autoInit();
      expect(carousels.length).toBe(2);
    });

    it('should parse data attributes for options', () => {
      document.body.innerHTML = `
        <div class="amp-carousel" data-carousel
             data-carousel-variant="testimonials"
             data-carousel-size="xl"
             data-carousel-per-page="4"
             data-carousel-gap="2rem">
          <div>Slide 1</div>
        </div>
      `;

      const carousels = AmphibiousCarousel.autoInit();
      expect(carousels.length).toBe(1);

      const el = document.querySelector('.amp-carousel') as HTMLElement;
      expect(el.classList.contains('amp-carousel--testimonials')).toBe(true);
      expect(el.classList.contains('amp-carousel--xl')).toBe(true);
    });

    it('should handle initialization errors gracefully', () => {
      document.body.innerHTML = '';
      const carousels = AmphibiousCarousel.autoInit();
      expect(carousels.length).toBe(0);
    });
  });
});
