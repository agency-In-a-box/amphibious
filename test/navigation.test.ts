/**
 * Navigation Module Tests
 * Tests for mobile menu toggle, dropdowns, and keyboard navigation
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { Navigation } from '../src/js/navigation';

describe('Navigation Module', () => {
  let navigation: Navigation;
  let container: HTMLElement;

  beforeEach(() => {
    // Setup DOM structure
    document.body.innerHTML = `
      <nav class="nav">
        <button id="nav_toggle" class="nav__toggle">
          <span class="nav__hamburger"></span>
        </button>
        <ul class="nav__list">
          <li><a href="#home">Home</a></li>
          <li class="nav__dropdown">
            <a href="#services">Services</a>
            <ul class="nav__dropdown-menu">
              <li><a href="#web">Web Design</a></li>
              <li><a href="#app">App Development</a></li>
            </ul>
          </li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
    `;

    container = document.querySelector('.nav') as HTMLElement;
    navigation = new Navigation();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Mobile Menu Toggle', () => {
    it('should initialize without errors', () => {
      expect(() => navigation.init()).not.toThrow();
    });

    it('should toggle menu open state on button click', () => {
      navigation.init();
      const toggleButton = document.querySelector('#nav_toggle') as HTMLElement;

      // Initially closed
      expect(container.classList.contains('is-open')).toBe(false);

      // Click to open
      toggleButton.click();
      expect(container.classList.contains('is-open')).toBe(true);

      // Click to close
      toggleButton.click();
      expect(container.classList.contains('is-open')).toBe(false);
    });

    it('should close menu on Escape key', () => {
      navigation.init();
      const toggleButton = document.querySelector('#nav_toggle') as HTMLElement;

      // Open menu
      toggleButton.click();
      expect(container.classList.contains('is-open')).toBe(true);

      // Press Escape
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);

      expect(container.classList.contains('is-open')).toBe(false);
    });

    it('should set correct ARIA attributes', () => {
      navigation.init();
      const toggleButton = document.querySelector('#nav_toggle') as HTMLElement;

      // Initially
      expect(toggleButton.getAttribute('aria-expanded')).toBe('false');

      // After opening
      toggleButton.click();
      expect(toggleButton.getAttribute('aria-expanded')).toBe('true');

      // After closing
      toggleButton.click();
      expect(toggleButton.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('Dropdown Menus', () => {
    it('should open dropdown on hover', () => {
      navigation.init();
      const dropdown = document.querySelector('.nav__dropdown') as HTMLElement;

      // Initially closed
      expect(dropdown.classList.contains('is-open')).toBe(false);

      // Trigger mouseenter
      const mouseEnterEvent = new MouseEvent('mouseenter');
      dropdown.dispatchEvent(mouseEnterEvent);

      expect(dropdown.classList.contains('is-open')).toBe(true);
    });

    it('should close dropdown on mouse leave', () => {
      navigation.init();
      const dropdown = document.querySelector('.nav__dropdown') as HTMLElement;

      // Open dropdown
      const mouseEnterEvent = new MouseEvent('mouseenter');
      dropdown.dispatchEvent(mouseEnterEvent);
      expect(dropdown.classList.contains('is-open')).toBe(true);

      // Close dropdown
      const mouseLeaveEvent = new MouseEvent('mouseleave');
      dropdown.dispatchEvent(mouseLeaveEvent);
      expect(dropdown.classList.contains('is-open')).toBe(false);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate with arrow keys', () => {
      navigation.init();
      const links = container.querySelectorAll('a, button');
      const firstLink = links[0] as HTMLElement;
      const secondLink = links[1] as HTMLElement;

      // Focus first link
      firstLink.focus();
      expect(document.activeElement).toBe(firstLink);

      // Arrow right to next
      const arrowRightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      firstLink.dispatchEvent(arrowRightEvent);
      expect(document.activeElement).toBe(secondLink);
    });

    it('should wrap navigation at boundaries', () => {
      navigation.init();
      const links = container.querySelectorAll('a, button');
      const firstLink = links[0] as HTMLElement;
      const lastLink = links[links.length - 1] as HTMLElement;

      // Focus last link
      lastLink.focus();

      // Arrow right should wrap to first
      const arrowRightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      lastLink.dispatchEvent(arrowRightEvent);
      expect(document.activeElement).toBe(firstLink);
    });
  });

  describe('Responsive Behavior', () => {
    it('should close menu when viewport becomes desktop size', () => {
      navigation.init();
      const toggleButton = document.querySelector('#nav_toggle') as HTMLElement;

      // Open menu in mobile view
      Object.defineProperty(window, 'innerWidth', { value: 500, writable: true });
      toggleButton.click();
      expect(container.classList.contains('is-open')).toBe(true);

      // Resize to desktop
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
      window.dispatchEvent(new Event('resize'));

      // Wait for debounced resize handler
      setTimeout(() => {
        expect(container.classList.contains('is-open')).toBe(false);
      }, 300);
    });
  });
});
