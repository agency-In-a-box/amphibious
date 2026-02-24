# Task 3: P2+P6 — Shopping Cart & Checkout Layout Rebuild

## Objective

Refactor the three e-commerce pages to use the Amphibious `.aiab-` grid system, namespace all custom classes, extract inline CSS, and bring them into visual consistency with the rest of the documentation site.

**Read `AUDIT-REPORT.md`, `CLAUDE.md`, and `src/css/main.css` before starting.**

---

## Target Files

| File | Current State | Target State |
|------|--------------|-------------|
| `examples/e-commerce-cart.html` | 733 lines inline CSS, `grid-template-columns: 1fr 380px`, ~70 non-namespaced classes | Framework grid, external CSS, all `.aiab-` prefixed |
| `examples/shopping-cart-modern.html` | Zero framework usage, 914-line external CSS with own `:root` variables, ~65 non-namespaced classes | Framework grid + tokens, namespaced classes |
| `examples/checkout-flow.html` | Partial framework usage, 323 lines inline CSS, ~30 non-namespaced classes, redefines `.aiab-btn` | Full framework compliance, no redefinitions |

---

## Phase 1: Inventory Before Touching Anything

For each of the 3 files, produce a class inventory:

```bash
# Extract all classes used in each file
for f in examples/e-commerce-cart.html examples/shopping-cart-modern.html examples/checkout-flow.html; do
  echo "=== $f ==="
  grep -oP 'class="[^"]*"' "$f" | tr ' ' '\n' | grep -v '^class=' | sed 's/"//g' | sort -u
done
```

Categorize each class as:
- **Framework class** — already `.aiab-` prefixed, keep as-is
- **Needs prefixing** — custom class that should become `.aiab-cart-*` or `.aiab-checkout-*`
- **Framework duplicate** — reimplements something that already exists (e.g., `.visually-hidden` → `.aiab-sr-only`)
- **Remove** — class with no CSS rules or unused

Save this inventory as `CART-CLASS-INVENTORY.md` in the project root for reference.

---

## Phase 2: Layout Conversion — e-commerce-cart.html

### Current Layout Problem
```css
/* Current — bypasses framework grid */
.cart-content {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 32px;
}
```

### Target Layout
```html
<div class="aiab-container">
  <div class="aiab-row">
    <!-- Cart items: 11 of 16 columns -->
    <div class="aiab-col-11">
      <!-- cart items here -->
    </div>
    <!-- Order summary sidebar: 5 of 16 columns -->
    <div class="aiab-col-5">
      <!-- order summary here -->
    </div>
  </div>
</div>
```

### Step-by-Step

1. **Extract the inline `<style>` block** (all 733 lines) into `examples/css/e-commerce-cart.css` and link it with `<link rel="stylesheet" href="css/e-commerce-cart.css">`
2. **Replace the custom grid layout** with `.aiab-container` > `.aiab-row` > `.aiab-col-11` + `.aiab-col-5`
3. **Add responsive breakpoints** using framework classes: on tablet, stack to single column (`aiab-col-tablet-16` on both)
4. **Add the site navigation** — this page should have `<nav class="aiab-site-nav">` matching other example pages. Copy from a known-good example like `examples/e-commerce-catalog.html`
5. **Replace `.visually-hidden`** with `.aiab-sr-only` everywhere in this file
6. **Add `data-theme="light"`** to `<html>` if Task 2 hasn't already done this

### Class Prefixing for e-commerce-cart.html

Prefix all custom classes with `.aiab-cart-`:

| Current Class | New Class |
|--------------|-----------|
| `.cart-header` | `.aiab-cart-header` |
| `.cart-content` | `.aiab-cart-content` |
| `.cart-item` | `.aiab-cart-item` |
| `.cart-item-image` | `.aiab-cart-item-image` |
| `.cart-item-details` | `.aiab-cart-item-details` |
| `.quantity-selector` | `.aiab-cart-quantity` |
| `.order-summary` | `.aiab-cart-summary` |
| `.checkout-button` | `.aiab-btn .aiab-btn-primary` (use framework button) |
| `.cart-count` | `.aiab-cart-count` |
| `.progress-steps` | `.aiab-cart-progress` |
| `.remove-btn` | `.aiab-cart-remove` |
| `.save-btn` | `.aiab-cart-save` |

**Important:** Update both the HTML classes AND the CSS selectors in the extracted stylesheet simultaneously. Do not leave orphaned selectors.

---

## Phase 3: Layout Conversion — shopping-cart-modern.html

This is the most broken page. It operates as a standalone app with zero framework integration.

### Step-by-Step

1. **Add the standard `<head>` section** — charset, viewport, title in format `Shopping Cart — Amphibious 2.0`, link to `/src/css/main.css`
2. **Add the site navigation** from the shared pattern
3. **Replace the custom `:root` variables** in `shopping-cart-modern.css`:

| Current Variable | Framework Equivalent |
|-----------------|---------------------|
| `--primary-color` | `var(--aiab-color-primary)` or `var(--color-primary)` from design tokens |
| `--primary-dark` | `var(--aiab-color-primary-dark)` |
| `--bg-color` | `var(--aiab-surface-primary)` |
| `--text-color` | `var(--aiab-ink)` |
| `--border-color` | `var(--aiab-border)` |

Check `src/css/tokens/design-tokens.css` for the actual variable names in use — use those exactly.

4. **Wrap content in framework grid:**
```html
<div class="aiab-container">
  <div class="aiab-row">
    <div class="aiab-col-11"><!-- cart items --></div>
    <div class="aiab-col-5"><!-- summary --></div>
  </div>
</div>
```

5. **Change `max-width: 1400px`** to match framework container width (1200px or whatever `.aiab-container` uses)
6. **Remove the `.aiab-tooltip` redefinition** from `shopping-cart-modern.css` — the framework tooltip should work as-is
7. **Prefix all custom classes** with `.aiab-cart-` following the same pattern as Phase 2
8. **Rename dangerously generic classes:**

| Current (collision risk) | New |
|-------------------------|-----|
| `.save` | `.aiab-cart-save` |
| `.remove` | `.aiab-cart-remove` |
| `.free` | `.aiab-cart-free-shipping` |
| `.feature` | `.aiab-cart-feature` |
| `.price` | `.aiab-cart-price` |
| `.step` | `.aiab-cart-step` |

---

## Phase 4: Cleanup — checkout-flow.html

This page is closest to compliance. It already uses `.aiab-container`, `.aiab-row`, and `.aiab-col-*`.

### Fixes Required

1. **Extract 323 lines of inline `<style>`** into `examples/css/checkout-flow.css`
2. **Remove local `.aiab-btn` redefinition** — if the framework button styles are insufficient, extend with a modifier class (e.g., `.aiab-btn.aiab-checkout-submit`) rather than overriding the base class
3. **Remove local `.aiab-form-group` redefinition** — same approach, use modifier
4. **Prefix remaining non-namespaced classes:**

| Current Class | New Class |
|--------------|-----------|
| `.btn-primary` | `.aiab-btn .aiab-btn-primary` (framework) |
| `.btn-secondary` | `.aiab-btn .aiab-btn-secondary` (framework) |
| `.checkout-form` | `.aiab-checkout-form` |
| `.payment-methods` | `.aiab-checkout-payment` |
| `.order-review` | `.aiab-checkout-review` |

5. **Add mobile breakpoint at 480px** — currently missing. Content should stack to single column below tablet.

---

## Phase 5: Verification

### Grid Compliance Check
```bash
for f in examples/e-commerce-cart.html examples/shopping-cart-modern.html examples/checkout-flow.html; do
  echo "=== $f ==="
  echo "aiab-container: $(grep -c 'aiab-container' $f)"
  echo "aiab-row: $(grep -c 'aiab-row' $f)"
  echo "aiab-col: $(grep -c 'aiab-col-' $f)"
  echo "Inline style blocks: $(grep -c '<style' $f)"
  echo "Non-aiab classes:"
  grep -oP 'class="[^"]*"' "$f" | tr '"' '\n' | tr ' ' '\n' | grep -v '^$' | grep -v '^class=' | grep -v '^aiab-' | sort -u | head -20
done
```

### Expected Results
- All 3 files use `.aiab-container` > `.aiab-row` > `.aiab-col-*` for primary layout
- Zero inline `<style>` blocks (all extracted to external files)
- Zero non-namespaced custom classes (only standard HTML attributes and framework classes remain)
- No redefinitions of `.aiab-btn`, `.aiab-tooltip`, `.aiab-form-group`, or any other framework class

### Visual Spot Check
Open each page in the dev server (`bun run dev`) and confirm:
- Navigation matches other example pages
- Two-column layout (cart items + summary) renders correctly
- Content stacks on mobile viewport (390px)
- Brand orange (#ED8B00) appears via CSS variables, not hardcoded

---

## Commit Strategy

Single commit covering all three files:
```
Refactor e-commerce pages to use framework grid and namespace

- e-commerce-cart.html: Replace custom grid with aiab-col-11/5,
  extract 733 lines inline CSS to external file, prefix 70+ classes
- shopping-cart-modern.html: Add framework integration, replace
  custom :root vars with design tokens, prefix 65+ classes
- checkout-flow.html: Extract inline CSS, remove framework class
  redefinitions, prefix remaining 30+ classes
- Add site navigation to cart pages missing it
- All custom classes now use aiab-cart-* or aiab-checkout-* prefix
```

---

## Constraints

- **Do NOT modify framework CSS files** (anything in `src/css/`). Only create new external stylesheets for the cart/checkout pages.
- **Do NOT change the functional behavior** of quantity selectors, remove buttons, or checkout form validation. Only change structure and class names.
- **Preserve all existing content and product data** — images, prices, descriptions stay the same.
- **Use the existing grid system** — check `src/css/grid-modern.css` for available column classes. The grid is 16 columns.
- **Check design tokens** before inventing new CSS variables — `src/css/tokens/design-tokens.css` likely already has what you need.
