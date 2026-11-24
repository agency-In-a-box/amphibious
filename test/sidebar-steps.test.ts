import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { amp } from '../src/amp';
import { initSidebars, Sidebar } from '../src/js/sidebar';
import { Steps } from '../src/js/steps';

const setWidth = (px: number) =>
  Object.defineProperty(window, 'innerWidth', { value: px, writable: true });

describe('Sidebar', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button data-sidebar-toggle>Menu</button>
      <aside class="aiab-sidebar" id="s">
        <button class="aiab-sidebar__toggle">Collapse</button>
        <a class="aiab-sidebar__link aiab-sidebar__link--active" href="#">Home</a>
        <a class="aiab-sidebar__link" href="#users">Users</a>
      </aside>`;
    setWidth(1200);
  });
  afterEach(() => {
    document.body.innerHTML = '';
    setWidth(1024);
  });

  it('attaches itself to the element and starts open on desktop', () => {
    const el = document.getElementById('s') as HTMLElement & { _sidebar?: Sidebar };
    const sidebar = new Sidebar(el);
    expect(el._sidebar).toBe(sidebar);
    expect(sidebar.isOpen).toBe(true);
    expect(sidebar.isCollapsed).toBe(false);
    sidebar.destroy();
  });

  it('collapses and expands on desktop and announces it', () => {
    const sidebar = new Sidebar('#s');
    const seen: string[] = [];
    for (const name of ['sidebarCollapsed', 'sidebarExpanded']) {
      sidebar.element.addEventListener(name, () => seen.push(name));
    }
    sidebar.toggle();
    expect(sidebar.isCollapsed).toBe(true);
    expect(sidebar.element.classList.contains('aiab-sidebar--collapsed')).toBe(true);
    (document.querySelector('.aiab-sidebar__toggle') as HTMLElement).click();
    expect(sidebar.isCollapsed).toBe(false);
    expect(seen).toEqual(['sidebarCollapsed', 'sidebarExpanded']);
    sidebar.destroy();
  });

  it('opens and closes as an overlay on mobile; Escape and overlay click close it', () => {
    setWidth(375);
    const sidebar = new Sidebar('#s');
    expect(sidebar.isOpen).toBe(false);
    (document.querySelector('[data-sidebar-toggle]') as HTMLElement).click();
    expect(sidebar.isOpen).toBe(true);
    expect(sidebar.element.classList.contains('aiab-sidebar--open')).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(sidebar.isOpen).toBe(false);
    sidebar.open();
    (document.querySelector('.aiab-sidebar__overlay') as HTMLElement).click();
    expect(sidebar.isOpen).toBe(false);
    sidebar.destroy();
  });

  it('sets the active link and aria-current', () => {
    const sidebar = new Sidebar('#s');
    sidebar.setActiveLink('#users');
    const links = document.querySelectorAll('.aiab-sidebar__link');
    expect(links[0].classList.contains('aiab-sidebar__link--active')).toBe(false);
    expect(links[1].classList.contains('aiab-sidebar__link--active')).toBe(true);
    expect(links[1].getAttribute('aria-current')).toBe('page');
    sidebar.destroy();
  });

  it('replaces an existing instance and initSidebars skips enhanced elements', () => {
    const first = new Sidebar('#s');
    const second = new Sidebar('#s');
    expect((document.getElementById('s') as HTMLElement & { _sidebar?: Sidebar })._sidebar).toBe(
      second,
    );
    expect(initSidebars()).toHaveLength(0);
    first.destroy();
    second.destroy();
  });

  it('throws for a missing element', () => {
    expect(() => new Sidebar('#nope')).toThrow('Sidebar element not found');
  });
});

describe('Steps', () => {
  const markup = `
    <ol class="aiab-steps" id="st">
      <li class="aiab-steps__item aiab-steps__item--complete"></li>
      <li class="aiab-steps__item aiab-steps__item--active"></li>
      <li class="aiab-steps__item"></li>
      <li class="aiab-steps__item"></li>
    </ol>`;
  beforeEach(() => {
    document.body.innerHTML = markup;
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  const states = () =>
    [...document.querySelectorAll('.aiab-steps__item')].map((li) =>
      li.classList.contains('aiab-steps__item--active')
        ? 'active'
        : li.classList.contains('aiab-steps__item--complete')
          ? 'complete'
          : 'pending',
    );

  it('reads the active step from the markup', () => {
    const steps = new Steps('#st');
    expect(steps.currentStep).toBe(1);
    expect(steps.totalSteps).toBe(4);
    expect(document.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
  });

  it('goToStep completes earlier steps, resets later ones and reports the change', () => {
    const seen: number[] = [];
    const steps = new Steps('#st', { onStepChange: (i) => seen.push(i) });
    steps.goToStep(3);
    expect(states()).toEqual(['complete', 'complete', 'complete', 'active']);
    steps.goToStep(0);
    expect(states()).toEqual(['active', 'pending', 'pending', 'pending']);
    steps.goToStep(0);
    expect(seen).toEqual([3, 0]);
  });

  it('ignores out-of-range steps; next/previous move one step', () => {
    const steps = new Steps('#st');
    steps.goToStep(9);
    expect(steps.currentStep).toBe(1);
    steps.next();
    expect(steps.currentStep).toBe(2);
    steps.previous();
    steps.previous();
    expect(steps.currentStep).toBe(0);
  });

  it('completeStep marks a non-active step complete', () => {
    const steps = new Steps('#st', { currentStep: 0 });
    steps.completeStep(2);
    expect(states()).toEqual(['active', 'pending', 'complete', 'pending']);
  });

  it('allowClick makes items interactive', () => {
    const steps = new Steps('#st', { allowClick: true });
    (document.querySelectorAll('.aiab-steps__item')[3] as HTMLElement).click();
    expect(steps.currentStep).toBe(3);
    const item = document.querySelectorAll('.aiab-steps__item')[0] as HTMLElement;
    item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(steps.currentStep).toBe(0);
  });
});

describe('amp.createCart / amp.createButton', () => {
  it('builds a cart icon with a count badge', () => {
    const cart = amp.createCart(3);
    expect(cart.textContent).toContain('3');
  });

  it('builds a classed button with a click handler', () => {
    let clicked = 0;
    const button = amp.createButton('Save', {
      variant: 'primary',
      size: 'lg',
      onClick: () => clicked++,
    });
    expect(button.tagName).toBe('BUTTON');
    expect(button.className).toBe('aiab-btn aiab-btn-primary aiab-btn-lg');
    expect(button.type).toBe('button');
    button.click();
    expect(clicked).toBe(1);
  });
});
