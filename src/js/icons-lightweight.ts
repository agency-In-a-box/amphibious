/**
 * Lightweight Icon System - Amphibious 2.0
 * Replaces heavy Lucide runtime with inline SVG approach
 * Reduces bundle size by ~150KB+
 */

// The SVG map is generated at build time from lucide-static (scripts/generate-icons.js).
// Only icons referenced by the library, docs and demos are included.
import { iconSVGs } from './icon-set.generated';

/**
 * Lightweight icon initialization
 * Replaces data-lucide attributes with inline SVGs
 */
export function initializeIcons(): void {
  const iconElements = document.querySelectorAll('[data-lucide]');

  iconElements.forEach((element) => {
    const iconName = element.getAttribute('data-lucide');
    if (iconName && iconSVGs[iconName]) {
      // Replace element with SVG while preserving classes
      const classes = element.className;
      const wrapper = document.createElement('span');
      wrapper.innerHTML = iconSVGs[iconName];
      const svg = wrapper.firstElementChild as SVGElement;

      if (svg) {
        // Copy classes and attributes
        if (classes) svg.setAttribute('class', classes);

        // Copy size classes
        if (classes.includes('icon--xs')) {
          svg.setAttribute('width', '12');
          svg.setAttribute('height', '12');
        } else if (classes.includes('icon--sm')) {
          svg.setAttribute('width', '16');
          svg.setAttribute('height', '16');
        } else if (classes.includes('icon--md')) {
          svg.setAttribute('width', '20');
          svg.setAttribute('height', '20');
        } else if (classes.includes('icon--lg')) {
          svg.setAttribute('width', '24');
          svg.setAttribute('height', '24');
        } else if (classes.includes('icon--xl')) {
          svg.setAttribute('width', '32');
          svg.setAttribute('height', '32');
        }

        // Replace the element
        element.parentNode?.replaceChild(svg, element);
      }
    } else if (iconName) {
      // Names used in markup are validated at build time, so this only fires for
      // names created at runtime. Leave the element untouched rather than
      // rendering a placeholder glyph.
      console.warn(`[Amphibious] Unknown icon "${iconName}"`);
    }
  });
}

/**
 * Create a single icon element
 */
export function createIcon(
  name: string,
  options: { size?: number; class?: string } = {},
): HTMLElement {
  const svg = iconSVGs[name];
  if (!svg) {
    console.warn(`[Amphibious] Unknown icon "${name}"`);
    const empty = document.createElement('span');
    empty.setAttribute('aria-hidden', 'true');
    return empty;
  }

  const wrapper = document.createElement('span');
  wrapper.innerHTML = svg;
  const svgElement = wrapper.firstElementChild as SVGElement;

  if (svgElement) {
    if (options.size) {
      svgElement.setAttribute('width', String(options.size));
      svgElement.setAttribute('height', String(options.size));
    }
    if (options.class) {
      svgElement.setAttribute('class', options.class);
    }
  }

  return wrapper;
}

/**
 * Get list of available icons
 */
export function getAvailableIcons(): string[] {
  return Object.keys(iconSVGs);
}

/**
 * Check if an icon exists
 */
export function hasIcon(name: string): boolean {
  return name in iconSVGs;
}

// Auto-initialize on DOM ready
if (typeof document !== 'undefined') {
  const safeInitIcons = () => {
    try {
      // Only run if Lucide CDN hasn't already replaced the icons
      // biome-ignore lint/suspicious/noExplicitAny: checking CDN global
      if (typeof (window as any).lucide === 'undefined') {
        initializeIcons();
      }
    } catch (error) {
      console.error('[Amphibious] Icon auto-init failed:', error);
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInitIcons);
  } else {
    // DOM already loaded
    setTimeout(safeInitIcons, 0);
  }

  // Expose fallback for CDN script onerror handlers:
  // <script src="lucide.js" onerror="window.__amphibiousIconFallback?.()"></script>
  // biome-ignore lint/suspicious/noExplicitAny: global fallback hook
  (window as any).__amphibiousIconFallback = () => {
    console.warn('[Amphibious] Lucide CDN unavailable, using lightweight icon fallback');
    initializeIcons();
  };
}

// Export for manual initialization
export default {
  init: initializeIcons,
  create: createIcon,
  available: getAvailableIcons,
  has: hasIcon,
};
