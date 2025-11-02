/**
 * Forms Module Tests
 * Tests for form validation, character counters, and password toggles
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { Forms } from '../src/js/forms';

describe('Forms Module', () => {
  let forms: Forms;
  let container: HTMLElement;

  beforeEach(() => {
    // Setup DOM structure
    document.body.innerHTML = `
      <form class="form-validate" id="testForm">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required>
          <div class="invalid-feedback"></div>
        </div>

        <div class="form-group">
          <label for="phone">Phone</label>
          <input type="tel" id="phone" name="phone" data-validate="phone">
          <div class="invalid-feedback"></div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" required minlength="8">
          <div class="invalid-feedback"></div>
        </div>

        <div class="form-group">
          <label for="message">Message</label>
          <textarea id="message" name="message" maxlength="100" data-char-counter></textarea>
        </div>

        <div class="form-group">
          <label for="age">Age</label>
          <input type="number" id="age" name="age" min="18" max="120">
          <div class="invalid-feedback"></div>
        </div>

        <div class="form-group">
          <label for="website">Website</label>
          <input type="url" id="website" name="website" pattern="https://.*">
          <div class="invalid-feedback"></div>
        </div>

        <div class="form-floating">
          <input type="text" id="floating" placeholder="Name">
          <label for="floating">Name</label>
        </div>

        <button type="submit">Submit</button>
      </form>
    `;

    container = document.querySelector('#testForm') as HTMLElement;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
    it('should initialize without errors', () => {
      forms = new Forms();
      expect(() => forms.init()).not.toThrow();
    });

    it('should add novalidate attribute to forms', () => {
      forms = new Forms();
      forms.init();

      expect(container.getAttribute('novalidate')).toBe('true');
    });

    it('should setup character counter', () => {
      forms = new Forms();
      forms.init();

      const messageField = document.querySelector('#message') as HTMLElement;
      const counter = messageField.parentElement?.querySelector('.char-counter');

      expect(counter).toBeTruthy();
      expect(counter?.textContent).toBe('0 / 100');
    });

    it('should setup password toggle button', () => {
      forms = new Forms();
      forms.init();

      const passwordField = document.querySelector('#password') as HTMLElement;
      const toggle = passwordField.parentElement?.querySelector('.password-toggle');

      expect(toggle).toBeTruthy();
    });
  });

  describe('Field Validation', () => {
    it('should validate required fields', () => {
      forms = new Forms();
      forms.init();

      const emailField = document.querySelector('#email') as HTMLInputElement;
      const event = new Event('submit', { cancelable: true });

      container.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
      expect(emailField.classList.contains('is-invalid')).toBe(true);
    });

    it('should validate email format', () => {
      forms = new Forms();
      forms.init();

      const emailField = document.querySelector('#email') as HTMLInputElement;

      // Invalid email
      emailField.value = 'invalid-email';
      emailField.dispatchEvent(new Event('blur'));
      expect(emailField.classList.contains('is-invalid')).toBe(true);

      // Valid email
      emailField.value = 'test@example.com';
      emailField.dispatchEvent(new Event('blur'));
      expect(emailField.classList.contains('is-valid')).toBe(true);
    });

    it('should validate phone number', () => {
      forms = new Forms();
      forms.init();

      const phoneField = document.querySelector('#phone') as HTMLInputElement;

      // Invalid phone
      phoneField.value = '123';
      phoneField.dispatchEvent(new Event('blur'));
      expect(phoneField.classList.contains('is-invalid')).toBe(true);

      // Valid phone
      phoneField.value = '1234567890';
      phoneField.dispatchEvent(new Event('blur'));
      expect(phoneField.classList.contains('is-valid')).toBe(true);
    });

    it('should validate URL format', () => {
      forms = new Forms();
      forms.init();

      const urlField = document.querySelector('#website') as HTMLInputElement;

      // Invalid URL
      urlField.value = 'not-a-url';
      urlField.dispatchEvent(new Event('blur'));
      expect(urlField.classList.contains('is-invalid')).toBe(true);

      // Valid URL but wrong pattern
      urlField.value = 'http://example.com';
      urlField.dispatchEvent(new Event('blur'));
      expect(urlField.classList.contains('is-invalid')).toBe(true);

      // Valid URL with correct pattern
      urlField.value = 'https://example.com';
      urlField.dispatchEvent(new Event('blur'));
      expect(urlField.classList.contains('is-valid')).toBe(true);
    });

    it('should validate min/max length', () => {
      forms = new Forms();
      forms.init();

      const passwordField = document.querySelector('#password') as HTMLInputElement;

      // Too short
      passwordField.value = '1234567';
      passwordField.dispatchEvent(new Event('blur'));
      expect(passwordField.classList.contains('is-invalid')).toBe(true);

      // Valid length
      passwordField.value = '12345678';
      passwordField.dispatchEvent(new Event('blur'));
      expect(passwordField.classList.contains('is-valid')).toBe(true);
    });

    it('should validate number min/max', () => {
      forms = new Forms();
      forms.init();

      const ageField = document.querySelector('#age') as HTMLInputElement;

      // Too low
      ageField.value = '10';
      ageField.dispatchEvent(new Event('blur'));
      expect(ageField.classList.contains('is-invalid')).toBe(true);

      // Too high
      ageField.value = '150';
      ageField.dispatchEvent(new Event('blur'));
      expect(ageField.classList.contains('is-invalid')).toBe(true);

      // Valid
      ageField.value = '25';
      ageField.dispatchEvent(new Event('blur'));
      expect(ageField.classList.contains('is-valid')).toBe(true);
    });

    it('should clear error on input', () => {
      forms = new Forms();
      forms.init();

      const emailField = document.querySelector('#email') as HTMLInputElement;

      // Create error
      emailField.dispatchEvent(new Event('blur'));
      expect(emailField.classList.contains('is-invalid')).toBe(true);

      // Start typing
      emailField.dispatchEvent(new Event('input'));
      expect(emailField.classList.contains('is-invalid')).toBe(false);
    });
  });

  describe('Custom Validation Rules', () => {
    it('should add and use custom validation rule', () => {
      forms = new Forms();
      forms.init();

      // Add custom rule
      forms.addRule('customRule', (value) => value === 'valid');

      // Create field with custom rule
      const field = document.createElement('input');
      field.setAttribute('data-validate', 'customRule');
      field.value = 'invalid';
      container.appendChild(field);

      field.dispatchEvent(new Event('blur'));
      expect(field.classList.contains('is-invalid')).toBe(true);

      field.value = 'valid';
      field.dispatchEvent(new Event('blur'));
      expect(field.classList.contains('is-valid')).toBe(true);
    });
  });

  describe('Character Counter', () => {
    it('should update character count on input', () => {
      forms = new Forms();
      forms.init();

      const messageField = document.querySelector('#message') as HTMLInputElement;
      const counter = messageField.parentElement?.querySelector('.char-counter');

      messageField.value = 'Hello World';
      messageField.dispatchEvent(new Event('input'));

      expect(counter?.textContent).toBe('11 / 100');
    });

    it('should add warning class when near limit', () => {
      forms = new Forms();
      forms.init();

      const messageField = document.querySelector('#message') as HTMLInputElement;
      const counter = messageField.parentElement?.querySelector('.char-counter');

      // Set value to 95 characters (> 90% of 100)
      messageField.value = 'a'.repeat(95);
      messageField.dispatchEvent(new Event('input'));

      expect(counter?.classList.contains('char-counter--warning')).toBe(true);
    });
  });

  describe('Password Toggle', () => {
    it('should toggle password visibility', () => {
      forms = new Forms();
      forms.init();

      const passwordField = document.querySelector('#password') as HTMLInputElement;
      const toggle = passwordField.parentElement?.querySelector('.password-toggle') as HTMLButtonElement;

      expect(passwordField.type).toBe('password');

      toggle.click();
      expect(passwordField.type).toBe('text');

      toggle.click();
      expect(passwordField.type).toBe('password');
    });
  });

  describe('Floating Labels', () => {
    it('should add filled class when field has value', () => {
      forms = new Forms();
      forms.init();

      const floatingField = document.querySelector('#floating') as HTMLInputElement;

      floatingField.value = 'Test';
      floatingField.dispatchEvent(new Event('input'));

      expect(floatingField.classList.contains('filled')).toBe(true);

      floatingField.value = '';
      floatingField.dispatchEvent(new Event('input'));

      expect(floatingField.classList.contains('filled')).toBe(false);
    });
  });

  describe('Form Submission', () => {
    it('should prevent submission if validation fails', () => {
      forms = new Forms();
      forms.init();

      const event = new Event('submit', { cancelable: true });
      container.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
    });

    it('should allow submission if validation passes', () => {
      forms = new Forms();
      forms.init();

      // Fill required fields
      const emailField = document.querySelector('#email') as HTMLInputElement;
      const passwordField = document.querySelector('#password') as HTMLInputElement;

      emailField.value = 'test@example.com';
      passwordField.value = 'password123';

      const event = new Event('submit', { cancelable: true });
      container.dispatchEvent(event);

      expect(container.classList.contains('was-validated')).toBe(true);
    });

    it('should focus first error field', () => {
      forms = new Forms();
      forms.init();

      const emailField = document.querySelector('#email') as HTMLInputElement;
      const passwordField = document.querySelector('#password') as HTMLInputElement;

      const event = new Event('submit', { cancelable: true });
      container.dispatchEvent(event);

      // First required field should be focused
      expect(document.activeElement).toBe(emailField);
    });
  });

  describe('Programmatic Methods', () => {
    it('should validate form programmatically', () => {
      forms = new Forms();
      forms.init();

      const isValid = forms.validate('#testForm');
      expect(isValid).toBe(false); // Required fields are empty

      // Fill required fields
      const emailField = document.querySelector('#email') as HTMLInputElement;
      const passwordField = document.querySelector('#password') as HTMLInputElement;
      emailField.value = 'test@example.com';
      passwordField.value = 'password123';

      const isValidAfter = forms.validate('#testForm');
      expect(isValidAfter).toBe(true);
    });

    it('should reset form and validation states', () => {
      forms = new Forms();
      forms.init();

      // Create validation states
      const emailField = document.querySelector('#email') as HTMLInputElement;
      emailField.dispatchEvent(new Event('blur'));
      expect(emailField.classList.contains('is-invalid')).toBe(true);

      // Reset
      forms.reset('#testForm');

      expect(emailField.classList.contains('is-invalid')).toBe(false);
      expect(emailField.value).toBe('');
    });
  });

  describe('ARIA Attributes', () => {
    it('should set aria-invalid on invalid fields', () => {
      forms = new Forms();
      forms.init();

      const emailField = document.querySelector('#email') as HTMLInputElement;
      emailField.dispatchEvent(new Event('blur'));

      expect(emailField.getAttribute('aria-invalid')).toBe('true');

      emailField.value = 'test@example.com';
      emailField.dispatchEvent(new Event('blur'));

      expect(emailField.getAttribute('aria-invalid')).toBe('false');
    });

    it('should set aria-describedby for error messages', () => {
      forms = new Forms();
      forms.init();

      const emailField = document.querySelector('#email') as HTMLInputElement;
      emailField.dispatchEvent(new Event('blur'));

      const describedBy = emailField.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
    });
  });
});