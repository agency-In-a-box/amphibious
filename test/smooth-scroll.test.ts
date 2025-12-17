/**
 * Smooth Scroll Module Tests
 * Tests for anchor scrolling, easing functions, and scroll utilities
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { SmoothScroll } from '../src/js/smooth-scroll';

describe('SmoothScroll Module', () => {
  let smoothScroll: SmoothScroll;
  let container: HTMLElement;

  beforeEach(() => {
    // Setup DOM structure
    document.body.innerHTML = `
      <nav>
        <a href="#section1">Section 1</a>
        <a href="#section2">Section 2</a>
        <a href="#section3">Section 3</a>
        <a href="#">Empty Hash</a>
        <a href="https://example.com">External Link</a>
      </nav>
      <div id="section1" style="margin-top: 1000px;">Section 1 Content</div>
      <div id="section2" style="margin-top: 1000px;">Section 2 Content</div>
      <div id="section3" style="margin-top: 1000px;">Section 3 Content</div>
    `;

    container = document.body;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    window.scrollTo(0, 0);
  });

  describe('Initialization', () => {
    it('should initialize with default options', () => {
      smoothScroll = new SmoothScroll();
      expect(() => smoothScroll.init()).not.toThrow();
    });

    it('should accept custom options', () => {
      smoothScroll = new SmoothScroll({
        duration: 500,
        offset: 100,
        selector: 'a[href^="#"]',
      });
      expect(() => smoothScroll.init()).not.toThrow();
    });
  });

  describe('Anchor Link Handling', () => {
    it('should prevent default on anchor clicks', () => {
      smoothScroll = new SmoothScroll();
      smoothScroll.init();

      const link = document.querySelector('a[href="#section1"]') as HTMLAnchorElement;
      let defaultPrevented = false;

      link.addEventListener('click', (e) => {
        if (e.defaultPrevented) defaultPrevented = true;
      });

      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      link.dispatchEvent(clickEvent);

      expect(defaultPrevented).toBe(true);
    });

    it('should not scroll for empty hash links', () => {
      smoothScroll = new SmoothScroll();
      smoothScroll.init();

      const link = document.querySelector('a[href="#"]') as HTMLAnchorElement;
      const scrollY = window.scrollY;

      link.click();

      expect(window.scrollY).toBe(scrollY);
    });

    it('should not affect external links', () => {
      smoothScroll = new SmoothScroll();
      smoothScroll.init();

      const link = document.querySelector('a[href="https://example.com"]') as HTMLAnchorElement;
      let defaultPrevented = false;

      link.addEventListener('click', (e) => {
        if (e.defaultPrevented) defaultPrevented = true;
      });

      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      link.dispatchEvent(clickEvent);

      expect(defaultPrevented).toBe(false);
    });
  });

  describe('Scroll Functionality', () => {
    it('should scroll to element', () => {
      smoothScroll = new SmoothScroll({ duration: 0 }); // Instant for testing
      smoothScroll.init();

      const target = document.querySelector('#section2') as HTMLElement;
      const targetTop = target.getBoundingClientRect().top + window.scrollY;

      smoothScroll.scrollToElement(target, 0);

      // Allow for small differences due to rounding
      expect(Math.abs(window.scrollY - targetTop)).toBeLessThan(2);
    });

    it('should apply offset when scrolling', () => {
      const offset = 50;
      smoothScroll = new SmoothScroll({ duration: 0, offset });
      smoothScroll.init();

      const target = document.querySelector('#section1') as HTMLElement;
      const targetTop = target.getBoundingClientRect().top + window.scrollY;

      smoothScroll.scrollToElement(target, 0);

      expect(Math.abs(window.scrollY - (targetTop - offset))).toBeLessThan(2);
    });

    it('should scroll to top', () => {
      // Scroll down first
      window.scrollTo(0, 500);
      expect(window.scrollY).toBe(500);

      smoothScroll = new SmoothScroll();
      smoothScroll.scrollToTop(0); // Instant for testing

      expect(window.scrollY).toBe(0);
    });
  });

  describe('Viewport Detection', () => {
    it('should detect if element is in viewport', () => {
      smoothScroll = new SmoothScroll();

      // Mock element in viewport
      const element = document.createElement('div');
      Object.defineProperty(element, 'getBoundingClientRect', {
        value: () => ({
          top: 100,
          left: 100,
          bottom: 200,
          right: 200,
        }),
      });

      expect(smoothScroll.isInViewport(element)).toBe(true);
    });

    it('should detect if element is outside viewport', () => {
      smoothScroll = new SmoothScroll();

      // Mock element outside viewport
      const element = document.createElement('div');
      Object.defineProperty(element, 'getBoundingClientRect', {
        value: () => ({
          top: -1000,
          left: 0,
          bottom: -900,
          right: 100,
        }),
      });

      expect(smoothScroll.isInViewport(element)).toBe(false);
    });
  });

  describe('Hash Navigation', () => {
    it('should handle hash on page load', (done) => {
      // Simulate page load with hash
      window.location.hash = '#section3';

      smoothScroll = new SmoothScroll({ duration: 0 });
      smoothScroll.init();

      // Wait for initial scroll
      setTimeout(() => {
        const target = document.querySelector('#section3') as HTMLElement;
        const targetTop = target.getBoundingClientRect().top + window.scrollY;

        expect(Math.abs(window.scrollY - targetTop)).toBeLessThan(2);
        window.location.hash = '';
        done();
      }, 150);
    });

    it('should handle hashchange events', () => {
      smoothScroll = new SmoothScroll({ duration: 0 });
      smoothScroll.init();

      window.location.hash = '#section2';
      window.dispatchEvent(new HashChangeEvent('hashchange'));

      const target = document.querySelector('#section2') as HTMLElement;
      const targetTop = target.getBoundingClientRect().top + window.scrollY;

      expect(Math.abs(window.scrollY - targetTop)).toBeLessThan(2);
      window.location.hash = '';
    });
  });

  describe('Focus Management', () => {
    it('should focus target element after scroll', () => {
      smoothScroll = new SmoothScroll({ duration: 0 });
      smoothScroll.init();

      const target = document.querySelector('#section1') as HTMLElement;
      smoothScroll.scrollToElement(target, 0);

      expect(document.activeElement).toBe(target);
    });

    it('should handle elements with existing tabindex', () => {
      smoothScroll = new SmoothScroll({ duration: 0 });

      const target = document.querySelector('#section2') as HTMLElement;
      target.setAttribute('tabindex', '0');

      smoothScroll.scrollToElement(target, 0);

      expect(document.activeElement).toBe(target);
      expect(target.getAttribute('tabindex')).toBe('0'); // Should preserve
    });
  });
});
