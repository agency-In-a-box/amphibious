# Amphibious QA — Master Prompt for Claude Code CLI

You are working on the Amphibious 2.0 CSS framework located in this repository. Three specific production bugs must be fixed. Do not refactor anything outside the scope of each fix. Work methodically — one issue at a time — and verify each fix before moving to the next.

---

## Bug 1 — Page header does not bleed full width on inner pages

**Affected files:** `docs/features.html`, `docs/form.html`, `docs/function.html`

**Root cause:** On these pages, `<header class="aiab-docs-header">` is a child of `<div class="aiab-container">`, which constrains it to the container width. The correct pattern (used on `docs/index.html`) is the inverse: the header is full-bleed and contains a `<div class="aiab-container">` inside it.

**Fix:** In each affected file, restructure the page header so it is a sibling of `<main>`, sitting outside any container, with the container div nested inside it. Match this exact pattern from `docs/index.html`:

```html
<header class="aiab-docs-header">
  <div class="aiab-container">
    <h1>Page Title</h1>
    <p>Lead text here.</p>
  </div>
</header>
<main id="main-content" class="aiab-container">
```

Confirm the `aiab-docs-header` CSS in `src/css/pages/docs.css` has no `max-width` constraint of its own — it should be width: 100% by default as a block element. If it has a max-width, remove it.

---

## Bug 2 — Logo "Amphibious" is invisible on scroll (orange on orange)

**Affected file:** `src/css/navigation-unified.css` and `src/js/navigation.ts`

**Root cause:** The `.aiab-site-logo` colour is `var(--nav-text)`. When the nav sits transparently over the orange hero gradient, the orange logo text disappears into the orange gradient. There is no `.is-scrolled` state that applies a contrasting background once the user scrolls past the hero.

**Fix — two parts:**

**Part A — CSS:** Add a scrolled state rule in `src/css/navigation-unified.css`. When the nav receives a `.is-scrolled` class, apply a solid background with sufficient contrast:

```css
/* Scrolled state — applied via JS when user scrolls past hero */
.aiab-site-nav.is-scrolled {
  background-color: var(--color-white, #fff);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

[data-theme="dark"] .aiab-site-nav.is-scrolled {
  background-color: var(--color-gray-900, #1a1a1a);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}
```

Do not change the logo colour variable. The contrast fix comes from the background, not by hardcoding a colour on the logo.

**Part B — JS:** In `src/js/navigation.ts`, add a scroll listener that adds `.is-scrolled` to `.aiab-site-nav` once the user scrolls past the height of the hero or page header, and removes it when they scroll back to the top. Use `requestAnimationFrame` throttling. If a scroll listener already exists in that file, add the class toggle to it rather than creating a duplicate listener.

If the nav is already hardcoded with a background on all pages (not transparent over the hero), audit whether `--nav-text` resolves to orange in the hero page context specifically. If so, pin the logo to `var(--color-white)` scoped only to the hero overlap state — not globally.

---

## Bug 3 — Slideshow controls are broken on `docs/features.html`

**Root cause:** Slide HTML initialises with the namespaced class `aiab-active` (e.g. `class="slide aiab-active"`) but the inline JavaScript uses the un-namespaced class `active`. The `classList.remove/add('active')` calls never match, so slides never change.

**Fix — Part A — JS class name:** In `docs/features.html`, locate the inline `<script>` block containing `showSlide()`. Change all four occurrences of `'active'` to `'aiab-active'`:

```js
// Replace this:
slides.forEach(slide => slide.classList.remove('active'));
dots.forEach(dot => dot.classList.remove('active'));
slides[slideIndex - 1].classList.add('active');
dots[slideIndex - 1].classList.add('active');

// With this:
slides.forEach(slide => slide.classList.remove('aiab-active'));
dots.forEach(dot => dot.classList.remove('aiab-active'));
slides[slideIndex - 1].classList.add('aiab-active');
dots[slideIndex - 1].classList.add('aiab-active');
```

**Fix — Part B — Slide redesign:** After fixing the JS, redesign the slide component markup and styles for this demo. Apply style changes in `docs/features.css` if it exists, otherwise in a scoped `<style>` block within `docs/features.html`. Requirements:

- **Left-aligned layout:** all slide content (heading, body text) left-aligned, not centred
- **Typography scale:** heading `font-size: clamp(1.5rem, 3vw, 2.25rem)`, `letter-spacing: -0.02em`, `font-weight: 500`; body text `font-size: 1.125rem`, `line-height: 1.6`
- **Breathing room:** minimum `padding-right: 4rem` on slide content so text never collides with arrow controls
- **Arrow placement:** prev/next arrows absolutely positioned, vertically centred (`top: 50%; transform: translateY(-50%)`), `left: 1rem` and `right: 1rem` respectively, sitting on the slide edges — not overlapping the text zone
- **Minimum slide height:** `.slideshow-container` min-height `320px`
- **Dot navigation:** dots sit below the slide container with `margin-top: 1rem`, not overlaid on the slide image/gradient

---

## Verification checklist

After completing all three fixes, confirm:

1. `docs/features.html` — header gradient extends edge to edge at full viewport width
2. `docs/form.html` and `docs/function.html` — same full-bleed header confirmed on both
3. On any page with an orange hero, scroll down and confirm the nav logo remains legible at all scroll positions
4. `docs/features.html` — clicking next/prev arrows and dots advances slides correctly
5. `bun run lint` — no new lint errors
6. `bun run typecheck` — passes clean
7. `bun test` — all 210 existing tests still pass

Do not introduce new dependencies. Do not change any file or component outside the explicit scope of each bug above.
