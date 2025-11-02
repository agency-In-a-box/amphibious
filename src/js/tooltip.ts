/**
 * Tooltip Component for Amphibious 2.0
 * Accessible, customizable tooltips with smart positioning
 */

export interface TooltipOptions {
  content?: string;
  html?: string;
  position?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end';
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

export class Tooltip {
  private element: HTMLElement;
  private tooltipElement: HTMLElement | null = null;
  private options: Required<TooltipOptions>;
  private isVisible = false;
  private showTimeout: ReturnType<typeof setTimeout> | null = null;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private static instances = new Map<HTMLElement, Tooltip>();

  constructor(element: HTMLElement | string, options: TooltipOptions = {}) {
    this.element = typeof element === 'string' ? document.querySelector(element)! : element;

    if (!this.element) {
      throw new Error('Tooltip: Target element not found');
    }

    // Default options
    this.options = {
      content: this.element.getAttribute('title') || this.element.getAttribute('data-tooltip') || '',
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

    if (trigger === 'hover') {
      this.element.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
      this.element.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
      this.element.addEventListener('focus', this.handleFocus.bind(this));
      this.element.addEventListener('blur', this.handleBlur.bind(this));
    } else if (trigger === 'click') {
      this.element.addEventListener('click', this.handleClick.bind(this));
      document.addEventListener('click', this.handleDocumentClick.bind(this));
    } else if (trigger === 'focus') {
      this.element.addEventListener('focus', this.handleFocus.bind(this));
      this.element.addEventListener('blur', this.handleBlur.bind(this));
    }

    // Keyboard support
    this.element.addEventListener('keydown', this.handleKeydown.bind(this));
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
    this.show();
  }

  private handleMouseLeave(): void {
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
    if (this.isVisible && !this.element.contains(event.target as Node) &&
        (!this.tooltipElement || !this.tooltipElement.contains(event.target as Node))) {
      this.hide();
    }
  }

  private handleKeydown(event: KeyboardEvent): void {
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
      tooltip.innerHTML = content;
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
    const classes = ['tooltip'];

    if (this.options.position) {
      classes.push(`tooltip--${this.options.position}`);
    }

    if (this.options.variant !== 'default') {
      classes.push(`tooltip--${this.options.variant}`);
    }

    if (this.options.size !== 'default') {
      classes.push(`tooltip--${this.options.size}`);
    }

    if (this.options.interactive) {
      classes.push('tooltip--interactive');
    }

    if (this.options.className) {
      classes.push(this.options.className);
    }

    return classes.join(' ');
  }

  private updatePosition(): void {
    if (!this.tooltipElement) return;

    const triggerRect = this.element.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;

    let position = this.options.position;

    // Auto-adjust position if tooltip would go outside viewport
    position = this.adjustPositionForViewport(position, triggerRect, tooltipRect, viewportWidth, viewportHeight) || 'top';

    // Calculate coordinates
    const coords = this.calculatePosition(position, triggerRect, tooltipRect);

    // Apply position
    this.tooltipElement.style.left = `${coords.x + scrollX}px`;
    this.tooltipElement.style.top = `${coords.y + scrollY}px`;

    // Update classes if position changed
    if (position !== this.options.position) {
      this.tooltipElement.className = this.tooltipElement.className.replace(
        /tooltip--\w+(-\w+)?/g,
        `tooltip--${position}`
      );
    }
  }

  private adjustPositionForViewport(
    position: TooltipOptions['position'],
    triggerRect: DOMRect,
    tooltipRect: DOMRect,
    viewportWidth: number,
    viewportHeight: number
  ): TooltipOptions['position'] {
    const coords = this.calculatePosition(position, triggerRect, tooltipRect);

    // Check if tooltip goes outside viewport and adjust
    if (coords.x < 0) {
      if (position?.includes('left')) return position.replace('left', 'right') as TooltipOptions['position'];
      if (position?.includes('top') || position?.includes('bottom')) {
        const basePart = position?.split('-')[0];
        return `${basePart}-start` as TooltipOptions['position'];
      }
    }

    if (coords.x + tooltipRect.width > viewportWidth) {
      if (position?.includes('right')) return position.replace('right', 'left') as TooltipOptions['position'];
      if (position?.includes('top') || position?.includes('bottom')) {
        const basePart = position?.split('-')[0];
        return `${basePart}-end` as TooltipOptions['position'];
      }
    }

    if (coords.y < 0) {
      if (position?.includes('top')) return position.replace('top', 'bottom') as TooltipOptions['position'];
    }

    if (coords.y + tooltipRect.height > viewportHeight) {
      if (position?.includes('bottom')) return position.replace('bottom', 'top') as TooltipOptions['position'];
    }

    return position;
  }

  private calculatePosition(position: TooltipOptions['position'], triggerRect: DOMRect, tooltipRect: DOMRect): { x: number; y: number } {
    const offset = this.options.offset;
    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
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
        x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
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
        y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
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
        y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
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
   * Show the tooltip
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
      this.tooltipElement.classList.remove('tooltip--hidden');
      this.tooltipElement.classList.add('tooltip--visible');
      this.tooltipElement.setAttribute('aria-hidden', 'false');

      this.isVisible = true;
      this.options.onShow();

      // Set up window resize listener
      window.addEventListener('resize', this.handleWindowResize.bind(this));
      window.addEventListener('scroll', this.handleWindowScroll.bind(this));
    };

    if (this.options.delay > 0) {
      this.showTimeout = setTimeout(showTooltip, this.options.delay);
    } else {
      showTooltip();
    }
  }

  /**
   * Hide the tooltip
   */
  hide(): void {
    if (!this.isVisible) return;

    this.clearShowTimeout();

    const hideTooltip = () => {
      if (this.tooltipElement) {
        this.tooltipElement.classList.remove('tooltip--visible');
        this.tooltipElement.classList.add('tooltip--hidden');
        this.tooltipElement.setAttribute('aria-hidden', 'true');

        // Remove from DOM after animation
        setTimeout(() => {
          if (this.tooltipElement && !this.isVisible) {
            document.body.removeChild(this.tooltipElement);
            this.tooltipElement = null;
          }
        }, 200);
      }

      this.isVisible = false;
      this.options.onHide();

      // Remove window listeners
      window.removeEventListener('resize', this.handleWindowResize.bind(this));
      window.removeEventListener('scroll', this.handleWindowScroll.bind(this));
    };

    if (this.options.hideDelay > 0) {
      this.hideTimeout = setTimeout(hideTooltip, this.options.hideDelay);
    } else {
      hideTooltip();
    }
  }

  /**
   * Toggle tooltip visibility
   */
  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Update tooltip content
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
        this.tooltipElement.innerHTML = newContent;
      } else {
        this.tooltipElement.textContent = newContent;
      }
    }
  }

  /**
   * Update tooltip options
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
   * Destroy the tooltip
   */
  destroy(): void {
    this.hide();

    // Remove event listeners
    this.element.removeEventListener('mouseenter', this.handleMouseEnter.bind(this));
    this.element.removeEventListener('mouseleave', this.handleMouseLeave.bind(this));
    this.element.removeEventListener('focus', this.handleFocus.bind(this));
    this.element.removeEventListener('blur', this.handleBlur.bind(this));
    this.element.removeEventListener('click', this.handleClick.bind(this));
    this.element.removeEventListener('keydown', this.handleKeydown.bind(this));
    document.removeEventListener('click', this.handleDocumentClick.bind(this));

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
   * Get tooltip instance from element
   */
  static getInstance(element: HTMLElement): Tooltip | undefined {
    return Tooltip.instances.get(element);
  }

  /**
   * Initialize tooltips from data attributes
   */
  static initFromData(): void {
    const elements = document.querySelectorAll('[data-tooltip]');
    elements.forEach((element) => {
      if (!Tooltip.instances.has(element as HTMLElement)) {
        new Tooltip(element as HTMLElement, {
          content: element.getAttribute('data-tooltip') || '',
          position: (element.getAttribute('data-tooltip-position') as any) || 'top',
          variant: (element.getAttribute('data-tooltip-variant') as any) || 'default',
          trigger: (element.getAttribute('data-tooltip-trigger') as any) || 'hover',
        });
      }
    });
  }

  /**
   * Destroy all tooltip instances
   */
  static destroyAll(): void {
    Tooltip.instances.forEach((tooltip) => tooltip.destroy());
    Tooltip.instances.clear();
  }
}

// E-commerce specific tooltip utilities
export class EcommerceTooltips {
  /**
   * Create product info tooltip
   */
  static productInfo(element: HTMLElement, productData: {
    name: string;
    price: string;
    description?: string;
    image?: string;
  }): Tooltip {
    const content = `
      <div class="tooltip--product-info">
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
      className: 'tooltip--product-info',
      interactive: true,
    });
  }

  /**
   * Create shipping info tooltip
   */
  static shippingInfo(element: HTMLElement, shippingData: {
    method: string;
    cost: string;
    time: string;
  }): Tooltip {
    const content = `
      <div class="tooltip--with-icon">
        <i data-lucide="truck" class="tooltip__icon"></i>
        <div class="tooltip__content">
          <div class="tooltip__title">${shippingData.method}</div>
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
      className: 'tooltip--with-icon',
    });
  }

  /**
   * Create stock status tooltip
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