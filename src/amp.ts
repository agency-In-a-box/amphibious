/**
 * `amp` — the global convenience API used throughout the docs and examples
 * (`amp.createModal(...)`, `amp.createTooltip(...)`, `amp.alert(...)`).
 *
 * The docs taught this API but nothing defined it, so every call threw
 * `ReferenceError: amp is not defined`. These are thin wrappers over the
 * class exports with no behaviour of their own.
 *
 * `createNavigation` replaces any instance already on that element (the site
 * nav is auto-initialised), so options apply and handlers never double up.
 */

import { AmphibiousCarousel, type AmphibiousCarouselOptions } from './js/carousel';
import { EcommerceIcons, Icon, type IconOptions } from './js/icons';
import { createIcon, initializeIcons } from './js/icons-lightweight';
import { type Modal, ModalManager, type ModalOptions } from './js/modal';
import { Navigation, type NavigationOptions } from './js/navigation';
import { EcommerceTooltips, Tooltip, type TooltipOptions } from './js/tooltip';

export interface ButtonOptions {
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'light'
    | 'dark'
    | 'ghost'
    | 'link'
    | 'outline-primary'
    | 'outline-secondary'
    | 'outline-success'
    | 'outline-danger';
  size?: 'xs' | 'sm' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: MouseEvent) => void;
}

let anonymousModalCount = 0;

export const amp = {
  /**
   * Get-or-create a modal. Both documented forms are supported:
   *   amp.createModal('cart', '#cartModal', options)
   *   amp.createModal('#cartModal', options)
   */
  createModal(
    idOrElement: string | HTMLElement,
    elementOrOptions?: string | HTMLElement | ModalOptions,
    options: ModalOptions = {},
  ): Modal {
    if (typeof elementOrOptions === 'string' || elementOrOptions instanceof HTMLElement) {
      const id = String(idOrElement);
      return ModalManager.get(id) ?? ModalManager.create(id, elementOrOptions, options);
    }
    const element = idOrElement;
    const id =
      typeof element === 'string' ? element : element.id || `amp-modal-${++anonymousModalCount}`;
    return ModalManager.get(id) ?? ModalManager.create(id, element, elementOrOptions ?? {});
  },

  alert: (message: string, type?: 'success' | 'error' | 'warning' | 'info') =>
    ModalManager.alert(message, type),

  confirm: (message: string, confirmText?: string, cancelText?: string) =>
    ModalManager.confirm(message, confirmText, cancelText),

  createTooltip: (element: HTMLElement | string, options?: TooltipOptions) =>
    new Tooltip(element, options),

  createProductTooltip: (
    element: HTMLElement,
    data: Parameters<typeof EcommerceTooltips.productInfo>[1],
  ) => EcommerceTooltips.productInfo(element, data),

  createShippingTooltip: (
    element: HTMLElement,
    data: Parameters<typeof EcommerceTooltips.shippingInfo>[1],
  ) => EcommerceTooltips.shippingInfo(element, data),

  /** Shopping-cart icon with an item-count badge: `amp.createCart(3)`. */
  createCart: (count = 0, options?: IconOptions) => EcommerceIcons.cart(count, options),

  /** Button element: `amp.createButton('Save', { variant: 'primary', size: 'lg', onClick })`. */
  createButton: (text: string, options: ButtonOptions = {}) => {
    const { variant = 'primary', size, onClick, type = 'button' } = options;
    const button = document.createElement('button');
    button.type = type;
    button.className = ['aiab-btn', `aiab-btn-${variant}`, size ? `aiab-btn-${size}` : '']
      .filter(Boolean)
      .join(' ');
    button.textContent = text;
    if (onClick) button.addEventListener('click', onClick);
    return button;
  },

  createRating: (rating: number, maxRating = 5, options?: IconOptions) =>
    EcommerceIcons.rating(rating, maxRating, options),

  createIcon: (name: string, options?: { size?: number; class?: string }) =>
    createIcon(name, options),

  /** Render `<i data-lucide>` placeholders added after load (whole page or within `root`). */
  refreshIcons: (root?: ParentNode) => initializeIcons(root),

  createIconButton: (name: string, options?: Parameters<typeof Icon.createButton>[1]) =>
    Icon.createButton(name, options),

  /**
   * Enhance a navigation: mobile menu, dropdowns, keyboard support, current
   * page. `amp.createNavigation('#docs-nav', { breakpoint: 960 })`
   */
  createNavigation: (element?: string | HTMLElement, options?: NavigationOptions) =>
    Navigation.create(element, options),

  Carousel: AmphibiousCarousel,

  createCarousel: (selector: string | HTMLElement, options?: AmphibiousCarouselOptions) =>
    new AmphibiousCarousel(selector, options),
};

export type Amp = typeof amp;

declare global {
  interface Window {
    amp: Amp;
  }
}

if (typeof window !== 'undefined') {
  window.amp = amp;
}
