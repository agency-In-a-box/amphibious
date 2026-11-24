/**
 * Navigation Module Tests
 * Tests for mobile menu toggle, dropdowns, and keyboard navigation
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { Navigation } from '../src/js/navigation';

describe('Navigation Module', () => {
  let navigation: Navigation;
  let container: HTMLElement;

  beforeEach(() => {
    // Setup DOM structure
    document.body.innerHTML = `
      <nav class="aiab-nav">
        <button id="nav_toggle" class="nav__toggle">
          <span class="nav__hamburger"></span>
        </button>
        <ul class="nav__list">
          <li><a href="#home">Home</a></li>
          <li class="aiab-nav__dropdown">
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

    container = document.querySelector('.aiab-nav') as HTMLElement;
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
      expect(container.classList.contains('aiab-is-open')).toBe(false);

      // Click to open
      toggleButton.click();
      expect(container.classList.contains('aiab-is-open')).toBe(true);

      // Click to close
      toggleButton.click();
      expect(container.classList.contains('aiab-is-open')).toBe(false);
    });

    it('should close menu on Escape key', () => {
      navigation.init();
      const toggleButton = document.querySelector('#nav_toggle') as HTMLElement;

      // Open menu
      toggleButton.click();
      expect(container.classList.contains('aiab-is-open')).toBe(true);

      // Press Escape
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);

      expect(container.classList.contains('aiab-is-open')).toBe(false);
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
      const dropdown = document.querySelector('.aiab-nav__dropdown') as HTMLElement;

      // Initially closed
      expect(dropdown.classList.contains('aiab-is-open')).toBe(false);

      // Trigger mouseenter
      const mouseEnterEvent = new MouseEvent('mouseenter');
      dropdown.dispatchEvent(mouseEnterEvent);

      expect(dropdown.classList.contains('aiab-is-open')).toBe(true);
    });

    it('should close dropdown on mouse leave', () => {
      navigation.init();
      const dropdown = document.querySelector('.aiab-nav__dropdown') as HTMLElement;

      // Open dropdown
      const mouseEnterEvent = new MouseEvent('mouseenter');
      dropdown.dispatchEvent(mouseEnterEvent);
      expect(dropdown.classList.contains('aiab-is-open')).toBe(true);

      // Close dropdown
      const mouseLeaveEvent = new MouseEvent('mouseleave');
      dropdown.dispatchEvent(mouseLeaveEvent);
      expect(dropdown.classList.contains('aiab-is-open')).toBe(false);
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
    it('should close menu when viewport becomes desktop size', async () => {
      navigation.init();
      const toggleButton = document.querySelector('#nav_toggle') as HTMLElement;

      // Open menu in mobile view
      Object.defineProperty(window, 'innerWidth', { value: 500, writable: true });
      toggleButton.click();
      expect(container.classList.contains('aiab-is-open')).toBe(true);

      // Resize to desktop
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
      window.dispatchEvent(new Event('resize'));

      // Wait for the debounced resize handler (250ms)
      await new Promise((resolve) => setTimeout(resolve, 300));
      expect(container.classList.contains('aiab-is-open')).toBe(false);
    });
  });
});

describe('Navigation API: element + options', () => {
  const siteNav = `
    <nav class="aiab-site-nav" id="site">
      <button class="aiab-nav-toggle" aria-controls="main-nav"></button>
      <ul id="main-nav" class="aiab-horizontal">
        <li><a href="/">Home</a></li>
        <li><a href="/docs/form.html">Form</a>
          <ul><li><a href="/docs/form.html#basic">Basic</a></li></ul>
        </li>
        <li><a href="#top">Top</a></li>
      </ul>
    </nav>`;
  const demoNav = `
    <section class="demo">
      <nav id="demo-nav">
        <ul class="aiab-horizontal">
          <li class="aiab-active"><a href="#">Products</a>
            <ul><li><a href="#">Web</a></li></ul>
          </li>
          <li><a href="#services">Services</a></li>
        </ul>
      </nav>
      <button id="demo-toggle">Menu</button>
    </section>`;

  beforeEach(() => {
    document.body.innerHTML = siteNav + demoNav;
  });
  afterEach(() => {
    document.body.innerHTML = '';
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
  });

  it('defaults to the site nav and leaves other navs untouched', () => {
    const nav = new Navigation();
    nav.init();
    expect(nav.element?.id).toBe('site');
    // Authored state in the demo nav is not stripped
    expect(document.querySelector('#demo-nav li')?.classList.contains('aiab-active')).toBe(true);
    nav.destroy();
  });

  it('never marks hash-only links as the current page', () => {
    const nav = Navigation.create('#demo-nav');
    expect(document.querySelectorAll('#demo-nav [aria-current]').length).toBe(0);
    nav.destroy();
  });

  it('marks the matching top-level item once, via currentPath', () => {
    // happy-dom starts at about:blank; give links a real origin to resolve against
    (window as unknown as { happyDOM: { setURL(url: string): void } }).happyDOM.setURL(
      'http://localhost:2960/',
    );
    const nav = Navigation.create('#site', { currentPath: '/docs/form.html' });
    const current = document.querySelectorAll('#site [aria-current="page"]');
    expect(current.length).toBe(1);
    expect(current[0].textContent).toBe('Form');
    nav.destroy();
  });

  it('honours highlightCurrent: false', () => {
    const nav = Navigation.create('#demo-nav', { highlightCurrent: false });
    expect(document.querySelector('#demo-nav li')?.classList.contains('aiab-active')).toBe(true);
    nav.destroy();
  });

  it('finds a toggle through aria-controls and reports state through onToggle', () => {
    const seen: boolean[] = [];
    const nav = Navigation.create('#site', { onToggle: (open) => seen.push(open) });
    const toggle = document.querySelector('.aiab-nav-toggle') as HTMLElement;
    toggle.click();
    expect(nav.isOpen).toBe(true);
    expect(document.querySelector('#site')?.classList.contains('aiab-menu-open')).toBe(true);
    expect(document.querySelector('#main-nav')?.classList.contains('aiab-is-active')).toBe(true);
    nav.close();
    expect(seen).toEqual([true, false]);
    nav.destroy();
  });

  it('accepts an explicit toggle option', () => {
    const nav = Navigation.create('#demo-nav', { toggle: '#demo-toggle' });
    (document.querySelector('#demo-toggle') as HTMLElement).click();
    expect(nav.isOpen).toBe(true);
    nav.destroy();
  });

  it('replaces an existing instance instead of doubling handlers', () => {
    const first = Navigation.create('#site');
    const second = Navigation.create('#site', { breakpoint: 960 });
    expect(Navigation.getInstance(document.querySelector('#site') as HTMLElement)).toBe(second);
    (document.querySelector('.aiab-nav-toggle') as HTMLElement).click();
    expect(second.isOpen).toBe(true); // one handler: a double toggle would leave it closed
    expect(first.isOpen).toBe(false);
    second.destroy();
  });

  it('binds tap-to-expand once, however often it is re-initialised', () => {
    Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
    const nav = Navigation.create('#site');
    nav.initMobileDropdowns();
    nav.initMobileDropdowns();
    const formLi = document.querySelectorAll('#site .aiab-horizontal > li')[1];
    const link = formLi.querySelector(':scope > a') as HTMLElement;
    link.click();
    expect(formLi.classList.contains('aiab-is-expanded')).toBe(true);
    expect(link.getAttribute('aria-expanded')).toBe('true');
    // Closing the menu collapses open submenus
    nav.open();
    nav.close();
    expect(formLi.classList.contains('aiab-is-expanded')).toBe(false);
    nav.destroy();
  });

  it('uses the breakpoint option for mobile behaviour', () => {
    Object.defineProperty(window, 'innerWidth', { value: 900, writable: true });
    const nav = Navigation.create('#site', { breakpoint: 960 });
    const formLi = document.querySelectorAll('#site .aiab-horizontal > li')[1];
    (formLi.querySelector(':scope > a') as HTMLElement).click();
    expect(formLi.classList.contains('aiab-is-expanded')).toBe(true);
    nav.destroy();
  });

  it('throws a clear error for a missing element', () => {
    expect(() => Navigation.create('#nope')).toThrow('Navigation element not found');
  });

  it('is reachable as amp.createNavigation', async () => {
    const { amp } = await import('../src/amp');
    const nav = amp.createNavigation('#demo-nav', { sticky: false });
    expect(nav).toBeInstanceOf(Navigation);
    nav.destroy();
  });
});
