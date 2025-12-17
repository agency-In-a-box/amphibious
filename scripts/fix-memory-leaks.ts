#!/usr/bin/env bun
/**
 * Fix memory leaks in JavaScript/TypeScript modules
 * Implements proper event listener cleanup and WeakMap patterns
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';

interface MemoryLeakFix {
  file: string;
  description: string;
  fixed: boolean;
}

async function createBackup(filePath: string): Promise<void> {
  const backupDir = join(
    process.cwd(),
    'backups',
    'memory-leaks',
    new Date().toISOString().split('T')[0],
  );
  const backupPath = join(backupDir, filePath.replace(process.cwd() + '/', ''));

  await mkdir(dirname(backupPath), { recursive: true });
  const content = await readFile(filePath, 'utf-8');
  await writeFile(backupPath, content);
}

async function fixModalMemoryLeaks(): Promise<MemoryLeakFix> {
  const filePath = join(process.cwd(), 'src/js/modal.ts');
  await createBackup(filePath);

  let content = await readFile(filePath, 'utf-8');

  // Add event listener storage at class level
  const classStart = content.indexOf('export class Modal {');
  const firstProperty = content.indexOf('private element: HTMLElement;');

  content =
    content.slice(0, firstProperty) +
    `private element: HTMLElement;
  private eventListeners: Array<{ element: Element | Document | Window; type: string; handler: EventListener }> = [];
` +
    content.slice(firstProperty + 'private element: HTMLElement;'.length);

  // Add addEventListener helper method
  const initMethod = content.indexOf('  private init(): void {');
  content =
    content.slice(0, initMethod) +
    `  /**
   * Add event listener with cleanup tracking
   */
  private addEventListener(element: Element | Document | Window, type: string, handler: EventListener): void {
    element.addEventListener(type, handler);
    this.eventListeners.push({ element, type, handler });
  }

  /**
   * Remove all tracked event listeners
   */
  private removeAllEventListeners(): void {
    this.eventListeners.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    this.eventListeners = [];
  }

` +
    content.slice(initMethod);

  // Replace setupEventHandlers method with proper cleanup
  const setupEventHandlersStart = content.indexOf('  private setupEventHandlers(): void {');
  const setupEventHandlersEnd =
    content.indexOf('  }', content.indexOf('    }', setupEventHandlersStart)) + 3;

  const newSetupEventHandlers = `  private setupEventHandlers(): void {
    // Close button
    const closeButtons = this.element.querySelectorAll('[data-modal-close], .modal__close');
    closeButtons.forEach(button => {
      const handler = () => this.close();
      this.addEventListener(button, 'click', handler);
    });

    // Confirm button
    const confirmButtons = this.element.querySelectorAll('[data-modal-confirm]');
    confirmButtons.forEach(button => {
      const handler = () => {
        if (this.options.onConfirm) {
          this.options.onConfirm();
        }
        this.close();
      };
      this.addEventListener(button, 'click', handler);
    });

    // Cancel button
    const cancelButtons = this.element.querySelectorAll('[data-modal-cancel]');
    cancelButtons.forEach(button => {
      const handler = () => {
        if (this.options.onCancel) {
          this.options.onCancel();
        }
        this.close();
      };
      this.addEventListener(button, 'click', handler);
    });

    // Keyboard events
    if (this.options.keyboard) {
      const keyHandler = (e: Event) => this.handleKeydown(e as KeyboardEvent);
      this.addEventListener(this.element, 'keydown', keyHandler);
    }

    // Prevent closing when clicking inside modal
    const dialog = this.element.querySelector('.modal__dialog');
    if (dialog) {
      const stopHandler = (e: Event) => e.stopPropagation();
      this.addEventListener(dialog, 'click', stopHandler);
    }

    // Click outside to close
    if (this.options.closeOnBackdrop && this.options.backdrop !== 'static') {
      const clickHandler = (e: Event) => {
        if (e.target === this.element) {
          this.close();
        }
      };
      this.addEventListener(this.element, 'click', clickHandler);
    }
  }`;

  content =
    content.slice(0, setupEventHandlersStart) +
    newSetupEventHandlers +
    content.slice(setupEventHandlersEnd);

  // Fix createBackdrop method
  const createBackdropMethod = content.indexOf('  private createBackdrop(): void {');
  const createBackdropEnd =
    content.indexOf('  }', content.indexOf('    }', createBackdropMethod)) + 3;

  const newCreateBackdrop = `  private createBackdrop(): void {
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'modal-backdrop';
    document.body.appendChild(this.backdrop);

    if (this.options.closeOnBackdrop && this.options.backdrop !== 'static') {
      const handler = () => this.close();
      this.addEventListener(this.backdrop, 'click', handler);
    }
  }`;

  content =
    content.slice(0, createBackdropMethod) + newCreateBackdrop + content.slice(createBackdropEnd);

  // Fix destroy method - remove cloneNode hack
  const destroyMethod = content.indexOf('  public destroy(): void {');
  const destroyEnd =
    content.indexOf(
      '  }',
      content.indexOf("    this.element.removeAttribute('tabindex');", destroyMethod),
    ) + 3;

  const newDestroy = `  public destroy(): void {
    this.close();

    // Remove all event listeners
    this.removeAllEventListeners();

    // Remove backdrop
    if (this.backdrop) {
      this.backdrop.remove();
      this.backdrop = null;
    }

    // Reset element
    this.element.classList.remove('modal', \`modal--\${this.options.size}\`, \`modal--\${this.options.variant}\`);
    this.element.removeAttribute('role');
    this.element.removeAttribute('aria-modal');
    this.element.removeAttribute('aria-hidden');
    this.element.removeAttribute('tabindex');
  }`;

  content = content.slice(0, destroyMethod) + newDestroy + content.slice(destroyEnd);

  await writeFile(filePath, content);

  return {
    file: 'src/js/modal.ts',
    description: 'Fixed event listener leaks and removed cloneNode workaround',
    fixed: true,
  };
}

async function fixNavigationMemoryLeaks(): Promise<MemoryLeakFix> {
  const filePath = join(process.cwd(), 'src/js/navigation.ts');
  await createBackup(filePath);

  let content = await readFile(filePath, 'utf-8');

  // Add event listener storage
  const classStart = content.indexOf('export class Navigation {');
  const firstProperty = content.indexOf('  private navElement: HTMLElement | null;');

  content =
    content.slice(0, firstProperty) +
    `  private navElement: HTMLElement | null;
  private eventListeners: Array<{ element: Element | Document | Window; type: string; handler: EventListener }> = [];
  private resizeTimer: ReturnType<typeof setTimeout> | null = null;
  private tabKeyHandler: ((e: KeyboardEvent) => void) | null = null;
` +
    content.slice(firstProperty + '  private navElement: HTMLElement | null;'.length);

  // Add addEventListener helper
  const constructorEnd = content.indexOf('  }', content.indexOf('constructor()')) + 3;

  content =
    content.slice(0, constructorEnd) +
    `

  /**
   * Add event listener with cleanup tracking
   */
  private addEventListener(element: Element | Document | Window, type: string, handler: EventListener): void {
    element.addEventListener(type, handler);
    this.eventListeners.push({ element, type, handler });
  }

  /**
   * Clean up all event listeners
   */
  public destroy(): void {
    // Clear resize timer
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }

    // Remove tab key handler if it exists
    if (this.tabKeyHandler) {
      document.removeEventListener('keydown', this.tabKeyHandler);
    }

    // Remove all tracked event listeners
    this.eventListeners.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    this.eventListeners = [];

    // Close menu if open
    if (this.isOpen) {
      this.closeMenu();
    }
  }
` +
    content.slice(constructorEnd);

  // Fix setupMobileToggle to use tracked listeners
  content = content.replace(
    "this.toggleButton.addEventListener('click', (e) => {",
    'const toggleHandler = (e: Event) => {',
  );

  content = content.replace(
    '      e.preventDefault();\n      this.toggleMenu();\n    });',
    "      e.preventDefault();\n      this.toggleMenu();\n    };\n    this.addEventListener(this.toggleButton, 'click', toggleHandler);",
  );

  // Fix document click listener
  content = content.replace(
    "    // Close menu when clicking outside\n    document.addEventListener('click', (e) => {",
    '    // Close menu when clicking outside\n    const clickOutsideHandler = (e: Event) => {',
  );

  content = content.replace(
    '        this.closeMenu();\n      }\n    });',
    "        this.closeMenu();\n      }\n    };\n    this.addEventListener(document, 'click', clickOutsideHandler);",
  );

  // Fix escape key listener
  content = content.replace(
    "    // Close menu on Escape key\n    document.addEventListener('keydown', (e) => {",
    '    // Close menu on Escape key\n    const escapeHandler = (e: Event) => {',
  );

  content = content.replace(
    '        this.toggleButton?.focus();\n      }\n    });',
    "        this.toggleButton?.focus();\n      }\n    };\n    this.addEventListener(document, 'keydown', escapeHandler);",
  );

  // Fix handleResize
  content = content.replace(
    "  private handleResize(): void {\n    let resizeTimer: ReturnType<typeof setTimeout>;\n\n    window.addEventListener('resize', () => {",
    '  private handleResize(): void {\n    const resizeHandler = () => {',
  );

  content = content.replace(
    '      }, 250);\n    });',
    "      }, 250);\n    };\n    this.addEventListener(window, 'resize', resizeHandler);",
  );

  content = content.replace(
    '      clearTimeout(resizeTimer);\n      resizeTimer = setTimeout(',
    '      if (this.resizeTimer) clearTimeout(this.resizeTimer);\n      this.resizeTimer = setTimeout(',
  );

  // Fix trapFocus tab key handler
  content = content.replace(
    "    document.addEventListener('keydown', handleTabKey);",
    "    this.tabKeyHandler = handleTabKey;\n    document.addEventListener('keydown', this.tabKeyHandler);",
  );

  await writeFile(filePath, content);

  return {
    file: 'src/js/navigation.ts',
    description: 'Fixed event listener leaks and added proper cleanup',
    fixed: true,
  };
}

async function fixFormsMemoryLeaks(): Promise<MemoryLeakFix> {
  const filePath = join(process.cwd(), 'src/js/forms.ts');
  await createBackup(filePath);

  let content = await readFile(filePath, 'utf-8');

  // Add event listener storage
  const classStart = content.indexOf('export class Forms {');
  const firstProperty = content.indexOf('  private forms: NodeListOf<HTMLFormElement>;');

  content =
    content.slice(0, firstProperty) +
    `  private forms: NodeListOf<HTMLFormElement>;
  private eventListeners: Array<{ element: Element; type: string; handler: EventListener }> = [];
` +
    content.slice(firstProperty + '  private forms: NodeListOf<HTMLFormElement>;'.length);

  // Add addEventListener helper and destroy method
  const constructorEnd = content.indexOf('  }', content.indexOf('constructor()')) + 3;

  content =
    content.slice(0, constructorEnd) +
    `

  /**
   * Add event listener with cleanup tracking
   */
  private addEventListener(element: Element, type: string, handler: EventListener): void {
    element.addEventListener(type, handler);
    this.eventListeners.push({ element, type, handler });
  }

  /**
   * Clean up all event listeners
   */
  public destroy(): void {
    // Remove all tracked event listeners
    this.eventListeners.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    this.eventListeners = [];

    // Clean up any created elements
    document.querySelectorAll('.char-counter').forEach(el => el.remove());
    document.querySelectorAll('.password-toggle').forEach(el => el.remove());
  }
` +
    content.slice(constructorEnd);

  // Fix form submit listener
  content = content.replace(
    "    form.addEventListener('submit', (e) => {",
    '    const submitHandler = (e: Event) => {',
  );

  content = content.replace(
    '        this.focusFirstError(form);\n      }\n    });',
    "        this.focusFirstError(form);\n      }\n    };\n    this.addEventListener(form, 'submit', submitHandler);",
  );

  // Fix field blur listener
  content = content.replace(
    "    field.addEventListener('blur', () => {",
    '    const blurHandler = () => {',
  );

  content = content.replace(
    '      this.validateField(field);\n    });',
    "      this.validateField(field);\n    };\n    this.addEventListener(field, 'blur', blurHandler);",
  );

  // Fix field input listener
  content = content.replace(
    "    field.addEventListener('input', () => {",
    '    const inputHandler = () => {',
  );

  content = content.replace(
    '      this.updateCharCounter(field);\n    });',
    "      this.updateCharCounter(field);\n    };\n    this.addEventListener(field, 'input', inputHandler);",
  );

  // Fix custom validation rule listener
  content = content.replace(
    "      field.addEventListener('blur', () => {",
    '      const customBlurHandler = () => {',
  );

  content = content.replace(
    '        }\n      });',
    "        }\n      };\n      this.addEventListener(field, 'blur', customBlurHandler);",
  );

  // Fix floating label listeners
  content = content.replace(
    "      field.addEventListener('input', () => {",
    '      const floatHandler = () => {',
  );

  content = content.replace(
    '        }\n      });',
    "        }\n      };\n      this.addEventListener(field, 'input', floatHandler);",
  );

  // Fix character counter listener
  content = content.replace(
    "      input.addEventListener('input', () => {\n        this.updateCharCounter(input);\n      });",
    "      const counterHandler = () => {\n        this.updateCharCounter(input);\n      };\n      this.addEventListener(input, 'input', counterHandler);",
  );

  // Fix password toggle listener
  content = content.replace(
    "      toggle.addEventListener('click', () => {",
    '      const toggleHandler = () => {',
  );

  content = content.replace(
    '            : \'<span class="password-toggle__icon">👁‍🗨</span>\';\n      });',
    "            : '<span class=\"password-toggle__icon\">👁‍🗨</span>';\n      };\n      this.addEventListener(toggle, 'click', toggleHandler);",
  );

  await writeFile(filePath, content);

  return {
    file: 'src/js/forms.ts',
    description: 'Added event listener tracking and cleanup',
    fixed: true,
  };
}

async function main() {
  const results: MemoryLeakFix[] = [];

  try {
    // Fix modal memory leaks
    results.push(await fixModalMemoryLeaks());

    // Fix navigation memory leaks
    results.push(await fixNavigationMemoryLeaks());

    // Fix forms memory leaks
    results.push(await fixFormsMemoryLeaks());

    // Summary

    results.forEach((result) => {
      if (result.fixed) {
      } else {
      }
    });
  } catch (error) {
    console.error('❌ Error fixing memory leaks:', error);
  }
}

main().catch(console.error);
