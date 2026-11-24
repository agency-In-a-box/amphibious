/**
 * Icon hydration + theme-scope PostCSS plugin
 *
 * Regression cover for the 2026-11-24 QA session: unregistered icons rendered
 * as a literal "□", icon modifier classes were no-ops, hydration dropped ids,
 * and OS dark mode leaked into pages declaring data-theme="light".
 */

import { beforeEach, describe, expect, it } from 'bun:test';
import postcss from 'postcss';
import themeScope from '../scripts/postcss-theme-scope.js';
import { hasIcon, initializeIcons, registerIcons } from '../src/js/icons-lightweight';

describe('Icon hydration', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders the icons the commerce pages use', () => {
    for (const name of [
      'eye',
      'git-compare',
      'user',
      'phone',
      'shirt',
      'tag',
      'grid-3x3',
      'list',
    ]) {
      expect(hasIcon(name)).toBe(true);
    }
  });

  it('replaces placeholders with an SVG and keeps author attributes', () => {
    document.body.innerHTML =
      '<i data-lucide="moon" id="themeIcon" data-x="1" class="icon--sm"></i>';
    initializeIcons();
    const svg = document.getElementById('themeIcon');
    expect(svg?.tagName.toLowerCase()).toBe('svg');
    expect(svg?.getAttribute('data-x')).toBe('1');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });

  it('maps icon--* modifiers to the aiab-icon--* classes the CSS defines', () => {
    document.body.innerHTML = '<i data-lucide="star" class="icon--xs icon--filled"></i>';
    initializeIcons();
    const cls = document.querySelector('svg')?.getAttribute('class') ?? '';
    expect(cls).toContain('aiab-icon--xs');
    expect(cls).toContain('aiab-icon--filled');
    expect(document.querySelector('svg')?.getAttribute('width')).toBe('12');
  });

  it('re-renders when data-lucide changes (theme toggle swap)', () => {
    document.body.innerHTML = '<i data-lucide="moon" id="t"></i>';
    initializeIcons();
    document.getElementById('t')?.setAttribute('data-lucide', 'sun');
    initializeIcons();
    expect(document.getElementById('t')?.getAttribute('class')).toContain('lucide-sun');
  });

  it('never renders a tofu glyph for unknown icons', () => {
    document.body.innerHTML = '<i data-lucide="definitely-not-an-icon" class="icon--sm"></i>';
    initializeIcons();
    expect(document.body.textContent).not.toContain('□');
    expect(document.querySelector('[data-lucide]')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('accepts runtime registrations', () => {
    registerIcons({
      'test-dot': '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/></svg>',
    });
    document.body.innerHTML = '<i data-lucide="test-dot"></i>';
    initializeIcons();
    expect(document.querySelector('svg circle')).not.toBeNull();
  });
});

describe('postcss-theme-scope', () => {
  const run = async (css: string) =>
    (await postcss([themeScope()]).process(css, { from: undefined })).css;

  it('scopes dark-mode rules so data-theme="light" wins', async () => {
    const out = await run('@media (prefers-color-scheme: dark) { input[readonly] { color: red } }');
    expect(out).toContain(':where(html:not([data-theme="light"])) input[readonly]');
  });

  it('scopes :root without adding specificity', async () => {
    const out = await run('@media (prefers-color-scheme: dark) { :root { --a: 1 } }');
    expect(out).toContain(':root:where(:not([data-theme="light"]))');
  });

  it('emits an explicit [data-theme="dark"] copy outside the media query', async () => {
    const out = await run('@media (prefers-color-scheme: dark) { .card { color: white } }');
    const outside = out.slice(out.lastIndexOf('}', out.indexOf(':where(html[data-theme="dark"])')));
    expect(out).toContain(':where(html[data-theme="dark"]) .card');
    expect(outside).not.toContain('@media');
  });

  it('converts author-scoped :not(light) selectors for the explicit copy', async () => {
    const out = await run(
      '@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .x { a: b } }',
    );
    expect(out).toContain(':root[data-theme="dark"] .x');
  });

  it('does not copy keyframes out of the dark query', async () => {
    const out = await run(
      '@media (prefers-color-scheme: dark) { @keyframes k { to { opacity: 1 } } .a { b: c } }',
    );
    expect(out.match(/@keyframes k/g)?.length).toBe(1);
  });

  it('leaves already-scoped and light-scheme rules alone', async () => {
    const out = await run(
      '@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .x { a: b } }' +
        '@media (prefers-color-scheme: light) { .y { a: b } }',
    );
    expect(out).toContain(':root:not([data-theme="light"]) .x');
    expect(out).not.toContain(':where(html:not([data-theme="light"])) .y');
  });
});
