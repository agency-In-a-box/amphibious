/**
 * Color Picker Tests
 * Swatch markup must not be injectable through presets or stored recent colors.
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { ColorPicker } from '../src/js/color-picker';

const EVIL = '#fff" onmouseover="window.__xss=1" data-x="';
const CSS_EVIL = 'red; background-image: url(//evil.example/x)';

describe('ColorPicker swatches', () => {
  let picker: ColorPicker | undefined;

  beforeEach(() => {
    document.body.innerHTML = '<input type="text" id="c" value="#336699">';
    localStorage.clear();
  });

  afterEach(() => {
    picker?.destroy();
    picker = undefined;
    document.body.innerHTML = '';
    localStorage.clear();
  });

  const build = () => {
    const input = document.getElementById('c') as HTMLInputElement;
    picker = new ColorPicker(input, {
      presets: ['#ff0000', EVIL, CSS_EVIL, 'rgb(10, 20, 30)'],
      showPresets: true,
    });
    return document.querySelectorAll<HTMLButtonElement>('.aiab-color-swatch');
  };

  it('gives every swatch an accessible name', () => {
    for (const swatch of build()) {
      expect(swatch.getAttribute('aria-label')).toStartWith('Select color');
    }
  });

  it('cannot be broken out of an attribute by a malicious preset', () => {
    for (const swatch of build()) {
      expect(swatch.hasAttribute('onmouseover')).toBe(false);
      expect(swatch.hasAttribute('data-x')).toBe(false);
    }
  });

  it('renders only plain colors, so no extra CSS declarations can be added', () => {
    const colors = [...build()].map((s) => s.dataset.color);
    expect(colors).toEqual(['#ff0000', 'rgb(10, 20, 30)']);
    for (const swatch of build()) expect(swatch.getAttribute('style')).not.toContain('url(');
  });

  it('ignores non-color values stored in localStorage', () => {
    localStorage.setItem(
      'aiab-color-picker-recent',
      JSON.stringify([EVIL, 42, { a: 1 }, '#abc', '#123456']),
    );
    build();
    const recent = [
      ...document.querySelectorAll<HTMLElement>('.aiab-recent-colors .aiab-color-swatch'),
    ];
    expect(recent.map((s) => s.dataset.color)).toEqual(['#abc', '#123456']);
  });
});
