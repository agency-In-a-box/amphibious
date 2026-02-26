/**
 * Toast Component Tests
 * Tests for toast lifecycle, types, content escaping,
 * close/dismiss behavior, progress bar, action buttons, and cleanup
 */

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { ToastComponent } from '../src/js/toast.js';

describe('Toast Component', () => {
  let toast: InstanceType<typeof ToastComponent>;

  beforeEach(() => {
    document.body.innerHTML = '';
    toast = new ToastComponent();
  });

  afterEach(() => {
    toast.destroy();
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
    it('should create a toast container in document.body', () => {
      const container = document.querySelector('.aiab-toast-container');
      expect(container).toBeTruthy();
      expect(container?.parentNode).toBe(document.body);
    });

    it('should set role=region on the container', () => {
      const container = document.querySelector('.aiab-toast-container');
      expect(container?.getAttribute('role')).toBe('region');
    });

    it('should set aria-live=polite on the container', () => {
      const container = document.querySelector('.aiab-toast-container');
      expect(container?.getAttribute('aria-live')).toBe('polite');
    });

    it('should set aria-label=Notifications on the container', () => {
      const container = document.querySelector('.aiab-toast-container');
      expect(container?.getAttribute('aria-label')).toBe('Notifications');
    });

    it('should default to top-right position', () => {
      const container = document.querySelector('.aiab-toast-container');
      expect(container?.classList.contains('aiab-toast-container--top-right')).toBe(true);
    });
  });

  describe('show()', () => {
    it('should create a toast element with role=alert', () => {
      toast.show({ message: 'Hello' });
      const toastEl = document.querySelector('[role="alert"]');
      expect(toastEl).toBeTruthy();
    });

    it('should return a string ID', () => {
      const id = toast.show({ message: 'Hello' });
      expect(typeof id).toBe('string');
      expect(id.startsWith('toast-')).toBe(true);
    });

    it('should add the toast element to the container', () => {
      toast.show({ message: 'Hello' });
      const container = document.querySelector('.aiab-toast-container');
      expect(container?.children.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Toast Types', () => {
    it('should add toast--success class for success type', () => {
      const id = toast.success('Success!');
      const toastEl = document.getElementById(id);
      expect(toastEl?.classList.contains('toast--success')).toBe(true);
    });

    it('should add toast--error class for error type', () => {
      const id = toast.error('Error!');
      const toastEl = document.getElementById(id);
      expect(toastEl?.classList.contains('toast--error')).toBe(true);
    });

    it('should add toast--warning class for warning type', () => {
      const id = toast.warning('Warning!');
      const toastEl = document.getElementById(id);
      expect(toastEl?.classList.contains('toast--warning')).toBe(true);
    });

    it('should add toast--info class for info type', () => {
      const id = toast.info('Info!');
      const toastEl = document.getElementById(id);
      expect(toastEl?.classList.contains('toast--info')).toBe(true);
    });

    it('should include an icon element for typed toasts', () => {
      const id = toast.success('With icon');
      const toastEl = document.getElementById(id);
      const icon = toastEl?.querySelector('.toast__icon');
      expect(icon).toBeTruthy();
      expect(icon?.querySelector('svg')).toBeTruthy();
    });
  });

  describe('Title and Message', () => {
    it('should render title text', () => {
      const id = toast.show({ title: 'My Title', message: 'Body text' });
      const toastEl = document.getElementById(id);
      const title = toastEl?.querySelector('.toast__title');
      expect(title?.textContent).toBe('My Title');
    });

    it('should render message text', () => {
      const id = toast.show({ message: 'Body text' });
      const toastEl = document.getElementById(id);
      const msg = toastEl?.querySelector('.toast__message');
      expect(msg?.textContent).toBe('Body text');
    });

    it('should escape HTML in title to prevent XSS', () => {
      const id = toast.show({ title: '<script>alert("xss")</script>', message: 'safe' });
      const toastEl = document.getElementById(id);
      const title = toastEl?.querySelector('.toast__title');
      expect(title?.textContent).toBe('<script>alert("xss")</script>');
      expect(title?.innerHTML).not.toContain('<script>');
    });

    it('should escape HTML in message to prevent XSS', () => {
      const id = toast.show({ message: '<img onerror=alert(1)>' });
      const toastEl = document.getElementById(id);
      const msg = toastEl?.querySelector('.toast__message');
      expect(msg?.innerHTML).not.toContain('<img');
    });
  });

  describe('Close Button', () => {
    it('should have a close button when closable=true (default)', () => {
      const id = toast.show({ message: 'Closable' });
      const toastEl = document.getElementById(id);
      const closeBtn = toastEl?.querySelector('.aiab-toast__close');
      expect(closeBtn).toBeTruthy();
    });

    it('should not have a close button when closable=false', () => {
      const id = toast.show({ message: 'Not closable', closable: false });
      const toastEl = document.getElementById(id);
      const closeBtn = toastEl?.querySelector('.aiab-toast__close');
      expect(closeBtn).toBeNull();
    });

    it('should hide toast when close button is clicked', () => {
      const id = toast.show({ message: 'Click close', duration: 0 });
      const toastEl = document.getElementById(id);
      const closeBtn = toastEl?.querySelector('.aiab-toast__close') as HTMLElement;
      closeBtn.click();

      // After clicking, the toast should have the exiting class
      expect(toastEl?.classList.contains('aiab-toast--exiting')).toBe(true);
    });
  });

  describe('Auto-dismiss', () => {
    it('should store a timeout reference when duration > 0', () => {
      const id = toast.show({ message: 'Auto dismiss', duration: 3000 });
      const toastData = toast.toasts.get(id);
      expect(toastData?.timeout).toBeTruthy();
    });

    it('should not set timeout when duration is 0', () => {
      const id = toast.show({ message: 'No dismiss', duration: 0 });
      const toastData = toast.toasts.get(id);
      expect(toastData?.timeout).toBeNull();
    });
  });

  describe('Progress Bar', () => {
    it('should show progress bar when progress=true and duration>0', () => {
      const id = toast.show({ message: 'With progress', progress: true, duration: 5000 });
      const toastEl = document.getElementById(id);
      const progressBar = toastEl?.querySelector('.aiab-toast__progress');
      expect(progressBar).toBeTruthy();
    });

    it('should not show progress bar when progress=false', () => {
      const id = toast.show({ message: 'No progress', progress: false, duration: 5000 });
      const toastEl = document.getElementById(id);
      const progressBar = toastEl?.querySelector('.aiab-toast__progress');
      expect(progressBar).toBeNull();
    });

    it('should set animation duration on progress bar', () => {
      const id = toast.show({ message: 'Progress', progress: true, duration: 3000 });
      const toastEl = document.getElementById(id);
      const progressBar = toastEl?.querySelector('.aiab-toast__progress') as HTMLElement;
      expect(progressBar?.style.animationDuration).toBe('3000ms');
    });
  });

  describe('Action Buttons', () => {
    it('should create action buttons from config', () => {
      const handler = mock(() => {});
      const id = toast.show({
        message: 'With actions',
        duration: 0,
        actions: [{ name: 'undo', label: 'Undo', handler }],
      });
      const toastEl = document.getElementById(id);
      const actionBtns = toastEl?.querySelectorAll('.aiab-toast__action');
      expect(actionBtns?.length).toBe(1);
      expect(actionBtns?.[0].textContent).toBe('Undo');
    });

    it('should call action handler when button is clicked', () => {
      const handler = mock(() => {});
      const id = toast.show({
        message: 'Click action',
        duration: 0,
        actions: [{ name: 'undo', label: 'Undo', handler }],
      });
      const toastEl = document.getElementById(id);
      const actionBtn = toastEl?.querySelector('.aiab-toast__action') as HTMLElement;
      actionBtn.click();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should add primary class to primary action buttons', () => {
      const id = toast.show({
        message: 'Primary action',
        duration: 0,
        actions: [{ name: 'confirm', label: 'Confirm', primary: true, handler: () => {} }],
      });
      const toastEl = document.getElementById(id);
      const actionBtn = toastEl?.querySelector('.aiab-toast__action');
      expect(actionBtn?.classList.contains('aiab-toast__action--primary')).toBe(true);
    });
  });

  describe('hide()', () => {
    it('should add exiting class to toast element', () => {
      const id = toast.show({ message: 'Hide me', duration: 0 });
      const toastEl = document.getElementById(id);
      toast.hide(id);
      expect(toastEl?.classList.contains('aiab-toast--exiting')).toBe(true);
    });

    it('should do nothing for an invalid ID', () => {
      // Should not throw
      expect(() => toast.hide('nonexistent-id')).not.toThrow();
    });
  });

  describe('hideAll()', () => {
    it('should add exiting class to all active toasts', () => {
      const id1 = toast.show({ message: 'Toast 1', duration: 0 });
      const id2 = toast.show({ message: 'Toast 2', duration: 0 });
      const el1 = document.getElementById(id1);
      const el2 = document.getElementById(id2);

      toast.hideAll();

      expect(el1?.classList.contains('aiab-toast--exiting')).toBe(true);
      expect(el2?.classList.contains('aiab-toast--exiting')).toBe(true);
    });
  });

  describe('destroy()', () => {
    it('should remove the container from the DOM', () => {
      toast.destroy();
      const container = document.querySelector('.aiab-toast-container');
      expect(container).toBeNull();
    });

    it('should clear the toasts map', () => {
      toast.show({ message: 'Test', duration: 0 });
      toast.destroy();
      expect(toast.toasts.size).toBe(0);
    });

    it('should set container reference to null', () => {
      toast.destroy();
      expect(toast.container).toBeNull();
    });
  });

  describe('Position', () => {
    it('should create container with specified position class', () => {
      toast.destroy();
      document.body.innerHTML = '';
      toast = new ToastComponent();
      toast.show({ message: 'Bottom left', position: 'bottom-left' });
      const container = document.querySelector('.aiab-toast-container--bottom-left');
      expect(container).toBeTruthy();
    });

    it('should recreate container when position changes', () => {
      toast.show({ message: 'Top right', position: 'top-right' });
      toast.show({ message: 'Bottom left', position: 'bottom-left' });
      const container = document.querySelector('.aiab-toast-container--bottom-left');
      expect(container).toBeTruthy();
    });
  });
});
