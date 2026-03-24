/**
 * Tooltip Component for Amphibious 2.0
 * Accessible, customizable tooltips with smart positioning
 */

import { sanitizeHTML } from '../utils/sanitize';

/**
 * Configuration options for the Tooltip component.
 *
 * @property content - Plain text content. Falls back to the element's `title` or `data-tooltip` attribute.
 * @property html - HTML content string (sanitized before rendering). Takes precedence over `content`.
 * @property position - Placement relative to the trigger element. Supports 12 positions with auto-adjustment.
 * @property variant - Color variant for the tooltip background.
 * @property size - Size modifier. Defaults to `'default'`.
 * @property trigger - Interaction mode: `'hover'` (+ focus), `'click'`, `'focus'`, or `'manual'`.
 * @property delay - Show delay in milliseconds. Defaults to `100`.
 * @property hideDelay - Hide delay in milliseconds. Defaults to `100`.
 * @property interactive - Keep tooltip visible while hovering over it. Defaults to `false`.
 * @property allowHTML - Whether to render `html` content as HTML (sanitized). Defaults to `false`.
 * @property maxWidth - Maximum tooltip width in pixels. Defaults to `320`.
 * @property offset - Distance from trigger in pixels. Defaults to `8`.
 * @property zIndex - CSS z-index for the tooltip. Defaults to `1060`.
 * @property className - Additional CSS class(es) to apply to the tooltip element.
 * @property onShow - Callback fired when the tooltip becomes visible.
 * @property onHide - Callback fired when the tooltip is hidden.
 * @property onMount - Callback fired when the Tooltip instance is initialized.
 * @property onDestroy - Callback fired when the Tooltip instance is destroyed.
 */
export interface TooltipOptions {
  content?: string;
  html?: string;
  position?:
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'left-start'
    | 'left-end'
    | 'right'
    | 'right-start'
    | 'right-end';
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'light';
  size?: 'sm' | 'default' | 'lg';
  trigger?: 'hover' | 'click' | 'focus' | 'manual';
  delay?: number;
  hideDelay?: number;
  interactive?: boolean;
  allowHTML?: boolean;
  maxWidth?: number;
  offset?: number;
  zIndex?: number;
  className?: string;
  onShow?: () => void;
  onHide?: () => void;
  onMount?: () => void;
  onDestroy?: () => void;
}

/**
 * Accessible, customizable tooltip component with smart viewport-aware positioning.
 *
 * Supports 12 placement positions (with automatic flip when clipped by viewport),
 * multiple trigger modes, interactive tooltips, HTML content (sanitized via DOMPurify),
 * color variants, keyboard dismissal (Escape), and `prefers-reduced-motion` support.
 *
 * Tracks all instances in a static Map for bulk operations and lookup by element.
 *
 * @example
 * ```ts
 * // Via constructor
 * const tip = new Tooltip('#info-icon', {
 *   content: 'More information',
 *   position: 'right',
 *   variant: 'info',
 * });
 *
 * // Via data attributes (auto-init)
 * // <span data-tooltip="Hello" data-tooltip-position="bottom">Hover me</span>
 * Tooltip.initFromData();
 *
 * // Clean up
 * tip.destroy();
 * Tooltip.destroyAll();
 * ```
 */
export class Tooltip {
  private element: HTMLElement;
  private tooltipElement: HTMLElement | null = null;
  private options: Required<TooltipOptions>;
  private isVisible = false;
  private showTimeout: ReturnType<typeof setTimeout> | null = null;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private prefersReducedMotion = false;
  private currentPosition: TooltipOptions['position'] = undefined;

  // Store bound handlers for proper removeEventListener
  private boundHandlers: Record<string, EventListener> = {};

  private static instances = new Map<HTMLElement, Tooltip>();

  /**
   * @param element - Target element (HTMLElement or CSS selector) to attach the tooltip to.
   * @param options - Tooltip configuration merged with defaults.
   * @throws {Error} If the target element is not found in the DOM.
   */
  constructor(element: HTMLElement | string, options: TooltipOptions = {}) {
    this.element = typeof element === 'string' ? document.querySelector(element)! : element;

    if (!this.element) {
      throw new Error('Tooltip: Target element not found');
    }

    // Default options
    this.options = {
      content:
        this.element.getAttribute('title') || this.element.getAttribute('data-tooltip') || '',
      html: '',
      position: 'top',
      variant: 'default',
      size: 'default',
      trigger: 'hover',
      delay: 100,
      hideDelay: 100,
      interactive: false,
      allowHTML: false,
      maxWidth: 320,
      offset: 8,
      zIndex: 1060,
      className: '',
      onShow: () => {},
      onHide: () => {},
      onMount: () => {},
      onDestroy: () => {},
      ...options,
    };

    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.init();
  }

  private init(): void {
    // Remove title attribute to prevent native tooltip
    if (this.element.hasAttribute('title')) {
      this.element.removeAttribute('title');
    }

    // Set up event listeners based on trigger
    this.setupEventListeners();

    // Set up resize observer for repositioning
    this.setupResizeObserver();

    // Add to instances map
    Tooltip.instances.set(this.element, this);

    // Call mount callback
    this.options.onMount();
  }

  private setupEventListeners(): void {
    const { trigger } = this.options;

    // Store bound handlers so removeEventListener can match them
    this.boundHandlers = {
      mouseenter: this.handleMouseEnter.bind(this),
      mouseleave: this.handleMouseLeave.bind(this),
      focus: this.handleFocus.bind(this),
      blur: this.handleBlur.bind(this),
      click: this.handleClick.bind(this),
      documentClick: this.handleDocumentClick.bind(this),
      keydown: this.handleKeydown.bind(this),
      resize: this.handleWindowResize.bind(this),
      scroll: this.handleWindowScroll.bind(this),
    };

    if (trigger === 'hover') {
      this.element.addEventListener('mouseenter', this.boundHandlers.mouseenter);
      this.element.addEventListener('mouseleave', this.boundHandlers.mouseleave);
      this.element.addEventListener('focus', this.boundHandlers.focus);
      this.element.addEventListener('blur', this.boundHandlers.blur);
    } else if (trigger === 'click') {
      this.element.addEventListener('click', this.boundHandlers.click);
      document.addEventListener('click', this.boundHandlers.documentClick);
    } else if (trigger === 'focus') {
      this.element.addEventListener('focus', this.boundHandlers.focus);
      this.element.addEventListener('blur', this.boundHandlers.blur);
    }

    // Keyboard support
    this.element.addEventListener('keydown', this.boundHandlers.keydown);
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.isVisible) {
          this.updatePosition();
        }
      });
      this.resizeObserver.observe(this.element);
    }
  }

  private handleMouseEnter(): void {
    this.clearHideTimeout();
    if (this.options.delay > 0) {
      this.clearShowTimeout();
      this.showTimeout = setTimeout(() => this.show(), this.options.delay);
    } else {
      this.show();
    }
  }

  private handleMouseLeave(): void {
    this.clearShowTimeout();
    if (!this.options.interactive) {
      this.hide();
    }
  }

  private handleFocus(): void {
    this.show();
  }

  private handleBlur(): void {
    this.hide();
  }

  private handleClick(event: Event): void {
    event.preventDefault();
    this.toggle();
  }

  private handleDocumentClick(event: Event): void {
    if (
      this.isVisible &&
      !this.element.contains(event.target as Node) &&
      (!this.tooltipElement || !this.tooltipElement.contains(event.target as Node))
    ) {
      this.hide();
    }
  }

  private handleKeydown(event: Event): void {
    if (!(event instanceof KeyboardEvent)) return;
    if (event.key === 'Escape' && this.isVisible) {
      this.hide();
      this.element.focus();
    }
  }

  private createTooltipElement(): HTMLElement {
    const tooltip = document.createElement('div');
    tooltip.className = this.getTooltipClasses();
    tooltip.setAttribute('role', 'tooltip');
    tooltip.setAttribute('aria-hidden', 'true');

    // Set content
    const content = this.options.html || this.options.content;
    if (this.options.allowHTML && this.options.html) {
      tooltip.innerHTML = sanitizeHTML(content || '');
    } else {
      tooltip.textContent = content;
    }

    // Set styles
    tooltip.style.maxWidth = `${this.options.maxWidth}px`;
    tooltip.style.zIndex = this.options.zIndex.toString();

    // Handle interactive tooltips
    if (this.options.interactive) {
      tooltip.addEventListener('mouseenter', () => this.clearHideTimeout());
      tooltip.addEventListener('mouseleave', () => this.hide());
    }

    return tooltip;
  }

  private getTooltipClasses(): string {
    const classes = ['aiab-tooltip'];

    if (this.options.position) {
      classes.push(`aiab-tooltip--${this.options.position}`);
    }

    if (this.options.variant !== 'default') {
      classes.push(`aiab-tooltip--${this.options.variant}`);
    }

    if (this.options.size !== 'default') {
      classes.push(`aiab-tooltip--${this.options.size}`);
    }

    if (this.options.interactive) {
      classes.push('aiab-tooltip--interactive');
    }

    if (this.options.className) {
      classes.push(this.options.className);
    }

    return classes.join(' ');
  }

  private updatePosition(): void {
    if (!this.tooltipElement) return;

    const triggerRect = this.element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    // First, position the tooltip off-screen to get its dimensions
    this.tooltipElement.style.visibility = 'hidden';
    this.tooltipElement.style.left = '-9999px';
    this.tooltipElement.style.top = '-9999px';
    this.tooltipElement.style.display = 'block';

    const tooltipRect = this.tooltipElement.getBoundingClientRect();

    let position = this.options.position;

    // Auto-adjust position if tooltip would go outside viewport
    position =
      this.adjustPositionForViewport(
        position,
        triggerRect,
        tooltipRect,
        viewportWidth,
        viewportHeight,
      ) || 'top';

    // Calculate coordinates
    const coords = this.calculatePosition(position, triggerRect, tooltipRect);

    // Apply final position
    this.tooltipElement.style.visibility = 'visible';
    this.tooltipElement.style.left = `${coords.x + scrollX}px`;
    this.tooltipElement.style.top = `${coords.y + scrollY}px`;

    // Update position class if it changed from whatever is currently applied
    const appliedPosition = this.currentPosition || this.options.position;
    if (position !== appliedPosition) {
      if (appliedPosition) {
        this.tooltipElement.classList.remove(`aiab-tooltip--${appliedPosition}`);
      }
      this.tooltipElement.classList.add(`aiab-tooltip--${position}`);
    }
    this.currentPosition = position;
  }

  private adjustPositionForViewport(
    position: TooltipOptions['position'],
    triggerRect: DOMRect,
    tooltipRect: DOMRect,
    viewportWidth: number,
    viewportHeight: number,
  ): TooltipOptions['position'] {
    const coords = this.calculatePosition(position, triggerRect, tooltipRect);
    const margin = 10; // Add margin from viewport edges

    // Check if tooltip goes outside viewport and adjust
    if (coords.x < margin) {
      if (position?.includes('left'))
        return position.replace('left', 'right') as TooltipOptions['position'];
      if (position?.includes('top') || position?.includes('bottom')) {
        const basePart = position?.split('-')[0];
        return `${basePart}-start` as TooltipOptions['position'];
      }
    }

    if (coords.x + tooltipRect.width > viewportWidth - margin) {
      if (position?.includes('right'))
        return position.replace('right', 'left') as TooltipOptions['position'];
      if (position?.includes('top') || position?.includes('bottom')) {
        const basePart = position?.split('-')[0];
        return `${basePart}-end` as TooltipOptions['position'];
      }
    }

    if (coords.y < margin) {
      if (position?.includes('top'))
        return position.replace('top', 'bottom') as TooltipOptions['position'];
      // If still doesn't fit, try horizontal positioning
      if (!position?.includes('bottom')) return 'right';
    }

    if (coords.y + tooltipRect.height > viewportHeight - margin) {
      if (position?.includes('bottom'))
        return position.replace('bottom', 'top') as TooltipOptions['position'];
      // If still doesn't fit, try horizontal positioning
      if (!position?.includes('top')) return 'left';
    }

    return position;
  }

  private calculatePosition(
    position: TooltipOptions['position'],
    triggerRect: DOMRect,
    tooltipRect: DOMRect,
  ): { x: number; y: number } {
    const offset = this.options.offset;
    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.top - tooltipRect.height - offset;
        break;
      case 'top-start':
        x = triggerRect.left;
        y = triggerRect.top - tooltipRect.height - offset;
        break;
      case 'top-end':
        x = triggerRect.right - tooltipRect.width;
        y = triggerRect.top - tooltipRect.height - offset;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.bottom + offset;
        break;
      case 'bottom-start':
        x = triggerRect.left;
        y = triggerRect.bottom + offset;
        break;
      case 'bottom-end':
        x = triggerRect.right - tooltipRect.width;
        y = triggerRect.bottom + offset;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - offset;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case 'left-start':
        x = triggerRect.left - tooltipRect.width - offset;
        y = triggerRect.top;
        break;
      case 'left-end':
        x = triggerRect.left - tooltipRect.width - offset;
        y = triggerRect.bottom - tooltipRect.height;
        break;
      case 'right':
        x = triggerRect.right + offset;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case 'right-start':
        x = triggerRect.right + offset;
        y = triggerRect.top;
        break;
      case 'right-end':
        x = triggerRect.right + offset;
        y = triggerRect.bottom - tooltipRect.height;
        break;
    }

    return { x, y };
  }

  private clearShowTimeout(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
  }

  private clearHideTimeout(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  /**
   * Show the tooltip. Creates the tooltip DOM element if it does not exist,
   * positions it relative to the trigger, and applies visibility classes.
   * Respects the configured `delay` (skipped when `prefers-reduced-motion` is active).
   * No-ops if already visible.
   */
  show(): void {
    if (this.isVisible) return;

    this.clearHideTimeout();

    const showTooltip = () => {
      if (!this.options.content && !this.options.html) return;

      // Create tooltip element if it doesn't exist
      if (!this.tooltipElement) {
        this.tooltipElement = this.createTooltipElement();
        document.body.appendChild(this.tooltipElement);
      }

      // Update content if needed
      this.updateContent();

      // Position tooltip
      this.updatePosition();

      // Show tooltip
      this.tooltipElement.classList.remove('aiab-tooltip--hidden');
      this.tooltipElement.classList.add('aiab-tooltip--visible');
      this.tooltipElement.setAttribute('aria-hidden', 'false');

      this.isVisible = true;
      this.options.onShow();

      // Set up window resize listener
      window.addEventListener('resize', this.boundHandlers.resize);
      window.addEventListener('scroll', this.boundHandlers.scroll);
    };

    const delay = this.prefersReducedMotion ? 0 : this.options.delay;
    if (delay > 0) {
      this.showTimeout = setTimeout(showTooltip, delay);
    } else {
      showTooltip();
    }
  }

  /**
   * Hide the tooltip. Applies hidden classes, then removes the tooltip
   * element from the DOM after the animation completes. Respects `hideDelay`.
   * No-ops if already hidden.
   */
  hide(): void {
    if (!this.isVisible) return;

    this.clearShowTimeout();

    const hideTooltip = () => {
      if (this.tooltipElement) {
        this.tooltipElement.classList.remove('aiab-tooltip--visible');
        this.tooltipElement.classList.add('aiab-tooltip--hidden');
        this.tooltipElement.setAttribute('aria-hidden', 'true');

        // Remove from DOM after animation (skip delay if reduced motion)
        const removeDelay = this.prefersReducedMotion ? 0 : 200;
        setTimeout(() => {
          if (this.tooltipElement && !this.isVisible) {
            if (this.tooltipElement.parentNode) {
              this.tooltipElement.parentNode.removeChild(this.tooltipElement);
            }
            this.tooltipElement = null;
          }
        }, removeDelay);
      }

      this.isVisible = false;
      this.currentPosition = undefined;
      this.options.onHide();

      // Remove window listeners
      window.removeEventListener('resize', this.boundHandlers.resize);
      window.removeEventListener('scroll', this.boundHandlers.scroll);
    };

    const hideDelay = this.prefersReducedMotion ? 0 : this.options.hideDelay;
    if (hideDelay > 0) {
      this.hideTimeout = setTimeout(hideTooltip, hideDelay);
    } else {
      hideTooltip();
    }
  }

  /**
   * Toggle the tooltip between visible and hidden states.
   */
  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Update the tooltip's text or HTML content. If the tooltip is currently
   * visible, the content is updated in-place.
   *
   * @param content - New plain text content (updates `options.content`).
   * @param html - New HTML content (updates `options.html`; sanitized if `allowHTML` is true).
   */
  updateContent(content?: string, html?: string): void {
    if (content !== undefined) {
      this.options.content = content;
    }
    if (html !== undefined) {
      this.options.html = html;
    }

    if (this.tooltipElement) {
      const newContent = this.options.html || this.options.content;
      if (this.options.allowHTML && this.options.html) {
        this.tooltipElement.innerHTML = sanitizeHTML(newContent || '');
      } else {
        this.tooltipElement.textContent = newContent;
      }
    }
  }

  /**
   * Merge new options into the tooltip configuration and re-apply
   * classes and position if the tooltip is currently rendered.
   * @param options - Partial options to merge.
   */
  updateOptions(options: Partial<TooltipOptions>): void {
    this.options = { ...this.options, ...options };

    if (this.tooltipElement) {
      this.tooltipElement.className = this.getTooltipClasses();
      this.updatePosition();
    }
  }

  private handleWindowResize(): void {
    if (this.isVisible) {
      this.updatePosition();
    }
  }

  private handleWindowScroll(): void {
    if (this.isVisible) {
      this.updatePosition();
    }
  }

  /**
   * Fully tear down the tooltip: hide it, remove all event listeners,
   * disconnect the ResizeObserver, remove from the static instances registry,
   * and invoke the `onDestroy` callback.
   */
  destroy(): void {
    this.hide();

    // Remove event listeners using stored bound references
    this.element.removeEventListener('mouseenter', this.boundHandlers.mouseenter);
    this.element.removeEventListener('mouseleave', this.boundHandlers.mouseleave);
    this.element.removeEventListener('focus', this.boundHandlers.focus);
    this.element.removeEventListener('blur', this.boundHandlers.blur);
    this.element.removeEventListener('click', this.boundHandlers.click);
    this.element.removeEventListener('keydown', this.boundHandlers.keydown);
    document.removeEventListener('click', this.boundHandlers.documentClick);
    window.removeEventListener('resize', this.boundHandlers.resize);
    window.removeEventListener('scroll', this.boundHandlers.scroll);

    // Disconnect resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    // Remove from instances
    Tooltip.instances.delete(this.element);

    // Call destroy callback
    this.options.onDestroy();
  }

  /**
   * Retrieve an existing Tooltip instance attached to the given element.
   * @param element - The trigger element to look up.
   * @returns The Tooltip instance, or `undefined` if none is attached.
   */
  static getInstance(element: HTMLElement): Tooltip | undefined {
    return Tooltip.instances.get(element);
  }

  /**
   * Auto-initialize Tooltip instances for all elements with a `[data-tooltip]`
   * attribute. Reads position, variant, and trigger from corresponding
   * `data-tooltip-*` attributes. Skips elements that already have a Tooltip.
   */
  static initFromData(): void {
    const elements = document.querySelectorAll('[data-tooltip]');
    elements.forEach((element) => {
      if (!Tooltip.instances.has(element as HTMLElement)) {
        new Tooltip(element as HTMLElement, {
          content: element.getAttribute('data-tooltip') || '',
          position:
            (element.getAttribute('data-tooltip-position') as TooltipOptions['position']) || 'top',
          variant:
            (element.getAttribute('data-tooltip-variant') as TooltipOptions['variant']) ||
            'default',
          trigger:
            (element.getAttribute('data-tooltip-trigger') as TooltipOptions['trigger']) || 'hover',
        });
      }
    });
  }

  /**
   * Destroy every tracked Tooltip instance and clear the registry.
   */
  static destroyAll(): void {
    Tooltip.instances.forEach((tooltip) => tooltip.destroy());
    Tooltip.instances.clear();
  }
}

/**
 * Pre-configured tooltip factories for common e-commerce UI patterns.
 * Each static method creates and returns a Tooltip instance with
 * domain-appropriate defaults (HTML content, positioning, variants).
 */
export class EcommerceTooltips {
  /**
   * Create a product info tooltip displaying name, price, and optional description.
   *
   * @param element - The trigger element (e.g., a product thumbnail).
   * @param productData - Product information to display.
   * @param productData.name - Product name.
   * @param productData.price - Formatted price string.
   * @param productData.description - Optional product description.
   * @param productData.image - Optional image URL (reserved for future use).
   * @returns A configured Tooltip instance.
   */
  static productInfo(
    element: HTMLElement,
    productData: {
      name: string;
      price: string;
      description?: string;
      image?: string;
    },
  ): Tooltip {
    const content = `
      <div class="aiab-tooltip--product-info">
        <div class="product-name">${productData.name}</div>
        <div class="product-price">${productData.price}</div>
        ${productData.description ? `<div class="product-description">${productData.description}</div>` : ''}
      </div>
    `;

    return new Tooltip(element, {
      html: content,
      allowHTML: true,
      position: 'right',
      size: 'lg',
      className: 'aiab-tooltip--product-info',
      interactive: true,
    });
  }

  /**
   * Create a shipping information tooltip with method, cost, and delivery time.
   *
   * @param element - The trigger element (e.g., a shipping icon).
   * @param shippingData - Shipping details to display.
   * @param shippingData.method - Shipping method name (e.g., "Standard", "Express").
   * @param shippingData.cost - Formatted cost string.
   * @param shippingData.time - Estimated delivery time string.
   * @returns A configured Tooltip instance with `'info'` variant.
   */
  static shippingInfo(
    element: HTMLElement,
    shippingData: {
      method: string;
      cost: string;
      time: string;
    },
  ): Tooltip {
    const content = `
      <div class="aiab-tooltip--with-icon">
        <i data-lucide="truck" class="aiab-tooltip__icon"></i>
        <div class="aiab-tooltip__content">
          <div class="aiab-tooltip__title">${shippingData.method}</div>
          <div>Cost: ${shippingData.cost}</div>
          <div>Delivery: ${shippingData.time}</div>
        </div>
      </div>
    `;

    return new Tooltip(element, {
      html: content,
      allowHTML: true,
      position: 'top',
      variant: 'info',
      className: 'aiab-tooltip--with-icon',
    });
  }

  /**
   * Create a stock status tooltip with color-coded variant based on quantity.
   * - `stock === 0`: danger (red), "Out of stock"
   * - `stock <= 5`: warning (yellow), "Only N left in stock"
   * - `stock > 5`: success (green), "N items in stock"
   *
   * @param element - The trigger element (e.g., a stock indicator).
   * @param stock - Current stock quantity.
   * @returns A configured Tooltip instance.
   */
  static stockStatus(element: HTMLElement, stock: number): Tooltip {
    let variant: 'success' | 'warning' | 'danger' = 'success';
    let message = `${stock} items in stock`;

    if (stock === 0) {
      variant = 'danger';
      message = 'Out of stock';
    } else if (stock <= 5) {
      variant = 'warning';
      message = `Only ${stock} left in stock`;
    }

    return new Tooltip(element, {
      content: message,
      variant,
      position: 'top',
    });
  }
}

// Auto-initialize tooltips on DOM ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Tooltip.initFromData());
  } else {
    Tooltip.initFromData();
  }
}

// Export for global access
declare global {
  interface Window {
    AmpTooltip: typeof Tooltip;
    AmpEcommerceTooltips: typeof EcommerceTooltips;
  }
}

if (typeof window !== 'undefined') {
  window.AmpTooltip = Tooltip;
  window.AmpEcommerceTooltips = EcommerceTooltips;
}
