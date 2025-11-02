/**
 * Icon System for Amphibious 2.0
 * Lucide Icons integration with TypeScript
 */

import { createIcons, icons } from 'lucide';

export interface IconOptions {
  size?: number;
  color?: string;
  strokeWidth?: number;
  class?: string;
  'aria-label'?: string;
}

export class Icon {
  private static initialized = false;
  private static cache = new Map<string, string>();

  /**
   * Initialize the icon system
   * This should be called once when the app starts
   */
  static init(): void {
    if (this.initialized) return;

    // Initialize Lucide with all icons
    createIcons({ icons });
    this.initialized = true;
  }

  /**
   * Create an icon element
   * @param name - Icon name (kebab-case, e.g., 'shopping-cart')
   * @param options - Icon configuration options
   * @returns HTMLElement or null if icon not found
   */
  static create(name: string, options: IconOptions = {}): HTMLElement | null {
    this.init();

    const {
      size = 24,
      color = 'currentColor',
      strokeWidth = 2,
      class: className = '',
      'aria-label': ariaLabel
    } = options;

    // Create icon element using Lucide's data attribute approach
    const iconElement = document.createElement('i');
    iconElement.setAttribute('data-lucide', name);

    // Add classes
    const classes = ['icon', className].filter(Boolean).join(' ');
    iconElement.className = classes;

    // Set attributes
    if (size !== 24) {
      iconElement.setAttribute('width', size.toString());
      iconElement.setAttribute('height', size.toString());
    }

    if (color !== 'currentColor') {
      iconElement.style.color = color;
    }

    if (strokeWidth !== 2) {
      iconElement.setAttribute('stroke-width', strokeWidth.toString());
    }

    // Accessibility
    if (ariaLabel) {
      iconElement.setAttribute('aria-label', ariaLabel);
      iconElement.setAttribute('role', 'img');
    } else {
      iconElement.setAttribute('aria-hidden', 'true');
    }

    // Let Lucide replace the element with SVG
    createIcons({ icons: { [name]: icons[name as keyof typeof icons] } });

    return iconElement;
  }

  /**
   * Create an icon and append it to a container
   * @param container - Container element
   * @param name - Icon name
   * @param options - Icon options
   */
  static appendTo(container: HTMLElement, name: string, options: IconOptions = {}): HTMLElement | null {
    const icon = this.create(name, options);
    if (icon) {
      container.appendChild(icon);
    }
    return icon;
  }

  /**
   * Replace existing icons in the DOM
   * Call this after dynamically adding icons
   */
  static refresh(): void {
    this.init();
    createIcons({ icons });
  }

  /**
   * Create an icon button
   * @param name - Icon name
   * @param options - Icon and button options
   */
  static createButton(
    name: string,
    options: IconOptions & {
      onClick?: () => void;
      variant?: 'default' | 'primary' | 'success' | 'danger';
      size?: 'sm' | 'default' | 'lg';
    } = {}
  ): HTMLButtonElement {
    const { onClick, variant = 'default', size: buttonSize = 'default', ...iconOptions } = options;

    const button = document.createElement('button');
    button.className = `icon-button ${variant !== 'default' ? `icon-button--${variant}` : ''} ${buttonSize !== 'default' ? `icon-button--${buttonSize}` : ''}`.trim();

    if (onClick) {
      button.addEventListener('click', onClick);
    }

    const icon = this.create(name, iconOptions);
    if (icon) {
      button.appendChild(icon);
    }

    return button;
  }

  /**
   * Create an icon with text
   * @param name - Icon name
   * @param text - Text content
   * @param options - Configuration options
   */
  static createWithText(
    name: string,
    text: string,
    options: IconOptions & {
      layout?: 'horizontal' | 'vertical' | 'reverse';
      tag?: keyof HTMLElementTagNameMap;
    } = {}
  ): HTMLElement {
    const { layout = 'horizontal', tag = 'span', ...iconOptions } = options;

    const container = document.createElement(tag);
    container.className = `icon-text ${layout === 'vertical' ? 'icon-text--vertical' : ''} ${layout === 'reverse' ? 'icon-text--reverse' : ''}`.trim();

    const icon = this.create(name, iconOptions);
    const textNode = document.createElement('span');
    textNode.textContent = text;

    if (icon) {
      if (layout === 'reverse') {
        container.appendChild(textNode);
        container.appendChild(icon);
      } else {
        container.appendChild(icon);
        container.appendChild(textNode);
      }
    }

    return container;
  }

  /**
   * Create an icon with badge
   * @param name - Icon name
   * @param count - Badge count (optional)
   * @param options - Icon options
   */
  static createWithBadge(
    name: string,
    count?: number,
    options: IconOptions & {
      badgeSize?: 'sm' | 'default' | 'lg';
    } = {}
  ): HTMLElement {
    const { badgeSize = 'default', ...iconOptions } = options;

    const container = document.createElement('div');
    container.className = 'icon-badge';

    const icon = this.create(name, iconOptions);
    if (icon) {
      container.appendChild(icon);
    }

    const badge = document.createElement('span');
    badge.className = `icon-badge__count ${badgeSize !== 'default' ? `icon-badge__count--${badgeSize}` : ''}`.trim();

    if (count !== undefined && count > 0) {
      badge.textContent = count > 99 ? '99+' : count.toString();
    }

    container.appendChild(badge);
    return container;
  }
}

// E-commerce specific icon utilities
export class EcommerceIcons {
  /**
   * Create shopping cart icon with item count
   */
  static cart(count: number = 0, options: IconOptions = {}): HTMLElement {
    return Icon.createWithBadge('shopping-cart', count, {
      'aria-label': `Shopping cart with ${count} items`,
      ...options
    });
  }

  /**
   * Create wishlist heart icon
   */
  static wishlist(filled: boolean = false, options: IconOptions = {}): HTMLElement | null {
    return Icon.create(filled ? 'heart' : 'heart', {
      class: filled ? 'icon--filled icon--danger' : '',
      'aria-label': filled ? 'Remove from wishlist' : 'Add to wishlist',
      ...options
    });
  }

  /**
   * Create star rating
   */
  static rating(rating: number, maxRating: number = 5, options: IconOptions = {}): HTMLElement {
    const container = document.createElement('div');
    container.className = 'rating';
    container.setAttribute('aria-label', `Rating: ${rating} out of ${maxRating} stars`);

    for (let i = 1; i <= maxRating; i++) {
      const star = Icon.create('star', {
        class: i <= rating ? 'icon--filled icon--warning' : '',
        ...options
      });
      if (star) {
        container.appendChild(star);
      }
    }

    return container;
  }

  /**
   * Create search icon
   */
  static search(options: IconOptions = {}): HTMLElement | null {
    return Icon.create('search', {
      'aria-label': 'Search',
      ...options
    });
  }

  /**
   * Create user account icon
   */
  static account(options: IconOptions = {}): HTMLElement | null {
    return Icon.create('user', {
      'aria-label': 'Account',
      ...options
    });
  }

  /**
   * Create filter icon
   */
  static filter(options: IconOptions = {}): HTMLElement | null {
    return Icon.create('filter', {
      'aria-label': 'Filter',
      ...options
    });
  }
}

// Export for global use
declare global {
  interface Window {
    AmpIcons: typeof Icon;
    AmpEcommerceIcons: typeof EcommerceIcons;
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.AmpIcons = Icon;
  window.AmpEcommerceIcons = EcommerceIcons;
}