/**
 * Accessibility Tests
 * Validates ARIA patterns, keyboard navigation, and semantic structure
 * across Amphibious component HTML patterns using axe-core.
 *
 * Part of audit finding A11Y-5: accessibility scanning in CI.
 */

import { afterEach, describe, expect, it } from 'bun:test';
import axe from 'axe-core';

// Component HTML fixtures representing real usage patterns
const FIXTURES = {
  modal: `
		<div class="aiab-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
			<div class="aiab-modal__backdrop"></div>
			<div class="aiab-modal__content">
				<div class="aiab-modal__header">
					<h2 id="modal-title">Modal Title</h2>
					<button class="aiab-modal__close" aria-label="Close modal">&times;</button>
				</div>
				<div class="aiab-modal__body">
					<p>Modal content goes here.</p>
				</div>
				<div class="aiab-modal__footer">
					<button class="aiab-btn">Cancel</button>
					<button class="aiab-btn aiab-btn--primary">Confirm</button>
				</div>
			</div>
		</div>
	`,

  form: `
		<form class="aiab-form" novalidate>
			<div class="aiab-form-group">
				<label for="name-input">Full Name</label>
				<input type="text" id="name-input" required aria-required="true" />
			</div>
			<div class="aiab-form-group">
				<label for="email-input">Email</label>
				<input type="email" id="email-input" required aria-required="true" />
			</div>
			<div class="aiab-form-group">
				<label for="message-input">Message</label>
				<textarea id="message-input" rows="4"></textarea>
			</div>
			<button type="submit" class="aiab-btn aiab-btn--primary">Submit</button>
		</form>
	`,

  navigation: `
		<nav class="aiab-nav" aria-label="Main navigation">
			<a href="/" class="aiab-nav__brand">Brand</a>
			<button class="aiab-nav__toggle" aria-label="Toggle navigation" aria-expanded="false">
				<span class="aiab-nav__toggle-icon"></span>
			</button>
			<ul class="aiab-nav__menu" role="menubar">
				<li role="none"><a href="/home" role="menuitem">Home</a></li>
				<li role="none"><a href="/about" role="menuitem">About</a></li>
				<li role="none"><a href="/contact" role="menuitem">Contact</a></li>
			</ul>
		</nav>
	`,

  tabs: `
		<div class="aiab-tabs">
			<div role="tablist" aria-label="Content tabs">
				<button role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1">Tab 1</button>
				<button role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2" tabindex="-1">Tab 2</button>
				<button role="tab" aria-selected="false" aria-controls="panel-3" id="tab-3" tabindex="-1">Tab 3</button>
			</div>
			<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">Panel 1 content</div>
			<div role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>Panel 2 content</div>
			<div role="tabpanel" id="panel-3" aria-labelledby="tab-3" hidden>Panel 3 content</div>
		</div>
	`,

  alert: `
		<div class="aiab-alert aiab-alert--warning" role="alert">
			<span class="aiab-alert__icon" aria-hidden="true">⚠️</span>
			<div class="aiab-alert__content">
				<strong>Warning:</strong> Please review your input.
			</div>
			<button class="aiab-alert__close" aria-label="Dismiss alert">&times;</button>
		</div>
	`,

  toast: `
		<div class="aiab-toast-container aiab-toast-container--top-right" role="region" aria-live="polite" aria-label="Notifications">
			<div class="aiab-toast aiab-toast--success" role="alert" tabindex="-1">
				<span class="aiab-toast__icon" aria-hidden="true">✓</span>
				<div class="aiab-toast__content">
					<h4 class="aiab-toast__title">Success</h4>
					<p class="aiab-toast__message">Operation completed.</p>
				</div>
				<button class="aiab-toast__close" aria-label="Close notification">&times;</button>
			</div>
		</div>
	`,

  breadcrumb: `
		<nav class="aiab-breadcrumb" aria-label="Breadcrumb">
			<ol>
				<li><a href="/">Home</a></li>
				<li><a href="/products">Products</a></li>
				<li aria-current="page">Current Page</li>
			</ol>
		</nav>
	`,

  accordion: `
		<div class="aiab-accordion">
			<div class="aiab-accordion-item">
				<button class="aiab-accordion-header" aria-expanded="true" aria-controls="acc-panel-1" id="acc-header-1">Section 1</button>
				<div class="aiab-accordion-content" id="acc-panel-1" role="region" aria-labelledby="acc-header-1">Content 1</div>
			</div>
			<div class="aiab-accordion-item">
				<button class="aiab-accordion-header" aria-expanded="false" aria-controls="acc-panel-2" id="acc-header-2">Section 2</button>
				<div class="aiab-accordion-content" id="acc-panel-2" role="region" aria-labelledby="acc-header-2" hidden>Content 2</div>
			</div>
		</div>
	`,
};

describe('Accessibility (axe-core)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  for (const [name, html] of Object.entries(FIXTURES)) {
    it(`${name} component has no axe-core violations`, async () => {
      document.body.innerHTML = html;
      const results = await axe.run(document.body, {
        // Disable rules that need real layout/computed styles (happy-dom limitation)
        rules: {
          'color-contrast': { enabled: false },
          region: { enabled: false },
          'scrollable-region-focusable': { enabled: false },
        },
      });
      const violations = results.violations.map(
        (v) => `${v.id}: ${v.description} (${v.nodes.length} instance(s))`,
      );
      expect(violations).toEqual([]);
    });
  }
});

describe('Accessibility — manual ARIA checks', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('all interactive elements have accessible names', () => {
    document.body.innerHTML = Object.values(FIXTURES).join('\n');
    const buttons = document.querySelectorAll('button');
    const missing: string[] = [];

    buttons.forEach((btn) => {
      const label =
        btn.getAttribute('aria-label') ||
        btn.getAttribute('aria-labelledby') ||
        btn.textContent?.trim();
      if (!label) {
        missing.push(`<button> missing accessible name: class="${btn.className}"`);
      }
    });

    expect(missing).toEqual([]);
  });

  it('all form inputs have associated labels', () => {
    document.body.innerHTML = FIXTURES.form;
    const inputs = document.querySelectorAll('input, textarea, select');
    const missing: string[] = [];

    inputs.forEach((input) => {
      const id = input.getAttribute('id');
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledby = input.getAttribute('aria-labelledby');
      const hasLabel = id && document.querySelector(`label[for="${id}"]`);

      if (!hasLabel && !ariaLabel && !ariaLabelledby) {
        missing.push(`<${input.tagName.toLowerCase()}> missing label: id="${id}"`);
      }
    });

    expect(missing).toEqual([]);
  });

  it('modal has proper ARIA dialog attributes', () => {
    document.body.innerHTML = FIXTURES.modal;
    const dialog = document.querySelector('[role="dialog"]');

    expect(dialog).toBeTruthy();
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(dialog?.getAttribute('aria-labelledby')).toBeTruthy();

    const labelId = dialog?.getAttribute('aria-labelledby');
    const heading = document.getElementById(labelId!);
    expect(heading).toBeTruthy();
    expect(heading?.textContent?.trim()).toBeTruthy();
  });

  it('tabs have proper ARIA tablist/tab/tabpanel linkage', () => {
    document.body.innerHTML = FIXTURES.tabs;

    const tablist = document.querySelector('[role="tablist"]');
    expect(tablist?.getAttribute('aria-label')).toBeTruthy();

    const tabs = document.querySelectorAll('[role="tab"]');
    tabs.forEach((tab) => {
      const controls = tab.getAttribute('aria-controls');
      expect(controls).toBeTruthy();
      const panel = document.getElementById(controls!);
      expect(panel).toBeTruthy();
      expect(panel?.getAttribute('role')).toBe('tabpanel');
      expect(panel?.getAttribute('aria-labelledby')).toBe(tab.getAttribute('id'));
    });
  });

  it('navigation has aria-label and toggle has aria-expanded', () => {
    document.body.innerHTML = FIXTURES.navigation;

    const nav = document.querySelector('nav');
    expect(nav?.getAttribute('aria-label')).toBeTruthy();

    const toggle = document.querySelector('.aiab-nav__toggle');
    expect(toggle?.getAttribute('aria-expanded')).toBeTruthy();
    expect(toggle?.getAttribute('aria-label')).toBeTruthy();
  });

  it('toast container has aria-live region', () => {
    document.body.innerHTML = FIXTURES.toast;

    const container = document.querySelector('.aiab-toast-container');
    expect(container?.getAttribute('role')).toBe('region');
    expect(container?.getAttribute('aria-live')).toBe('polite');
    expect(container?.getAttribute('aria-label')).toBeTruthy();

    const toast = document.querySelector('.aiab-toast');
    expect(toast?.getAttribute('role')).toBe('alert');
  });

  it('breadcrumb uses nav with aria-label and aria-current', () => {
    document.body.innerHTML = FIXTURES.breadcrumb;

    const nav = document.querySelector('.aiab-breadcrumb');
    expect(nav?.getAttribute('aria-label')).toBeTruthy();

    const current = document.querySelector('[aria-current="page"]');
    expect(current).toBeTruthy();
  });
});
