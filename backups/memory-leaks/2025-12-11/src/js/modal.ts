/**
 * Modal Module - Amphibious 2.0
 * Accessible modal dialogs with focus management and animations
 */

export interface ModalOptions {
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'alert' | 'image' | 'drawer-left' | 'drawer-right' | 'bottom-sheet';
  animation?: 'fade-in' | 'slide-down' | 'zoom-in';
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  keyboard?: boolean;
  focus?: boolean;
  backdrop?: boolean | 'static';
  onOpen?: () => void;
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export class Modal {
  private element: HTMLElement;
  private backdrop: HTMLElement | null = null;
  private options: ModalOptions;
  private focusableElements: HTMLElement[] = [];
  private lastFocusedElement: HTMLElement | null = null;
  private isOpen = false;
  private scrollbarWidth = 0;

  constructor(element: string | HTMLElement, options: ModalOptions = {}) {
    // Get modal element
    if (typeof element === 'string') {
      const el = document.querySelector(element);
      if (!el) throw new Error(`Modal element ${element} not found`);
      this.element = el as HTMLElement;
    } else {
      this.element = element;
    }

    // Set default options
    this.options = {
      size: 'default',
      variant: 'default',
      animation: 'fade-in',
      closeOnBackdrop: true,
      closeOnEscape: true,
      keyboard: true,
      focus: true,
      backdrop: true,
      ...options,
    };

    this.init();
  }

  /**
   * Initialize modal
   */
  private init(): void {
    // Add modal classes
    this.element.classList.add('modal');
    if (this.options.size && this.options.size !== 'default') {
      this.element.classList.add(`modal--${this.options.size}`);
    }
    if (this.options.variant && this.options.variant !== 'default') {
      this.element.classList.add(`modal--${this.options.variant}`);
    }
    if (this.options.animation) {
      this.element.classList.add(`modal--${this.options.animation}`);
    }

    // Set ARIA attributes
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    this.element.setAttribute('aria-hidden', 'true');
    this.element.setAttribute('tabindex', '-1');

    // Create backdrop if needed
    if (this.options.backdrop) {
      this.createBackdrop();
    }

    // Setup event handlers
    this.setupEventHandlers();

    // Calculate scrollbar width
    this.calculateScrollbarWidth();
  }

  /**
   * Create backdrop element
   */
  private createBackdrop(): void {
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'modal-backdrop';
    document.body.appendChild(this.backdrop);

    if (this.options.closeOnBackdrop && this.options.backdrop !== 'static') {
      this.backdrop.addEventListener('click', () => this.close());
    }
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Close button
    const closeButtons = this.element.querySelectorAll('[data-modal-close], .modal__close');
    closeButtons.forEach((button) => {
      button.addEventListener('click', () => this.close());
    });

    // Confirm button
    const confirmButtons = this.element.querySelectorAll('[data-modal-confirm]');
    confirmButtons.forEach((button) => {
      button.addEventListener('click', () => {
        if (this.options.onConfirm) {
          this.options.onConfirm();
        }
        this.close();
      });
    });

    // Cancel button
    const cancelButtons = this.element.querySelectorAll('[data-modal-cancel]');
    cancelButtons.forEach((button) => {
      button.addEventListener('click', () => {
        if (this.options.onCancel) {
          this.options.onCancel();
        }
        this.close();
      });
    });

    // Keyboard events
    if (this.options.keyboard) {
      this.element.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    // Prevent closing when clicking inside modal
    const dialog = this.element.querySelector('.modal__dialog');
    if (dialog) {
      dialog.addEventListener('click', (e) => e.stopPropagation());
    }

    // Click outside to close
    if (this.options.closeOnBackdrop && this.options.backdrop !== 'static') {
      this.element.addEventListener('click', (e) => {
        if (e.target === this.element) {
          this.close();
        }
      });
    }
  }

  /**
   * Handle keyboard events
   */
  private handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && this.options.closeOnEscape) {
      e.preventDefault();
      this.close();
    }

    // Tab trap for accessibility
    if (e.key === 'Tab') {
      this.trapFocus(e);
    }
  }

  /**
   * Trap focus within modal
   */
  private trapFocus(e: KeyboardEvent): void {
    if (this.focusableElements.length === 0) return;

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Get focusable elements
   */
  private getFocusableElements(): void {
    const selector = 'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])';
    const elements = this.element.querySelectorAll(selector);
    this.focusableElements = Array.from(elements).filter((el) => {
      const element = el as HTMLElement;
      return !element.hasAttribute('disabled') && element.offsetParent !== null;
    }) as HTMLElement[];
  }

  /**
   * Calculate scrollbar width
   */
  private calculateScrollbarWidth(): void {
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    document.body.appendChild(outer);

    const inner = document.createElement('div');
    outer.appendChild(inner);

    this.scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    outer.remove();
  }

  /**
   * Open modal
   */
  public open(): void {
    if (this.isOpen) return;

    // Store last focused element
    this.lastFocusedElement = document.activeElement as HTMLElement;

    // Prevent body scroll
    document.body.classList.add('modal-open');
    document.body.style.setProperty('--scrollbar-width', `${this.scrollbarWidth}px`);

    // Show backdrop
    if (this.backdrop) {
      this.backdrop.classList.add('is-visible');
    }

    // Show modal
    this.element.classList.add('is-visible');
    this.element.setAttribute('aria-hidden', 'false');

    // Get focusable elements
    this.getFocusableElements();

    // Focus modal or first element
    if (this.options.focus) {
      setTimeout(() => {
        if (this.focusableElements.length > 0) {
          this.focusableElements[0].focus();
        } else {
          this.element.focus();
        }
      }, 100);
    }

    this.isOpen = true;

    // Dispatch open event
    const openEvent = new CustomEvent('modal:open', {
      detail: { modal: this },
      bubbles: true,
    });
    this.element.dispatchEvent(openEvent);

    // Call onOpen callback
    if (this.options.onOpen) {
      this.options.onOpen();
    }
  }

  /**
   * Close modal
   */
  public close(): void {
    if (!this.isOpen) return;

    // Hide modal
    this.element.classList.remove('is-visible');
    this.element.setAttribute('aria-hidden', 'true');

    // Hide backdrop
    if (this.backdrop) {
      this.backdrop.classList.remove('is-visible');
    }

    // Restore body scroll
    setTimeout(() => {
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('--scrollbar-width');
    }, 300);

    // Restore focus
    if (this.lastFocusedElement && this.options.focus) {
      this.lastFocusedElement.focus();
    }

    this.isOpen = false;

    // Dispatch close event
    const closeEvent = new CustomEvent('modal:close', {
      detail: { modal: this },
      bubbles: true,
    });
    this.element.dispatchEvent(closeEvent);

    // Call onClose callback
    if (this.options.onClose) {
      this.options.onClose();
    }
  }

  /**
   * Toggle modal
   */
  public toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Update modal content
   */
  public setContent(
    content: string | HTMLElement,
    target: 'body' | 'header' | 'footer' = 'body',
  ): void {
    let targetElement: HTMLElement | null = null;

    switch (target) {
      case 'body':
        targetElement = this.element.querySelector('.modal__body');
        break;
      case 'header':
        targetElement = this.element.querySelector('.modal__header');
        break;
      case 'footer':
        targetElement = this.element.querySelector('.modal__footer');
        break;
    }

    if (targetElement) {
      if (typeof content === 'string') {
        targetElement.innerHTML = content;
      } else {
        targetElement.innerHTML = '';
        targetElement.appendChild(content);
      }
    }
  }

  /**
   * Update modal title
   */
  public setTitle(title: string): void {
    const titleElement = this.element.querySelector('.modal__title');
    if (titleElement) {
      titleElement.textContent = title;
    }
  }

  /**
   * Destroy modal
   */
  public destroy(): void {
    this.close();

    // Remove backdrop
    if (this.backdrop) {
      this.backdrop.remove();
      this.backdrop = null;
    }

    // Remove event listeners
    const closeButtons = this.element.querySelectorAll('[data-modal-close], .modal__close');
    closeButtons.forEach((button) => {
      button.replaceWith(button.cloneNode(true));
    });

    // Reset element
    this.element.classList.remove(
      'modal',
      `modal--${this.options.size}`,
      `modal--${this.options.variant}`,
    );
    this.element.removeAttribute('role');
    this.element.removeAttribute('aria-modal');
    this.element.removeAttribute('aria-hidden');
    this.element.removeAttribute('tabindex');
  }

  /**
   * Check if modal is open
   */
  public isModalOpen(): boolean {
    return this.isOpen;
  }

  /**
   * Update options
   */
  public updateOptions(options: Partial<ModalOptions>): void {
    this.options = { ...this.options, ...options };
  }
}

/**
 * Static modal methods
 */
export class ModalManager {
  private static modals: Map<string, Modal> = new Map();

  /**
   * Create and register a modal
   */
  static create(id: string, element: string | HTMLElement, options: ModalOptions = {}): Modal {
    const modal = new Modal(element, options);
    this.modals.set(id, modal);
    return modal;
  }

  /**
   * Get modal by ID
   */
  static get(id: string): Modal | undefined {
    return this.modals.get(id);
  }

  /**
   * Open modal by ID
   */
  static open(id: string): void {
    const modal = this.modals.get(id);
    if (modal) {
      modal.open();
    }
  }

  /**
   * Close modal by ID
   */
  static close(id: string): void {
    const modal = this.modals.get(id);
    if (modal) {
      modal.close();
    }
  }

  /**
   * Close all modals
   */
  static closeAll(): void {
    this.modals.forEach((modal) => modal.close());
  }

  /**
   * Destroy modal by ID
   */
  static destroy(id: string): void {
    const modal = this.modals.get(id);
    if (modal) {
      modal.destroy();
      this.modals.delete(id);
    }
  }

  /**
   * Destroy all modals
   */
  static destroyAll(): void {
    this.modals.forEach((modal) => modal.destroy());
    this.modals.clear();
  }

  /**
   * Create alert modal
   */
  static alert(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
  ): Promise<void> {
    return new Promise((resolve) => {
      const modalHtml = `
        <div class="modal__dialog">
          <div class="modal__body">
            <div class="modal__icon">${this.getIcon(type)}</div>
            <p>${message}</p>
            <button class="btn btn--primary" data-modal-close>OK</button>
          </div>
        </div>
      `;

      const modalElement = document.createElement('div');
      modalElement.innerHTML = modalHtml;
      document.body.appendChild(modalElement);

      const modal = new Modal(modalElement, {
        variant: 'alert',
        closeOnBackdrop: false,
        onClose: () => {
          modalElement.remove();
          resolve();
        },
      });

      modalElement.classList.add(`modal--${type}`);
      modal.open();
    });
  }

  /**
   * Create confirm modal
   */
  static confirm(
    message: string,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const modalHtml = `
        <div class="modal__dialog">
          <div class="modal__body">
            <p>${message}</p>
          </div>
          <div class="modal__footer">
            <button class="btn btn--secondary" data-modal-cancel>${cancelText}</button>
            <button class="btn btn--primary" data-modal-confirm>${confirmText}</button>
          </div>
        </div>
      `;

      const modalElement = document.createElement('div');
      modalElement.innerHTML = modalHtml;
      document.body.appendChild(modalElement);

      const modal = new Modal(modalElement, {
        variant: 'alert',
        onConfirm: () => {
          modalElement.remove();
          resolve(true);
        },
        onCancel: () => {
          modalElement.remove();
          resolve(false);
        },
        onClose: () => {
          modalElement.remove();
          resolve(false);
        },
      });

      modal.open();
    });
  }

  /**
   * Get icon for alert type
   */
  private static getIcon(type: string): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '!';
      case 'info':
      default:
        return 'i';
    }
  }
}

export default Modal;
