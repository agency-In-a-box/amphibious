/**
 * Navigation Dropdown Enhancement
 * Improves dropdown menu interaction for hover, keyboard, and touch devices
 */

export function initNavigationDropdowns() {
  const navItems = document.querySelectorAll('.horizontal.branded > li');

  navItems.forEach((item) => {
    const link = item.querySelector('> a');
    const dropdown = item.querySelector('ul');

    if (!dropdown) return;

    // Add ARIA attributes for accessibility
    link.setAttribute('aria-haspopup', 'true');
    link.setAttribute('aria-expanded', 'false');
    dropdown.setAttribute('aria-hidden', 'true');

    // Handle keyboard navigation
    link.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDropdown(item, link, dropdown);
      } else if (e.key === 'Escape') {
        closeDropdown(item, link, dropdown);
      }
    });

    // Handle focus events for keyboard navigation
    item.addEventListener('focusin', () => {
      openDropdown(item, link, dropdown);
    });

    item.addEventListener('focusout', (e) => {
      // Check if focus is still within the dropdown
      setTimeout(() => {
        if (!item.contains(document.activeElement)) {
          closeDropdown(item, link, dropdown);
        }
      }, 100);
    });

    // Handle touch devices
    if ('ontouchstart' in window) {
      link.addEventListener('touchstart', (e) => {
        // If dropdown is closed, open it and prevent navigation
        if (link.getAttribute('aria-expanded') === 'false') {
          e.preventDefault();
          toggleDropdown(item, link, dropdown);
        }
        // If dropdown is open, allow navigation
      });

      // Close dropdown when tapping outside
      document.addEventListener('touchstart', (e) => {
        if (!item.contains(e.target)) {
          closeDropdown(item, link, dropdown);
        }
      });
    }

    // Improve mouse interaction
    let hoverTimeout;

    item.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimeout);
      openDropdown(item, link, dropdown);
    });

    item.addEventListener('mouseleave', () => {
      // Add slight delay before closing to improve UX
      hoverTimeout = setTimeout(() => {
        closeDropdown(item, link, dropdown);
      }, 200);
    });
  });

  // Helper functions
  function openDropdown(item, link, dropdown) {
    link.setAttribute('aria-expanded', 'true');
    dropdown.setAttribute('aria-hidden', 'false');
    item.classList.add('dropdown-open');
  }

  function closeDropdown(item, link, dropdown) {
    link.setAttribute('aria-expanded', 'false');
    dropdown.setAttribute('aria-hidden', 'true');
    item.classList.remove('dropdown-open');
  }

  function toggleDropdown(item, link, dropdown) {
    if (link.getAttribute('aria-expanded') === 'true') {
      closeDropdown(item, link, dropdown);
    } else {
      // Close other dropdowns first
      navItems.forEach((otherItem) => {
        if (otherItem !== item) {
          const otherLink = otherItem.querySelector('> a');
          const otherDropdown = otherItem.querySelector('ul');
          if (otherDropdown) {
            closeDropdown(otherItem, otherLink, otherDropdown);
          }
        }
      });
      openDropdown(item, link, dropdown);
    }
  }

  // Close dropdowns on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      navItems.forEach((item) => {
        const link = item.querySelector('> a');
        const dropdown = item.querySelector('ul');
        if (dropdown) {
          closeDropdown(item, link, dropdown);
        }
      });
    }
  });
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavigationDropdowns);
} else {
  initNavigationDropdowns();
}
