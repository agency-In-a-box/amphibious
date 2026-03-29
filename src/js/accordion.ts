/**
 * Accordion Component - Amphibious 2.0
 * Handles expand/collapse functionality with accessibility
 * Part of Amphibious 2.0 Component Library
 */

/**
 * Configuration options for the Accordion component.
 *
 * @property allowMultiple - Allow multiple panels to be open simultaneously. Defaults to `false`.
 * @property defaultOpen - Index of the item to open by default, or `'all'` to open every item. Defaults to `null`.
 * @property animated - Enable max-height transition animations. Defaults to `true`.
 * @property onOpen - Callback fired after an accordion item opens.
 * @property onClose - Callback fired after an accordion item closes.
 */
export interface AccordionOptions {
  allowMultiple?: boolean;
  defaultOpen?: number | 'all' | null;
  animated?: boolean;
  onOpen?: ((item: HTMLElement, content: HTMLElement) => void) | null;
  onClose?: ((item: HTMLElement, content: HTMLElement) => void) | null;
}

/**
 * Accessible accordion with expand/collapse panels, keyboard navigation,
 * and ARIA attribute management.
 *
 * Supports single or multiple open panels, animated transitions via
 * `max-height`, and automatic ARIA setup for headers and content regions.
 *
 * @example
 * ```ts
 * const accordion = new Accordion(document.querySelector('.aiab-accordion')!, {
 *   allowMultiple: true,
 *   onOpen: (item, content) => console.log('Opened', item),
 * });
 *
 * accordion.openAll();
 * accordion.destroy();
 * ```
 */
export class Accordion {
  private accordion: HTMLElement;
  private options: Required<AccordionOptions>;
  private items: HTMLElement[];
  private _abortController: AbortController;

  /**
   * @param element - The accordion container element.
   * @param options - Configuration options merged with sensible defaults.
   */
  constructor(element: HTMLElement, options: AccordionOptions = {}) {
    this.accordion = element;
    this.options = {
      allowMultiple: options.allowMultiple || element.dataset.allowMultiple === 'true' || false,
      defaultOpen:
        options.defaultOpen ??
        (element.dataset.defaultOpen as AccordionOptions['defaultOpen']) ??
        null,
      animated: options.animated !== false,
      onOpen: options.onOpen || null,
      onClose: options.onClose || null,
    };

    this.items = Array.from(this.accordion.querySelectorAll('.aiab-accordion-item'));
    this._abortController = new AbortController();
    this.init();
  }

  private init(): void {
    // Set up ARIA attributes
    this.accordion.setAttribute('role', 'presentation');

    this.items.forEach((item: HTMLElement, index: number) => {
      const header = item.querySelector('.aiab-accordion-header') as HTMLElement;
      const content = item.querySelector('.aiab-accordion-content') as HTMLElement;
      const itemId = `aiab-accordion-item-${Date.now()}-${index}`;

      // Set IDs and ARIA attributes
      header.setAttribute('id', `${itemId}-header`);
      content.setAttribute('id', `${itemId}-content`);
      header.setAttribute('aria-controls', `${itemId}-content`);
      content.setAttribute('aria-labelledby', `${itemId}-header`);

      // Set initial state
      const isOpen: boolean =
        item.classList.contains('aiab-active') ||
        this.options.defaultOpen === index ||
        this.options.defaultOpen === 'all';

      this.setItemState(item, header, content, isOpen);

      // Add event listeners (use AbortController for cleanup)
      header.addEventListener('click', (e: Event) => this.toggle(item, e), {
        signal: this._abortController.signal,
      });
      header.addEventListener(
        'keydown',
        (e: Event) => this.handleKeydown(e as KeyboardEvent, item, index),
        { signal: this._abortController.signal },
      );
    });

    // Set up keyboard navigation
    this.setupKeyboardNavigation();
  }

  private toggle(item: HTMLElement, event: Event): void {
    event.preventDefault();

    const header = item.querySelector('.aiab-accordion-header') as HTMLElement;
    const content = item.querySelector('.aiab-accordion-content') as HTMLElement;
    const isOpen: boolean = header.getAttribute('aria-expanded') === 'true';

    if (!isOpen) {
      // Opening
      if (!this.options.allowMultiple) {
        // Close other items
        this.items.forEach((otherItem: HTMLElement) => {
          if (otherItem !== item) {
            const otherHeader = otherItem.querySelector('.aiab-accordion-header') as HTMLElement;
            const otherContent = otherItem.querySelector('.aiab-accordion-content') as HTMLElement;
            this.setItemState(otherItem, otherHeader, otherContent, false);
          }
        });
      }

      this.setItemState(item, header, content, true);

      // Callback
      if (this.options.onOpen) {
        this.options.onOpen(item, content);
      }
    } else {
      // Closing
      this.setItemState(item, header, content, false);

      // Callback
      if (this.options.onClose) {
        this.options.onClose(item, content);
      }
    }
  }

  private setItemState(
    item: HTMLElement,
    header: HTMLElement,
    content: HTMLElement,
    isOpen: boolean,
  ): void {
    if (isOpen) {
      item.classList.add('aiab-active');
      header.setAttribute('aria-expanded', 'true');
      content.setAttribute('aria-hidden', 'false');

      // Calculate and set max-height for animation
      if (this.options.animated) {
        const scrollHeight: number = content.scrollHeight;
        content.style.maxHeight = `${scrollHeight}px`;
      }
    } else {
      item.classList.remove('aiab-active');
      header.setAttribute('aria-expanded', 'false');
      content.setAttribute('aria-hidden', 'true');

      if (this.options.animated) {
        content.style.maxHeight = '';
      }
    }
  }

  private handleKeydown(event: KeyboardEvent, item: HTMLElement, index: number): void {
    const key: string = event.key;
    let preventDefault = false;

    switch (key) {
      case 'Enter':
      case ' ':
        this.toggle(item, event);
        preventDefault = true;
        break;

      case 'ArrowDown':
        this.focusNextItem(index);
        preventDefault = true;
        break;

      case 'ArrowUp':
        this.focusPreviousItem(index);
        preventDefault = true;
        break;

      case 'Home':
        this.focusFirstItem();
        preventDefault = true;
        break;

      case 'End':
        this.focusLastItem();
        preventDefault = true;
        break;
    }

    if (preventDefault) {
      event.preventDefault();
    }
  }

  private setupKeyboardNavigation(): void {
    // Make headers focusable
    this.items.forEach((item: HTMLElement) => {
      const header = item.querySelector('.aiab-accordion-header') as HTMLElement;
      if (!header.hasAttribute('tabindex')) {
        header.setAttribute('tabindex', '0');
      }
    });
  }

  private focusNextItem(currentIndex: number): void {
    const nextIndex: number = (currentIndex + 1) % this.items.length;
    const nextHeader = this.items[nextIndex].querySelector('.aiab-accordion-header') as HTMLElement;
    nextHeader.focus();
  }

  private focusPreviousItem(currentIndex: number): void {
    const prevIndex: number = (currentIndex - 1 + this.items.length) % this.items.length;
    const prevHeader = this.items[prevIndex].querySelector('.aiab-accordion-header') as HTMLElement;
    prevHeader.focus();
  }

  private focusFirstItem(): void {
    const firstHeader = this.items[0].querySelector('.aiab-accordion-header') as HTMLElement;
    firstHeader.focus();
  }

  private focusLastItem(): void {
    const lastHeader = this.items[this.items.length - 1].querySelector(
      '.aiab-accordion-header',
    ) as HTMLElement;
    lastHeader.focus();
  }

  // Public methods

  /**
   * Open all accordion items simultaneously.
   */
  public openAll(): void {
    this.items.forEach((item: HTMLElement) => {
      const header = item.querySelector('.aiab-accordion-header') as HTMLElement;
      const content = item.querySelector('.aiab-accordion-content') as HTMLElement;
      this.setItemState(item, header, content, true);
    });
  }

  /**
   * Close all accordion items.
   */
  public closeAll(): void {
    this.items.forEach((item: HTMLElement) => {
      const header = item.querySelector('.aiab-accordion-header') as HTMLElement;
      const content = item.querySelector('.aiab-accordion-content') as HTMLElement;
      this.setItemState(item, header, content, false);
    });
  }

  /**
   * Open a specific accordion item by its zero-based index.
   * @param index - The item index to open.
   */
  public openItem(index: number): void {
    if (index >= 0 && index < this.items.length) {
      const item: HTMLElement = this.items[index];
      const header = item.querySelector('.aiab-accordion-header') as HTMLElement;
      const content = item.querySelector('.aiab-accordion-content') as HTMLElement;
      this.setItemState(item, header, content, true);
    }
  }

  /**
   * Close a specific accordion item by its zero-based index.
   * @param index - The item index to close.
   */
  public closeItem(index: number): void {
    if (index >= 0 && index < this.items.length) {
      const item: HTMLElement = this.items[index];
      const header = item.querySelector('.aiab-accordion-header') as HTMLElement;
      const content = item.querySelector('.aiab-accordion-content') as HTMLElement;
      this.setItemState(item, header, content, false);
    }
  }

  /**
   * Tear down the accordion by aborting all event listeners
   * registered via the internal AbortController.
   */
  public destroy(): void {
    this._abortController.abort();
  }
}

// Auto-initialize accordions on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    const accordions: NodeListOf<HTMLElement> = document.querySelectorAll(
      '.aiab-accordion[data-auto-init="true"]',
    );
    accordions.forEach((accordion: HTMLElement) => {
      new Accordion(accordion);
    });
  } catch (error) {
    console.error('[Amphibious] Accordion auto-init failed:', error);
  }
});

// Add to global scope
// biome-ignore lint/suspicious/noExplicitAny: global window assignment for non-module consumers
(window as any).Accordion = Accordion;

export default Accordion;
