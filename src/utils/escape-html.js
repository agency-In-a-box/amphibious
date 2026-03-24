/**
 * Lightweight HTML entity escaping.
 * Shared by all plain-JS components to prevent XSS when inserting
 * user-supplied text into HTML templates.
 *
 * Uses the browser's built-in textContent → innerHTML encoding.
 *
 * @param {string} str - Raw text to escape.
 * @returns {string} Escaped string safe for HTML insertion.
 */
export function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
