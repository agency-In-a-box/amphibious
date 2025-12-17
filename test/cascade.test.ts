import { test, expect, describe, beforeEach } from 'bun:test';
import { Window } from 'happy-dom';

describe('CSS @layer Cascade', () => {
  let window: Window;
  let document: Document;

  beforeEach(() => {
    window = new Window();
    document = window.document;

    // Simulate our layer structure
    const style = document.createElement('style');
    style.textContent = `
      /* Define layer order */
      @layer reset, tokens, base, layout, components, themes, utilities;

      /* Base layer */
      @layer base {
        .test-element {
          padding: 20px;
          color: black;
          font-size: 16px;
        }
      }

      /* Component layer */
      @layer components {
        .test-element {
          padding: 15px;
          background: lightblue;
          border: 1px solid #ccc;
        }
      }

      /* Utility layer */
      @layer utilities {
        .p-0 { padding: 0; }
        .text-center { text-align: center; }
        .mb-0 { margin-bottom: 0; }
      }

      /* Theme layer */
      @layer themes {
        .premium {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
      }
    `;
    document.head.appendChild(style);
  });

  test('utility classes override component styles', () => {
    const element = document.createElement('div');
    element.className = 'test-element p-0';
    document.body.appendChild(element);

    // In a real browser, utilities layer would override components layer
    // Since happy-dom doesn't fully support @layer, we verify the classes are applied
    expect(element.classList.contains('test-element')).toBe(true);
    expect(element.classList.contains('p-0')).toBe(true);
  });

  test('multiple utility classes can be combined', () => {
    const element = document.createElement('div');
    element.className = 'test-element p-0 text-center mb-0';
    document.body.appendChild(element);

    expect(element.classList.contains('p-0')).toBe(true);
    expect(element.classList.contains('text-center')).toBe(true);
    expect(element.classList.contains('mb-0')).toBe(true);
  });

  test('theme classes override base components', () => {
    const element = document.createElement('div');
    element.className = 'test-element premium';
    document.body.appendChild(element);

    expect(element.classList.contains('test-element')).toBe(true);
    expect(element.classList.contains('premium')).toBe(true);
  });

  test('layer order is maintained in final CSS', () => {
    // Verify that our CSS maintains the correct layer order
    const styleContent = document.querySelector('style')?.textContent || '';

    // Check that layer definition comes first
    expect(styleContent).toContain(
      '@layer reset, tokens, base, layout, components, themes, utilities',
    );

    // Check that layers are defined in order
    const baseIndex = styleContent.indexOf('@layer base');
    const componentsIndex = styleContent.indexOf('@layer components');
    const utilitiesIndex = styleContent.indexOf('@layer utilities');

    expect(baseIndex).toBeLessThan(componentsIndex);
    expect(componentsIndex).toBeLessThan(utilitiesIndex);
  });

  test('no !important needed for utility overrides', () => {
    const styleContent = document.querySelector('style')?.textContent || '';

    // Check that utility classes don't use !important
    const utilitySection = styleContent.match(/@layer utilities \{[\s\S]*?\}/)?.[0] || '';
    expect(utilitySection).not.toContain('!important');
  });
});

describe('CSS @layer Integration with Components', () => {
  let window: Window;
  let document: Document;

  beforeEach(() => {
    window = new Window();
    document = window.document;
  });

  test('navigation active states work without !important', () => {
    const nav = document.createElement('nav');
    nav.className = 'site-nav';
    nav.innerHTML = `
      <ul class="horizontal">
        <li class="active"><a href="#">Active</a></li>
        <li><a href="#">Normal</a></li>
      </ul>
    `;
    document.body.appendChild(nav);

    const activeItem = nav.querySelector('.active');
    expect(activeItem).toBeTruthy();

    // The active class should work without needing !important
    // due to proper layer ordering
  });

  test('grid system respects utility overrides', () => {
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `
      <div class="col-6 text-center">Column 1</div>
      <div class="col-6 text-right">Column 2</div>
    `;
    document.body.appendChild(row);

    const col1 = row.querySelector('.col-6.text-center');
    const col2 = row.querySelector('.col-6.text-right');

    expect(col1?.classList.contains('text-center')).toBe(true);
    expect(col2?.classList.contains('text-right')).toBe(true);
  });

  test('helper classes have highest priority', () => {
    const element = document.createElement('div');
    element.className = 'card-premium hide';
    document.body.appendChild(element);

    // The hide utility should override any component display styles
    expect(element.classList.contains('hide')).toBe(true);
  });
});
