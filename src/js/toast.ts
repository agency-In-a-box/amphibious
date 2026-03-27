/**
 * Toast/Snackbar Component
 * Provides temporary notification messages with auto-dismiss,
 * action buttons, progress bars, and pause-on-hover support.
 *
 * Part of Amphibious 2.0 Component Library
 *
 * @module toast
 */

import { escapeHTML } from '../utils/sanitize';

/** Toast type determines the icon and visual styling. */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/** Position of the toast container on screen. */
export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center';

/**
 * Action button configuration for a toast notification.
 *
 * @property name - Unique identifier stored as `data-action` on the button.
 * @property label - Visible button text.
 * @property primary - Whether the button renders with the primary action style.
 * @property handler - Callback invoked when the action button is clicked.
 * @property dismiss - Whether clicking the action also dismisses the toast. Defaults to `true`.
 */
export interface ToastAction {
  name: string;
  label: string;
  primary?: boolean;
  handler?: () => void;
  dismiss?: boolean;
}

/**
 * Options accepted by {@link ToastComponent.show}.
 *
 * @property type - Visual variant (`'success'`, `'error'`, `'warning'`, `'info'`).
 * @property message - Body text of the toast.
 * @property title - Optional heading above the message.
 * @property icon - Whether to show a type-specific icon.
 * @property position - Screen position for the container.
 * @property duration - Auto-dismiss delay in ms. `0` means persist until manually closed.
 * @property closable - Whether the close button is shown.
 * @property progress - Whether the progress bar is shown.
 * @property dark - Apply dark theme to this toast.
 * @property pauseOnHover - Pause auto-dismiss timer while the cursor is over the toast.
 * @property actions - Action buttons rendered below the message.
 */
export interface ToastOptions {
  type?: ToastType;
  message?: string;
  title?: string;
  icon?: boolean;
  position?: ToastPosition;
  duration?: number;
  closable?: boolean;
  progress?: boolean;
  dark?: boolean;
  pauseOnHover?: boolean;
  actions?: ToastAction[];
}

/**
 * Default values applied when options are not explicitly provided.
 */
export interface ToastDefaults {
  position: ToastPosition;
  duration: number;
  closable: boolean;
  progress: boolean;
}

/**
 * Localizable UI labels used by the toast component.
 */
export interface ToastLabels {
  notifications: string;
  closeNotification: string;
}

/**
 * Internal tracking entry for each active toast.
 */
export interface ToastEntry {
  element: HTMLElement;
  config: ToastOptions & ToastDefaults;
  timeout: ReturnType<typeof setTimeout> | null;
}

/** SVG icon markup keyed by toast type. */
const TOAST_ICONS: Record<string, string> = {
  success:
    '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
  error:
    '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>',
  warning:
    '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
  info: '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>',
};

/**
 * Toast notification component with auto-dismiss, action buttons, progress bars,
 * and pause-on-hover support. Manages a singleton container attached to `<body>`.
 *
 * @example
 * ```ts
 * const toast = new ToastComponent();
 * toast.success('Item saved');
 * toast.error('Something went wrong', { duration: 8000 });
 * toast.show({ title: 'Update', message: 'New version available', actions: [...] });
 * ```
 */
export class ToastComponent {
  public container: HTMLElement | null;
  public toasts: Map<string, ToastEntry>;
  private defaults: ToastDefaults;
  private labels: ToastLabels;

  constructor() {
    this.container = null;
    this.toasts = new Map();
    this.defaults = {
      position: 'top-right',
      duration: 5000,
      closable: true,
      progress: true,
    };
    this.labels = {
      notifications: 'Notifications',
      closeNotification: 'Close notification',
    };
    this.init();
  }

  /**
   * Initialize toast container.
   */
  private init(): void {
    if (!this.container) {
      this.createContainer();
    }
  }

  /**
   * Create toast container element and append it to `<body>`.
   * Removes any existing container first (e.g. when changing position).
   * @param position - Screen position for the container.
   */
  private createContainer(position: ToastPosition = 'top-right'): void {
    if (this.container) {
      this.container.remove();
    }

    this.container = document.createElement('div');
    this.container.className = `aiab-toast-container aiab-toast-container--${position}`;
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-live', 'polite');
    this.container.setAttribute('aria-label', this.labels.notifications);
    document.body.appendChild(this.container);
  }

  /**
   * Show a toast message.
   * @param options - Toast display options.
   * @returns The unique toast ID, usable with {@link hide}.
   */
  public show(options: ToastOptions = {}): string {
    const config = { ...this.defaults, ...options };
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    // Ensure container exists with correct position
    if (
      !this.container ||
      (config.position &&
        !this.container.classList.contains(`aiab-toast-container--${config.position}`))
    ) {
      this.createContainer(config.position);
    }

    // Create toast element
    const toast = this.createToastElement(id, config);

    // Add to container (non-null after createContainer)
    // biome-ignore lint/style/noNonNullAssertion: container is guaranteed to exist after createContainer call above
    this.container!.appendChild(toast);

    // Store reference
    this.toasts.set(id, { element: toast, config, timeout: null });

    // Auto dismiss if duration is set
    if (config.duration && config.duration > 0) {
      const toastData = this.toasts.get(id) as ToastEntry;
      toastData.timeout = setTimeout(() => {
        this.hide(id);
      }, config.duration);
    }

    // Add progress bar animation
    if (config.progress && config.duration && config.duration > 0) {
      const progressBar = toast.querySelector('.aiab-toast__progress') as HTMLElement | null;
      if (progressBar) {
        progressBar.style.animationDuration = `${config.duration}ms`;
      }
    }

    return id;
  }

  /**
   * Create the toast DOM element with icon, content, actions, close button, and progress bar.
   * @param id - Unique toast identifier.
   * @param config - Merged configuration (defaults + caller options).
   * @returns The constructed toast element.
   */
  private createToastElement(id: string, config: ToastOptions & ToastDefaults): HTMLElement {
    const toast = document.createElement('div');
    toast.className = `toast ${config.type ? `toast--${config.type}` : ''} ${config.dark ? 'aiab-toast--dark' : ''}`;
    toast.id = id;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('tabindex', '-1');

    let html = '';

    // Add icon
    if (config.icon) {
      html += `<span class="toast__icon">${this.getIcon(config.type || 'info')}</span>`;
    }

    // Add content
    html += '<div class="toast__content">';
    if (config.title) {
      html += `<h4 class="toast__title">${escapeHTML(config.title)}</h4>`;
    }
    if (config.message) {
      html += `<p class="toast__message">${escapeHTML(config.message)}</p>`;
    }

    // Add action buttons
    if (config.actions && config.actions.length > 0) {
      html += '<div class="toast__actions">';
      for (const action of config.actions) {
        const primary = action.primary ? 'aiab-toast__action--primary' : '';
        html += `<button class="aiab-toast__action ${primary}" data-action="${escapeHTML(action.name)}">${escapeHTML(action.label)}</button>`;
      }
      html += '</div>';
    }

    html += '</div>';

    // Add close button
    if (config.closable) {
      html += `
        <button class="aiab-toast__close" aria-label="${escapeHTML(this.labels.closeNotification)}">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M13.7 0.3a1 1 0 0 1 0 1.4L8.4 7l5.3 5.3a1 1 0 0 1-1.4 1.4L7 8.4l-5.3 5.3a1 1 0 0 1-1.4-1.4L5.6 7 .3 1.7A1 1 0 0 1 1.7.3L7 5.6 12.3.3a1 1 0 0 1 1.4 0z"/>
          </svg>
        </button>
      `;
    }

    // Add progress bar
    if (config.progress && config.duration && config.duration > 0) {
      html += '<div class="aiab-toast__progress"></div>';
    }

    toast.innerHTML = html;

    // Add event listeners
    this.attachEventListeners(toast, id, config);

    return toast;
  }

  /**
   * Attach event listeners to a toast element (close, actions, Escape, hover pause).
   * @param toast - The toast DOM element.
   * @param id - Unique toast identifier.
   * @param config - Merged configuration for this toast.
   */
  private attachEventListeners(
    toast: HTMLElement,
    id: string,
    config: ToastOptions & ToastDefaults,
  ): void {
    // Close button
    const closeBtn = toast.querySelector('.aiab-toast__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide(id));
    }

    // Action buttons
    const actionBtns = toast.querySelectorAll('.aiab-toast__action');
    actionBtns.forEach((btn) => {
      btn.addEventListener('click', (e: Event) => {
        const target = e.target as HTMLElement;
        const actionName = target.dataset.action;
        const action = config.actions?.find((a: ToastAction) => a.name === actionName);
        if (action?.handler) {
          action.handler();
        }
        if (action && action.dismiss !== false) {
          this.hide(id);
        }
      });
    });

    // Dismiss on Escape key
    toast.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.hide(id);
      }
    });

    // Pause on hover
    if (config.pauseOnHover && config.duration && config.duration > 0) {
      toast.addEventListener('mouseenter', () => {
        const toastData = this.toasts.get(id);
        if (toastData?.timeout) {
          clearTimeout(toastData.timeout);
          const progressBar = toast.querySelector('.aiab-toast__progress') as HTMLElement | null;
          if (progressBar) {
            progressBar.style.animationPlayState = 'paused';
          }
        }
      });

      toast.addEventListener('mouseleave', () => {
        const toastData = this.toasts.get(id);
        if (toastData && config.duration && config.duration > 0) {
          toastData.timeout = setTimeout(() => {
            this.hide(id);
          }, config.duration);
          const progressBar = toast.querySelector('.aiab-toast__progress') as HTMLElement | null;
          if (progressBar) {
            progressBar.style.animationPlayState = 'running';
          }
        }
      });
    }
  }

  /**
   * Hide and remove a toast by ID. Plays an exit animation then removes
   * the element from the DOM after 300 ms.
   * @param id - The toast identifier returned by {@link show}.
   */
  public hide(id: string): void {
    const toastData = this.toasts.get(id);
    if (!toastData) return;

    const { element, timeout } = toastData;

    // Clear timeout
    if (timeout) {
      clearTimeout(timeout);
    }

    // Add exit animation
    element.classList.add('aiab-toast--exiting');

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
   * Hide all active toasts.
   */
  public hideAll(): void {
    this.toasts.forEach((_: ToastEntry, id: string) => this.hide(id));
  }

  /**
   * Get SVG icon markup for a given toast type.
   * @param type - The toast type or icon name.
   * @returns SVG markup string.
   */
  private getIcon(type: string): string {
    return TOAST_ICONS[type] || TOAST_ICONS.info;
  }

  /**
   * Show a success toast.
   * @param message - Toast body text.
   * @param options - Additional toast options.
   * @returns The toast ID.
   */
  public success(message: string, options: ToastOptions = {}): string {
    return this.show({ ...options, type: 'success', message, icon: true });
  }

  /**
   * Show an error toast.
   * @param message - Toast body text.
   * @param options - Additional toast options.
   * @returns The toast ID.
   */
  public error(message: string, options: ToastOptions = {}): string {
    return this.show({ ...options, type: 'error', message, icon: true });
  }

  /**
   * Show a warning toast.
   * @param message - Toast body text.
   * @param options - Additional toast options.
   * @returns The toast ID.
   */
  public warning(message: string, options: ToastOptions = {}): string {
    return this.show({ ...options, type: 'warning', message, icon: true });
  }

  /**
   * Show an info toast.
   * @param message - Toast body text.
   * @param options - Additional toast options.
   * @returns The toast ID.
   */
  public info(message: string, options: ToastOptions = {}): string {
    return this.show({ ...options, type: 'info', message, icon: true });
  }

  /**
   * Destroy all toasts and clean up the container.
   * After calling this, the instance can still be re-used (init is called lazily).
   */
  public destroy(): void {
    // Clear all active toasts
    this.toasts.forEach((_entry: ToastEntry, id: string) => {
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

// ---------------------------------------------------------------------------
// Lazy singleton with proxy for deferred initialization
// ---------------------------------------------------------------------------

let _instance: ToastComponent | null = null;

function getToast(): ToastComponent {
  if (!_instance) {
    _instance = new ToastComponent();
  }
  return _instance;
}

/**
 * Lazy-initializing proxy that forwards all property access and method calls
 * to the singleton {@link ToastComponent} instance. The instance is only
 * created on first interaction.
 */
const toast: ToastComponent = new Proxy({} as ToastComponent, {
  get(_target: ToastComponent, prop: string | symbol): unknown {
    const instance = getToast();
    // biome-ignore lint/suspicious/noExplicitAny: dynamic proxy forwarding requires any
    const value = (instance as any)[prop as string];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

// Export for module usage
export default toast;
export { ToastComponent as default_ToastComponent };

// Global API
if (typeof window !== 'undefined') {
  // biome-ignore lint/suspicious/noExplicitAny: global window assignment for non-module consumers
  (window as any).Toast = toast;
}
