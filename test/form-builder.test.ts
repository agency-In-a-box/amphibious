/**
 * FormBuilder panel headings: level follows the page outline, labels are text.
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { FormBuilder } from '../src/js/form-builder';

describe('FormBuilder panel headings', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="fb"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  const el = () => document.getElementById('fb') as HTMLElement;

  it('uses h3 by default', () => {
    new FormBuilder(el());
    expect(el().querySelector('.aiab-toolbox-header')?.firstElementChild?.tagName).toBe('H3');
    expect(el().querySelector('.aiab-properties-header')?.firstElementChild?.tagName).toBe('H3');
  });

  it('uses the configured level and keeps the panel look', () => {
    new FormBuilder(el(), { panelHeadingLevel: 2 });
    const h = el().querySelector('.aiab-toolbox-header')?.firstElementChild as HTMLElement;
    expect(h.tagName).toBe('H2');
    expect(h.classList.contains('aiab-h3')).toBe(true);
  });

  it('renders labels as text, not markup', () => {
    new FormBuilder(el(), { labels: { toolbox: '<img src=x onerror=alert(1)>' } });
    const h = el().querySelector('.aiab-toolbox-header')?.firstElementChild as HTMLElement;
    expect(h.querySelector('img')).toBeNull();
    expect(h.textContent).toBe('<img src=x onerror=alert(1)>');
  });
});
