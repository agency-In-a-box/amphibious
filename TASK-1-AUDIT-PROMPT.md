# Task 1: Design Consistency Audit — Amphibious 2.0 Documentation Site

## Objective

Systematically audit every HTML page in the Amphibious docs and examples directories for design consistency issues. Produce a structured diagnostic report — no fixes in this task, just cataloging problems.

## Context

The Amphibious 2.0 documentation site has ~97 HTML pages across `docs/`, `examples/`, and root. Screenshots reveal three categories of problems:

1. **Theme inconsistency** — Pages should render in light mode but some show dark mode styles because only 3 files (`index.html`, `docs/foundation.html`, `examples/dark-mode-demo.html`) explicitly set `data-theme`. The remaining ~94 pages fall through to OS system preference via `@media (prefers-color-scheme: dark)`.
2. **Duplicate navigation** — Some pages appear to render the nav/menu structure more than once. All pages use hardcoded `<nav>` markup (no working include system). Need to identify which files have duplicate `<nav>` blocks or duplicate menu structures.
3. **Layout breakage** — The shopping cart pages (`examples/e-commerce-cart.html`, `examples/shopping-cart-modern.html`) have broken layouts that don't conform to the `.aiab-col-*` 16-column grid system.

## Instructions

### Step 1: Theme State Audit

For every `.html` file in `docs/`, `examples/`, and project root:

```bash
# Check which files set data-theme explicitly
grep -rl "data-theme" docs/ examples/ index.html sitemap.html

# Check which files have dark-mode-toggle
grep -rl "data-dark-mode-toggle" docs/ examples/ index.html sitemap.html

# Check which files import dark-mode.css or dark-mode-toggle.js
grep -rl "dark-mode" docs/ examples/ index.html sitemap.html
```

Produce a table with columns:
| File | has data-theme | data-theme value | has dark-mode-toggle | imports dark-mode CSS | imports dark-mode-toggle JS |

Flag every file that does NOT explicitly set `data-theme="light"` — these are vulnerable to system-preference dark mode bleeding through.

### Step 2: Navigation Duplication Audit

For every `.html` file:

```bash
# Count <nav occurrences per file
for f in $(find docs/ examples/ -name "*.html"); do
  count=$(grep -c "<nav" "$f" 2>/dev/null)
  if [ "$count" -gt 1 ]; then
    echo "DUPLICATE NAV: $f has $count <nav> elements"
  fi
done

# Also check for duplicate .aiab-site-nav
for f in $(find docs/ examples/ -name "*.html"); do
  count=$(grep -c "aiab-site-nav" "$f" 2>/dev/null)
  if [ "$count" -gt 1 ]; then
    echo "DUPLICATE SITE-NAV: $f has $count .aiab-site-nav references"
  fi
done
```

Produce a list of every file with more than one `<nav>` block. Note whether the duplication is:
- Two separate `<nav class="aiab-site-nav">` blocks (full duplicate)
- One `aiab-site-nav` plus a secondary contextual `<nav>` (legitimate — e.g., sidebar nav)
- Inline nav + an attempted include of `navigation-include.html`

### Step 3: Color Consistency Audit

Check CSS variable usage and inline style overrides:

```bash
# Find inline styles that override theme colors
grep -rn "style=.*background.*#\|style=.*color.*#" docs/ examples/ --include="*.html"

# Find hardcoded color values that should be CSS variables
grep -rn "#ED8B00\|#ed8b00\|#000000\|#ffffff\|#FFFFFF" docs/ examples/ --include="*.html"

# Check for inconsistent CSS imports (different pages loading different stylesheets)
for f in $(find docs/ examples/ -name "*.html"); do
  echo "=== $f ==="
  grep -o 'href="[^"]*\.css"' "$f" 2>/dev/null
  grep -o "from ['\"][^'\"]*\.css['\"]" "$f" 2>/dev/null
done
```

Flag:
- Pages with inline color overrides that conflict with the design token system
- Pages importing different CSS files than the standard `src/css/main.css` pipeline
- Any hardcoded hex colors that should be using `var(--aiab-*)` custom properties

### Step 4: Layout & Grid Audit — Shopping Cart Focus

For `examples/e-commerce-cart.html` and `examples/shopping-cart-modern.html`:

1. Check if they use `.aiab-col-*` grid classes or custom/inline layout CSS
2. Document every inline `<style>` block and its line count
3. List every CSS class used that is NOT in the `.aiab-` namespace
4. Check if the responsive breakpoints match the framework's breakpoint system
5. Note any hardcoded pixel widths that should be grid-based

```bash
# Count inline style blocks
grep -c "<style" examples/e-commerce-cart.html examples/shopping-cart-modern.html

# Find non-aiab classes
grep -oP 'class="[^"]*"' examples/e-commerce-cart.html | grep -v "aiab-" | sort -u

# Find hardcoded widths
grep -oP '\b\d+px\b' examples/e-commerce-cart.html | sort | uniq -c | sort -rn
```

### Step 5: Cross-Page Consistency Check

Compare the `<head>` section of 5 representative pages to identify inconsistencies:
- `docs/index.html` (main hub)
- `docs/form.html` (form docs)
- `docs/function.html` (function docs)
- `examples/e-commerce-catalog.html` (example page)
- `examples/e-commerce-cart.html` (problem page)

Check for differences in:
- Meta tags (viewport, charset, description)
- CSS import order
- JS module imports
- Font loading approach
- Favicon references

## Output Format

Produce a markdown file called `AUDIT-REPORT.md` in the project root with this structure:

```markdown
# Amphibious 2.0 — Design Consistency Audit Report
**Date:** [today]
**Scope:** All HTML files in docs/, examples/, and project root

## Executive Summary
- Total files audited: X
- Files missing explicit light theme: X/Y
- Files with duplicate navigation: X
- Files with inline color overrides: X
- Shopping cart grid compliance: PASS/FAIL

## 1. Theme State Findings
[Table from Step 1]

## 2. Navigation Duplication Findings
[List from Step 2]

## 3. Color Consistency Findings
[Flags from Step 3]

## 4. Shopping Cart Layout Findings
[Analysis from Step 4]

## 5. Cross-Page Head Consistency
[Diff from Step 5]

## Priority Fix List
Ordered by impact:
1. [highest impact issue]
2. ...
3. ...
```

## Constraints

- **Do NOT modify any files.** This is a read-only audit.
- **Do NOT skip legacy/theme files** — audit everything, but flag legacy files separately so we can decide whether to include them in subsequent fix tasks.
- **Be specific** — cite file paths, line numbers, and exact markup when reporting issues.
- **Use the CLAUDE.md** in the project root for namespace conventions and architecture context.
