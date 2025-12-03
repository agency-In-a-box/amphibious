# Amphibious 2.0 - Navigation & Content QA Audit Instructions

## Context

You are performing a QA audit on **Amphibious 2.0**, a modern CSS framework being prepared for public release. This is a complete rebuild of the original A.mphibio.us framework (circa 2015), modernized with Vite 6, TypeScript, and Atomic Design principles.

**Project Root**: `/Users/clivemoore/Documents/GitHub/AIAB/amphibious`

**Dev Server**: `bun run dev` → http://localhost:2960

---

## Your Mission

Perform a thorough QA analysis to ensure:

1. **Navigation Integrity**: All menu links point to existing pages
2. **Content Verification**: All linked pages have meaningful content (not empty/placeholder)
3. **Navigation Consistency**: Every page has the main navigation present and functional
4. **Link Reciprocity**: Pages referenced in the sitemap exist and are accessible

---

## Phase 1: Inventory Collection

### Step 1.1 - Collect All Navigation Links

Extract all navigation links from the main navigation structure defined in:

**Primary Navigation Sources:**
- `/index.html` - Main homepage navigation
- `/docs/navigation-include.html` - Shared navigation template

**Expected Main Navigation Structure:**

```
├── Home (/)
│   └── Dropdown:
│       ├── #what_is_it
│       ├── #how_its_made
│       ├── #gallery
│       ├── #evolution
│       └── #colophon
│
├── Foundation (/docs/foundation.html)
│   └── Dropdown:
│       ├── #core
│       ├── #grid
│       ├── #responsive_col
│       ├── #fluid_col
│       ├── #golden_section
│       ├── #push_pull
│       └── #mediaQueries
│
├── Form (/docs/form.html)
│   └── Dropdown:
│       ├── #typography
│       ├── #forms
│       ├── #multi_forms
│       ├── #custom_checkbox_radios
│       ├── #append_prepend_icons
│       ├── #datepicker_fields
│       └── #tables
│
├── Function (/docs/function.html)
│   └── Dropdown:
│       ├── #navigation
│       ├── #horizcss
│       ├── #vertnav
│       ├── #breadcrumbs
│       ├── #tabmagic
│       └── #pagination
│
├── Features (/docs/features.html)
│   └── Dropdown:
│       ├── #slides
│       ├── #helpers
│       ├── #pears
│       └── #icons
│
└── Examples (/examples/)
```

### Step 1.2 - Collect Sitemap Links

From `/sitemap.html`, extract all links. The sitemap claims these pages should exist:

**Core Pages:**
- `/index.html`
- `/sitemap.html`

**Documentation Pages:**
- `/docs/index.html`
- `/docs/getting-started.html`
- `/docs/api-reference.html`
- `/docs/carousel.html`

**Component Documentation (in /docs/components/):**
- `/docs/components/buttons.html`
- `/docs/components/grid.html`
- `/docs/components/typography.html`
- `/docs/components/forms.html`
- `/docs/components/navigation.html`
- `/docs/components/cards.html`
- `/docs/components/modals.html`
- `/docs/components/tooltips.html`
- `/docs/components/icons.html`
- `/docs/components/tables.html`
- `/docs/components/alerts.html`
- `/docs/components/tabs.html`
- `/docs/components/breadcrumbs.html`
- `/docs/components/pagination.html`
- `/docs/components/pears.html`
- `/docs/components/steps.html`
- `/docs/components/sidebar.html`
- `/docs/components/footer.html`
- `/docs/components/utilities.html`
- `/docs/components/css-variables.html`

**Example Pages (in /examples/):**
- `/examples/index.html`
- `/examples/grid-showcase.html`
- `/examples/typography-showcase.html`
- `/examples/pears-patterns.html`
- `/examples/buttons-showcase.html`
- `/examples/forms-showcase.html`
- `/examples/cards-showcase.html`
- `/examples/navigation-showcase.html`
- `/examples/modals-showcase.html`
- `/examples/tooltips-showcase.html`
- `/examples/carousel-showcase.html`
- `/examples/icons-showcase.html`
- `/examples/tables-showcase.html`
- `/examples/alerts-showcase.html`
- `/examples/tabs-showcase.html`
- `/examples/breadcrumbs-showcase.html`
- `/examples/pagination-showcase.html`
- `/examples/steps-showcase.html`
- `/examples/footer-showcase.html`
- `/examples/e-commerce-catalog.html`
- `/examples/e-commerce-product.html`
- `/examples/checkout-flow.html`
- `/examples/user-dashboard.html`
- `/examples/dashboard-template.html`
- `/examples/validation-showcase.html`
- `/examples/smooth-scroll-showcase.html`
- `/examples/theming-showcase.html`
- `/examples/utilities-showcase.html`

---

## Phase 2: File Existence Verification

### Step 2.1 - Check Each File Exists

Run the following verification for each page:

```bash
# From project root
cd /Users/clivemoore/Documents/GitHub/AIAB/amphibious

# Check main docs pages
for file in foundation.html form.html function.html features.html index.html getting-started.html api-reference.html carousel.html; do
  if [ -f "docs/$file" ]; then
    echo "✅ docs/$file exists"
  else
    echo "❌ docs/$file MISSING"
  fi
done

# Check component docs
for file in buttons.html grid.html typography.html forms.html navigation.html cards.html modals.html tooltips.html icons.html tables.html alerts.html tabs.html breadcrumbs.html pagination.html pears.html steps.html sidebar.html footer.html utilities.html css-variables.html; do
  if [ -f "docs/components/$file" ]; then
    echo "✅ docs/components/$file exists"
  else
    echo "❌ docs/components/$file MISSING"
  fi
done

# Check examples
for file in index.html grid-showcase.html typography-showcase.html pears-patterns.html buttons-showcase.html forms-showcase.html cards-showcase.html navigation-showcase.html modals-showcase.html tooltips-showcase.html carousel-showcase.html icons-showcase.html tables-showcase.html alerts-showcase.html tabs-showcase.html breadcrumbs-showcase.html pagination-showcase.html steps-showcase.html footer-showcase.html e-commerce-catalog.html e-commerce-product.html checkout-flow.html user-dashboard.html dashboard-template.html; do
  if [ -f "examples/$file" ]; then
    echo "✅ examples/$file exists"
  else
    echo "❌ examples/$file MISSING"
  fi
done
```

### Step 2.2 - Create Master Inventory

Create a structured report showing:
- Files that exist vs. files that are missing
- Files that exist but are NOT linked from navigation
- Links that point to non-existent files

---

## Phase 3: Content Verification

### Step 3.1 - Check Each Existing Page Has Content

For each existing HTML file, verify it:

1. **Has a valid HTML structure** (doctype, html, head, body tags)
2. **Has a title** that is meaningful (not empty or placeholder)
3. **Has main content** (not just a skeleton or "coming soon")
4. **Loads the framework CSS** (check for link to `/src/css/main.css` or similar)
5. **Loads the framework JS** (check for script to `/src/index.js` or `/src/index.ts`)

**Script to check content:**

```bash
# Check for meaningful content (more than just boilerplate)
for file in $(find docs examples -name "*.html" -type f ! -name "*.backup*"); do
  lines=$(wc -l < "$file")
  if [ "$lines" -lt 50 ]; then
    echo "⚠️  $file - Only $lines lines (possibly empty/placeholder)"
  else
    echo "✅ $file - $lines lines"
  fi
done
```

### Step 3.2 - Check Anchor Targets Exist

For pages with anchor links (like `/docs/foundation.html#grid`), verify:
- The target page exists
- The anchor ID exists within that page

```bash
# Example: Check anchors in foundation.html
grep -o 'id="[^"]*"' docs/foundation.html | sort -u
```

---

## Phase 4: Navigation Consistency Check

### Step 4.1 - Verify Navigation Presence on All Pages

Every documentation and example page should include the standard navigation. Check for:

1. **Navigation element** (`<nav class="site-nav">` or similar)
2. **All main menu items** present (Foundation, Form, Function, Features, Examples)
3. **Working dropdowns** with correct sub-links
4. **Logo/home link** present

**Verification Script:**

```bash
# Check each HTML file has navigation
for file in $(find docs examples -name "*.html" -type f ! -name "*.backup*"); do
  if grep -q 'class="site-nav"' "$file" || grep -q 'horizontal branded' "$file"; then
    echo "✅ $file has navigation"
  else
    echo "❌ $file MISSING navigation"
  fi
done
```

### Step 4.2 - Check Navigation Links Are Correct

Verify navigation links use correct paths:
- Absolute paths starting with `/` (e.g., `/docs/foundation.html`)
- NOT relative paths that might break (e.g., `../docs/foundation.html`)

---

## Phase 5: Cross-Reference Audit

### Step 5.1 - Footer Links

Check footer links on index.html and all pages point to valid destinations:

**Footer Links to Verify:**
- `/docs/getting-started.html`
- `/docs/grid-system.html`
- `/docs/components.html`
- `/docs/api.html`
- `/examples/pears-patterns.html`
- `/examples/e-commerce-catalog.html`
- `/examples/navigation-showcase.html`
- `/examples/showcase.html`

### Step 5.2 - Internal Links Within Content

Scan for all `<a href=` within page content and verify:
- All internal links (starting with `/` or relative) point to existing files
- No broken anchor references

---

## Phase 6: Generate QA Report

### Report Structure

Create a markdown report with these sections:

```markdown
# Amphibious 2.0 QA Audit Report
**Date**: [Date of audit]
**Auditor**: Claude Code

## Executive Summary
- Total pages audited: X
- Pages passing: X
- Pages with issues: X
- Critical issues: X
- Warnings: X

## Navigation Integrity
### ✅ Working Links
[List of all working navigation links]

### ❌ Broken Links  
[List of broken links with source page and target]

## Missing Pages
[List of pages referenced but not existing]

## Pages Missing Navigation
[List of pages without proper navigation]

## Content Issues
### Empty/Placeholder Pages
[List of pages with insufficient content]

### Missing Anchor Targets
[List of broken anchor links]

## Recommendations
1. [Priority fixes]
2. [Secondary fixes]
3. [Nice-to-have improvements]
```

---

## Appendix A: Actual Files Present

### /docs/ Directory
Files that currently exist:
- `api-reference.html`
- `carousel.html`
- `docs.css`
- `features.html`
- `form.html`
- `foundation.html`
- `function.html`
- `getting-started.html`
- `grid-system.html`
- `icons.html`
- `index.html`
- `navigation-include.html`
- `template.html`

### /docs/components/ Directory
Files that currently exist:
- `alerts.html`
- `buttons.html`
- `cards.html`
- `forms.html`
- `icons.html`
- `modal.html`
- `navigation.html`
- `pagination.html`
- `tabs.html`

### /examples/ Directory
Files that currently exist:
- `alerts-demo.html`
- `buttons-input-groups.html`
- `cards-demo.html`
- `carousel-showcase.html`
- `checkout-flow.html`
- `dashboard-template.html`
- `e-commerce-cart.html`
- `e-commerce-catalog.html`
- `e-commerce-product.html`
- `icons-enhanced.html`
- `icons.html`
- `index.html`
- `modal-enhanced.html`
- `modal.html`
- `modern-responsive-tables.html`
- `navigation-demo.html`
- `navigation-showcase.html`
- `navigation.html`
- `pears-patterns.html`
- `sidebar-demo.html`
- `tabs-pagination-steps-demo.html`
- `tooltip-enhanced.html`
- `tooltip.html`
- `user-dashboard.html`

---

## Appendix B: Known Discrepancies

Based on initial comparison, these files are referenced in sitemap/navigation but may not exist:

### Sitemap References → Missing Files
- `/docs/components/grid.html` (grid component docs)
- `/docs/components/typography.html`
- `/docs/components/modals.html` (exists as `modal.html`)
- `/docs/components/tooltips.html`
- `/docs/components/tables.html`
- `/docs/components/breadcrumbs.html`
- `/docs/components/pears.html`
- `/docs/components/steps.html`
- `/docs/components/sidebar.html`
- `/docs/components/footer.html`
- `/docs/components/utilities.html`
- `/docs/components/css-variables.html`
- `/examples/grid-showcase.html`
- `/examples/typography-showcase.html`
- `/examples/buttons-showcase.html`
- `/examples/forms-showcase.html`
- `/examples/cards-showcase.html`
- `/examples/modals-showcase.html`
- `/examples/tooltips-showcase.html`
- `/examples/icons-showcase.html`
- `/examples/tables-showcase.html`
- `/examples/alerts-showcase.html`
- `/examples/tabs-showcase.html`
- `/examples/breadcrumbs-showcase.html`
- `/examples/pagination-showcase.html`
- `/examples/steps-showcase.html`
- `/examples/footer-showcase.html`
- `/examples/validation-showcase.html`
- `/examples/smooth-scroll-showcase.html`
- `/examples/theming-showcase.html`
- `/examples/utilities-showcase.html`

### Files That Exist But Use Different Names
- `modal.html` vs `modals.html` (singular vs plural mismatch)
- `tooltip.html` vs `tooltips.html`
- `cards-demo.html` vs `cards-showcase.html`
- `alerts-demo.html` vs `alerts-showcase.html`
- `navigation-demo.html` vs `navigation-showcase.html` (both exist)

---

## Execution Commands

Run the full audit:

```bash
cd /Users/clivemoore/Documents/GitHub/AIAB/amphibious

# 1. Start dev server in background
bun run dev &
DEV_PID=$!

# 2. Wait for server to start
sleep 3

# 3. Test each link (using curl or similar)
# [Add specific test commands here]

# 4. Generate report
# [Add report generation commands]

# 5. Clean up
kill $DEV_PID
```

---

## Success Criteria

The audit is complete when:

- [ ] All navigation links verified (working or documented as broken)
- [ ] All sitemap links verified
- [ ] All pages checked for navigation presence
- [ ] All anchor links verified
- [ ] Content quality checked on all pages
- [ ] Report generated with actionable items
- [ ] Priority fixes identified

---

## Notes for Claude Code

1. **Be thorough**: Check every link, not just a sample
2. **Be specific**: When reporting issues, include exact file paths and line numbers
3. **Suggest fixes**: Don't just report problems—propose solutions
4. **Prioritize**: Mark critical issues (broken main nav) vs minor issues (missing optional page)
5. **Consider mobile**: Check if mobile navigation toggle exists where applicable
