/**
 * A.mphibio.us Navigation JavaScript
 * Modern, accessible navigation component functionality
 *
 * @version 4.0.0
 * @author A.mphibio.us Framework
 */

((window, document) => {
  // Utility functions
  const utils = {
    // Debounce function for performance
    debounce: (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    // Trap focus within element
    trapFocus: (element) => {
      const focusableElements = element.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])',
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      });
    },

    // Get next/previous sibling that matches selector
    getSibling: (element, selector, direction = 'next') => {
      let sibling = element[direction === 'next' ? 'nextElementSibling' : 'previousElementSibling'];
      while (sibling) {
        if (sibling.matches(selector)) return sibling;
        sibling = sibling[direction === 'next' ? 'nextElementSibling' : 'previousElementSibling'];
      }
      return null;
    },

    // Smooth scroll to element
    scrollToElement: (element, offset = 0) => {
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    },
  };

  /**
   * Primary Navigation Handler
   */
  class Navigation {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        breakpoint: 768,
        closeOnOutsideClick: true,
        closeOnEscape: true,
        dropdownHoverDelay: 100,
        ...options,
      };
      this.isOpen = false;
      this.init();
    }

    init() {
      this.setupElements();
      this.bindEvents();
      this.setupAccessibility();
    }

    setupElements() {
      this.toggle = this.element.querySelector('.nav__toggle');
      this.menu = this.element.querySelector('.nav__menu');
      this.mobileMenu = this.element.querySelector('.nav__mobile');
      this.overlay = this.element.querySelector('.nav__overlay');
      this.mobileClose = this.element.querySelector('.nav__mobile-close');
      this.dropdowns = this.element.querySelectorAll('.nav__item--dropdown');
      this.megaMenus = this.element.querySelectorAll('.nav__item--mega');
    }

    bindEvents() {
      // Mobile toggle
      if (this.toggle) {
        this.toggle.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleMobileMenu();
        });
      }

      // Mobile close button
      if (this.mobileClose) {
        this.mobileClose.addEventListener('click', (e) => {
          e.preventDefault();
          this.closeMobileMenu();
        });
      }

      // Overlay click
      if (this.overlay) {
        this.overlay.addEventListener('click', () => {
          this.closeMobileMenu();
        });
      }

      // Dropdown menus
      this.dropdowns.forEach((dropdown) => {
        this.setupDropdown(dropdown);
      });

      // Mega menus
      this.megaMenus.forEach((megaMenu) => {
        this.setupMegaMenu(megaMenu);
      });

      // Escape key
      if (this.options.closeOnEscape) {
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && this.isOpen) {
            this.closeMobileMenu();
            this.closeAllDropdowns();
          }
        });
      }

      // Outside click
      if (this.options.closeOnOutsideClick) {
        document.addEventListener('click', (e) => {
          if (!this.element.contains(e.target)) {
            this.closeAllDropdowns();
          }
        });
      }

      // Resize handler
      window.addEventListener(
        'resize',
        utils.debounce(() => {
          if (window.innerWidth > this.options.breakpoint && this.isOpen) {
            this.closeMobileMenu();
          }
        }, 250),
      );
    }

    setupAccessibility() {
      // Set ARIA attributes
      if (this.toggle && this.mobileMenu) {
        this.toggle.setAttribute('aria-expanded', 'false');
        this.toggle.setAttribute('aria-controls', this.mobileMenu.id || 'mobile-menu');
        this.mobileMenu.setAttribute('aria-hidden', 'true');
      }

      // Trap focus in mobile menu
      if (this.mobileMenu) {
        utils.trapFocus(this.mobileMenu);
      }
    }

    setupDropdown(dropdown) {
      const link = dropdown.querySelector('.nav__link');
      const menu = dropdown.querySelector('.nav__dropdown');
      let hoverTimer;

      // Hover events (desktop)
      dropdown.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => {
          this.openDropdown(dropdown);
        }, this.options.dropdownHoverDelay);
      });

      dropdown.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => {
          this.closeDropdown(dropdown);
        }, this.options.dropdownHoverDelay);
      });

      // Keyboard events
      link.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleDropdown(dropdown);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.openDropdown(dropdown);
          this.focusFirstMenuItem(dropdown);
        }
      });

      // Menu item keyboard navigation
      const menuItems = menu.querySelectorAll('.nav__dropdown-link');
      menuItems.forEach((item, index) => {
        item.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextItem = menuItems[index + 1] || menuItems[0];
            nextItem.focus();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevItem = menuItems[index - 1] || menuItems[menuItems.length - 1];
            prevItem.focus();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            this.closeDropdown(dropdown);
            link.focus();
          }
        });
      });
    }

    setupMegaMenu(megaMenu) {
      const link = megaMenu.querySelector('.nav__link');
      const menu = megaMenu.querySelector('.nav__mega-menu');
      let hoverTimer;

      // Similar setup as dropdown but for mega menus
      megaMenu.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimer);
        this.openMegaMenu(megaMenu);
      });

      megaMenu.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => {
          this.closeMegaMenu(megaMenu);
        }, this.options.dropdownHoverDelay);
      });

      link.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleMegaMenu(megaMenu);
        }
      });
    }

    toggleMobileMenu() {
      if (this.isOpen) {
        this.closeMobileMenu();
      } else {
        this.openMobileMenu();
      }
    }

    openMobileMenu() {
      this.isOpen = true;
      if (this.mobileMenu) this.mobileMenu.classList.add('is-open');
      if (this.overlay) this.overlay.classList.add('is-open');
      if (this.toggle) {
        this.toggle.setAttribute('aria-expanded', 'true');
        this.toggle.classList.add('is-open');
      }
      if (this.mobileMenu) this.mobileMenu.setAttribute('aria-hidden', 'false');

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Focus first menu item
      setTimeout(() => {
        const firstMenuItem = this.mobileMenu?.querySelector('.nav__mobile-link');
        if (firstMenuItem) firstMenuItem.focus();
      }, 300);
    }

    closeMobileMenu() {
      this.isOpen = false;
      if (this.mobileMenu) this.mobileMenu.classList.remove('is-open');
      if (this.overlay) this.overlay.classList.remove('is-open');
      if (this.toggle) {
        this.toggle.setAttribute('aria-expanded', 'false');
        this.toggle.classList.remove('is-open');
      }
      if (this.mobileMenu) this.mobileMenu.setAttribute('aria-hidden', 'true');

      // Restore body scroll
      document.body.style.overflow = '';
    }

    openDropdown(dropdown) {
      this.closeAllDropdowns();
      dropdown.classList.add('is-open');
      const menu = dropdown.querySelector('.nav__dropdown');
      if (menu) menu.setAttribute('aria-hidden', 'false');
    }

    closeDropdown(dropdown) {
      dropdown.classList.remove('is-open');
      const menu = dropdown.querySelector('.nav__dropdown');
      if (menu) menu.setAttribute('aria-hidden', 'true');
    }

    toggleDropdown(dropdown) {
      if (dropdown.classList.contains('is-open')) {
        this.closeDropdown(dropdown);
      } else {
        this.openDropdown(dropdown);
      }
    }

    closeAllDropdowns() {
      this.dropdowns.forEach((dropdown) => {
        this.closeDropdown(dropdown);
      });
      this.megaMenus.forEach((megaMenu) => {
        this.closeMegaMenu(megaMenu);
      });
    }

    openMegaMenu(megaMenu) {
      this.closeAllDropdowns();
      megaMenu.classList.add('is-open');
    }

    closeMegaMenu(megaMenu) {
      megaMenu.classList.remove('is-open');
    }

    toggleMegaMenu(megaMenu) {
      if (megaMenu.classList.contains('is-open')) {
        this.closeMegaMenu(megaMenu);
      } else {
        this.openMegaMenu(megaMenu);
      }
    }

    focusFirstMenuItem(dropdown) {
      const firstItem = dropdown.querySelector('.nav__dropdown-link');
      if (firstItem) firstItem.focus();
    }
  }

  /**
   * Tabs Handler
   */
  class Tabs {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        activeClass: 'is-active',
        destroyOnResize: false,
        keyboard: true,
        ...options,
      };
      this.init();
    }

    init() {
      this.setupElements();
      this.bindEvents();
      this.setupAccessibility();
      this.activateFirstTab();
    }

    setupElements() {
      this.tabList = this.element.querySelector('.tabs__list');
      this.tabs = [...this.element.querySelectorAll('.tabs__button')];
      this.panels = [...this.element.querySelectorAll('.tabs__panel')];
    }

    bindEvents() {
      this.tabs.forEach((tab, index) => {
        tab.addEventListener('click', (e) => {
          e.preventDefault();
          this.activateTab(index);
        });

        if (this.options.keyboard) {
          tab.addEventListener('keydown', (e) => {
            let targetIndex = index;

            if (e.key === 'ArrowRight') {
              targetIndex = index + 1 >= this.tabs.length ? 0 : index + 1;
            } else if (e.key === 'ArrowLeft') {
              targetIndex = index - 1 < 0 ? this.tabs.length - 1 : index - 1;
            } else if (e.key === 'Home') {
              targetIndex = 0;
            } else if (e.key === 'End') {
              targetIndex = this.tabs.length - 1;
            }

            if (targetIndex !== index) {
              e.preventDefault();
              this.activateTab(targetIndex);
              this.tabs[targetIndex].focus();
            }
          });
        }
      });
    }

    setupAccessibility() {
      // Set role and ARIA attributes
      if (this.tabList) {
        this.tabList.setAttribute('role', 'tablist');
      }

      this.tabs.forEach((tab, index) => {
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-controls', this.panels[index]?.id || `panel-${index}`);
        tab.setAttribute('tabindex', '-1');
        tab.id = tab.id || `tab-${index}`;
      });

      this.panels.forEach((panel, index) => {
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', this.tabs[index]?.id || `tab-${index}`);
        panel.setAttribute('tabindex', '0');
        panel.id = panel.id || `panel-${index}`;
      });
    }

    activateFirstTab() {
      const activeTab = this.tabs.find((tab) => tab.getAttribute('aria-selected') === 'true');
      const activeIndex = activeTab ? this.tabs.indexOf(activeTab) : 0;
      this.activateTab(activeIndex);
    }

    activateTab(index) {
      // Deactivate all tabs
      this.tabs.forEach((tab) => {
        tab.setAttribute('aria-selected', 'false');
        tab.setAttribute('tabindex', '-1');
      });

      this.panels.forEach((panel) => {
        panel.setAttribute('aria-hidden', 'true');
      });

      // Activate selected tab
      const selectedTab = this.tabs[index];
      const selectedPanel = this.panels[index];

      if (selectedTab && selectedPanel) {
        selectedTab.setAttribute('aria-selected', 'true');
        selectedTab.setAttribute('tabindex', '0');
        selectedPanel.setAttribute('aria-hidden', 'false');

        // Trigger custom event
        this.element.dispatchEvent(
          new CustomEvent('tabChanged', {
            detail: { index, tab: selectedTab, panel: selectedPanel },
          }),
        );
      }
    }

    getActiveTab() {
      return this.tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true');
    }

    next() {
      const current = this.getActiveTab();
      const next = current + 1 >= this.tabs.length ? 0 : current + 1;
      this.activateTab(next);
    }

    previous() {
      const current = this.getActiveTab();
      const prev = current - 1 < 0 ? this.tabs.length - 1 : current - 1;
      this.activateTab(prev);
    }
  }

  /**
   * Pagination Handler
   */
  class Pagination {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        totalPages: 1,
        currentPage: 1,
        showPageSize: true,
        showJumpTo: true,
        pageSizes: [10, 20, 50, 100],
        onPageChange: null,
        onPageSizeChange: null,
        ...options,
      };
      this.init();
    }

    init() {
      this.setupElements();
      this.bindEvents();
      this.render();
    }

    setupElements() {
      this.prevBtn = this.element.querySelector('.pagination__link--prev');
      this.nextBtn = this.element.querySelector('.pagination__link--next');
      this.pageSize = this.element.querySelector('.pagination__page-size-select');
      this.jumpInput = this.element.querySelector('.pagination__jump-input');
      this.jumpBtn = this.element.querySelector('.pagination__jump-button');
    }

    bindEvents() {
      // Previous/Next buttons
      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.goToPage(this.options.currentPage - 1);
        });
      }

      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.goToPage(this.options.currentPage + 1);
        });
      }

      // Page size change
      if (this.pageSize) {
        this.pageSize.addEventListener('change', (e) => {
          this.changePageSize(Number.parseInt(e.target.value));
        });
      }

      // Jump to page
      if (this.jumpBtn && this.jumpInput) {
        this.jumpBtn.addEventListener('click', () => {
          const page = Number.parseInt(this.jumpInput.value);
          if (page && page >= 1 && page <= this.options.totalPages) {
            this.goToPage(page);
          }
        });

        this.jumpInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            this.jumpBtn.click();
          }
        });
      }

      // Delegate page number clicks
      this.element.addEventListener('click', (e) => {
        if (
          e.target.classList.contains('pagination__link') &&
          !e.target.classList.contains('pagination__link--prev') &&
          !e.target.classList.contains('pagination__link--next')
        ) {
          e.preventDefault();
          const page = Number.parseInt(e.target.dataset.page || e.target.textContent);
          if (page && page !== this.options.currentPage) {
            this.goToPage(page);
          }
        }
      });
    }

    goToPage(page) {
      if (page < 1 || page > this.options.totalPages || page === this.options.currentPage) {
        return;
      }

      this.options.currentPage = page;
      this.render();

      if (this.options.onPageChange) {
        this.options.onPageChange(page);
      }

      this.element.dispatchEvent(
        new CustomEvent('pageChanged', {
          detail: { page },
        }),
      );
    }

    changePageSize(size) {
      if (this.options.onPageSizeChange) {
        this.options.onPageSizeChange(size);
      }

      this.element.dispatchEvent(
        new CustomEvent('pageSizeChanged', {
          detail: { size },
        }),
      );
    }

    render() {
      // Update navigation button states
      if (this.prevBtn) {
        this.prevBtn.classList.toggle('pagination__link--disabled', this.options.currentPage <= 1);
      }

      if (this.nextBtn) {
        this.nextBtn.classList.toggle(
          'pagination__link--disabled',
          this.options.currentPage >= this.options.totalPages,
        );
      }

      // Update ARIA attributes
      this.element.setAttribute(
        'aria-label',
        `Pagination, page ${this.options.currentPage} of ${this.options.totalPages}`,
      );
    }

    updateTotalPages(totalPages) {
      this.options.totalPages = totalPages;
      this.render();
    }

    getCurrentPage() {
      return this.options.currentPage;
    }
  }

  /**
   * Sidebar Navigation Handler
   */
  class Sidebar {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        collapsible: true,
        overlay: true,
        closeOnOutsideClick: true,
        closeOnEscape: true,
        breakpoint: 768,
        ...options,
      };
      this.isOpen = false;
      this.isCollapsed = false;
      this.init();
    }

    init() {
      this.setupElements();
      this.bindEvents();
      this.setupAccessibility();
      this.handleResize();
    }

    setupElements() {
      this.toggle = document.querySelector('[data-sidebar-toggle]');
      this.overlay = this.element.querySelector('.sidebar__overlay');
      this.collapseBtn = this.element.querySelector('.sidebar__toggle');
      this.dropdowns = this.element.querySelectorAll('.sidebar__item--dropdown');
      this.links = this.element.querySelectorAll('.sidebar__link');
    }

    bindEvents() {
      // Main toggle (usually in header)
      if (this.toggle) {
        this.toggle.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggle();
        });
      }

      // Collapse/expand button
      if (this.collapseBtn) {
        this.collapseBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleCollapse();
        });
      }

      // Overlay click
      if (this.overlay && this.options.closeOnOutsideClick) {
        this.overlay.addEventListener('click', () => {
          this.close();
        });
      }

      // Dropdown menus
      this.dropdowns.forEach((dropdown) => {
        this.setupDropdown(dropdown);
      });

      // Escape key
      if (this.options.closeOnEscape) {
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && this.isOpen) {
            this.close();
          }
        });
      }

      // Outside click (when static)
      if (this.options.closeOnOutsideClick) {
        document.addEventListener('click', (e) => {
          if (
            this.isOpen &&
            !this.element.contains(e.target) &&
            !this.toggle?.contains(e.target) &&
            window.innerWidth <= this.options.breakpoint
          ) {
            this.close();
          }
        });
      }

      // Resize handler
      window.addEventListener(
        'resize',
        utils.debounce(() => {
          this.handleResize();
        }, 250),
      );
    }

    setupAccessibility() {
      // Add tooltips for collapsed state
      this.links.forEach((link) => {
        const text = link.querySelector('.sidebar__text')?.textContent;
        if (text) {
          link.setAttribute('data-tooltip', text);
        }
      });
    }

    setupDropdown(dropdown) {
      const link = dropdown.querySelector('.sidebar__link');
      const submenu = dropdown.querySelector('.sidebar__submenu');

      link.addEventListener('click', (e) => {
        if (submenu) {
          e.preventDefault();
          this.toggleDropdown(dropdown);
        }
      });

      // Keyboard navigation
      link.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (submenu) {
            e.preventDefault();
            this.toggleDropdown(dropdown);
          }
        }
      });
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      this.isOpen = true;
      this.element.classList.add('sidebar--open');
      if (this.overlay) this.overlay.classList.add('is-open');

      // Update toggle button
      if (this.toggle) {
        this.toggle.setAttribute('aria-expanded', 'true');
      }

      // Prevent body scroll on mobile
      if (window.innerWidth <= this.options.breakpoint) {
        document.body.style.overflow = 'hidden';
      }

      this.element.dispatchEvent(new CustomEvent('sidebarOpened'));
    }

    close() {
      this.isOpen = false;
      this.element.classList.remove('sidebar--open');
      if (this.overlay) this.overlay.classList.remove('is-open');

      // Update toggle button
      if (this.toggle) {
        this.toggle.setAttribute('aria-expanded', 'false');
      }

      // Restore body scroll
      document.body.style.overflow = '';

      this.element.dispatchEvent(new CustomEvent('sidebarClosed'));
    }

    toggleCollapse() {
      if (this.isCollapsed) {
        this.expand();
      } else {
        this.collapse();
      }
    }

    collapse() {
      this.isCollapsed = true;
      this.element.classList.add('sidebar--collapsed');

      // Close all dropdowns when collapsing
      this.closeAllDropdowns();

      this.element.dispatchEvent(new CustomEvent('sidebarCollapsed'));
    }

    expand() {
      this.isCollapsed = false;
      this.element.classList.remove('sidebar--collapsed');

      this.element.dispatchEvent(new CustomEvent('sidebarExpanded'));
    }

    toggleDropdown(dropdown) {
      const isOpen = dropdown.classList.contains('is-open');

      // Close other dropdowns
      this.closeAllDropdowns();

      if (!isOpen) {
        dropdown.classList.add('is-open');
      }
    }

    closeAllDropdowns() {
      this.dropdowns.forEach((dropdown) => {
        dropdown.classList.remove('is-open');
      });
    }

    handleResize() {
      const isMobile = window.innerWidth <= this.options.breakpoint;

      if (!isMobile && this.isOpen) {
        // On desktop, keep sidebar open but remove mobile classes
        document.body.style.overflow = '';
        if (this.overlay) this.overlay.classList.remove('is-open');
      }
    }

    setActiveLink(href) {
      this.links.forEach((link) => {
        link.classList.remove('sidebar__link--active');
        if (link.getAttribute('href') === href) {
          link.classList.add('sidebar__link--active');
        }
      });
    }

    isOpen() {
      return this.isOpen;
    }

    isCollapsed() {
      return this.isCollapsed;
    }
  }

  /**
   * Step Navigation Handler
   */
  class Steps {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        currentStep: 0,
        allowClick: false,
        validateStep: null,
        onStepChange: null,
        ...options,
      };
      this.init();
    }

    init() {
      this.setupElements();
      this.bindEvents();
      this.setupAccessibility();
      this.updateSteps();
    }

    setupElements() {
      this.steps = [...this.element.querySelectorAll('.steps__item')];
    }

    bindEvents() {
      if (this.options.allowClick) {
        this.steps.forEach((step, index) => {
          step.addEventListener('click', () => {
            this.goToStep(index);
          });

          step.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this.goToStep(index);
            }
          });
        });
      }
    }

    setupAccessibility() {
      this.steps.forEach((step, index) => {
        if (this.options.allowClick) {
          step.setAttribute('role', 'tab');
          step.setAttribute('tabindex', index === this.options.currentStep ? '0' : '-1');
          step.setAttribute('aria-selected', index === this.options.currentStep ? 'true' : 'false');
        }
      });
    }

    goToStep(index) {
      if (index < 0 || index >= this.steps.length) {
        return false;
      }

      // Validate current step if validator provided
      if (this.options.validateStep && !this.options.validateStep(this.options.currentStep)) {
        return false;
      }

      this.options.currentStep = index;
      this.updateSteps();

      if (this.options.onStepChange) {
        this.options.onStepChange(index);
      }

      this.element.dispatchEvent(
        new CustomEvent('stepChanged', {
          detail: { step: index },
        }),
      );

      return true;
    }

    nextStep() {
      return this.goToStep(this.options.currentStep + 1);
    }

    previousStep() {
      return this.goToStep(this.options.currentStep - 1);
    }

    completeStep(index = this.options.currentStep) {
      const step = this.steps[index];
      if (step) {
        step.classList.add('steps__item--complete');
        step.classList.remove('steps__item--active', 'steps__item--error');
      }
    }

    markStepAsError(index = this.options.currentStep) {
      const step = this.steps[index];
      if (step) {
        step.classList.add('steps__item--error');
        step.classList.remove('steps__item--active', 'steps__item--complete');
      }
    }

    updateSteps() {
      this.steps.forEach((step, index) => {
        step.classList.remove('steps__item--active', 'steps__item--error');

        if (index === this.options.currentStep) {
          step.classList.add('steps__item--active');
          if (this.options.allowClick) {
            step.setAttribute('tabindex', '0');
            step.setAttribute('aria-selected', 'true');
          }
        } else {
          if (this.options.allowClick) {
            step.setAttribute('tabindex', '-1');
            step.setAttribute('aria-selected', 'false');
          }
        }
      });
    }

    getCurrentStep() {
      return this.options.currentStep;
    }

    getTotalSteps() {
      return this.steps.length;
    }
  }

  // Auto-initialization
  function initializeComponents() {
    // Initialize Navigation
    document.querySelectorAll('.nav').forEach((nav) => {
      if (!nav._navigation) {
        nav._navigation = new Navigation(nav);
      }
    });

    // Initialize Tabs
    document.querySelectorAll('.tabs').forEach((tabs) => {
      if (!tabs._tabs) {
        tabs._tabs = new Tabs(tabs);
      }
    });

    // Initialize Pagination
    document.querySelectorAll('.pagination').forEach((pagination) => {
      if (!pagination._pagination) {
        pagination._pagination = new Pagination(pagination);
      }
    });

    // Initialize Steps
    document.querySelectorAll('.steps').forEach((steps) => {
      if (!steps._steps) {
        steps._steps = new Steps(steps);
      }
    });

    // Initialize Sidebars
    document.querySelectorAll('.sidebar').forEach((sidebar) => {
      if (!sidebar._sidebar) {
        sidebar._sidebar = new Sidebar(sidebar);
      }
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeComponents);
  } else {
    initializeComponents();
  }

  // Expose classes globally
  window.Navigation = Navigation;
  window.Tabs = Tabs;
  window.Pagination = Pagination;
  window.Steps = Steps;
  window.Sidebar = Sidebar;

  // jQuery integration if available
  if (window.jQuery) {
    window.jQuery.fn.navigation = function (options) {
      return this.each(function () {
        if (!this._navigation) {
          this._navigation = new Navigation(this, options);
        }
      });
    };

    window.jQuery.fn.tabs = function (options) {
      return this.each(function () {
        if (!this._tabs) {
          this._tabs = new Tabs(this, options);
        }
      });
    };
  }
})(window, document);
