/**
 * Navigation Module - Amphibious 2.0
 * Enhances navigation markup: mobile menu toggle, dropdowns, keyboard
 * navigation, current-page highlighting and scroll state.
 */

import { getFocusableElements, trapFocus } from '../utils/focus-trap';

/** Options for {@link Navigation}. Every option is optional. */
export interface NavigationOptions {
  /**
   * Viewport width in px at or below which the mobile menu and tap-to-expand
   * dropdowns apply. Defaults to 768, matching `--bp-md-down` in the CSS.
   */
  breakpoint?: number;
  /**
   * Toggle `.is-scrolled` on the nav once the page scrolls past the
   * `.aiab-docs-header` / `.aiab-hero`. Defaults to true for `.aiab-site-nav`,
   * false otherwise.
   */
  sticky?: boolean;
  /** Mark the link for the current page with `.aiab-active` + `aria-current`. Defaults to true. */
  highlightCurrent?: boolean;
  /** Path used for current-page matching instead of `location.pathname`. */
  currentPath?: string;
  /** Menu toggle button (element or selector). Defaults to auto-detection. */
  toggle?: string | HTMLElement;
  /** Called after the mobile menu opens or closes. */
  onToggle?: (isOpen: boolean) => void;
}

const ROOT_SELECTOR = '.aiab-nav, .navigation, nav';
const TOGGLE_SELECTOR = '#nav_toggle, .nav__toggle, .aiab-nav-toggle';
const DROPDOWN_SELECTOR = '.aiab-nav__dropdown, .aiab-dropdown';

/** Treat `/docs/`, `/docs/index.html` and `/docs/index` as the same page; drop `.html`. */
function normalizePath(path: string): string {
  return path.replace(/\/index(\.html)?$/, '/').replace(/\.html$/, '') || '/';
}

/**
 * Responsive navigation with mobile menu, dropdowns, keyboard navigation,
 * focus trapping and current-page highlighting.
 *
 * Everything is scoped to one root element. With no arguments it uses the
 * page's site nav, which is what the auto-initialiser does.
 *
 * @example
 * ```ts
 * // Markup-only: the site nav is enhanced automatically on load.
 *
 * // Another nav on the page, with options:
 * const nav = Navigation.create('#docs-nav', { breakpoint: 960, sticky: false });
 * nav.open();
 * nav.destroy();
 *
 * // Same thing through the global API:
 * amp.createNavigation('#docs-nav', { onToggle: (open) => console.log(open) });
 * ```
 */
export class Navigation {
  private static instances = new WeakMap<HTMLElement, Navigation>();

  private navElement: HTMLElement | null;
  private toggleButton: HTMLElement | null;
  private readonly options: NavigationOptions;
  private readonly mobileBreakpoint: number;
  private eventListeners: Array<{
    element: Element | Document | Window;
    type: string;
    handler: EventListener;
  }> = [];
  private boundDropdownLinks = new WeakSet<Element>();
  private resizeTimer: ReturnType<typeof setTimeout> | null = null;
  private tabKeyHandler: ((e: KeyboardEvent) => void) | null = null;
  private menuOpen = false;
  private scrollTicking = false;

  /**
   * @param element - Root element or selector. Omit to use the page's site nav
   *   (`.aiab-site-nav`, else the first `.aiab-nav, .navigation, nav`).
   * @param options - See {@link NavigationOptions}.
   * @throws If a selector or element is given but not found.
   */
  constructor(element?: string | HTMLElement | null, options: NavigationOptions = {}) {
    const explicit = element !== undefined && element !== null;
    const root =
      typeof element === 'string'
        ? document.querySelector<HTMLElement>(element)
        : explicit
          ? element
          : (document.querySelector<HTMLElement>('.aiab-site-nav') ??
            document.querySelector<HTMLElement>(ROOT_SELECTOR));

    if (explicit && !root) {
      throw new Error(`[Amphibious] Navigation element not found: ${String(element)}`);
    }

    this.navElement = root;
    this.options = options;
    this.mobileBreakpoint = options.breakpoint ?? 768;
    this.toggleButton = this.findToggle(explicit);
  }

  /**
   * Create and initialise a navigation on `element`. If that element already
   * has an instance (for example the auto-initialised site nav), it is
   * destroyed first so the new options apply and handlers never double up.
   */
  static create(
    element?: string | HTMLElement | null,
    options: NavigationOptions = {},
  ): Navigation {
    const nav = new Navigation(element, options);
    if (nav.navElement) Navigation.instances.get(nav.navElement)?.destroy();
    nav.init();
    return nav;
  }

  /** The instance attached to `element`, if any. */
  static getInstance(element: HTMLElement): Navigation | undefined {
    return Navigation.instances.get(element);
  }

  /** Root element this instance manages (null when the page has no nav). */
  get element(): HTMLElement | null {
    return this.navElement;
  }

  /** Whether the mobile menu is open. */
  get isOpen(): boolean {
    return this.menuOpen;
  }

  /**
   * Initialize all navigation functionality: active states, mobile toggle,
   * dropdowns, keyboard navigation, mobile dropdowns, resize and scroll
   * handling. Must be called after construction ({@link Navigation.create}
   * does both).
   */
  init(): void {
    if (this.navElement) Navigation.instances.set(this.navElement, this);
    this.setActiveStates();
    this.setupMobileToggle();
    this.setupDropdowns();
    this.setupKeyboardNav();
    this.initMobileDropdowns();
    this.handleResize();
    this.setupScrollState();
  }

  /**
   * Remove all tracked event listeners, close the menu, and clean up timers.
   * Call this before discarding the instance to prevent memory leaks.
   */
  destroy(): void {
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    if (this.tabKeyHandler) document.removeEventListener('keydown', this.tabKeyHandler);

    for (const { element, type, handler } of this.eventListeners) {
      element.removeEventListener(type, handler);
    }
    this.eventListeners = [];
    this.boundDropdownLinks = new WeakSet();

    if (this.menuOpen) this.closeMenu();
    if (this.navElement && Navigation.instances.get(this.navElement) === this) {
      Navigation.instances.delete(this.navElement);
    }
  }

  /** Open the mobile menu. */
  open(): void {
    if (!this.menuOpen) this.toggleMenu();
  }

  /** Close the mobile menu. */
  close(): void {
    if (this.menuOpen) this.closeMenu();
  }

  /** Toggle the mobile menu. */
  toggle(): void {
    this.toggleMenu();
  }

  /**
   * Highlight the current page inside this nav's `.aiab-horizontal` lists.
   * The best-matching top-level item gets `.aiab-active` and its link gets
   * `aria-current="page"`. Hash-only links (`#…`) never count as the current
   * page; a sub-link whose hash matches `location.hash` gets `.aiab-active`.
   */
  setActiveStates(): void {
    if (this.options.highlightCurrent === false) return;
    const lists = this.within('.aiab-horizontal');
    if (lists.length === 0) return;

    const here = normalizePath(this.options.currentPath ?? window.location.pathname);
    const currentHash = window.location.hash;

    for (const list of lists) {
      list.querySelectorAll('li').forEach((li) => li.classList.remove('aiab-active'));
      list.querySelectorAll('a').forEach((a) => {
        a.removeAttribute('aria-current');
        a.classList.remove('aiab-active');
      });

      let best: { li: Element; score: number } | null = null;

      list.querySelectorAll('a[href]').forEach((link) => {
        const href = link.getAttribute('href') ?? '';

        if (href.startsWith('#')) {
          if (currentHash && href === currentHash) link.classList.add('aiab-active');
          return;
        }

        let url: URL;
        try {
          url = new URL(href, window.location.href);
        } catch {
          return;
        }
        if (url.origin !== window.location.origin) return;

        const path = normalizePath(url.pathname);
        const isExact = path === here;
        const isParent = path !== '/' && path.endsWith('/') && here.startsWith(path);
        if (!isExact && !isParent) return;

        if (isExact && currentHash && url.hash === currentHash) link.classList.add('aiab-active');

        // Prefer exact matches, then the longest parent path.
        const score = (isExact ? 10_000 : 0) + path.length;
        const topLi = link.closest('.aiab-horizontal > li');
        if (topLi && list.contains(topLi) && (!best || score > best.score)) {
          best = { li: topLi, score };
        }
      });

      const match = best as { li: Element; score: number } | null;
      if (match) {
        match.li.classList.add('aiab-active');
        match.li.querySelector(':scope > a')?.setAttribute('aria-current', 'page');
      }
    }
  }

  /**
   * Tap-to-expand for list items that contain a submenu. At or below the
   * breakpoint, tapping the item's link toggles `.aiab-is-expanded` instead
   * of navigating. Safe to call repeatedly: each link is bound once.
   */
  initMobileDropdowns(): void {
    for (const list of this.within('.aiab-horizontal')) {
      list.querySelectorAll('li').forEach((li) => {
        if (!li.querySelector(':scope > ul')) return;
        const link = li.querySelector(':scope > a');
        if (!link || this.boundDropdownLinks.has(link)) return;
        this.boundDropdownLinks.add(link);
        link.setAttribute('aria-expanded', 'false');

        this.addEventListener(link, 'click', (e) => {
          if (!this.isMobile()) return;
          e.preventDefault();
          const expanded = li.classList.toggle('aiab-is-expanded');
          link.setAttribute('aria-expanded', String(expanded));
        });
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------------

  private isMobile(): boolean {
    return window.innerWidth <= this.mobileBreakpoint;
  }

  /** The root itself (if it matches) plus matching descendants. */
  private within(selector: string): Element[] {
    if (!this.navElement) return [];
    const found = Array.from(this.navElement.querySelectorAll(selector));
    return this.navElement.matches(selector) ? [this.navElement, ...found] : found;
  }

  private findToggle(explicitRoot: boolean): HTMLElement | null {
    const { toggle } = this.options;
    if (typeof toggle === 'string') return document.querySelector<HTMLElement>(toggle);
    if (toggle) return toggle;
    if (!this.navElement) return null;

    const inside = this.navElement.querySelector<HTMLElement>(TOGGLE_SELECTOR);
    if (inside) return inside;

    // A toggle elsewhere that declares what it controls
    const ids = [this.navElement.id, ...this.within('[id]').map((el) => el.id)].filter(Boolean);
    for (const id of ids) {
      const safe =
        typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(id) : id.replace(/"/g, '\\"');
      const byControls = document.querySelector<HTMLElement>(`[aria-controls="${safe}"]`);
      if (byControls) return byControls;
    }

    // Auto mode only: keep the original page-wide lookup
    return explicitRoot ? null : document.querySelector<HTMLElement>(TOGGLE_SELECTOR);
  }

  private addEventListener(
    element: Element | Document | Window,
    type: string,
    handler: EventListener,
  ): void {
    element.addEventListener(type, handler);
    this.eventListeners.push({ element, type, handler });
  }

  private setupMobileToggle(): void {
    if (!this.toggleButton) return;

    // ARIA: expose menu state on the toggle; label icon-only toggles
    this.toggleButton.setAttribute('aria-expanded', 'false');
    if (!this.toggleButton.hasAttribute('aria-label') && !this.toggleButton.textContent?.trim()) {
      this.toggleButton.setAttribute('aria-label', 'Toggle navigation menu');
    }

    this.addEventListener(this.toggleButton, 'click', (e) => {
      e.preventDefault();
      this.toggleMenu();
    });

    // Close when clicking outside
    this.addEventListener(document, 'click', (e) => {
      const target = e.target as Node;
      if (
        this.menuOpen &&
        !this.navElement?.contains(target) &&
        !this.toggleButton?.contains(target)
      ) {
        this.closeMenu();
      }
    });

    // Close on Escape and return focus to the toggle
    this.addEventListener(document, 'keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Escape' && this.menuOpen) {
        this.closeMenu();
        this.toggleButton?.focus();
      }
    });
  }

  private setOpenState(open: boolean): void {
    this.menuOpen = open;

    if (this.navElement) {
      this.navElement.classList.toggle('aiab-is-open', open);
      this.navElement.classList.toggle('aiab-nav--open', open);
      this.navElement.classList.toggle('aiab-menu-open', open);
      // Lists not adjacent to the toggle open through `.aiab-horizontal.aiab-is-active`
      for (const list of this.within('.aiab-horizontal')) {
        list.classList.toggle('aiab-is-active', open);
      }
    }

    if (this.toggleButton) {
      this.toggleButton.classList.toggle('aiab-is-active', open);
      this.toggleButton.setAttribute('aria-expanded', String(open));
      this.toggleButton
        .querySelector('.aiab-nav__hamburger, .hamburger')
        ?.classList.toggle('aiab-is-active', open);
    }

    if (open) {
      this.setupFocusTrap();
    } else {
      // Reopening starts from a clean state: collapse any expanded submenus
      for (const li of this.within('li.aiab-is-expanded')) {
        li.classList.remove('aiab-is-expanded');
        li.querySelector(':scope > a')?.setAttribute('aria-expanded', 'false');
      }
    }
    this.options.onToggle?.(open);
  }

  private toggleMenu(): void {
    this.setOpenState(!this.menuOpen);
  }

  private closeMenu(): void {
    this.setOpenState(false);
  }

  private setupDropdowns(): void {
    for (const dropdown of this.within(DROPDOWN_SELECTOR)) {
      const trigger = dropdown.querySelector('a, button');
      if (!trigger) continue;

      this.addEventListener(dropdown, 'mouseenter', () => dropdown.classList.add('aiab-is-open'));
      this.addEventListener(dropdown, 'mouseleave', () =>
        dropdown.classList.remove('aiab-is-open'),
      );
      this.addEventListener(trigger, 'click', (e) => {
        if (this.isMobile()) {
          e.preventDefault();
          dropdown.classList.toggle('aiab-is-open');
        }
      });
    }
  }

  private setupKeyboardNav(): void {
    if (!this.navElement) return;
    const links = this.navElement.querySelectorAll('a, button');

    links.forEach((link, index) => {
      this.addEventListener(link, 'keydown', (e) => {
        const key = (e as KeyboardEvent).key;
        if (key === 'ArrowRight' || key === 'ArrowDown') {
          e.preventDefault();
          (links[(index + 1) % links.length] as HTMLElement).focus();
        } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
          e.preventDefault();
          (links[(index - 1 + links.length) % links.length] as HTMLElement).focus();
        }
      });
    });
  }

  private handleResize(): void {
    this.addEventListener(window, 'resize', () => {
      if (this.resizeTimer) clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        if (!this.isMobile() && this.menuOpen) this.closeMenu();
      }, 250);
    });
  }

  /** Toggle `.is-scrolled` once the page scrolls past the header/hero (rAF-throttled). */
  private setupScrollState(): void {
    const nav = this.navElement;
    if (!nav) return;
    const sticky = this.options.sticky ?? nav.matches('.aiab-site-nav');
    if (!sticky) return;

    const scrollHandler = () => {
      if (this.scrollTicking) return;
      this.scrollTicking = true;
      requestAnimationFrame(() => {
        const header = document.querySelector('.aiab-docs-header, .aiab-hero');
        const threshold = header ? header.getBoundingClientRect().bottom + window.scrollY : 80;
        nav.classList.toggle('is-scrolled', window.scrollY > threshold);
        this.scrollTicking = false;
      });
    };

    this.addEventListener(window, 'scroll', scrollHandler);
    scrollHandler();
  }

  /** Keep Tab / Shift+Tab inside the open mobile menu. */
  private setupFocusTrap(): void {
    const nav = this.navElement;
    if (!nav || getFocusableElements(nav).length === 0) return;

    if (this.tabKeyHandler) document.removeEventListener('keydown', this.tabKeyHandler);

    this.tabKeyHandler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !this.menuOpen) return;
      trapFocus(e, getFocusableElements(nav));
    };
    document.addEventListener('keydown', this.tabKeyHandler);
  }
}

/**
 * Auto-initialise the page's site nav when the DOM is ready, and expose
 * `window.amphibiousNav` for scripts that need the instance.
 */
function initNavigation() {
  try {
    const nav = new Navigation();
    if (!nav.element || Navigation.getInstance(nav.element)) return;
    nav.init();
    window.amphibiousNav = {
      instance: nav,
      initMobileDropdowns: () => nav.initMobileDropdowns(),
      setActiveStates: () => nav.setActiveStates(),
    };
  } catch (error) {
    console.error('[Amphibious] Navigation auto-init failed:', error);
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
  } else {
    initNavigation();
  }
}

export default Navigation;
