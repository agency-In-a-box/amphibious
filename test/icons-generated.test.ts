import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
// @ts-expect-error plain JS build script
import { buildIconSource, collectUsedIcons, OUTPUT } from '../scripts/generate-icons.js';
import { hasIcon, initializeIcons } from '../src/js/icons-lightweight';

describe('generated icon set', () => {
  test('src/js/icon-set.generated.ts is up to date (run `bun run generate:icons`)', () => {
    expect(readFileSync(OUTPUT, 'utf8')).toBe(buildIconSource());
  });

  test('every data-lucide name used in HTML or TS is shipped', () => {
    const missing = [...collectUsedIcons().keys()].filter((name) => !hasIcon(name));
    expect(missing).toEqual([]);
  });

  test('unknown icons render nothing and never a placeholder glyph', () => {
    document.body.innerHTML = '<i data-lucide="definitely-not-an-icon"></i>';
    initializeIcons();
    const el = document.body.firstElementChild as HTMLElement;
    expect(el.tagName).toBe('I');
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(document.body.textContent).toBe('');
  });

  test('known icons become inline SVG', () => {
    document.body.innerHTML = '<i data-lucide="tag"></i>';
    initializeIcons();
    expect(document.body.querySelector('svg')).not.toBeNull();
  });
});
