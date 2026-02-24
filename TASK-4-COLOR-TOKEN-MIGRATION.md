# Task 4: P3 — Color Token Migration

## Objective

Replace 286 hardcoded `#ED8B00` instances across 66 files with the CSS custom property from the design token system. Also standardize the competing gray palettes (Bootstrap vs Tailwind) and extract the 23 duplicate framework banner inline styles into a reusable class.

**Read `AUDIT-REPORT.md`, `CLAUDE.md`, and `src/css/tokens/design-tokens.css` before starting.**

---

## Phase 1: Identify the Canonical CSS Variable

Before replacing anything, confirm the correct variable name for the brand orange.

```bash
# Find how the brand color is defined in design tokens
grep -rn "ED8B00\|ed8b00" src/css/tokens/ src/css/main.css

# Find any existing CSS custom property for primary color
grep -rn "\-\-.*primary" src/css/tokens/design-tokens.css

# Check what dark-mode-demo.html uses (the one file that does it right)
grep -n "var(--" examples/dark-mode-demo.html | head -20
```

The variable is likely one of:
- `var(--aiab-color-primary)`
- `var(--color-primary)`
- `var(--apple-orange-500)`

Use whatever is already defined in `design-tokens.css`. If none exists, create one:
```css
:root {
  --aiab-color-primary: #ED8B00;
  --aiab-color-primary-hover: #c97400;  /* ~10% darker, already used in 33 files */
  --aiab-color-primary-active: #a85f00; /* ~20% darker */
}
```

Add this to `src/css/tokens/design-tokens.css` if it doesn't already exist there.

---

## Phase 2: Replace #ED8B00 in CSS Files

### Scope: `src/css/` directory

These are the framework CSS files — highest priority because they cascade to every page.

```bash
grep -rn "#ED8B00\|#ed8b00" src/css/ --include="*.css"
```

**Replace pattern:**
| Context | Current | Replacement |
|---------|---------|------------|
| `color:` | `#ED8B00` | `var(--aiab-color-primary)` |
| `background:` / `background-color:` | `#ED8B00` | `var(--aiab-color-primary)` |
| `border-color:` / `border:` | `#ED8B00` | `var(--aiab-color-primary)` |
| `box-shadow:` | `#ED8B00` | `var(--aiab-color-primary)` |
| `outline:` | `#ED8B00` | `var(--aiab-color-primary)` |
| Gradient `linear-gradient(...)` | `#ED8B00` | `var(--aiab-color-primary)` |
| `fill:` / `stroke:` (SVG) | `#ED8B00` | `var(--aiab-color-primary)` |

**Also replace the hover/dark variant:**
| Current | Replacement |
|---------|------------|
| `#c97400` (hover orange) | `var(--aiab-color-primary-hover)` |
| `#b36800` or similar darker | `var(--aiab-color-primary-active)` |

### Constraint: Do NOT replace inside `design-tokens.css` definitions

The token definition itself must keep the raw hex:
```css
/* KEEP this as-is */
:root {
  --aiab-color-primary: #ED8B00;
}
```

Only replace *usages* of the hex value with the variable reference.

---

## Phase 3: Replace #ED8B00 in HTML Files

### Inline `style=""` Attributes

```bash
grep -rn 'style=.*#ED8B00\|style=.*#ed8b00' docs/ examples/ demos/ --include="*.html"
```

For inline styles on HTML elements, replace the hex with the variable:

```html
<!-- Before -->
<div style="background: #ED8B00; padding: 8px;">

<!-- After -->
<div style="background: var(--aiab-color-primary); padding: 8px;">
```

### Inline `<style>` Blocks

Same replacement inside `<style>` tags within HTML files. These are the ~25 pages with large inline style blocks.

### SVG Elements

Some SVGs have `fill="#ED8B00"` or `stroke="#ED8B00"` as attributes, not CSS. These can use `currentColor` with a parent CSS rule, or keep the variable in a `style` attribute:

```html
<!-- Before -->
<svg><path fill="#ED8B00" d="..."/></svg>

<!-- After — use style attribute for CSS variable -->
<svg><path style="fill: var(--aiab-color-primary)" d="..."/></svg>
```

If the SVG is in an `<img src="">` tag (external file), it can't use CSS variables — leave those alone and note them in the commit message.

---

## Phase 4: Framework Banner Class

23 files have this identical inline-styled banner:

```html
<div style="background: #ED8B00; padding: 8px 16px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px;">
    <a href="..." style="color: white; text-decoration: none;">← Back to Examples</a>
    <span style="color: rgba(255,255,255,0.6); margin: 0 8px;">|</span>
    <a href="/" style="color: white; text-decoration: none;">Amphibious Framework</a>
</div>
```

### Step 1: Create the class

Add to `src/css/atoms/` or `src/css/molecules/` — wherever framework banners belong:

```css
/* Framework banner — appears on legacy/theme example pages */
.aiab-framework-banner {
  background: var(--aiab-color-primary);
  padding: 8px 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
}

.aiab-framework-banner a {
  color: white;
  text-decoration: none;
}

.aiab-framework-banner a:hover {
  text-decoration: underline;
}

.aiab-framework-banner .aiab-framework-banner-sep {
  color: rgba(255, 255, 255, 0.6);
  margin: 0 8px;
}
```

### Step 2: Import it in `main.css`

Add the import in the atoms section of `src/css/main.css`.

### Step 3: Replace all 23 instances

```html
<!-- Before (23 copies of this) -->
<div style="background: #ED8B00; padding: 8px 16px; ...">
    <a href="..." style="color: white; ...">← Back to Examples</a>
    <span style="color: rgba(255,255,255,0.6); margin: 0 8px;">|</span>
    <a href="/" style="color: white; ...">Amphibious Framework</a>
</div>

<!-- After -->
<div class="aiab-framework-banner">
    <a href="...">← Back to Examples</a>
    <span class="aiab-framework-banner-sep">|</span>
    <a href="/">Amphibious Framework</a>
</div>
```

Note: The `href` for "Back to Examples" varies per file — preserve each file's specific link target.

---

## Phase 5: Gray Palette Decision

The audit found two competing gray systems. **Standardize on one.**

Check which palette the design tokens already define:

```bash
grep -n "gray\|grey\|neutral\|slate" src/css/tokens/design-tokens.css
```

Whichever system is in the tokens file is canonical. Map the other system's values to the nearest token:

| If tokens use Bootstrap-style | Map Tailwind values to → |
|------------------------------|-------------------------|
| `#dee2e6` (border) | Replace `#e5e7eb` with `var(--aiab-border)` |
| `#6c757d` (muted) | Replace `#718096` with `var(--aiab-text-muted)` |
| `#e9ecef` (light bg) | Replace `#e2e8f0` with `var(--aiab-surface-secondary)` |

**Do NOT do a blind find-replace across all files for grays.** These appear in different contexts and some may be intentional. Instead:

1. Replace grays in `src/css/` files (framework CSS) — these are definitive
2. Replace grays in HTML inline styles only where they clearly serve the same semantic purpose as the token (borders, muted text, light backgrounds)
3. Leave grays in legacy theme files alone (pea.rs, green, classic)

---

## Phase 6: Verification

```bash
# Count remaining hardcoded #ED8B00 (should only be in design-tokens.css definition)
echo "Remaining #ED8B00:"
grep -rn "#ED8B00\|#ed8b00" src/css/ docs/ examples/ demos/ --include="*.css" --include="*.html" | grep -v "design-tokens.css" | wc -l

# Verify the variable is defined
grep "aiab-color-primary" src/css/tokens/design-tokens.css

# Check no broken var() references
grep -rn "var(--aiab-color-primary)" src/css/ --include="*.css" | head -10

# Count framework banner conversions
grep -rl "aiab-framework-banner" examples/ docs/ | wc -l
# Expected: 23

# Verify banner class exists in CSS
grep "aiab-framework-banner" src/css/atoms/*.css src/css/molecules/*.css
```

### Expected Results
- `#ED8B00` appears only in `design-tokens.css` (the definition) and possibly in a handful of SVG `<img>` src files that can't use CSS variables
- All 23 framework banners use the `.aiab-framework-banner` class
- Zero inline `style="background: #ED8B00"` anywhere in the project

---

## Commit Strategy

Two commits:

### Commit 1: Brand color token migration
```
Replace 286 hardcoded #ED8B00 with var(--aiab-color-primary)

Migrates all brand orange references in CSS and HTML to use the
design token custom property. Also replaces #c97400 hover variant
with var(--aiab-color-primary-hover). Brand color can now be
changed in one place: src/css/tokens/design-tokens.css
```

### Commit 2: Framework banner + gray standardization
```
Extract framework banner to .aiab-framework-banner class

Replaces 23 identical inline-styled banner instances with a single
reusable CSS class. Also standardizes competing Bootstrap/Tailwind
gray values to use design token variables.
```

---

## Constraints

- **Do NOT change the actual color values** — this is a refactor, not a redesign. `#ED8B00` should still be the rendered color everywhere it was before.
- **Do NOT touch legacy theme CSS files** (`css/a.mphibio.us.css`, green theme, classic theme) — they have their own color systems.
- **Preserve fallback values** where appropriate: `var(--aiab-color-primary, #ED8B00)` in critical rendering paths.
- **Test the dark mode demo page** after changes — `examples/dark-mode-demo.html` should still toggle correctly since it already uses CSS variables.
