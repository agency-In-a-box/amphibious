/**
 * HTML Sanitization Utility
 * Prevents XSS attacks by sanitizing HTML content before rendering
 */

import DOMPurify, { type Config } from 'dompurify';

// Configure DOMPurify with safe defaults
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
 * Sanitize HTML string to prevent XSS attacks
 * @param dirty - Potentially unsafe HTML string
 * @param config - Optional custom DOMPurify configuration
 * @returns Sanitized HTML string safe for innerHTML
 */
export function sanitizeHTML(dirty: string, config?: Partial<Config>): string {
  const finalConfig = config ? { ...purifyConfig, ...config } : purifyConfig;
  return DOMPurify.sanitize(dirty, finalConfig) as unknown as string;
}

/**
 * Sanitize and set innerHTML on an element
 * @param element - DOM element to set content on
 * @param html - HTML string to sanitize and set
 * @param config - Optional custom DOMPurify configuration
 */
export function setInnerHTML(
  element: Element | HTMLElement,
  html: string,
  config?: Partial<Config>,
): void {
  element.innerHTML = sanitizeHTML(html, config);
}

/**
 * Create a DOM element from sanitized HTML
 * @param html - HTML string to sanitize and convert to DOM
 * @param config - Optional custom DOMPurify configuration
 * @returns DocumentFragment with sanitized content
 */
export function createSafeElement(html: string, config?: Partial<Config>): DocumentFragment {
  const template = document.createElement('template');
  template.innerHTML = sanitizeHTML(html, config);
  return template.content;
}

/**
 * Escape HTML entities in text content
 * Use this for displaying user input as text (not HTML)
 * @param text - Text to escape
 * @returns Escaped text safe for HTML context
 */
export function escapeHTML(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Check if a URL is safe (no javascript: protocol)
 * @param url - URL to validate
 * @returns true if URL is safe
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
 * Sanitize user input for use in HTML attributes
 * @param input - User input to sanitize
 * @returns Sanitized string safe for attribute values
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

// Export configured DOMPurify instance for advanced usage
export const purify = DOMPurify;
