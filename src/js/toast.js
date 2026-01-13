/**
 * Toast/Snackbar Component
 * Provides temporary notification messages
 * Part of Amphibious 2.0 Component Library
 */

class ToastComponent {
  constructor() {
    this.container = null;
    this.toasts = new Map();
    this.defaults = {
      position: 'top-right',
      duration: 5000,
      closable: true,
      progress: true,
    };
    this.init();
  }

  /**
   * Initialize toast container
   */
  init() {
    // Create container if it doesn't exist
    if (!this.container) {
      this.createContainer();
    }
  }

  /**
   * Create toast container
   */
  createContainer(position = 'top-right') {
    // Remove existing container if changing position
    if (this.container) {
      this.container.remove();
    }

    this.container = document.createElement('div');
    this.container.className = `toast-container toast-container--${position}`;
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-live', 'polite');
    this.container.setAttribute('aria-label', 'Notifications');
    document.body.appendChild(this.container);
  }

  /**
   * Show a toast message
   * @param {Object} options - Toast options
   * @returns {string} Toast ID
   */
  show(options = {}) {
    const config = { ...this.defaults, ...options };
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Ensure container exists with correct position
    if (
      !this.container ||
      (config.position && !this.container.classList.contains(`toast-container--${config.position}`))
    ) {
      this.createContainer(config.position);
    }

    // Create toast element
    const toast = this.createToastElement(id, config);

    // Add to container
    this.container.appendChild(toast);

    // Store reference
    this.toasts.set(id, { element: toast, config, timeout: null });

    // Auto dismiss if duration is set
    if (config.duration && config.duration > 0) {
      const toastData = this.toasts.get(id);
      toastData.timeout = setTimeout(() => {
        this.hide(id);
      }, config.duration);
    }

    // Add progress bar animation
    if (config.progress && config.duration > 0) {
      const progressBar = toast.querySelector('.toast__progress');
      if (progressBar) {
        progressBar.style.animationDuration = `${config.duration}ms`;
      }
    }

    return id;
  }

  /**
   * Create toast element
   */
  createToastElement(id, config) {
    const toast = document.createElement('div');
    toast.className = `toast ${config.type ? `toast--${config.type}` : ''} ${config.dark ? 'toast--dark' : ''}`;
    toast.id = id;
    toast.setAttribute('role', 'alert');

    let html = '';

    // Add icon
    if (config.icon) {
      html += `<span class="toast__icon">${this.getIcon(config.type || config.icon)}</span>`;
    }

    // Add content
    html += '<div class="toast__content">';
    if (config.title) {
      html += `<h4 class="toast__title">${config.title}</h4>`;
    }
    if (config.message) {
      html += `<p class="toast__message">${config.message}</p>`;
    }

    // Add action buttons
    if (config.actions && config.actions.length > 0) {
      html += '<div class="toast__actions">';
      config.actions.forEach((action) => {
        const primary = action.primary ? 'toast__action--primary' : '';
        html += `<button class="toast__action ${primary}" data-action="${action.name}">${action.label}</button>`;
      });
      html += '</div>';
    }

    html += '</div>';

    // Add close button
    if (config.closable) {
      html += `
        <button class="toast__close" aria-label="Close notification">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M13.7 0.3a1 1 0 0 1 0 1.4L8.4 7l5.3 5.3a1 1 0 0 1-1.4 1.4L7 8.4l-5.3 5.3a1 1 0 0 1-1.4-1.4L5.6 7 .3 1.7A1 1 0 0 1 1.7.3L7 5.6 12.3.3a1 1 0 0 1 1.4 0z"/>
          </svg>
        </button>
      `;
    }

    // Add progress bar
    if (config.progress && config.duration > 0) {
      html += '<div class="toast__progress"></div>';
    }

    toast.innerHTML = html;

    // Add event listeners
    this.attachEventListeners(toast, id, config);

    return toast;
  }

  /**
   * Attach event listeners to toast
   */
  attachEventListeners(toast, id, config) {
    // Close button
    const closeBtn = toast.querySelector('.toast__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide(id));
    }

    // Action buttons
    const actionBtns = toast.querySelectorAll('.toast__action');
    actionBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const actionName = e.target.dataset.action;
        const action = config.actions.find((a) => a.name === actionName);
        if (action?.handler) {
          action.handler();
        }
        if (action && action.dismiss !== false) {
          this.hide(id);
        }
      });
    });

    // Pause on hover
    if (config.pauseOnHover && config.duration > 0) {
      toast.addEventListener('mouseenter', () => {
        const toastData = this.toasts.get(id);
        if (toastData?.timeout) {
          clearTimeout(toastData.timeout);
          const progressBar = toast.querySelector('.toast__progress');
          if (progressBar) {
            progressBar.style.animationPlayState = 'paused';
          }
        }
      });

      toast.addEventListener('mouseleave', () => {
        const toastData = this.toasts.get(id);
        if (toastData && config.duration > 0) {
          toastData.timeout = setTimeout(() => {
            this.hide(id);
          }, config.duration);
          const progressBar = toast.querySelector('.toast__progress');
          if (progressBar) {
            progressBar.style.animationPlayState = 'running';
          }
        }
      });
    }
  }

  /**
   * Hide a toast
   */
  hide(id) {
    const toastData = this.toasts.get(id);
    if (!toastData) return;

    const { element, timeout } = toastData;

    // Clear timeout
    if (timeout) {
      clearTimeout(timeout);
    }

    // Add exit animation
    element.classList.add('toast--exiting');

    // Remove after animation
    setTimeout(() => {
      element.remove();
      this.toasts.delete(id);

      // Remove container if empty
      if (this.container && this.container.children.length === 0) {
        this.container.remove();
        this.container = null;
      }
    }, 300);
  }

  /**
   * Hide all toasts
   */
  hideAll() {
    this.toasts.forEach((_, id) => this.hide(id));
  }

  /**
   * Get icon HTML based on type
   */
  getIcon(type) {
    const icons = {
      success:
        '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
      error:
        '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>',
      warning:
        '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
      info: '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>',
    };
    return icons[type] || icons.info;
  }

  /**
   * Convenience methods
   */
  success(message, options = {}) {
    return this.show({ ...options, type: 'success', message, icon: true });
  }

  error(message, options = {}) {
    return this.show({ ...options, type: 'error', message, icon: true });
  }

  warning(message, options = {}) {
    return this.show({ ...options, type: 'warning', message, icon: true });
  }

  info(message, options = {}) {
    return this.show({ ...options, type: 'info', message, icon: true });
  }

  /**
   * Destroy all toasts and clean up
   */
  destroy() {
    // Clear all active toasts
    this.toasts.forEach((config, id) => {
      this.hide(id);
    });

    // Remove container if it exists
    if (this.container?.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    // Clear references
    this.container = null;
    this.toasts.clear();
  }
}

// Auto-initialize
const toast = new ToastComponent();

// Export for module usage
export default toast;
export { ToastComponent };

// Global API
if (typeof window !== 'undefined') {
  window.Toast = toast;
}
