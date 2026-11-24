import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/css/navigation-unified.css', import.meta.url), 'utf8');

describe('navigation-unified.css regressions', () => {
  it('does not flip flyouts by list position (last / second-to-last child)', () => {
    expect(css).not.toMatch(/ul\s*>\s*li:last-child\s+ul/);
    expect(css).not.toMatch(/ul\s*>\s*li:nth-last-child\(2\)\s+ul/);
  });

  it('limits the right-edge alignment to the first-level dropdown', () => {
    expect(css).toMatch(/> li:is\(:last-child, :nth-last-child\(2\)\) > ul/);
  });

  it('resets list bullets on every horizontal list and its dropdowns', () => {
    const base = css.slice(css.indexOf('.aiab-horizontal {'));
    expect(base.slice(0, 400)).toContain('list-style: none');
    expect(css).toMatch(/& ul \{[^}]*list-style: none/);
  });

  it('delays hiding (not showing) a dropdown so the pointer can cross the gap', () => {
    expect(css).toContain('visibility 0s linear 150ms');
    expect(css).toContain('transition-delay: 0s');
  });
});
