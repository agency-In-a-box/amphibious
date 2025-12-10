/**
 * Workilo-Style Filter System JavaScript
 * Handles filter interactions, state management, and UI updates
 */

// Filter State Management
const filterState = {
  categories: new Set(),
  skills: new Set(),
  workModes: new Set(),
  pricing: null,
  responseTimes: new Set(),
  activeCount: 0,
  sortBy: 'popular'
};

// Toggle Filter Drawer
function toggleFilterDrawer() {
  const drawer = document.getElementById('filterDrawer');
  const toggle = document.querySelector('.filter-toggle');

  drawer.classList.toggle('open');
  toggle.classList.toggle('active');
}

// Toggle Pill Dropdown
function togglePill(button) {
  const pill = button.parentElement;
  const wasOpen = pill.classList.contains('open');

  // Close all other pills
  document.querySelectorAll('.filter-pill').forEach(p => {
    if (p !== pill) {
      p.classList.remove('open');
    }
  });

  // Toggle current pill
  if (!wasOpen) {
    pill.classList.add('open');
    button.classList.add('active');
  } else {
    pill.classList.remove('open');
    button.classList.remove('active');
  }
}

// Toggle Sort Menu
function toggleSort(button) {
  const dropdown = button.parentElement;
  const wasOpen = dropdown.classList.contains('open');

  if (!wasOpen) {
    dropdown.classList.add('open');
    button.classList.add('active');
  } else {
    dropdown.classList.remove('open');
    button.classList.remove('active');
  }
}

// Update Filter Count
function updateFilterCount() {
  let count = 0;
  count += filterState.categories.size;
  count += filterState.skills.size;
  count += filterState.workModes.size;
  count += filterState.pricing ? 1 : 0;
  count += filterState.responseTimes.size;

  filterState.activeCount = count;

  const countElement = document.querySelector('.filter-count');
  if (countElement) {
    countElement.textContent = `${count} Filter${count !== 1 ? 's' : ''}`;
  }

  // Update filter toggle appearance
  const filterToggle = document.querySelector('.filter-toggle');
  if (count > 0) {
    filterToggle.style.background = 'rgba(255, 105, 0, 0.1)';
    filterToggle.style.borderColor = '#FF6900';
    filterToggle.style.color = '#FF6900';
  } else {
    filterToggle.style.background = '';
    filterToggle.style.borderColor = '';
    filterToggle.style.color = '';
  }
}

// Clear All Filters
function clearAllFilters() {
  // Clear state
  filterState.categories.clear();
  filterState.skills.clear();
  filterState.workModes.clear();
  filterState.pricing = null;
  filterState.responseTimes.clear();

  // Clear all checkboxes and radio buttons
  document.querySelectorAll('.pill-option input, .drawer-option input').forEach(input => {
    input.checked = false;
  });

  // Update UI
  updateFilterCount();
  applyFilters();
}

// Apply Filters (Mock Function)
function applyFilters() {
  console.log('Applying filters:', filterState);

  // Update results count (mock)
  const resultsElement = document.querySelector('.results-info strong');
  if (resultsElement) {
    const filtered = Math.max(1, 8 - filterState.activeCount);
    resultsElement.textContent = filtered;
    resultsElement.parentElement.innerHTML =
      `Showing <strong>${filtered}</strong> of 8 workalongs`;
  }
}

// Initialize Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  // Sync filter options between pills and drawer
  const filterGroups = [
    { name: 'category', state: 'categories' },
    { name: 'skills', state: 'skills' },
    { name: 'workmode', state: 'workModes' },
    { name: 'response', state: 'responseTimes' }
  ];

  filterGroups.forEach(({ name, state }) => {
    // Handle pill checkboxes
    document.querySelectorAll(`.filter-pill[data-filter="${name}"] input[type="checkbox"]`).forEach(input => {
      input.addEventListener('change', function() {
        if (this.checked) {
          filterState[state].add(this.value);
        } else {
          filterState[state].delete(this.value);
        }

        // Sync with drawer
        const drawerInput = document.querySelector(`.drawer-option input[value="${this.value}"]`);
        if (drawerInput) {
          drawerInput.checked = this.checked;
        }

        updateFilterCount();
        applyFilters();
      });
    });

    // Handle drawer checkboxes
    document.querySelectorAll(`.drawer-section input[type="checkbox"][value]`).forEach(input => {
      const group = input.closest('.drawer-section')?.querySelector('h4')?.textContent.toLowerCase();
      if (group && group.includes(name.replace('mode', ' mode'))) {
        input.addEventListener('change', function() {
          if (this.checked) {
            filterState[state].add(this.value);
          } else {
            filterState[state].delete(this.value);
          }

          // Sync with pill
          const pillInput = document.querySelector(`.filter-pill[data-filter="${name}"] input[value="${this.value}"]`);
          if (pillInput) {
            pillInput.checked = this.checked;
          }

          updateFilterCount();
          applyFilters();
        });
      }
    });
  });

  // Handle pricing radio buttons
  document.querySelectorAll('.filter-pill[data-filter="pricing"] input[type="radio"]').forEach(input => {
    input.addEventListener('change', function() {
      if (this.checked) {
        filterState.pricing = this.value;
        updateFilterCount();
        applyFilters();
      }
    });
  });

  // Handle sort options
  document.querySelectorAll('.sort-option').forEach(button => {
    button.addEventListener('click', function() {
      // Update active state
      document.querySelectorAll('.sort-option').forEach(opt => {
        opt.classList.remove('active');
      });
      this.classList.add('active');

      // Update sort state
      filterState.sortBy = this.dataset.sort;

      // Close dropdown
      const dropdown = this.closest('.sort-dropdown');
      dropdown.classList.remove('open');
      dropdown.querySelector('.sort-button').classList.remove('active');

      // Apply sort
      console.log('Sorting by:', filterState.sortBy);
      applyFilters();
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', function(e) {
    // Close pill dropdowns
    if (!e.target.closest('.filter-pill')) {
      document.querySelectorAll('.filter-pill').forEach(pill => {
        pill.classList.remove('open');
        pill.querySelector('.pill-button')?.classList.remove('active');
      });
    }

    // Close sort dropdown
    if (!e.target.closest('.sort-dropdown')) {
      const sortDropdown = document.querySelector('.sort-dropdown');
      if (sortDropdown) {
        sortDropdown.classList.remove('open');
        sortDropdown.querySelector('.sort-button')?.classList.remove('active');
      }
    }
  });

  // Prevent closing when clicking inside dropdowns
  document.querySelectorAll('.pill-dropdown, .sort-menu').forEach(dropdown => {
    dropdown.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  });

  // Handle response time indicators
  document.querySelectorAll('.filter-pill[data-filter="response"] input').forEach(input => {
    input.addEventListener('change', function() {
      // Update visual indicators
      const indicator = document.querySelector(`.indicator[data-value="${this.value}"]`);
      if (indicator) {
        if (this.checked) {
          indicator.classList.add('active');
        } else {
          indicator.classList.remove('active');
        }
      }
    });
  });

  // Initialize filter count
  updateFilterCount();
});