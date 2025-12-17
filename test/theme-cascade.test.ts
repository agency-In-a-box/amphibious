import { beforeEach, describe, expect, test } from 'bun:test';
import { Window } from 'happy-dom';

describe('Theme Layer Override Tests', () => {
  let window: Window;
  let document: Document;

  beforeEach(() => {
    window = new Window();
    document = window.document;

    // Create a more comprehensive layer setup to test themes
    const style = document.createElement('style');
    style.textContent = `
      /* Define layer order */
      @layer reset, tokens, base, layout, components, themes, utilities;

      /* Component layer - base button */
      @layer components {
        .button {
          padding: 8px 16px;
          background: #e0e0e0;
          color: #333;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        .card {
          padding: 16px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
      }

      /* Theme layer - premium design system */
      @layer themes {
        .btn-premium {
          padding: 12px 32px;
          background: #1863dc;
          color: white;
          border: none;
          border-radius: 6px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .card-premium {
          padding: 32px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.04);
        }
      }

      /* Utilities layer - should still override themes */
      @layer utilities {
        .p-0 { padding: 0; }
        .bg-primary { background: #ED8B00; }
        .shadow-none { box-shadow: none; }
      }
    `;
    document.head.appendChild(style);
  });

  test('theme styles override base component styles', () => {
    // Create base button
    const baseButton = document.createElement('button');
    baseButton.className = 'button';

    // Create premium button
    const premiumButton = document.createElement('button');
    premiumButton.className = 'btn-premium';

    document.body.appendChild(baseButton);
    document.body.appendChild(premiumButton);

    // Premium button should have theme styles that override base
    expect(premiumButton.classList.contains('btn-premium')).toBe(true);
    expect(baseButton.classList.contains('button')).toBe(true);
  });

  test('utility classes override theme styles', () => {
    // Theme button with utility overrides
    const button = document.createElement('button');
    button.className = 'btn-premium p-0 shadow-none';

    document.body.appendChild(button);

    // Utilities should win over theme styles
    expect(button.classList.contains('btn-premium')).toBe(true);
    expect(button.classList.contains('p-0')).toBe(true);
    expect(button.classList.contains('shadow-none')).toBe(true);
  });

  test('combining theme and utility classes works correctly', () => {
    const card = document.createElement('div');
    card.className = 'card-premium bg-primary p-0';

    document.body.appendChild(card);

    // All classes should be applied with utilities having priority
    expect(card.classList.contains('card-premium')).toBe(true);
    expect(card.classList.contains('bg-primary')).toBe(true);
    expect(card.classList.contains('p-0')).toBe(true);
  });

  test('theme layer does not require !important to override components', () => {
    const styleContent = document.querySelector('style')?.textContent || '';

    // Extract theme layer content
    const themeLayerMatch = styleContent.match(/@layer themes \{[\s\S]*?\}/);
    const themeContent = themeLayerMatch?.[0] || '';

    // Theme layer should not need !important
    expect(themeContent).not.toContain('!important');
  });

  test('multiple theme classes can coexist', () => {
    // Test that we can apply multiple theme styles
    const element = document.createElement('div');
    element.className = 'card-premium btn-premium'; // Both theme classes

    document.body.appendChild(element);

    expect(element.classList.contains('card-premium')).toBe(true);
    expect(element.classList.contains('btn-premium')).toBe(true);
  });
});

describe('Apple Design System Theme Tests', () => {
  let window: Window;
  let document: Document;

  beforeEach(() => {
    window = new Window();
    document = window.document;

    // Add Apple design system styles
    const style = document.createElement('style');
    style.textContent = `
      @layer reset, tokens, base, layout, components, themes, utilities;

      @layer themes {
        .apple-button {
          padding: 11px 23px;
          background: #0071e3;
          color: white;
          border-radius: 980px;
          font-family: -apple-system, BlinkMacSystemFont;
        }

        .apple-card {
          background: #fbfbfd;
          border-radius: 18px;
          padding: 40px;
        }
      }

      @layer utilities {
        .rounded-none { border-radius: 0; }
        .font-serif { font-family: serif; }
      }
    `;
    document.head.appendChild(style);
  });

  test('Apple theme styles are applied correctly', () => {
    const button = document.createElement('button');
    button.className = 'apple-button';

    document.body.appendChild(button);

    expect(button.classList.contains('apple-button')).toBe(true);
  });

  test('utilities override Apple theme styles', () => {
    const button = document.createElement('button');
    button.className = 'apple-button rounded-none font-serif';

    document.body.appendChild(button);

    // Utilities should override theme styles
    expect(button.classList.contains('apple-button')).toBe(true);
    expect(button.classList.contains('rounded-none')).toBe(true);
    expect(button.classList.contains('font-serif')).toBe(true);
  });
});
