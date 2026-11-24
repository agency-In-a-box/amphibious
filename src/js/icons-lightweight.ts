/**
 * Icon System - Amphibious 2.0
 *
 * Hydrates `data-lucide` placeholder elements into inline SVG.
 *
 * The SVG map is generated at build time from lucide-static
 * (scripts/generate-icons.js); only icons referenced by the library, docs and
 * demos are included, and an unknown name in markup fails the build.
 *
 * Modifier classes: the documented markup uses `icon--xs`, `icon--filled`,
 * `icon--warning`, etc. Hydration maps each `icon--*` token to the
 * `aiab-icon--*` class that the stylesheet actually defines.
 */

import { iconSVGs } from './icon-set.generated';

const registry: Record<string, string> = { ...iconSVGs };

/** Pixel sizes mirror the --icon-size-* tokens in atoms/icons.css. */
const SIZE_PX: Record<string, number> = { xs: 12, sm: 20, md: 24, lg: 32, xl: 48 };
const DEFAULT_SIZE = 24;
const warned = new Set<string>();

function warnOnce(name: string): void {
  if (warned.has(name)) return;
  warned.add(name);
  console.warn(`[Amphibious] Unknown icon "${name}".`);
}

/** `icon--xs icon--filled` also gets `aiab-icon--xs aiab-icon--filled`; the size token sets width/height. */
function normalizeClasses(classList: string): { classes: string; size: number } {
  const tokens = classList.split(/\s+/).filter(Boolean);
  const out = new Set(tokens);
  let size = DEFAULT_SIZE;
  for (const token of tokens) {
    const match = /^(?:aiab-)?icon--([a-z0-9-]+)$/.exec(token);
    if (!match) continue;
    out.add(`aiab-icon--${match[1]}`);
    if (SIZE_PX[match[1]]) size = SIZE_PX[match[1]];
  }
  return { classes: [...out].join(' '), size };
}

function buildSvg(name: string, size: number, classes: string): SVGElement | null {
  const markup = registry[name];
  if (!markup) return null;
  const holder = document.createElement('span');
  holder.innerHTML = markup;
  const svg = holder.firstElementChild as SVGElement | null;
  if (!svg) return null;
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('class', `${classes} lucide lucide-${name}`.trim());
  svg.setAttribute('data-icon-rendered', name);
  return svg;
}

function hydrate(el: Element): void {
  const name = el.getAttribute('data-lucide');
  if (!name) return;
  // Already rendered and unchanged
  if (el.getAttribute('data-icon-rendered') === name) return;

  const { classes, size } = normalizeClasses(el.getAttribute('class') ?? '');
  const svg = buildSvg(name, size, classes);

  if (!svg) {
    warnOnce(name);
    // Leave the slot at the right size and render nothing; a visible glyph
    // reads as a broken page, an empty slot keeps layout stable.
    el.setAttribute('data-icon-rendered', name);
    el.setAttribute('aria-hidden', 'true');
    if (el instanceof HTMLElement) {
      el.style.display = 'inline-block';
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
    }
    return;
  }

  // Carry over what the author put on the placeholder (id, aria-*, data-*,
  // style). data-lucide stays so callers can swap icons by changing the
  // attribute and calling initializeIcons() again.
  for (const attr of Array.from(el.attributes)) {
    if (['class', 'width', 'height', 'data-icon-rendered'].includes(attr.name)) continue;
    svg.setAttribute(attr.name, attr.value);
  }
  if (svg.hasAttribute('aria-label')) svg.setAttribute('role', 'img');
  else svg.setAttribute('aria-hidden', 'true');

  el.replaceWith(svg);
}

/** Replace every `[data-lucide]` placeholder under `root` with inline SVG. */
export function initializeIcons(root: ParentNode = document): void {
  root.querySelectorAll('[data-lucide]').forEach(hydrate);
}

/** Add or override icons at runtime. Values are `<svg>` markup strings. */
export function registerIcons(icons: Record<string, string>): void {
  Object.assign(registry, icons);
}

/** Create a single icon element (wrapped in a span, for backward compatibility). */
export function createIcon(
  name: string,
  options: { size?: number; class?: string } = {},
): HTMLElement {
  const wrapper = document.createElement('span');
  const { classes, size } = normalizeClasses(options.class ?? '');
  const svg = buildSvg(name, options.size ?? size, classes);
  if (!svg) {
    warnOnce(name);
    wrapper.setAttribute('aria-hidden', 'true');
    return wrapper;
  }
  svg.setAttribute('aria-hidden', 'true');
  wrapper.appendChild(svg);
  return wrapper;
}

/**
 * SVG markup string for templates built with innerHTML. Returns '' for
 * unknown names (and warns once), so a missing icon never shows a glyph.
 */
export function iconMarkup(
  name: string,
  options: { size?: number; class?: string; label?: string } = {},
): string {
  const { classes, size } = normalizeClasses(options.class ?? '');
  const svg = buildSvg(name, options.size ?? size, classes);
  if (!svg) {
    warnOnce(name);
    return '';
  }
  if (options.label) {
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', options.label);
  } else {
    svg.setAttribute('aria-hidden', 'true');
  }
  return svg.outerHTML;
}

/** Get list of available icons */
export function getAvailableIcons(): string[] {
  return Object.keys(registry);
}

/** Check if an icon exists */
export function hasIcon(name: string): boolean {
  return name in registry;
}

// Auto-initialize on DOM ready
if (typeof document !== 'undefined') {
  const safeInitIcons = () => {
    try {
      // Defer to the Lucide CDN script if a page loads it (the icon gallery does).
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
    setTimeout(safeInitIcons, 0);
  }

  // Fallback hook for CDN script onerror handlers:
  // <script src="lucide.js" onerror="window.__amphibiousIconFallback?.()"></script>
  // biome-ignore lint/suspicious/noExplicitAny: global fallback hook
  (window as any).__amphibiousIconFallback = () => {
    console.warn('[Amphibious] Lucide CDN unavailable, using bundled icons');
    initializeIcons();
  };
}

export default {
  init: initializeIcons,
  create: createIcon,
  markup: iconMarkup,
  register: registerIcons,
  available: getAvailableIcons,
  has: hasIcon,
};
