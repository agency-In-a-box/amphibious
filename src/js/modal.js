/**
 * Amphibious 2.0 Modal Component
 * Handles modal overlay display and interactions
 */

class ModalComponent {
  constructor() {
    this.activeModal = null;
    this.init();
  }

  init() {
    // Initialize all modal openers
    this.initModalOpeners();

    // Initialize all modal closers
    this.initModalClosers();

    // Close modal on overlay click
    this.initOverlayClick();

    // Close modal on escape key
    this.initEscapeKey();
  }

  /**
   * Initialize modal opener buttons
   */
  initModalOpeners() {
    document.querySelectorAll('.modal_opener').forEach((opener) => {
      opener.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = opener.getAttribute('amp-target');
        if (targetId) {
          this.openModal(targetId);
        }
      });
    });
  }

  /**
   * Initialize modal close buttons
   */
  initModalClosers() {
    document.querySelectorAll('.modal_kill').forEach((closer) => {
      closer.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = closer.getAttribute('amp-target');
        if (targetId) {
          this.closeModal(targetId);
        }
      });
    });
  }

  /**
   * Close modal when clicking overlay background
   */
  initOverlayClick() {
    document.querySelectorAll('.modal_overlay').forEach((overlay) => {
      overlay.addEventListener('click', (e) => {
        // Only close if clicking the overlay itself, not modal content
        if (e.target === overlay) {
          this.closeModal(overlay.id);
        }
      });
    });
  }

  /**
   * Close modal on escape key press
   */
  initEscapeKey() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.closeModal(this.activeModal);
      }
    });
  }

  /**
   * Open a modal by ID
   */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Add active class to show modal
    modal.classList.add('active');

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Set active modal
    this.activeModal = modalId;

    // Set ARIA attributes
    modal.setAttribute('aria-hidden', 'false');

    // Focus first focusable element in modal
    const focusable = modal.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable) {
      focusable.focus();
    }
  }

  /**
   * Close a modal by ID
   */
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Remove active class to hide modal
    modal.classList.remove('active');

    // Restore body scroll
    document.body.style.overflow = '';

    // Clear active modal
    if (this.activeModal === modalId) {
      this.activeModal = null;
    }

    // Set ARIA attributes
    modal.setAttribute('aria-hidden', 'true');

    // Return focus to opener if possible
    const opener = document.querySelector(`.modal_opener[amp-target="${modalId}"]`);
    if (opener) {
      opener.focus();
    }
  }
}

// Initialize modal when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.amphibiousModal = new ModalComponent();
  });
} else {
  window.amphibiousModal = new ModalComponent();
}

export default ModalComponent;
