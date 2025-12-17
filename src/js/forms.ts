/**
 * Forms Module - Amphibious 2.0
 * Form validation and enhancement functionality
 */

export class Forms {
  private forms: NodeListOf<HTMLFormElement>;
  private eventListeners: Array<{ element: Element; type: string; handler: EventListener }> = [];

  private validationRules: Map<string, (value: string) => boolean>;

  constructor() {
    this.forms = document.querySelectorAll('form[data-validate], .form-validate');
    this.validationRules = new Map();
    this.setupDefaultRules();
  }

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
    document.querySelectorAll('.char-counter').forEach((el) => el.remove());
    document.querySelectorAll('.password-toggle').forEach((el) => el.remove());
  }

  /**
   * Initialize forms functionality
   */
  init(): void {
    this.forms.forEach((form) => {
      this.setupForm(form);
    });

    // Setup floating labels
    this.setupFloatingLabels();

    // Setup character counters
    this.setupCharCounters();

    // Setup password visibility toggles
    this.setupPasswordToggles();
  }

  /**
   * Setup default validation rules
   */
  private setupDefaultRules(): void {
    // Email validation
    this.validationRules.set('email', (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    });

    // Phone validation
    this.validationRules.set('phone', (value: string) => {
      const phoneRegex = /^[\d\s\-\(\)\+]+$/;
      return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10;
    });

    // URL validation
    this.validationRules.set('url', (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    });

    // Number validation
    this.validationRules.set('number', (value: string) => {
      return !isNaN(Number(value));
    });

    // Alpha only
    this.validationRules.set('alpha', (value: string) => {
      return /^[a-zA-Z]+$/.test(value);
    });

    // Alphanumeric
    this.validationRules.set('alphanumeric', (value: string) => {
      return /^[a-zA-Z0-9]+$/.test(value);
    });
  }

  /**
   * Setup form validation
   */
  private setupForm(form: HTMLFormElement): void {
    // Add novalidate to handle validation ourselves
    form.setAttribute('novalidate', 'true');

    // Setup field validation
    const fields = form.querySelectorAll('input, textarea, select');
    fields.forEach((field) => {
      this.setupField(field as HTMLInputElement);
    });

    // Form submission
    const submitHandler = (e: Event) => {
      if (!this.validateForm(form)) {
        e.preventDefault();
        this.focusFirstError(form);
      }
    };
    this.addEventListener(form, 'submit', submitHandler);
  }

  /**
   * Setup individual field validation
   */
  private setupField(field: HTMLInputElement): void {
    // Real-time validation on blur
    const blurHandler = () => {
      this.validateField(field);
    };
    this.addEventListener(field, 'blur', blurHandler);

    // Clear error on input
    const inputHandler = () => {
      if (field.classList.contains('is-invalid')) {
        this.clearFieldError(field);
      }

      // Update character counter if present
      this.updateCharCounter(field);
    };
    this.addEventListener(field, 'input', inputHandler);

    // Custom validation rules
    const customRule = field.dataset.validate;
    if (customRule && this.validationRules.has(customRule)) {
      const customBlurHandler = () => {
        const rule = this.validationRules.get(customRule);
        if (rule && !rule(field.value)) {
          this.showFieldError(field, field.dataset.validateMessage || 'Invalid input');
        }
      };
      this.addEventListener(field, 'blur', customBlurHandler);
    }
  }

  /**
   * Validate entire form
   */
  private validateForm(form: HTMLFormElement): boolean {
    let isValid = true;
    const fields = form.querySelectorAll('input, textarea, select');

    fields.forEach((field) => {
      if (!this.validateField(field as HTMLInputElement)) {
        isValid = false;
      }
    });

    // Always add was-validated to indicate validation has been performed
    form.classList.add('was-validated');

    return isValid;
  }

  /**
   * Validate individual field
   */
  private validateField(field: HTMLInputElement): boolean {
    // Required validation
    if (field.hasAttribute('required') && !field.value.trim()) {
      this.showFieldError(field, field.dataset.requiredMessage || 'This field is required');
      return false;
    }

    // Type-based validation
    switch (field.type) {
      case 'email':
        if (field.value && !this.validationRules.get('email')!(field.value)) {
          this.showFieldError(field, 'Please enter a valid email address');
          return false;
        }
        break;

      case 'url':
        if (field.value && !this.validationRules.get('url')!(field.value)) {
          this.showFieldError(field, 'Please enter a valid URL');
          return false;
        }
        break;

      case 'tel':
        if (field.value && !this.validationRules.get('phone')!(field.value)) {
          this.showFieldError(field, 'Please enter a valid phone number');
          return false;
        }
        break;

      case 'number':
        const min = field.getAttribute('min');
        const max = field.getAttribute('max');
        const value = Number(field.value);

        if (min !== null && value < Number(min)) {
          this.showFieldError(field, `Value must be at least ${min}`);
          return false;
        }

        if (max !== null && value > Number(max)) {
          this.showFieldError(field, `Value must be at most ${max}`);
          return false;
        }
        break;
    }

    // Pattern validation
    const pattern = field.getAttribute('pattern');
    if (pattern && field.value) {
      const regex = new RegExp(pattern);
      if (!regex.test(field.value)) {
        this.showFieldError(field, field.dataset.patternMessage || 'Invalid format');
        return false;
      }
    }

    // Length validation
    const minLength = field.getAttribute('minlength');
    const maxLength = field.getAttribute('maxlength');

    if (minLength && field.value.length < Number(minLength)) {
      this.showFieldError(field, `Minimum length is ${minLength} characters`);
      return false;
    }

    if (maxLength && field.value.length > Number(maxLength)) {
      this.showFieldError(field, `Maximum length is ${maxLength} characters`);
      return false;
    }

    // Custom validation
    const customRule = field.dataset.validate;
    if (customRule && this.validationRules.has(customRule)) {
      const rule = this.validationRules.get(customRule);
      if (rule && field.value && !rule(field.value)) {
        this.showFieldError(field, field.dataset.validateMessage || 'Invalid input');
        return false;
      }
    }

    this.showFieldSuccess(field);
    return true;
  }

  /**
   * Show field error
   */
  private showFieldError(field: HTMLInputElement, message: string): void {
    field.classList.remove('is-valid');
    field.classList.add('is-invalid');

    // Find or create error message element
    const formGroup = field.closest('.form-group');
    let errorElement = formGroup?.querySelector('.invalid-feedback') as HTMLElement;

    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'invalid-feedback';
      field.parentElement?.appendChild(errorElement);
    }

    errorElement.textContent = message;
    errorElement.style.display = 'block';

    // Set ARIA attributes
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute(
      'aria-describedby',
      errorElement.id || 'error-' + Math.random().toString(36).substr(2, 9),
    );
  }

  /**
   * Show field success
   */
  private showFieldSuccess(field: HTMLInputElement): void {
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');

    // Hide error message
    const formGroup = field.closest('.form-group');
    const errorElement = formGroup?.querySelector('.invalid-feedback') as HTMLElement;
    if (errorElement) {
      errorElement.style.display = 'none';
    }

    // Show success message if configured
    const successElement = formGroup?.querySelector('.valid-feedback') as HTMLElement;
    if (successElement) {
      successElement.style.display = 'block';
    }

    // Update ARIA
    field.setAttribute('aria-invalid', 'false');
  }

  /**
   * Clear field error
   */
  private clearFieldError(field: HTMLInputElement): void {
    field.classList.remove('is-invalid', 'is-valid');

    const formGroup = field.closest('.form-group');
    const errorElement = formGroup?.querySelector('.invalid-feedback') as HTMLElement;
    const successElement = formGroup?.querySelector('.valid-feedback') as HTMLElement;

    if (errorElement) {
      errorElement.style.display = 'none';
    }

    if (successElement) {
      successElement.style.display = 'none';
    }

    field.removeAttribute('aria-invalid');
  }

  /**
   * Focus first error field
   */
  private focusFirstError(form: HTMLFormElement): void {
    const firstError = form.querySelector('.is-invalid') as HTMLElement;
    if (firstError) {
      firstError.focus();
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Setup floating labels
   */
  private setupFloatingLabels(): void {
    const floatingInputs = document.querySelectorAll(
      '.form-floating input, .form-floating select, .form-floating textarea',
    );

    floatingInputs.forEach((input) => {
      const field = input as HTMLInputElement;

      // Check initial state
      if (field.value) {
        field.classList.add('filled');
      }

      // Update on input
      const floatHandler = () => {
        if (field.value) {
          field.classList.add('filled');
        } else {
          field.classList.remove('filled');
        }
      };
      this.addEventListener(field, 'input', floatHandler);
    });
  }

  /**
   * Setup character counters
   */
  private setupCharCounters(): void {
    const fieldsWithCounter = document.querySelectorAll('[data-char-counter]');

    fieldsWithCounter.forEach((field) => {
      const input = field as HTMLInputElement;
      const maxLength = input.getAttribute('maxlength');

      if (!maxLength) return;

      // Create counter element
      const counter = document.createElement('div');
      counter.className = 'char-counter';
      counter.textContent = `0 / ${maxLength}`;
      input.parentElement?.appendChild(counter);

      // Update counter
      const counterHandler = () => {
        this.updateCharCounter(input);
      };
      this.addEventListener(input, 'input', counterHandler);

      // Initial update
      this.updateCharCounter(input);
    });
  }

  /**
   * Update character counter
   */
  private updateCharCounter(field: HTMLInputElement): void {
    const maxLength = field.getAttribute('maxlength');
    if (!maxLength) return;

    const counter = field.parentElement?.querySelector('.char-counter');
    if (counter) {
      const current = field.value.length;
      const max = Number(maxLength);
      counter.textContent = `${current} / ${max}`;

      // Add warning class when near limit
      if (current > max * 0.9) {
        counter.classList.add('char-counter--warning');
      } else {
        counter.classList.remove('char-counter--warning');
      }
    }
  }

  /**
   * Setup password visibility toggles
   */
  private setupPasswordToggles(): void {
    const passwordFields = document.querySelectorAll('input[type="password"]');

    passwordFields.forEach((field) => {
      const input = field as HTMLInputElement;
      const wrapper = input.parentElement;

      // Skip if toggle already exists
      if (wrapper?.querySelector('.password-toggle')) return;

      // Create toggle button
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'password-toggle';
      toggle.innerHTML = '<span class="password-toggle__icon">👁</span>';
      toggle.setAttribute('aria-label', 'Toggle password visibility');

      // Add toggle to wrapper
      wrapper?.style.setProperty('position', 'relative');
      wrapper?.appendChild(toggle);

      // Toggle functionality
      const toggleHandler = () => {
        const type = input.type === 'password' ? 'text' : 'password';
        input.type = type;
        toggle.classList.toggle('is-visible');
        toggle.innerHTML =
          type === 'password'
            ? '<span class="password-toggle__icon">👁</span>'
            : '<span class="password-toggle__icon">👁‍🗨</span>';
      };
      this.addEventListener(toggle, 'click', toggleHandler);
    });
  }

  /**
   * Add custom validation rule
   */
  public addRule(name: string, validator: (value: string) => boolean): void {
    this.validationRules.set(name, validator);
  }

  /**
   * Validate form programmatically
   */
  public validate(formSelector: string): boolean {
    const form = document.querySelector(formSelector) as HTMLFormElement;
    if (!form) return false;

    return this.validateForm(form);
  }

  /**
   * Reset form and validation states
   */
  public reset(formSelector: string): void {
    const form = document.querySelector(formSelector) as HTMLFormElement;
    if (!form) return;

    form.reset();
    form.classList.remove('was-validated');

    const fields = form.querySelectorAll('.is-valid, .is-invalid');
    fields.forEach((field) => {
      this.clearFieldError(field as HTMLInputElement);
    });
  }
}

export default Forms;
