# Task 2: P0 Theme Consistency + P1 Navigation Fixes

## Objective

Two surgical fix passes across the Amphibious documentation site:
1. **P0** — Add `data-theme="light"` to every page that loads `main.css` or `dark-mode.css` but lacks an explicit theme declaration (~55 files)
2. **P1** — Fix 4 navigation duplication/nesting issues identified in AUDIT-REPORT.md

**Read `AUDIT-REPORT.md` and `CLAUDE.md` in the project root before starting.**

---

## P0: Theme Consistency — `data-theme="light"`

### The Problem

Zero pages in the project set `data-theme="light"` on the `<html>` element. The dark mode CSS uses this rule:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { /* dark mode styles */ }
}
```

Any page loading `main.css` (which imports `dark-mode.css`) will render in dark mode on systems with dark OS preference. Users see inconsistent theming across the docs site depending on their OS settings.

### The Fix

For every HTML file that loads `main.css`, `dark-mode.css`, or `dist/amphibious.css`:

**Change:**
```html
<html lang="en">
```

**To:**
```html
<html lang="en" data-theme="light">
```

### Scope Rules

**DO modify** — files that load the framework CSS and are vulnerable to dark mode bleed-through:
- All files in `docs/` (except `docs/navigation-include.html` which is a partial)
- All files in `examples/` that import `main.css` or `dist/amphibious.css`
- All files in `demos/` that import framework CSS
- `index.html` and `sitemap.html` in project root

**DO NOT modify:**
- `examples/dark-mode-demo.html` — this page intentionally supports dark mode toggling
- Legacy pages that don't load framework CSS (pea.rs, green/classic themes, font specimens) — they're unaffected
- Any file that is a partial/snippet without an `<html>` tag (e.g., `docs/navigation-include.html`, `includes/navigation.html`)
- Any file already correctly handling theme via JS toggle (`index.html` gets the attribute BUT keep the toggle JS intact)

### Special Case: index.html

`index.html` has the dark mode toggle JS. Add `data-theme="light"` as the default so the page loads light, but the toggle JS can still switch it. The toggle JS sets `data-theme` dynamically, so the HTML attribute just provides the safe default.

### Verification

After all changes, run:
```bash
# Count files with data-theme="light"
grep -rl 'data-theme="light"' docs/ examples/ demos/ index.html sitemap.html | wc -l

# Confirm no file loads dark-mode CSS without having data-theme
for f in $(grep -rl "dark-mode\|main\.css\|amphibious\.css" docs/ examples/ demos/ index.html sitemap.html --include="*.html"); do
  if ! grep -q 'data-theme=' "$f" 2>/dev/null; then
    echo "MISSING THEME: $f"
  fi
done

# The only file that should load dark CSS without data-theme="light" is dark-mode-demo.html
# (it uses the toggle JS to manage theme state)
```

Expected result: 0 files reported as MISSING THEME (except `dark-mode-demo.html` which is intentional).

---

## P1: Navigation Fixes — 4 Files

### Fix 1: `docs/form.html` — Remove Duplicate Navigation

**Problem:** Two full navigation menus render on the page.
- Line ~426: Modern `<nav class="aiab-site-nav">` with current menu structure
- Line ~1374: Legacy nav with outdated labels ("Symantic Grid", "E.volution")

**Action:** Delete the entire legacy navigation block (the one near line 1374 with old-style naming). Keep the modern `aiab-site-nav` block. Search for the legacy nav by its distinctive content strings: "Symantic Grid" or "E.volution" to locate it precisely.

**Verify:** After fix, `grep -c "aiab-site-nav" docs/form.html` should return `1`.

### Fix 2: `examples/form-validation-demo.html` — Fix Nested Nav-in-Nav

**Problem:** `<nav id="main-nav" class="main-nav">` is nested inside `<nav class="aiab-site-nav">`, creating invalid semantic structure.

**Action:** Change the inner `<nav id="main-nav" class="main-nav">` to `<div id="main-nav" class="main-nav">`. Update the corresponding closing `</nav>` to `</div>`.

**Verify:** Ensure only one `<nav` element with `aiab-site-nav` remains as the outer wrapper.

### Fix 3: `examples/accordion-demo.html` — Fix Nested Nav-in-Nav

**Problem:** Same pattern as Fix 2 — inner `<nav>` nested in outer `<nav class="aiab-site-nav">`.

**Action:** Same fix — change inner `<nav id="main-nav" class="main-nav">` to `<div>`.

### Fix 4: `examples/avatar-demo.html` — Fix Nested Nav-in-Nav

**Problem:** Same pattern as Fixes 2 and 3.

**Action:** Same fix — change inner `<nav>` to `<div>`.

### Navigation Verification

After all nav fixes:
```bash
# Check no duplicate aiab-site-nav in form.html
grep -c "aiab-site-nav" docs/form.html
# Expected: 1

# Check no nested nav-in-nav in the three fixed files
for f in examples/form-validation-demo.html examples/accordion-demo.html examples/avatar-demo.html; do
  echo "=== $f ==="
  # Count nav elements — should be exactly 1 (the outer aiab-site-nav)
  # plus any legitimate secondary navs (breadcrumbs, pagination demos)
  grep -c "<nav " "$f"
done

# Quick structural check — no <nav> should appear inside another <nav>
for f in examples/form-validation-demo.html examples/accordion-demo.html examples/avatar-demo.html; do
  python3 -c "
import re
with open('$f') as fh:
    content = fh.read()
# Find nested nav pattern
nested = re.findall(r'<nav[^>]*>.*?<nav[^>]*>', content, re.DOTALL)
if nested:
    print(f'NESTED NAV FOUND in $f: {len(nested)} instances')
else:
    print(f'$f: CLEAN')
"
done
```

---

## Commit Strategy

Make two separate commits:

### Commit 1: P0 Theme Consistency
```
Add data-theme="light" to all framework-loading pages

Prevents uncontrolled dark mode bleed-through on ~55 pages that
load main.css/dark-mode.css but had no explicit theme declaration.
Users with dark OS preference were seeing inconsistent theming
across the documentation site.
```

### Commit 2: P1 Navigation Fixes
```
Fix duplicate and nested navigation markup

- Remove legacy duplicate nav from docs/form.html
- Fix nested nav-in-nav on 3 example pages (change inner <nav> to <div>)
```

---

## Constraints

- **Do NOT modify CSS files** — this task is HTML-only.
- **Do NOT remove or alter the dark mode toggle JS** on pages that have it.
- **Do NOT change any page's visual appearance** beyond correcting the light theme default.
- **Do NOT touch legacy/theme pages** that aren't loading the modern framework CSS.
- **Preserve all existing attributes** on `<html>` tags (lang, class, etc.) — only add `data-theme="light"`.
