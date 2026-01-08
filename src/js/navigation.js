/**
 * Amphibious 2.0 Navigation Component
 * Handles active states, mobile toggle, and dropdown functionality
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
  }

  /**
   * Set active states based on current page
   */
  setActiveStates() {
    const currentPath = window.location.pathname;
    const currentHash = window.location.hash;

    // Remove all active classes and aria-current
    document.querySelectorAll('.horizontal li').forEach((li) => {
      li.classList.remove('active');
    });

    document.querySelectorAll('.horizontal a').forEach((link) => {
      link.removeAttribute('aria-current');
    });

    // Find and set the active navigation item
    document.querySelectorAll('.horizontal a').forEach((link) => {
      const href = link.getAttribute('href');

      // Skip if no href
      if (!href) return;

      // Normalize paths for comparison
      const linkPath = href.split('#')[0];
      const isExactMatch = linkPath === currentPath;
      const isParentMatch = currentPath.startsWith(linkPath) && linkPath !== '/';

      // Check for home page
      const isHome = currentPath === '/' && (linkPath === '/' || linkPath === '/index.html');

      // Set active state for exact matches or parent matches
      if (isExactMatch || isParentMatch || isHome) {
        const parentLi = link.closest('.horizontal > li');

        // Only set active on top-level items
        if (parentLi) {
          parentLi.classList.add('active');

          // Find the top-level link
          const topLevelLink = parentLi.querySelector(':scope > a');
          if (topLevelLink) {
            topLevelLink.setAttribute('aria-current', 'page');
          }
        }
      }

      // Check for hash matches in sub-navigation
      if (currentHash && href.includes(currentHash)) {
        link.classList.add('active');
      }
    });
  }

  /**
   * Initialize mobile navigation toggle
   */
  initMobileToggle() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('main-nav');
    const siteNav = document.querySelector('.site-nav');

    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !isExpanded);
        nav.classList.toggle('is-active');

        // Also toggle class on parent nav for better CSS targeting
        if (siteNav) {
          siteNav.classList.toggle('menu-open');
        }
      });
    }
  }

  /**
   * Initialize mobile dropdown behavior
   */
  initMobileDropdowns() {
    // Only apply to mobile view
    if (window.innerWidth >= 960) return;

    document.querySelectorAll('.horizontal > li').forEach((li) => {
      const hasDropdown = li.querySelector('ul');
      if (!hasDropdown) return;

      const link = li.querySelector(':scope > a');
      if (!link) return;

      // Prevent navigation on parent items with dropdowns in mobile
      link.addEventListener('click', (e) => {
        if (window.innerWidth < 960) {
          e.preventDefault();
          li.classList.toggle('is-expanded');
        }
      });
    });
  }
}

// Initialize navigation when DOM is ready
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
