/**
 * Amphibious 2.0 - Navigation Component
 * A responsive, accessible navigation system with mobile support
 */

import { Icon } from '../js/icons';

export interface NavigationOptions {
  sticky?: boolean;
  transparent?: boolean;
  breakpoint?: number;
  currentPath?: string;
  onToggle?: (isOpen: boolean) => void;
  searchEnabled?: boolean;
  themeToggle?: boolean;
  githubUrl?: string;
  githubStars?: string;
}

export class AmphibiousNavigation {
  private element: HTMLElement;
  private options: NavigationOptions;
  private isOpen: boolean = false;
  private isSticky: boolean = false;
  private scrollThreshold: number = 100;

  constructor(selector: string | HTMLElement, options: NavigationOptions = {}) {
    this.element = typeof selector === 'string'
      ? document.querySelector(selector) as HTMLElement
      : selector;

    if (!this.element) {
      throw new Error(`Navigation element not found: ${selector}`);
    }

    this.options = {
      sticky: true,
      transparent: false,
      breakpoint: 768,
      searchEnabled: true,
      themeToggle: true,
      githubUrl: 'https://github.com/your-org/amphibious',
      ...options
    };

    this.init();
  }

  private init(): void {
    this.render();
    this.attachEventListeners();
    this.initializeIcons();
    this.highlightCurrentPage();

    if (this.options.sticky) {
      this.initStickyBehavior();
    }
  }

  private render(): void {
    const nav = document.createElement('nav');
    nav.className = 'amp-nav';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Main navigation');

    if (this.options.transparent) {
      nav.classList.add('amp-nav--transparent');
    }

    nav.innerHTML = `
      <div class="container">
        <div class="amp-nav__wrapper">
          <div class="amp-nav__brand">
            <a href="/" class="amp-nav__logo">
              <i data-lucide="waves" class="amp-nav__icon"></i>
              <span class="amp-nav__text">Amphibious 2.0</span>
            </a>
          </div>

          <ul class="amp-nav__menu" id="navMenu">
            <li class="amp-nav__item">
              <a href="/docs/" class="amp-nav__link" data-path="/docs/">
                Documentation
              </a>
              <div class="amp-nav__dropdown">
                <a href="/docs/getting-started.html" class="amp-nav__dropdown-link">Getting Started</a>
                <a href="/docs/grid-system.html" class="amp-nav__dropdown-link">Grid System</a>
                <a href="/docs/components/" class="amp-nav__dropdown-link">Components</a>
                <a href="/docs/api-reference.html" class="amp-nav__dropdown-link">API Reference</a>
              </div>
            </li>
            <li class="amp-nav__item">
              <a href="/examples/" class="amp-nav__link" data-path="/examples/">
                Examples
              </a>
              <div class="amp-nav__dropdown">
                <a href="/examples/icons-enhanced.html" class="amp-nav__dropdown-link">Icons</a>
                <a href="/examples/tooltip-enhanced.html" class="amp-nav__dropdown-link">Tooltips</a>
                <a href="/examples/modal-enhanced.html" class="amp-nav__dropdown-link">Modals</a>
                <a href="/examples/e-commerce-catalog.html" class="amp-nav__dropdown-link">E-commerce</a>
              </div>
            </li>
            <li class="amp-nav__item">
              <a href="/playground/" class="amp-nav__link" data-path="/playground/">
                Playground
              </a>
            </li>
            <li class="amp-nav__item">
              <a href="/showcase/" class="amp-nav__link" data-path="/showcase/">
                Showcase
              </a>
            </li>
          </ul>

          <div class="amp-nav__actions">
            ${this.options.searchEnabled ? `
              <button class="amp-nav__search" aria-label="Search" data-tooltip="Search docs">
                <i data-lucide="search"></i>
              </button>
            ` : ''}
            ${this.options.themeToggle ? `
              <button class="amp-nav__theme" aria-label="Toggle theme" data-tooltip="Toggle theme">
                <i data-lucide="moon" id="themeIcon"></i>
              </button>
            ` : ''}
            ${this.options.githubUrl ? `
              <a href="${this.options.githubUrl}" class="amp-nav__github" target="_blank" rel="noopener" data-tooltip="View on GitHub">
                <i data-lucide="github"></i>
                ${this.options.githubStars ? `<span class="amp-nav__stars">${this.options.githubStars}</span>` : ''}
              </a>
            ` : ''}
          </div>

          <button class="amp-nav__toggle" aria-label="Toggle menu" aria-expanded="false">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <!-- Mobile Menu Overlay -->
      <div class="amp-nav__overlay" aria-hidden="true"></div>

      <!-- Search Modal -->
      ${this.options.searchEnabled ? `
        <div class="amp-nav__search-modal" aria-hidden="true">
          <div class="amp-nav__search-content">
            <input type="search" class="amp-nav__search-input" placeholder="Search documentation...">
            <button class="amp-nav__search-close" aria-label="Close search">
              <i data-lucide="x"></i>
            </button>
            <div class="amp-nav__search-results"></div>
          </div>
        </div>
      ` : ''}
    `;

    // Replace existing element content
    this.element.innerHTML = '';
    this.element.appendChild(nav);
  }

  private attachEventListeners(): void {
    // Mobile menu toggle
    const toggleBtn = this.element.querySelector('.amp-nav__toggle');
    const menu = this.element.querySelector('.amp-nav__menu');
    const overlay = this.element.querySelector('.amp-nav__overlay');

    if (toggleBtn && menu) {
      toggleBtn.addEventListener('click', () => {
        this.toggleMenu();
      });
    }

    if (overlay) {
      overlay.addEventListener('click', () => {
        this.closeMenu();
      });
    }

    // Search functionality
    if (this.options.searchEnabled) {
      const searchBtn = this.element.querySelector('.amp-nav__search');
      const searchModal = this.element.querySelector('.amp-nav__search-modal');
      const searchClose = this.element.querySelector('.amp-nav__search-close');
      const searchInput = this.element.querySelector('.amp-nav__search-input') as HTMLInputElement;

      if (searchBtn && searchModal) {
        searchBtn.addEventListener('click', () => {
          searchModal.classList.add('amp-nav__search-modal--open');
          searchModal.setAttribute('aria-hidden', 'false');
          searchInput?.focus();
        });
      }

      if (searchClose && searchModal) {
        searchClose.addEventListener('click', () => {
          searchModal.classList.remove('amp-nav__search-modal--open');
          searchModal.setAttribute('aria-hidden', 'true');
        });
      }

      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.handleSearch((e.target as HTMLInputElement).value);
        });
      }
    }

    // Theme toggle
    if (this.options.themeToggle) {
      const themeBtn = this.element.querySelector('.amp-nav__theme');
      if (themeBtn) {
        themeBtn.addEventListener('click', () => {
          this.toggleTheme();
        });
      }
    }

    // Dropdown menus
    const dropdownItems = this.element.querySelectorAll('.amp-nav__item');
    dropdownItems.forEach(item => {
      const link = item.querySelector('.amp-nav__link');
      const dropdown = item.querySelector('.amp-nav__dropdown');

      if (link && dropdown) {
        // Desktop hover
        item.addEventListener('mouseenter', () => {
          if (window.innerWidth > this.options.breakpoint!) {
            dropdown.classList.add('amp-nav__dropdown--open');
          }
        });

        item.addEventListener('mouseleave', () => {
          if (window.innerWidth > this.options.breakpoint!) {
            dropdown.classList.remove('amp-nav__dropdown--open');
          }
        });

        // Mobile click
        link.addEventListener('click', (e) => {
          if (window.innerWidth <= this.options.breakpoint! && dropdown) {
            e.preventDefault();
            dropdown.classList.toggle('amp-nav__dropdown--open');
          }
        });
      }
    });

    // Window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > this.options.breakpoint! && this.isOpen) {
        this.closeMenu();
      }
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.isOpen) {
          this.closeMenu();
        }
        const searchModal = this.element.querySelector('.amp-nav__search-modal');
        if (searchModal?.classList.contains('amp-nav__search-modal--open')) {
          searchModal.classList.remove('amp-nav__search-modal--open');
          searchModal.setAttribute('aria-hidden', 'true');
        }
      }
    });
  }

  private initStickyBehavior(): void {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateSticky = () => {
      const currentScrollY = window.scrollY;
      const nav = this.element.querySelector('.amp-nav') as HTMLElement;

      if (currentScrollY > this.scrollThreshold) {
        if (!this.isSticky) {
          this.isSticky = true;
          nav.classList.add('amp-nav--sticky');
        }

        // Hide/show on scroll direction
        if (currentScrollY > lastScrollY && currentScrollY > 500) {
          nav.classList.add('amp-nav--hidden');
        } else {
          nav.classList.remove('amp-nav--hidden');
        }
      } else {
        if (this.isSticky) {
          this.isSticky = false;
          nav.classList.remove('amp-nav--sticky');
          nav.classList.remove('amp-nav--hidden');
        }
      }

      lastScrollY = currentScrollY;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateSticky);
        ticking = true;
      }
    });
  }

  private toggleMenu(): void {
    this.isOpen = !this.isOpen;
    const nav = this.element.querySelector('.amp-nav');
    const menu = this.element.querySelector('.amp-nav__menu');
    const toggle = this.element.querySelector('.amp-nav__toggle');
    const overlay = this.element.querySelector('.amp-nav__overlay');

    if (nav && menu && toggle && overlay) {
      if (this.isOpen) {
        nav.classList.add('amp-nav--open');
        menu.classList.add('amp-nav__menu--open');
        toggle.classList.add('amp-nav__toggle--open');
        overlay.classList.add('amp-nav__overlay--visible');
        toggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      } else {
        nav.classList.remove('amp-nav--open');
        menu.classList.remove('amp-nav__menu--open');
        toggle.classList.remove('amp-nav__toggle--open');
        overlay.classList.remove('amp-nav__overlay--visible');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }

      if (this.options.onToggle) {
        this.options.onToggle(this.isOpen);
      }
    }
  }

  private closeMenu(): void {
    if (this.isOpen) {
      this.toggleMenu();
    }
  }

  private highlightCurrentPage(): void {
    const currentPath = this.options.currentPath || window.location.pathname;
    const links = this.element.querySelectorAll('.amp-nav__link');

    links.forEach(link => {
      const linkPath = link.getAttribute('data-path');
      if (linkPath && currentPath.startsWith(linkPath)) {
        link.classList.add('amp-nav__link--active');
      }
    });
  }

  private toggleTheme(): void {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    const themeIcon = this.element.querySelector('#themeIcon');

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    if (themeIcon) {
      themeIcon.setAttribute('data-lucide', newTheme === 'dark' ? 'sun' : 'moon');
      Icon.init();
    }
  }

  private handleSearch(query: string): void {
    const resultsContainer = this.element.querySelector('.amp-nav__search-results');
    if (!resultsContainer) return;

    if (query.length < 2) {
      resultsContainer.innerHTML = '';
      return;
    }

    // Mock search results - in production, this would query actual content
    const mockResults = [
      { title: 'Grid System', path: '/docs/grid-system.html', category: 'Documentation' },
      { title: 'Icons', path: '/examples/icons-enhanced.html', category: 'Examples' },
      { title: 'Tooltips', path: '/docs/components/tooltips.html', category: 'Components' },
      { title: 'Getting Started', path: '/docs/getting-started.html', category: 'Documentation' },
    ].filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );

    if (mockResults.length === 0) {
      resultsContainer.innerHTML = `
        <div class="amp-nav__search-empty">
          No results found for "${query}"
        </div>
      `;
    } else {
      resultsContainer.innerHTML = mockResults.map(result => `
        <a href="${result.path}" class="amp-nav__search-result">
          <span class="amp-nav__search-result-title">${result.title}</span>
          <span class="amp-nav__search-result-category">${result.category}</span>
        </a>
      `).join('');
    }
  }

  private initializeIcons(): void {
    setTimeout(() => {
      Icon.init();
    }, 10);
  }

  public destroy(): void {
    this.element.innerHTML = '';
  }
}

// Export factory function
export function createNavigation(selector: string | HTMLElement, options?: NavigationOptions): AmphibiousNavigation {
  return new AmphibiousNavigation(selector, options);
}