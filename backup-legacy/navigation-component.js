/**
 * Navigation Component - Amphibious 2.0
 * Handles navigation functionality and active states
 */

class NavigationComponent {
  constructor() {
    this.init();
  }

  init() {
    // Set active states based on current URL
    this.setActiveStates();

    // Initialize mobile toggle
    this.initMobileToggle();

    // Initialize dropdown behavior for mobile
    this.initMobileDropdowns();

    // Handle navigation include
    this.loadNavigation();
  }

  /**
   * Load navigation from include file
   */
  async loadNavigation() {
    // Check if navigation placeholder exists
    const navPlaceholder = document.getElementById('navigation-include');
    if (!navPlaceholder) return;

    try {
      const response = await fetch('/includes/navigation.html');
      const html = await response.text();
      navPlaceholder.innerHTML = html;

      // Re-initialize after loading
      this.setActiveStates();
      this.initMobileToggle();
      this.initMobileDropdowns();
    } catch (error) {
      console.error('Failed to load navigation:', error);
    }
  }

  /**
   * Set active states based on current page
   */
  setActiveStates() {
    const currentPath = window.location.pathname;
    const currentHash = window.location.hash;

    // Remove all active classes
    document.querySelectorAll('.horizontal li').forEach((li) => {
      li.classList.remove('active');
    });

    document.querySelectorAll('.horizontal a').forEach((link) => {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    });

    // Special handling for homepage
    if (currentPath === '/' || currentPath === '/index.html') {
      const homeLink = document.querySelector('.site-logo');
      if (homeLink) {
        homeLink.parentElement.classList.add('active');
        homeLink.setAttribute('aria-current', 'page');
      }
      return;
    }

    // Find and mark active page
    document.querySelectorAll('.horizontal a').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      // Clean up paths for comparison
      const linkPath = href.split('#')[0];
      const cleanCurrentPath = currentPath.replace('/index.html', '/');
      const cleanLinkPath = linkPath.replace('/index.html', '/');

      // Check for exact match or parent match
      if (cleanLinkPath === cleanCurrentPath) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');

        // Mark parent li as active
        const parentLi = link.closest('li');
        if (parentLi) {
          parentLi.classList.add('active');

          // If this is a dropdown item, also mark the parent menu item
          const parentUl = parentLi.parentElement;
          if (parentUl && parentUl.parentElement && parentUl.parentElement.tagName === 'LI') {
            parentUl.parentElement.classList.add('active');
          }
        }
      }
    });
  }

  /**
   * Initialize mobile navigation toggle
   */
  initMobileToggle() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.horizontal');

    if (!toggle || !nav) return;

    // Remove any existing listeners
    const newToggle = toggle.cloneNode(true);
    toggle.parentNode.replaceChild(newToggle, toggle);

    newToggle.addEventListener('click', () => {
      const isOpen = newToggle.getAttribute('aria-expanded') === 'true';

      newToggle.setAttribute('aria-expanded', !isOpen);
      nav.classList.toggle('is-open');
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.site-nav')) {
        newToggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });
  }

  /**
   * Initialize mobile dropdown toggles
   */
  initMobileDropdowns() {
    // Only for mobile
    if (window.innerWidth > 768) return;

    const dropdownParents = document.querySelectorAll('.horizontal > li:has(ul)');

    dropdownParents.forEach((parent) => {
      const link = parent.querySelector('> a');
      if (!link) return;

      // Clone to remove existing listeners
      const newLink = link.cloneNode(true);
      link.parentNode.replaceChild(newLink, link);

      newLink.addEventListener('click', (e) => {
        // If it has a dropdown, prevent navigation and toggle
        if (parent.querySelector('ul')) {
          e.preventDefault();
          parent.classList.toggle('is-open');
        }
      });
    });
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.amphibiousNav = new NavigationComponent();
  });
} else {
  window.amphibiousNav = new NavigationComponent();
}

// Re-initialize on window resize for mobile toggle
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (window.amphibiousNav) {
      window.amphibiousNav.initMobileDropdowns();
    }
  }, 250);
});

export default NavigationComponent;
