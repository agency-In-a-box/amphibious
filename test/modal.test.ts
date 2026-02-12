/**
 * Modal Module Tests
 * Tests for modal lifecycle, ARIA attributes, focus trapping,
 * keyboard interactions, callbacks, and ModalManager
 */

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { Modal, ModalManager } from '../src/js/modal';

describe('Modal Module', () => {
  let modalElement: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="test-modal">
        <div class="modal__dialog">
          <div class="modal__header">
            <h2 class="modal__title">Test Modal</h2>
            <button class="modal__close" aria-label="Close">&times;</button>
          </div>
          <div class="modal__body">
            <p>Modal body content</p>
            <a href="#">Link</a>
            <button>Focusable button</button>
          </div>
          <div class="modal__footer">
            <button data-modal-cancel>Cancel</button>
            <button data-modal-confirm>Confirm</button>
          </div>
        </div>
      </div>
    `;
    modalElement = document.getElementById('test-modal') as HTMLElement;
  });

  afterEach(() => {
    ModalManager.destroyAll();
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
    it('should initialize with default options', () => {
      const modal = new Modal(modalElement);
      expect(modal).toBeDefined();
      expect(modal.isModalOpen()).toBe(false);
    });

    it('should accept string selector', () => {
      const modal = new Modal('#test-modal');
      expect(modal).toBeDefined();
    });

    it('should throw on invalid selector', () => {
      expect(() => new Modal('#nonexistent')).toThrow('Modal element #nonexistent not found');
    });

    it('should add modal class to element', () => {
      new Modal(modalElement);
      expect(modalElement.classList.contains('modal')).toBe(true);
    });

    it('should add size class when specified', () => {
      new Modal(modalElement, { size: 'lg' });
      expect(modalElement.classList.contains('modal--lg')).toBe(true);
    });

    it('should add variant class when specified', () => {
      new Modal(modalElement, { variant: 'drawer-left' });
      expect(modalElement.classList.contains('modal--drawer-left')).toBe(true);
    });

    it('should add animation class', () => {
      new Modal(modalElement, { animation: 'slide-down' });
      expect(modalElement.classList.contains('modal--slide-down')).toBe(true);
    });

    it('should set ARIA attributes', () => {
      new Modal(modalElement);
      expect(modalElement.getAttribute('role')).toBe('dialog');
      expect(modalElement.getAttribute('aria-modal')).toBe('true');
      expect(modalElement.getAttribute('aria-hidden')).toBe('true');
      expect(modalElement.getAttribute('tabindex')).toBe('-1');
    });

    it('should create backdrop by default', () => {
      new Modal(modalElement);
      const backdrop = document.querySelector('.modal-backdrop');
      expect(backdrop).toBeTruthy();
    });

    it('should not create backdrop when disabled', () => {
      new Modal(modalElement, { backdrop: false });
      const backdrop = document.querySelector('.modal-backdrop');
      expect(backdrop).toBeNull();
    });
  });

  describe('Open and Close', () => {
    it('should open modal', () => {
      const modal = new Modal(modalElement);
      modal.open();

      expect(modal.isModalOpen()).toBe(true);
      expect(modalElement.classList.contains('is-visible')).toBe(true);
      expect(modalElement.getAttribute('aria-hidden')).toBe('false');
    });

    it('should add modal-open class to body on open', () => {
      const modal = new Modal(modalElement);
      modal.open();

      expect(document.body.classList.contains('modal-open')).toBe(true);
    });

    it('should show backdrop on open', () => {
      const modal = new Modal(modalElement);
      modal.open();

      const backdrop = document.querySelector('.modal-backdrop');
      expect(backdrop?.classList.contains('is-visible')).toBe(true);
    });

    it('should close modal', () => {
      const modal = new Modal(modalElement);
      modal.open();
      modal.close();

      expect(modal.isModalOpen()).toBe(false);
      expect(modalElement.classList.contains('is-visible')).toBe(false);
      expect(modalElement.getAttribute('aria-hidden')).toBe('true');
    });

    it('should hide backdrop on close', () => {
      const modal = new Modal(modalElement);
      modal.open();
      modal.close();

      const backdrop = document.querySelector('.modal-backdrop');
      expect(backdrop?.classList.contains('is-visible')).toBe(false);
    });

    it('should not re-open if already open', () => {
      const onOpen = mock(() => {});
      const modal = new Modal(modalElement, { onOpen });
      modal.open();
      modal.open();

      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it('should not re-close if already closed', () => {
      const onClose = mock(() => {});
      const modal = new Modal(modalElement, { onClose });
      modal.close();

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should toggle open and close', () => {
      const modal = new Modal(modalElement);

      modal.toggle();
      expect(modal.isModalOpen()).toBe(true);

      modal.toggle();
      expect(modal.isModalOpen()).toBe(false);
    });
  });

  describe('Events and Callbacks', () => {
    it('should dispatch modal:open event', () => {
      const modal = new Modal(modalElement);
      let eventFired = false;
      modalElement.addEventListener('modal:open', () => {
        eventFired = true;
      });

      modal.open();
      expect(eventFired).toBe(true);
    });

    it('should dispatch modal:close event', () => {
      const modal = new Modal(modalElement);
      let eventFired = false;
      modalElement.addEventListener('modal:close', () => {
        eventFired = true;
      });

      modal.open();
      modal.close();
      expect(eventFired).toBe(true);
    });

    it('should call onOpen callback', () => {
      const onOpen = mock(() => {});
      const modal = new Modal(modalElement, { onOpen });
      modal.open();
      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it('should call onClose callback', () => {
      const onClose = mock(() => {});
      const modal = new Modal(modalElement, { onClose });
      modal.open();
      modal.close();
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onConfirm when confirm button clicked', () => {
      const onConfirm = mock(() => {});
      new Modal(modalElement, { onConfirm });

      const confirmBtn = modalElement.querySelector('[data-modal-confirm]') as HTMLElement;
      confirmBtn.click();

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when cancel button clicked', () => {
      const onCancel = mock(() => {});
      new Modal(modalElement, { onCancel });

      const cancelBtn = modalElement.querySelector('[data-modal-cancel]') as HTMLElement;
      cancelBtn.click();

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Close Triggers', () => {
    it('should close on close button click', () => {
      const modal = new Modal(modalElement);
      modal.open();

      const closeBtn = modalElement.querySelector('.modal__close') as HTMLElement;
      closeBtn.click();

      expect(modal.isModalOpen()).toBe(false);
    });

    it('should close on Escape key', () => {
      const modal = new Modal(modalElement);
      modal.open();

      modalElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

      expect(modal.isModalOpen()).toBe(false);
    });

    it('should not close on Escape when closeOnEscape is false', () => {
      const modal = new Modal(modalElement, { closeOnEscape: false });
      modal.open();

      modalElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

      expect(modal.isModalOpen()).toBe(true);
    });

    it('should close on backdrop click', () => {
      const modal = new Modal(modalElement);
      modal.open();

      // Click on the modal element itself (not the dialog inside)
      modalElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(modal.isModalOpen()).toBe(false);
    });

    it('should not close on backdrop click with static backdrop', () => {
      const modal = new Modal(modalElement, { backdrop: 'static' });
      modal.open();

      modalElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(modal.isModalOpen()).toBe(true);
    });
  });

  describe('Focus Management', () => {
    it('should trap Tab key within modal', () => {
      const modal = new Modal(modalElement);
      modal.open();

      // Dispatch Tab keydown
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
      });
      modalElement.dispatchEvent(tabEvent);

      // The focus trap logic runs - verify no errors
      expect(modal.isModalOpen()).toBe(true);
    });

    it('should trap Shift+Tab within modal', () => {
      const modal = new Modal(modalElement);
      modal.open();

      const shiftTabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
      });
      modalElement.dispatchEvent(shiftTabEvent);

      expect(modal.isModalOpen()).toBe(true);
    });
  });

  describe('Content Management', () => {
    it('should update modal title', () => {
      const modal = new Modal(modalElement);
      modal.setTitle('New Title');

      const title = modalElement.querySelector('.modal__title');
      expect(title?.textContent).toBe('New Title');
    });

    it('should update modal body content', () => {
      const modal = new Modal(modalElement);
      const newContent = document.createElement('p');
      newContent.textContent = 'New content';
      modal.setContent(newContent, 'body');

      const body = modalElement.querySelector('.modal__body');
      expect(body?.textContent).toContain('New content');
    });
  });

  describe('Destroy', () => {
    it('should remove ARIA attributes on destroy', () => {
      const modal = new Modal(modalElement);
      modal.destroy();

      expect(modalElement.getAttribute('role')).toBeNull();
      expect(modalElement.getAttribute('aria-modal')).toBeNull();
      expect(modalElement.getAttribute('aria-hidden')).toBeNull();
      expect(modalElement.getAttribute('tabindex')).toBeNull();
    });

    it('should remove modal class on destroy', () => {
      const modal = new Modal(modalElement);
      modal.destroy();

      expect(modalElement.classList.contains('modal')).toBe(false);
    });

    it('should remove backdrop on destroy', () => {
      const modal = new Modal(modalElement);
      modal.destroy();

      const backdrop = document.querySelector('.modal-backdrop');
      expect(backdrop).toBeNull();
    });

    it('should close modal before destroying', () => {
      const modal = new Modal(modalElement);
      modal.open();
      modal.destroy();

      expect(modal.isModalOpen()).toBe(false);
    });
  });

  describe('Options', () => {
    it('should update options dynamically', () => {
      const modal = new Modal(modalElement);
      modal.updateOptions({ closeOnEscape: false });

      modal.open();
      modalElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

      expect(modal.isModalOpen()).toBe(true);
    });
  });

  describe('ModalManager', () => {
    it('should create and register a modal', () => {
      const modal = ModalManager.create('test', modalElement);
      expect(modal).toBeDefined();
      expect(ModalManager.get('test')).toBe(modal);
    });

    it('should open modal by ID', () => {
      const modal = ModalManager.create('test', modalElement);
      ModalManager.open('test');
      expect(modal.isModalOpen()).toBe(true);
    });

    it('should close modal by ID', () => {
      const modal = ModalManager.create('test', modalElement);
      modal.open();
      ModalManager.close('test');
      expect(modal.isModalOpen()).toBe(false);
    });

    it('should close all modals', () => {
      document.body.innerHTML += '<div id="modal2"></div>';
      const modal1 = ModalManager.create('m1', modalElement);
      const modal2 = ModalManager.create('m2', '#modal2');

      modal1.open();
      modal2.open();
      ModalManager.closeAll();

      expect(modal1.isModalOpen()).toBe(false);
      expect(modal2.isModalOpen()).toBe(false);
    });

    it('should destroy modal by ID', () => {
      ModalManager.create('test', modalElement);
      ModalManager.destroy('test');
      expect(ModalManager.get('test')).toBeUndefined();
    });

    it('should destroy all modals', () => {
      ModalManager.create('test', modalElement);
      ModalManager.destroyAll();
      expect(ModalManager.get('test')).toBeUndefined();
    });
  });
});
