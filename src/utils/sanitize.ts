/**
 * HTML Sanitization Utility
 * Prevents XSS attacks by sanitizing HTML content before rendering.
 *
 * Wraps DOMPurify with a curated allow-list of tags and attributes
 * suitable for the Amphibious component library. All functions that
 * accept HTML content should route through {@link sanitizeHTML} or
 * {@link setInnerHTML} rather than assigning `innerHTML` directly.
 *
 * @module sanitize
 */

import DOMPurify, { type Config } from 'dompurify';

/**
 * Default DOMPurify configuration with a curated allow-list of safe HTML tags
 * and attributes. Explicitly forbids `<script>` and `<style>` tags and
 * disables arbitrary `data-*` attributes (only explicitly listed ones are allowed).
 */
const purifyConfig: Config = {
  // Allow common HTML tags
  ALLOWED_TAGS: [
    'div',
    'span',
    'p',
    'a',
    'button',
    'img',
    'svg',
    'path',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'nav',
    'section',
    'header',
    'footer',
    'form',
    'input',
    'label',
    'select',
    'option',
    'textarea',
    'i',
    'em',
    'strong',
    'b',
    'u',
    'br',
    'hr',
    'table',
    'tbody',
    'thead',
    'tr',
    'td',
    'th',
    'article',
    'aside',
    'main',
    'figure',
    'figcaption',
    'blockquote',
    'pre',
    'code',
    'time',
    'mark',
  ],

  // Allow common attributes
  ALLOWED_ATTR: [
    'class',
    'id',
    'href',
    'src',
    'alt',
    'title',
    'role',
    'aria-label',
    'aria-hidden',
    'aria-expanded',
    'aria-controls',
    'data-lucide',
    'data-theme',
    'data-bs-toggle',
    'data-bs-target',
    'type',
    'name',
    'value',
    'placeholder',
    'required',
    'disabled',
    'for',
    'action',
    'method',
    'target',
    'rel',
    'width',
    'height',
    'viewBox',
    'fill',
    'stroke',
    'd',
    'colspan',
    'rowspan',
    'datetime',
  ],

  // Only allow explicitly listed data-* attributes above, not all data-* attrs
  ALLOW_DATA_ATTR: false,

  // Keep classes and IDs (needed for styling)
  KEEP_CONTENT: true,

  // Allow external links with rel="noopener noreferrer"
  ADD_ATTR: ['target', 'rel'],

  // Don't allow script/style tags — DOMPurify strips all on* event handlers by default
  FORBID_TAGS: ['script', 'style'],
};

/**
 * Sanitize an HTML string to prevent XSS attacks.
 *
 * @param dirty - Potentially unsafe HTML string.
 * @param config - Optional custom DOMPurify configuration merged with defaults.
 * @returns Sanitized HTML string safe for `innerHTML` assignment.
 *
 * @example
 * ```ts
 * const safe = sanitizeHTML('<p onclick="alert(1)">Hello</p>');
 * // => '<p>Hello</p>'
 * ```
 */
export function sanitizeHTML(dirty: string, config?: Partial<Config>): string {
  const finalConfig = config ? { ...purifyConfig, ...config } : purifyConfig;
  return DOMPurify.sanitize(dirty, finalConfig) as unknown as string;
}

/**
 * Sanitize an HTML string and assign it as the element's `innerHTML`.
 * This is the recommended way to set dynamic HTML content on DOM elements.
 *
 * @param element - DOM element to set content on.
 * @param html - HTML string to sanitize and set.
 * @param config - Optional custom DOMPurify configuration.
 *
 * @example
 * ```ts
 * setInnerHTML(document.getElementById('content')!, '<strong>Safe</strong>');
 * ```
 */
export function setInnerHTML(
  element: Element | HTMLElement,
  html: string,
  config?: Partial<Config>,
): void {
  element.innerHTML = sanitizeHTML(html, config);
}

/**
 * Create a DOM DocumentFragment from sanitized HTML.
 * Useful for building DOM trees from template strings without
 * the risk of XSS injection.
 *
 * @param html - HTML string to sanitize and convert to DOM.
 * @param config - Optional custom DOMPurify configuration.
 * @returns DocumentFragment containing the sanitized content, ready for `appendChild`.
 *
 * @example
 * ```ts
 * const fragment = createSafeElement('<div class="aiab-card">Card</div>');
 * document.body.appendChild(fragment);
 * ```
 */
export function createSafeElement(html: string, config?: Partial<Config>): DocumentFragment {
  const template = document.createElement('template');
  template.innerHTML = sanitizeHTML(html, config);
  return template.content;
}

/**
 * Escape HTML entities in text content.
 * Use this when displaying user input as text (not HTML) to prevent
 * accidental tag interpretation. Leverages the browser's built-in
 * `textContent` -> `innerHTML` encoding.
 *
 * @param text - Raw text string to escape.
 * @returns Escaped string safe for insertion into HTML context.
 *
 * @example
 * ```ts
 * escapeHTML('<script>alert("xss")</script>');
 * // => '&lt;script&gt;alert("xss")&lt;/script&gt;'
 * ```
 */
export function escapeHTML(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Check if a URL uses a safe protocol (http, https, mailto, or tel).
 * Rejects dangerous protocols like `javascript:` and `data:`.
 *
 * @param url - URL string to validate. Relative URLs are resolved against `window.location.href`.
 * @returns `true` if the URL protocol is in the safe list; `false` otherwise.
 *
 * @example
 * ```ts
 * isSafeURL('https://example.com');       // true
 * isSafeURL('javascript:alert(1)');       // false
 * isSafeURL('mailto:user@example.com');   // true
 * ```
 */
export function isSafeURL(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.href);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitize user input for safe use in HTML attribute values.
 * Strips angle brackets, quotes, and iteratively removes `javascript:` patterns
 * (including obfuscated nested variants like `"javasjavascript:cript:"`).
 *
 * @param input - User-provided string to sanitize.
 * @returns Cleaned string safe for use in HTML attribute values.
 *
 * @example
 * ```ts
 * sanitizeAttribute('onclick="alert(1)"');  // => 'onclickalert(1)'
 * sanitizeAttribute('javascript:void(0)');  // => 'void(0)'
 * ```
 */
export function sanitizeAttribute(input: string): string {
  let result = input.replace(/[<>"']/g, '').trim();
  // Loop until stable to prevent bypass via nested patterns like "javasjavascript:cript:"
  let prev = '';
  while (prev !== result) {
    prev = result;
    result = result.replace(/javascript\s*:/gi, '');
  }
  return result;
}

/**
 * The configured DOMPurify instance for advanced usage.
 * Use this when the convenience functions above are insufficient and you
 * need direct access to DOMPurify methods like `addHook` or `removeHook`.
 */
export const purify = DOMPurify;
