# CLAUDE CODE CLI - Amphibious Navigation & Content QA

Copy everything below the line into Claude Code CLI:

---

## Task: Complete Navigation & Content QA Audit

You are auditing the Amphibious 2.0 CSS framework project at `/Users/clivemoore/Documents/GitHub/AIAB/amphibious`

### Your Goals:

1. **Verify every navigation link** in the main menu points to an existing page
2. **Verify every page in the sitemap** actually exists
3. **Verify every existing page** has the main navigation present
4. **Verify all pages** have meaningful content (not empty/placeholder)
5. **Identify naming mismatches** (e.g., `modal.html` vs `modals.html`)

### Step 1: Read the context files first

```
Read these files to understand the project:
- /Users/clivemoore/Documents/GitHub/AIAB/amphibious/CLAUDE.md
- /Users/clivemoore/Documents/GitHub/AIAB/amphibious/QA-NAVIGATION-AUDIT.md
```

### Step 2: Extract navigation links from index.html

The main navigation is in `/Users/clivemoore/Documents/GitHub/AIAB/amphibious/index.html`

Extract all `href` values from the `<nav class="site-nav">` element.

### Step 3: Extract all links from sitemap.html

The sitemap is at `/Users/clivemoore/Documents/GitHub/AIAB/amphibious/sitemap.html`

Extract every internal link (anything starting with `/` or relative paths).

### Step 4: Check file existence

For each unique URL found, verify the corresponding file exists:
- `/docs/foundation.html` → check `docs/foundation.html` exists
- `/examples/` → check `examples/index.html` exists
- etc.

Use the filesystem tools to verify each file.

### Step 5: Check navigation presence

For every HTML file in `/docs/` and `/examples/` directories (excluding backup files), verify:
- Contains `<nav` element with class `site-nav` OR `horizontal branded`
- Contains links to all main sections: Foundation, Form, Function, Features, Examples

### Step 6: Check for content

For each HTML file, verify:
- File is more than 50 lines (not just a skeleton)
- Has a `<title>` tag with meaningful content
- Has a `<main>` or primary content section

### Step 7: Check anchor targets

For navigation links with anchors like `/docs/foundation.html#grid`:
- Verify the target page exists
- Verify the anchor ID exists within that page (look for `id="grid"`)

### Step 8: Generate Report

Create a comprehensive report at `/Users/clivemoore/Documents/GitHub/AIAB/amphibious/QA-REPORT.md` with:

```markdown
# Amphibious 2.0 QA Report
Generated: [timestamp]

## Summary
- Total unique links found: X
- Working links: X  
- Broken links: X
- Pages missing navigation: X
- Pages with insufficient content: X

## Critical Issues (Must Fix Before Launch)
[List any completely broken navigation, missing core pages]

## Missing Pages
[List every referenced page that doesn't exist, with the source of the reference]

## Broken Anchor Links
[List any #anchor links where the ID doesn't exist in the target page]

## Pages Missing Navigation
[List any pages in /docs or /examples that lack the main navigation]

## Naming Inconsistencies
[Note any singular/plural mismatches like modal vs modals]

## Content Quality Issues  
[Pages that exist but appear to be empty/placeholder]

## Recommendations
[Prioritized list of fixes needed]
```

### Expected Results

Based on initial analysis, you'll likely find:

**Missing Component Docs:**
- grid.html, typography.html, modals.html (exists as modal.html), tooltips.html, tables.html, breadcrumbs.html, pears.html, steps.html, sidebar.html, footer.html, utilities.html, css-variables.html

**Missing Example Showcases:**
- Many `-showcase.html` files are referenced but don't exist (the actual files use `-demo.html` suffix instead)

**Naming Mismatches:**
- `modal.html` vs `modals.html` 
- `tooltip.html` vs `tooltips.html`
- `-demo.html` vs `-showcase.html` patterns

### When Complete

After generating the report, provide a brief summary of:
1. How many critical issues found
2. Top 3 priority fixes needed
3. Overall assessment of launch readiness
