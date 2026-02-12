/**
 * Memory Leak Prevention Utilities
 *
 * This file contains utilities and patterns to prevent memory leaks
 * in components that use event listeners.
 */

interface EventListenerRecord {
  element: HTMLElement | Window | Document;
  type: string;
  handler: EventListener;
}

/**
 * Base class for components that need proper event listener cleanup
 */
export abstract class ComponentWithCleanup {
  protected eventListeners: EventListenerRecord[] = [];

  protected addEventListenerWithCleanup(
    element: HTMLElement | Window | Document,
    type: string,
    handler: EventListener,
    options?: AddEventListenerOptions,
  ): void {
    element.addEventListener(type, handler, options);
    this.eventListeners.push({ element, type, handler });
  }

  protected removeAllEventListeners(): void {
    this.eventListeners.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    this.eventListeners = [];
  }

  public destroy(): void {
    this.removeAllEventListeners();
  }
}

/**
 * Utility function to wrap event listeners with automatic cleanup
 */
export function createCleanupableEventListener(
  element: HTMLElement | Window | Document,
  type: string,
  handler: EventListener,
  options?: AddEventListenerOptions,
): () => void {
  element.addEventListener(type, handler, options);

  return () => {
    element.removeEventListener(type, handler);
  };
}

/**
 * AbortController-based event listener management
 * Modern approach using AbortController for cleanup
 */
export class EventListenerManager {
  private controller = new AbortController();

  addEventListener(
    element: HTMLElement | Window | Document,
    type: string,
    handler: EventListener,
    options?: AddEventListenerOptions,
  ): void {
    const mergedOptions = {
      ...options,
      signal: this.controller.signal,
    };

    element.addEventListener(type, handler, mergedOptions);
  }

  destroy(): void {
    this.controller.abort();
  }
}

/**
 * Usage examples and patterns
 */

// Example 1: Using ComponentWithCleanup base class
export class ExampleComponent extends ComponentWithCleanup {
  private element: HTMLElement;

  constructor(element: HTMLElement) {
    super();
    this.element = element;
    this.init();
  }

  private init(): void {
    // ✅ CORRECT - Will be automatically cleaned up
    const button = this.element.querySelector('button');
    if (button) {
      this.addEventListenerWithCleanup(button, 'click', () => {
        console.log('Button clicked');
      });
    }

    // ✅ CORRECT - Window events with cleanup
    this.addEventListenerWithCleanup(window, 'scroll', () => {
      console.log('Window scrolled');
    });
  }

  // destroy() is inherited from ComponentWithCleanup
}

// Example 2: Using EventListenerManager (modern approach)
export class ModernComponent {
  private element: HTMLElement;
  private eventManager = new EventListenerManager();

  constructor(element: HTMLElement) {
    this.element = element;
    this.init();
  }

  private init(): void {
    // ✅ CORRECT - Uses AbortController for cleanup
    this.eventManager.addEventListener(window, 'resize', () => {
      console.log('Window resized');
    });

    const form = this.element.querySelector('form');
    if (form) {
      this.eventManager.addEventListener(form, 'submit', (e) => {
        e.preventDefault();
        console.log('Form submitted');
      });
    }
  }

  public destroy(): void {
    this.eventManager.destroy(); // Removes all listeners
  }
}

// Example 3: Manual cleanup pattern
export class ManualCleanupComponent {
  private element: HTMLElement;
  private cleanupFunctions: (() => void)[] = [];

  constructor(element: HTMLElement) {
    this.element = element;
    this.init();
  }

  private init(): void {
    // ✅ CORRECT - Manual cleanup tracking
    const scrollHandler = () => console.log('Scrolled');
    window.addEventListener('scroll', scrollHandler);
    this.cleanupFunctions.push(() => {
      window.removeEventListener('scroll', scrollHandler);
    });

    // Multiple listeners with cleanup
    const resizeHandler = () => console.log('Resized');
    const clickHandler = (e: Event) => console.log('Clicked', e.target);

    window.addEventListener('resize', resizeHandler);
    this.element.addEventListener('click', clickHandler);

    this.cleanupFunctions.push(
      () => window.removeEventListener('resize', resizeHandler),
      () => this.element.removeEventListener('click', clickHandler),
    );
  }

  public destroy(): void {
    this.cleanupFunctions.forEach((cleanup) => cleanup());
    this.cleanupFunctions = [];
  }
}

/**
 * Common Memory Leak Patterns to Avoid
 */

// ❌ WRONG - No cleanup
class _BadComponent {
  constructor(element: HTMLElement) {
    // Memory leak: these listeners are never removed
    window.addEventListener('scroll', () => {
      console.log('Scroll');
    });

    element.addEventListener('click', () => {
      console.log('Click');
    });

    // When component is destroyed, listeners remain in memory
  }
}

// ❌ WRONG - Timer without cleanup
class _BadTimerComponent {
  constructor() {
    // Memory leak: interval never cleared
    setInterval(() => {
      console.log('Timer tick');
    }, 1000);

    // Memory leak: timeout never cleared
    setTimeout(() => {
      console.log('Delayed action');
    }, 5000);
  }
}

// ✅ CORRECT - Timer with cleanup
export class GoodTimerComponent {
  private intervalId?: number;
  private timeoutId?: number;

  constructor() {
    this.intervalId = window.setInterval(() => {
      console.log('Timer tick');
    }, 1000);

    this.timeoutId = window.setTimeout(() => {
      console.log('Delayed action');
    }, 5000);
  }

  public destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }
}
