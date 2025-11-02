/**
 * A.mphibio.us Alerts JavaScript Utilities
 * Modern alert and toast notification system
 *
 * @version 4.0.0
 * @author A.mphibio.us Framework
 */

((window, document) => {
  // Default configuration
  const defaultConfig = {
    container: 'body',
    position: 'top-right', // top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
    duration: 5000,
    maxToasts: 5,
    animations: true,
    pauseOnHover: true,
    closeOnClick: false,
    closeButton: true,
    rtl: false,
  };

  // Toast counter for unique IDs
  let toastCounter = 0;
  const config = { ...defaultConfig };

  // SVG Icons
  const icons = {
    success:
      '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>',
    error:
      '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>',
    warning:
      '<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>',
    info: '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>',
    close:
      '<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>',
  };

  /**
   * Main Alerts class
   */
  class Alerts {
    constructor(options = {}) {
      this.config = { ...config, ...options };
      this.container = null;
      this.init();
    }

    /**
     * Initialize the alert system
     */
    init() {
      this.createContainer();
      this.bindEvents();
    }

    /**
     * Create or get the toast container
     */
    createContainer() {
      let container = document.querySelector('.toast-container');
      if (!container) {
        container = document.createElement('div');
        container.className = `toast-container toast-container--${this.config.position}`;

        const parent =
          typeof this.config.container === 'string'
            ? document.querySelector(this.config.container)
            : this.config.container;

        (parent || document.body).appendChild(container);
      }
      this.container = container;
    }

    /**
     * Bind global events
     */
    bindEvents() {
      // ESC key to close toasts
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.clearAll();
        }
      });

      // Handle clicks on dismissible alerts
      document.addEventListener('click', (e) => {
        const dismissBtn = e.target.closest('.alert__dismiss');
        if (dismissBtn) {
          const alert = dismissBtn.closest('.alert, .toast');
          if (alert) {
            this.dismiss(alert);
          }
        }

        // Close on click if enabled
        if (this.config.closeOnClick) {
          const toast = e.target.closest('.toast');
          if (toast && !e.target.closest('.alert__dismiss, .alert__action')) {
            this.dismiss(toast);
          }
        }
      });
    }

    /**
     * Show a toast notification
     * @param {string} type - success, error, warning, info
     * @param {string} message - The message to display
     * @param {string} title - Optional title
     * @param {Object} options - Override options
     */
    toast(type, message, title = '', options = {}) {
      const toastOptions = { ...this.config, ...options };
      const toast = this.createToast(type, message, title, toastOptions);

      this.showToast(toast, toastOptions);
      return toast;
    }

    /**
     * Show success toast
     */
    success(message, title = 'Success!', options = {}) {
      return this.toast('success', message, title, options);
    }

    /**
     * Show error toast
     */
    error(message, title = 'Error!', options = {}) {
      return this.toast('error', message, title, options);
    }

    /**
     * Show warning toast
     */
    warning(message, title = 'Warning!', options = {}) {
      return this.toast('warning', message, title, options);
    }

    /**
     * Show info toast
     */
    info(message, title = 'Info', options = {}) {
      return this.toast('info', message, title, options);
    }

    /**
     * Create toast element
     */
    createToast(type, message, title, options) {
      toastCounter++;
      const toastId = `toast-${toastCounter}`;

      const toast = document.createElement('div');
      toast.id = toastId;
      toast.className = this.getToastClasses(type, options);

      if (options.duration && options.duration > 0) {
        toast.style.setProperty('--dismiss-duration', `${options.duration}ms`);
      }

      toast.innerHTML = this.getToastHTML(type, message, title, options);

      // Add hover pause functionality
      if (options.pauseOnHover && options.duration > 0) {
        this.addHoverPause(toast);
      }

      return toast;
    }

    /**
     * Get toast CSS classes
     */
    getToastClasses(type, options) {
      const classes = ['toast', 'alert', `alert--${type}`];

      if (options.closeButton) {
        classes.push('alert--dismissible');
      }

      if (options.duration > 0) {
        classes.push('toast--auto-dismiss');
      }

      return classes.join(' ');
    }

    /**
     * Get toast HTML content
     */
    getToastHTML(type, message, title, options) {
      const hasTitle = title && title.trim();
      const hasIcon = icons[type];

      let html = '';

      // Icon
      if (hasIcon) {
        html += `
                    <svg class="alert__icon" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        ${icons[type]}
                    </svg>
                `;
      }

      // Content
      html += '<div class="alert__content">';
      if (hasTitle) {
        html += `<h4 class="alert__title">${this.escapeHtml(title)}</h4>`;
      }
      html += `<p class="alert__message">${this.escapeHtml(message)}</p>`;
      html += '</div>';

      // Close button
      if (options.closeButton) {
        html += `
                    <button class="alert__dismiss" aria-label="Close notification">
                        <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            ${icons.close}
                        </svg>
                    </button>
                `;
      }

      return html;
    }

    /**
     * Show toast in container
     */
    showToast(toast, options) {
      this.enforceMaxToasts();

      // Insert at beginning for newest-first
      this.container.insertAdjacentElement('afterbegin', toast);

      // Auto-dismiss
      if (options.duration > 0) {
        setTimeout(() => {
          if (toast.parentNode) {
            this.dismiss(toast);
          }
        }, options.duration);
      }

      // Trigger animation
      if (options.animations) {
        requestAnimationFrame(() => {
          toast.style.opacity = '1';
          toast.style.transform = 'translateX(0)';
        });
      }
    }

    /**
     * Enforce maximum number of toasts
     */
    enforceMaxToasts() {
      const toasts = this.container.querySelectorAll('.toast');
      if (toasts.length >= this.config.maxToasts) {
        // Remove oldest toasts
        for (let i = this.config.maxToasts - 1; i < toasts.length; i++) {
          this.dismiss(toasts[i], false);
        }
      }
    }

    /**
     * Add hover pause functionality
     */
    addHoverPause(toast) {
      let timer;
      const remaining =
        Number.parseInt(toast.style.getPropertyValue('--dismiss-duration')) || this.config.duration;

      const pause = () => {
        toast.style.animationPlayState = 'paused';
        clearTimeout(timer);
      };

      const resume = () => {
        toast.style.animationPlayState = 'running';
        timer = setTimeout(() => {
          if (toast.parentNode) {
            this.dismiss(toast);
          }
        }, remaining);
      };

      toast.addEventListener('mouseenter', pause);
      toast.addEventListener('mouseleave', resume);
    }

    /**
     * Dismiss a specific alert/toast
     */
    dismiss(alert, animate = true) {
      if (!alert || !alert.parentNode) return;

      if (animate && this.config.animations) {
        alert.classList.add('toast--dismissing');
        setTimeout(() => {
          if (alert.parentNode) {
            alert.remove();
          }
        }, 300);
      } else {
        alert.remove();
      }
    }

    /**
     * Clear all toasts
     */
    clearAll() {
      const toasts = this.container ? this.container.querySelectorAll('.toast') : [];
      toasts.forEach((toast) => this.dismiss(toast));
    }

    /**
     * Update configuration
     */
    configure(options) {
      this.config = { ...this.config, ...options };
      return this;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  }

  /**
   * Static alert functions (for basic dismissible alerts)
   */
  class StaticAlerts {
    /**
     * Initialize dismissible alerts on page
     */
    static init() {
      // Auto-initialize dismissible alerts
      document.addEventListener('DOMContentLoaded', () => {
        this.bindEvents();
      });
    }

    /**
     * Bind events for static alerts
     */
    static bindEvents() {
      document.addEventListener('click', (e) => {
        const dismissBtn = e.target.closest('.alert__dismiss');
        if (dismissBtn && !dismissBtn.closest('.toast')) {
          const alert = dismissBtn.closest('.alert');
          if (alert) {
            this.dismiss(alert);
          }
        }
      });
    }

    /**
     * Dismiss static alert
     */
    static dismiss(alert) {
      if (!alert) return;

      alert.style.transition = 'all 0.3s ease';
      alert.style.opacity = '0';
      alert.style.transform = 'translateY(-10px)';

      setTimeout(() => {
        if (alert.parentNode) {
          alert.remove();
        }
      }, 300);
    }

    /**
     * Show static alert
     */
    static show(type, message, title = '', container = document.body) {
      const alert = document.createElement('div');
      alert.className = `alert alert--${type} alert--dismissible`;

      let html = '';

      if (icons[type]) {
        html += `
                    <svg class="alert__icon" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        ${icons[type]}
                    </svg>
                `;
      }

      html += '<div class="alert__content">';
      if (title) {
        html += `<h4 class="alert__title">${this.escapeHtml(title)}</h4>`;
      }
      html += `<p class="alert__message">${this.escapeHtml(message)}</p>`;
      html += '</div>';

      html += `
                <button class="alert__dismiss" aria-label="Close alert">
                    <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        ${icons.close}
                    </svg>
                </button>
            `;

      alert.innerHTML = html;
      container.appendChild(alert);

      return alert;
    }

    static escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  }

  // Initialize static alerts
  StaticAlerts.init();

  // Global instance
  const alerts = new Alerts();

  // Expose to global scope
  window.Alerts = Alerts;
  window.StaticAlerts = StaticAlerts;
  window.alerts = alerts;

  // jQuery plugin if jQuery is available
  if (window.jQuery) {
    window.jQuery.fn.alert = function (action = 'show', options = {}) {
      return this.each(function () {
        if (action === 'dismiss' || action === 'close') {
          StaticAlerts.dismiss(this);
        }
      });
    };
  }

  // AMD/UMD support
  if (typeof define === 'function' && define.amd) {
    define('alerts', [], () => ({ Alerts, StaticAlerts, alerts }));
  }
})(window, document);
