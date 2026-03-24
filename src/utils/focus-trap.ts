/**
 * Focus Trap Utility - Amphibious 2.0
 * Shared focus-cycling logic for modal and navigation components.
 *
 * @module focus-trap
 */

/** CSS selector matching interactive elements that can receive focus. */
export const FOCUSABLE_SELECTOR =
  'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])';

/**
 * Return all visible, enabled, focusable elements inside a container.
 *
 * @param container - The DOM element to search within.
 * @returns Array of focusable HTMLElements, in DOM order.
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = container.querySelectorAll(FOCUSABLE_SELECTOR);
  return Array.from(elements).filter((el) => {
    const element = el as HTMLElement;
    return !element.hasAttribute('disabled') && element.offsetParent !== null;
  }) as HTMLElement[];
}

/**
 * Cycle Tab / Shift+Tab focus between the first and last items in a list,
 * preventing focus from leaving the container.
 *
 * Call this from a `keydown` handler when `e.key === 'Tab'`.
 *
 * @param e - The keyboard event (must be a Tab press).
 * @param focusableElements - The ordered list of focusable elements to cycle through.
 */
export function trapFocus(e: KeyboardEvent, focusableElements: HTMLElement[]): void {
  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    }
  } else {
    if (document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
}
