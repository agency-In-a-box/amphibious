/**
 * Modal Module - Amphibious 2.0
 * Accessible modal dialogs with focus management and animations
 */

import { getFocusableElements, trapFocus } from '../utils/focus-trap';
import { setInnerHTML } from '../utils/sanitize';

/**
 * Configuration options for the Modal component.
 *
 * @property size - Modal size variant. Defaults to `'default'`.
 * @property variant - Visual variant: standard dialog, alert, image lightbox, drawer, or bottom sheet.
 * @property animation - Entry animation style. Defaults to `'fade-in'`.
 * @property closeOnBackdrop - Whether clicking the backdrop closes the modal. Defaults to `true`.
 * @property closeOnEscape - Whether pressing Escape closes the modal. Defaults to `true`.
 * @property keyboard - Enable keyboard event handling (Escape, Tab trap). Defaults to `true`.
 * @property focus - Manage focus on open/close (auto-focus first element, restore on close). Defaults to `true`.
 * @property backdrop - Show a backdrop overlay. Use `'static'` to prevent backdrop click closing.
 * @property onOpen - Callback fired after the modal opens.
 * @property onClose - Callback fired after the modal closes.
 * @property onConfirm - Callback fired when a `[data-modal-confirm]` button is clicked.
 * @property onCancel - Callback fired when a `[data-modal-cancel]` button is clicked.
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

/**
 * Accessible modal dialog with focus trapping, backdrop management, and animations.
 *
 * Supports multiple variants (alert, drawer, bottom sheet, image lightbox),
 * keyboard dismissal (Escape), configurable backdrop behavior, and
 * automatic focus management with Tab trapping.
 *
 * @fires modal:open - CustomEvent dispatched on the modal element when opened.
 * @fires modal:close - CustomEvent dispatched on the modal element when closed.
 *
 * @example
 * ```ts
 * const modal = new Modal('#my-dialog', {
 *   size: 'lg',
 *   animation: 'slide-down',
 *   onClose: () => console.log('closed'),
 * });
 * modal.open();
 * ```
 */
export class Modal {
  private element: HTMLElement;
  private eventListeners: Array<{
    element: Element | Document | Window;
    type: string;
    handler: EventListener;
  }> = [];

  private backdrop: HTMLElement | null = null;
  private options: ModalOptions;
  private focusableElements: HTMLElement[] = [];
  private lastFocusedElement: HTMLElement | null = null;
  private isOpen = false;
  private scrollbarWidth = 0;
  private prefersReducedMotion = false;

  /**
   * @param element - CSS selector string or HTMLElement for the modal container.
   * @param options - Configuration options merged with sensible defaults.
   * @throws {Error} If the element selector does not match any DOM element.
   */
  constructor(element: string | HTMLElement, options: ModalOptions = {}) {
    // Get modal element
    if (typeof element === 'string') {
      const el = document.querySelector(element);
      if (!el) throw new Error(`Modal element ${element} not found`);
      this.element = el as HTMLElement;
    } else {
      this.element = element;
    }

    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
   * Add event listener with cleanup tracking.
   */
  private addEventListener(
    element: Element | Document | Window,
    type: string,
    handler: EventListener,
  ): void {
    element.addEventListener(type, handler);
    this.eventListeners.push({ element, type, handler });
  }

  /**
   * Remove all tracked event listeners
   */
  private removeAllEventListeners(): void {
    this.eventListeners.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    this.eventListeners = [];
  }

  private init(): void {
    // Add modal classes
    this.element.classList.add('aiab-modal');
    if (this.options.size && this.options.size !== 'default') {
      this.element.classList.add(`aiab-modal--${this.options.size}`);
    }
    if (this.options.variant && this.options.variant !== 'default') {
      this.element.classList.add(`aiab-modal--${this.options.variant}`);
    }
    if (this.options.animation) {
      this.element.classList.add(`aiab-modal--${this.options.animation}`);
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
    this.backdrop.className = 'aiab-modal-backdrop';
    document.body.appendChild(this.backdrop);

    if (this.options.closeOnBackdrop && this.options.backdrop !== 'static') {
      const handler = () => this.close();
      this.addEventListener(this.backdrop, 'click', handler);
    }
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Close button
    const closeButtons = this.element.querySelectorAll('[data-modal-close], .aiab-modal__close');
    closeButtons.forEach((button) => {
      const handler = () => this.close();
      this.addEventListener(button, 'click', handler);
    });

    // Confirm button
    const confirmButtons = this.element.querySelectorAll('[data-modal-confirm]');
    confirmButtons.forEach((button) => {
      const handler = () => {
        if (this.options.onConfirm) {
          this.options.onConfirm();
        }
        this.close();
      };
      this.addEventListener(button, 'click', handler);
    });

    // Cancel button
    const cancelButtons = this.element.querySelectorAll('[data-modal-cancel]');
    cancelButtons.forEach((button) => {
      const handler = () => {
        if (this.options.onCancel) {
          this.options.onCancel();
        }
        this.close();
      };
      this.addEventListener(button, 'click', handler);
    });

    // Keyboard events
    if (this.options.keyboard) {
      const keyHandler = (e: Event) => this.handleKeydown(e as KeyboardEvent);
      this.addEventListener(this.element, 'keydown', keyHandler);
    }

    // Prevent closing when clicking inside modal
    const dialog = this.element.querySelector('.aiab-modal__dialog');
    if (dialog) {
      const stopHandler = (e: Event) => e.stopPropagation();
      this.addEventListener(dialog, 'click', stopHandler);
    }

    // Click outside to close
    if (this.options.closeOnBackdrop && this.options.backdrop !== 'static') {
      const clickHandler = (e: Event) => {
        if (e.target === this.element) {
          this.close();
        }
      };
      this.addEventListener(this.element, 'click', clickHandler);
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
      this.handleTrapFocus(e);
    }
  }

  /**
   * Trap focus within modal
   */
  private handleTrapFocus(e: KeyboardEvent): void {
    trapFocus(e, this.focusableElements);
  }

  /**
   * Get focusable elements
   */
  private refreshFocusableElements(): void {
    this.focusableElements = getFocusableElements(this.element);
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
   * Open the modal dialog.
   * Stores the currently focused element, prevents body scrolling,
   * shows the backdrop, sets ARIA attributes, and moves focus into the modal.
   * Dispatches a `modal:open` CustomEvent and invokes the `onOpen` callback.
   * No-ops if the modal is already open.
   */
  public open(): void {
    if (this.isOpen) return;

    // Store last focused element
    this.lastFocusedElement = document.activeElement as HTMLElement;

    // Prevent body scroll
    document.body.classList.add('aiab-modal-open');
    document.body.style.setProperty('--scrollbar-width', `${this.scrollbarWidth}px`);

    // Show backdrop
    if (this.backdrop) {
      this.backdrop.classList.add('aiab-is-visible');
    }

    // Show modal
    this.element.classList.add('aiab-is-visible');
    this.element.setAttribute('aria-hidden', 'false');

    // Get focusable elements
    this.refreshFocusableElements();

    // Focus modal or first element (skip delay if reduced motion)
    if (this.options.focus) {
      const focusDelay = this.prefersReducedMotion ? 0 : 100;
      setTimeout(() => {
        if (this.focusableElements.length > 0) {
          this.focusableElements[0].focus();
        } else {
          this.element.focus();
        }
      }, focusDelay);
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
   * Close the modal dialog.
   * Hides the modal and backdrop, restores body scrolling after the
   * animation completes, and returns focus to the previously focused element.
   * Dispatches a `modal:close` CustomEvent and invokes the `onClose` callback.
   * No-ops if the modal is already closed.
   */
  public close(): void {
    if (!this.isOpen) return;

    // Hide modal
    this.element.classList.remove('aiab-is-visible');
    this.element.setAttribute('aria-hidden', 'true');

    // Hide backdrop
    if (this.backdrop) {
      this.backdrop.classList.remove('aiab-is-visible');
    }

    // Restore body scroll (skip delay if reduced motion)
    const closeDelay = this.prefersReducedMotion ? 0 : 300;
    setTimeout(() => {
      document.body.classList.remove('aiab-modal-open');
      document.body.style.removeProperty('--scrollbar-width');
    }, closeDelay);

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
   * Toggle the modal between open and closed states.
   */
  public toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Update the content of a specific modal section. HTML strings are sanitized
   * via {@link setInnerHTML} before insertion to prevent XSS.
   *
   * @param content - HTML string or HTMLElement to insert.
   * @param target - Which modal section to update: `'body'`, `'header'`, or `'footer'`.
   */
  public setContent(
    content: string | HTMLElement,
    target: 'body' | 'header' | 'footer' = 'body',
  ): void {
    let targetElement: HTMLElement | null = null;

    switch (target) {
      case 'body':
        targetElement = this.element.querySelector('.aiab-modal__body');
        break;
      case 'header':
        targetElement = this.element.querySelector('.aiab-modal__header');
        break;
      case 'footer':
        targetElement = this.element.querySelector('.aiab-modal__footer');
        break;
    }

    if (targetElement) {
      if (typeof content === 'string') {
        setInnerHTML(targetElement, content);
      } else {
        setInnerHTML(targetElement, '');
        targetElement.appendChild(content);
      }
    }
  }

  /**
   * Update the modal title text.
   * @param title - New title text (set via `textContent`, not parsed as HTML).
   */
  public setTitle(title: string): void {
    const titleElement = this.element.querySelector('.aiab-modal__title');
    if (titleElement) {
      titleElement.textContent = title;
    }
  }

  /**
   * Fully tear down the modal: close it, remove all event listeners,
   * remove the backdrop element, and strip all modal-related classes and ARIA attributes
   * from the original element.
   */
  public destroy(): void {
    this.close();

    // Remove all event listeners
    this.removeAllEventListeners();

    // Remove backdrop
    if (this.backdrop) {
      this.backdrop.remove();
      this.backdrop = null;
    }

    // Reset element
    this.element.classList.remove(
      'aiab-modal',
      `aiab-modal--${this.options.size}`,
      `aiab-modal--${this.options.variant}`,
    );
    this.element.removeAttribute('role');
    this.element.removeAttribute('aria-modal');
    this.element.removeAttribute('aria-hidden');
    this.element.removeAttribute('tabindex');
  }

  /**
   * Check whether the modal is currently open.
   * @returns `true` if the modal is visible.
   */
  public isModalOpen(): boolean {
    return this.isOpen;
  }

  /**
   * Merge new options into the current configuration.
   * Does not re-initialize the modal; changes take effect on next open/close cycle.
   * @param options - Partial options to merge.
   */
  public updateOptions(options: Partial<ModalOptions>): void {
    this.options = { ...this.options, ...options };
  }
}

/**
 * Registry and factory for managing multiple Modal instances by string ID.
 * Provides static convenience methods for creating, opening, closing,
 * and destroying modals, plus promise-based alert/confirm dialogs.
 *
 * @example
 * ```ts
 * ModalManager.create('settings', '#settings-modal', { size: 'lg' });
 * ModalManager.open('settings');
 * ModalManager.close('settings');
 *
 * // Promise-based confirm
 * const confirmed = await ModalManager.confirm('Delete this item?');
 * ```
 */
export class ModalManager {
  private static modals: Map<string, Modal> = new Map();

  /**
   * Create a new Modal and register it under the given ID.
   * @param id - Unique identifier for later retrieval.
   * @param element - CSS selector or HTMLElement for the modal container.
   * @param options - Modal configuration options.
   * @returns The created Modal instance.
   */
  static create(id: string, element: string | HTMLElement, options: ModalOptions = {}): Modal {
    const modal = new Modal(element, options);
    ModalManager.modals.set(id, modal);
    return modal;
  }

  /**
   * Retrieve a registered Modal instance by its ID.
   * @param id - The modal identifier.
   * @returns The Modal instance, or `undefined` if not found.
   */
  static get(id: string): Modal | undefined {
    return ModalManager.modals.get(id);
  }

  /**
   * Open a registered modal by its ID. No-ops if the ID is not found.
   * @param id - The modal identifier.
   */
  static open(id: string): void {
    const modal = ModalManager.modals.get(id);
    if (modal) {
      modal.open();
    }
  }

  /**
   * Close a registered modal by its ID. No-ops if the ID is not found.
   * @param id - The modal identifier.
   */
  static close(id: string): void {
    const modal = ModalManager.modals.get(id);
    if (modal) {
      modal.close();
    }
  }

  /**
   * Close every registered modal.
   */
  static closeAll(): void {
    ModalManager.modals.forEach((modal) => modal.close());
  }

  /**
   * Destroy a registered modal and remove it from the registry.
   * @param id - The modal identifier.
   */
  static destroy(id: string): void {
    const modal = ModalManager.modals.get(id);
    if (modal) {
      modal.destroy();
      ModalManager.modals.delete(id);
    }
  }

  /**
   * Destroy every registered modal and clear the registry.
   */
  static destroyAll(): void {
    ModalManager.modals.forEach((modal) => modal.destroy());
    ModalManager.modals.clear();
  }

  /**
   * Display a promise-based alert dialog with an OK button.
   * The modal is auto-created, appended to `<body>`, and removed when dismissed.
   *
   * @param message - The message to display.
   * @param type - Visual style: `'success'`, `'error'`, `'warning'`, or `'info'`.
   * @returns A Promise that resolves when the user dismisses the alert.
   *
   * @example
   * ```ts
   * await ModalManager.alert('Changes saved!', 'success');
   * ```
   */
  static alert(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
  ): Promise<void> {
    return new Promise((resolve) => {
      const modalHtml = `
        <div class="aiab-modal__dialog">
          <div class="aiab-modal__body">
            <div class="aiab-modal__icon">${ModalManager.getIcon(type)}</div>
            <p>${message}</p>
            <button class="aiab-btn btn--primary" data-modal-close>OK</button>
          </div>
        </div>
      `;

      const modalElement = document.createElement('div');
      setInnerHTML(modalElement, modalHtml);
      document.body.appendChild(modalElement);

      const modal = new Modal(modalElement, {
        variant: 'alert',
        closeOnBackdrop: false,
        onClose: () => {
          modalElement.remove();
          resolve();
        },
      });

      modalElement.classList.add(`aiab-modal--${type}`);
      modal.open();
    });
  }

  /**
   * Display a promise-based confirmation dialog with Confirm/Cancel buttons.
   * The modal is auto-created, appended to `<body>`, and removed when dismissed.
   *
   * @param message - The question or message to display.
   * @param confirmText - Label for the confirm button. Defaults to `'Confirm'`.
   * @param cancelText - Label for the cancel button. Defaults to `'Cancel'`.
   * @returns A Promise that resolves to `true` if confirmed, `false` if cancelled or closed.
   *
   * @example
   * ```ts
   * if (await ModalManager.confirm('Delete this item?', 'Delete', 'Keep')) {
   *   deleteItem();
   * }
   * ```
   */
  static confirm(
    message: string,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const modalHtml = `
        <div class="aiab-modal__dialog">
          <div class="aiab-modal__body">
            <p>${message}</p>
          </div>
          <div class="aiab-modal__footer">
            <button class="aiab-btn btn--secondary" data-modal-cancel>${cancelText}</button>
            <button class="aiab-btn btn--primary" data-modal-confirm>${confirmText}</button>
          </div>
        </div>
      `;

      const modalElement = document.createElement('div');
      setInnerHTML(modalElement, modalHtml);
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
   * Return a simple text icon character for the given alert type.
   * @param type - Alert type name.
   * @returns A single-character icon string.
   */
  private static getIcon(type: string): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '!';
      default:
        return 'i';
    }
  }
}

export default Modal;
