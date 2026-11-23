# Task 6: Live Site QA — make the deployed site match the source

## Objective

The deployed docs site (https://amphibious-aiab.netlify.app) is broken in ways the source-level audits (9.0/10) never measured. On 2026-11-23 a crawl of the live deploy (main @ 535c578) found missing CSS, scripts that browsers refuse to run, icons rendering as □, dark-mode styles leaking into light mode, and broken nav anchors on every page.

Fix the causes, not the symptoms. Leave behind a check that fails the build if any of this comes back.

**Read `CLAUDE.md` and this file before starting.** The full row-level list is `qa/2026-11-23-live-findings.csv` (1,193 rows; filter by `type`). `qa/live-site-crawl.py` is the crawler that produced it.

---

## Ground rules

- Work on a branch: `fix/live-site-qa`. Netlify deploys `main` on push, so **never push to main**. Open a PR and verify against the Netlify deploy preview.
- Make one commit per phase, using conventional commit messages as in the existing history. Before each commit, run `bun run lint`, `bun run format:check`, `bun run typecheck` and the tests (in batches, per the segfault note in CLAUDE.md).
- CLAUDE.md rules apply: no hacks, no `!important`, `.aiab-` on classes only, `@custom-media` tokens instead of px.
- **Stop and ask Clive** before deleting any page, changing a public URL, or adding a runtime dependency. Dev dependencies are fine.
- Decisions already made by Clive (2026-11-23): **rebuild every legacy page** (Phase 4, no archiving) and the public repo URL is **https://github.com/agency-In-a-box/amphibious** (Phase 5). Don't re-ask.
- CLAUDE.md is stale in places. Vite is `^7.3.1`, not 6. Most pages do not get icons from the Lucide CDN (see Phase 3). Correct CLAUDE.md in Phase 6.

## Baseline (production, 2026-11-23)

| Check | Result |
|---|---|
| Live pages (200) | 104 |
| Pages with no working stylesheet | 11 |
| Pages with some CSS missing | 22 |
| Icon slots rendering as □ | 143 on 13 pages (65 icon names) |
| Icons that never render (page loads no script) | 11 on docs/getting-started |
| Broken internal link targets | 42 |
| Broken in-page anchors | 149 distinct, 640 instances, 62 pages |
| Missing scripts / module imports | 22 scripts, 2 imports, 1 `.ts` blocked by MIME type |
| Stylesheets with `@media (--bp-*)` served raw | 24 |
| Dead or placeholder external links | 14 |

---

## Phase 0: Reproduce (15 min)

1. `pip install requests beautifulsoup4`, then run `qa/live-site-crawl.py` against production (usage is in the file header). Confirm the numbers roughly match the baseline.
2. Run `bun run build:site`, serve the output with `bunx serve <outdir> -l 4173` (serve strips `.html`, as Netlify does), and crawl it with `QA_BASE=http://localhost:4173`. This local loop is your test harness for every phase.

## Phase 1: Replace the copy-and-regex site build (root cause)

**Problem.** `build:site` runs the library build and then `scripts/build-site.js`. That script copies raw HTML, CSS and `.ts` files into `dist/` and patches a few patterns with regex. This causes:

- `.ts` files served to browsers. The strip regex `\/src\/js\/\w+\.ts` doesn't match hyphens, so `/src/js/dark-mode-toggle.ts` ships. Netlify serves it as `text/vnd.trolltech.linguist` and the browser refuses the module. The toggle is dead on `/docs/foundation` and `/examples/dark-mode-demo`; the homepage only survives because of an inline script.
- Page CSS served without PostCSS, so 24 stylesheets' `@media (--bp-*)` queries never match. No shipping browser supports `@custom-media`. This hits the e-commerce catalog, cart, product and checkout CSS (e.g. `examples/e-commerce-catalog.css:699`), the theme CSS, `foundation-fixes.css`, and `src/css/**` files that demo pages link directly.
- Demo scripts pointing at files that don't exist: `/src/js/accordion.js`, `color-picker.js`, `range-slider.js`, `timeline.js` and `form-builder.js`, plus imports of `/src/js/carousel.js` and `/src/js/index.js` (carousel-showcase, modal). Those demos do nothing.
- Missing files ship silently.

**Target.** A real Vite multi-page build for every deployable HTML page.

- Start from `vite.config.docs.js`. Replace its 18 hand-listed inputs with a glob over `index.html`, `sitemap.html`, `docs/**`, `examples/**` and `demos/**`. Exclude `_archive/`.
- Let pages reference source directly (`/src/css/main.css`, `/src/index.ts`, the Task 5 standard head) and let Vite bundle it. Delete the rewrite step, not just its regexes.
- Keep the npm library build (`vite.config.js` → `dist/`) separate. Output the site to its own directory (e.g. `dist-site/`) and update `netlify.toml` `publish`.
- Output paths must mirror source paths (`docs/foundation.html` → `<out>/docs/foundation.html`) so live URLs don't change.
- Convert the demo `<script src="/src/js/*.js">` tags to module imports Vite can resolve.

**Acceptance**

- `build:site` no longer runs `build-site.js`.
- The output contains no `.ts` files and no HTML that references `/src/`.
- Built CSS contains 0 instances of `@media (--`.
- A local crawl shows 0 `stylesheet-broken`, `script-broken`, `js-import-broken` and `css-raw-custom-media`.
- Vite leaves an unresolvable `<link href>` in place with only a warning. Until Phase 6, the crawl is the gate, not the build.

**Fallback (timebox: 1 hour of blockers).** Harden `build-site.js` instead:

1. Run PostCSS over every copied CSS file.
2. Map `/src/js/[\w-]+\.ts` script tags to the bundle.
3. Fail the script if any referenced file is missing from the output.

Tell Clive which path you took and why.

## Phase 2: Stop the dark-mode leak

**Symptom.** When the OS is in dark mode, every checkbox and radio renders #111827, even on pages hard-set to `data-theme="light"`. Confirmed in Chrome on `/examples/e-commerce-catalog`: the computed background is `rgb(17, 24, 39)` and `matches(':read-only')` is true.

**Cause 1.** `src/css/forms/validation-states.css:548-549` sets `input:read-only, textarea:read-only { background-color: #111827 }` inside `@media (prefers-color-scheme: dark)`. Under the spec, checkboxes and radios match `:read-only`. Lines 106–108 have the same selector in light mode, so check what they set too. Restrict both rules to text-entry inputs.

**Cause 2, the systemic one.** The built `amphibious.css` has **140 rules** inside `@media (prefers-color-scheme: dark)` with no `:root:not([data-theme="light"])` guard. Commit 16dc481 added `data-theme="light"` to pages, but the CSS ignores it. Fix at the source, following CLAUDE.md's dark-mode architecture. If hand-editing would be messy, write a small PostCSS plugin that guards unguarded selectors inside those blocks.

**Acceptance**

- A new test in `test/theme-cascade.test.ts` parses the built CSS and fails on any unguarded rule inside a dark media block.
- In Chrome, with OS dark and `data-theme="light"`, the catalog's filter checkboxes are white.

## Phase 3: Icons

**Facts**

- `src/js/icons-lightweight.ts` ships 31 icons. Any other `data-lucide` name is replaced with "□" on purpose (the fallback branch in `initializeIcons`). Pages use 65 names outside the set, giving 143 □ on 13 pages: e-commerce-catalog 27, dashboard-template 21, user-dashboard 21, e-commerce-product 20, modal-enhanced 12, tooltip-enhanced 9, icons 8, e-commerce-cart 7, and the rest in the CSV.
- In `src/js/icons.ts`, `createIcons` is a mock no-op, so the public `Icon` / `EcommerceIcons` API renders nothing real. Flag this to Clive; don't silently remove public API.
- The namespace script corrupted three icon names:
  - `data-lucide="aiab-tag"` at `examples/e-commerce-catalog.html:160` and `examples/e-commerce-product.html:140`
  - `"aiab-alert-triangle"` at `docs/getting-started.html:349`

  Fix them, and fix `scripts/add-aiab-namespace.js` so it skips `data-lucide` values.
- `docs/getting-started.html` loads no script at all, so its 11 icons are blank.
- `index.html` and `docs/cowork-demo.html` load unpinned `unpkg.com/lucide@latest`.

**Target**

- Generate the icon map at build time from a `lucide-static` (or `lucide`) dev dependency, including only the names used in HTML and TS so the bundle stays small.
- Make the build fail on an unknown icon name.
- Remove the □ fallback, or keep it with a `console.error` in dev only.
- Remove or pin the CDN scripts so every page uses one icon path.

**Acceptance**

- The crawl reports 0 icons outside the shipped set.
- Chrome shows 0 `span[role=img]` placeholders on the catalog.
- The bundle stays under the 2MB CI limit. Report the size change.

## Phase 4: Legacy 2013 pages (decision: rebuild all)

These pages reference the original framework's files: `/css/a.mphibio.us.css`, `/css/a.mphibio.us.min.css`, `/js/plugins.js`, `/js/scripts.js`, `/js/js/modernizr-2.6.2.min.js` and more. **None of those files exist anywhere in the repo.**

| Pages | State |
|---|---|
| examples/buttons-input-groups (linked from the Examples index) | no CSS at all |
| examples/modern-responsive-tables (linked from the Examples index) | legacy sheet missing |
| examples/pea.rs/* (9 pages), docs/tests/fluid | no CSS at all |
| examples/themes/classic/* (8), themes/green/* (7) | a.mphibio.us.css + flexslider missing |
| examples/themes/ index, themes/modern-saas (2) | site-nav.css / main-atomic.css missing |
| demos/apple-redesign | relative path resolves to `/demos/src/css/…` |

Note that `examples/buttons-input-groups-broken.html` loads fine; the file named "broken" is the working one. Diff the two before choosing.

**Decision (Clive, 2026-11-23): rebuild every page in the table on the current framework. No archiving.**

- Keep each page at its current URL.
- Use the Task 5 standard head and the framework's own CSS/JS (through the Phase 1 build). Replace legacy class names with `.aiab-` equivalents, using the framework's grid and components.
- Preserve each page's content and intent. Where a page demonstrated a 2013 plugin (flexslider, tablesorter, dataTables, leap pager, float labels), use the framework's own component (carousel, data-table, pagination, forms) instead. Don't add jQuery back.
- Theme CSS (classic, green, modern-saas) must go through the build, so its `@custom-media` compiles.
- Fix `themes/classic/contact`'s `WEP11901.webp` path as part of the classic rebuild.
- Don't recreate the 2013 assets.
- This is the largest phase (33 pages). Work group by group, with one commit per group, and crawl after each one.

## Phase 5: Navigation, links, anchors

### 1. One nav

The nav is copy-pasted into 52 pages plus `includes/navigation.html`, and the copies drift. Make `includes/navigation.html` the single source and inject it at build time, e.g. a Vite `transformIndexHtml` plugin that fills the `<!-- Navigation Include -->` block. Build time is better than runtime: it works without JS and doesn't flash.

### 2. Anchor contract

Every dropdown below points at an ID that doesn't exist.

**Recommendation:** keep the nav's short anchors and rename the section IDs. The `aiab-` prefix on IDs is a namespace-script artifact, since CLAUDE.md says to prefix classes. Grep CSS, JS and tests for each ID before renaming it.

| Nav href | Current section ID |
|---|---|
| /docs/foundation#grid | aiab-grid |
| /docs/foundation#responsive | responsive_col |
| /docs/foundation#fluid | fluid_col |
| /docs/foundation#golden | golden_section |
| /docs/foundation#ordering | push_pull |
| /docs/foundation#media | mediaQueries |
| /docs/form#basic | forms |
| /docs/form#multi | multi_forms |
| /docs/form#custom | custom_checkbox_radios |
| /docs/form#prepend | append_prepend_icons |
| /docs/form#picker | datepicker_fields |
| /docs/function#tabs | aiab-tabs |
| /docs/function#pagination | aiab-pagination |
| /docs/features#accordion, #alerts, #cards, #carousel, #modals, #tooltips | none (page has slideshows, helpers, components, pears, icons) |
| /#what_is_it, #how_its_made, #gallery, #evolution, #colophon | none (homepage has features, grid, components, patterns) |

For the last two rows, point the nav at sections that exist or drop the items.

### 3. Broken internal links (fix or remove)

- `/examples/shopping-cart-modern.html` is linked from 17 pages, including `includes/navigation.html:75` and the homepage. The file was moved to `examples/_archive/`.
- `/docs/components/` is a breadcrumb on 7 component pages, and no index page exists.
- Component pages link to `examples/forms-demo`, `modal-demo`, `pagination-demo` and `tabs-demo`. The real files are `form-validation-demo`, `modal` and `tabs-pagination-steps-demo`.
- `examples/form-validation-demo` links to `examples/form.html` and `examples/foundation.html`. These should be `/docs/…`.
- The themes index links to `classic/index.html` and `green/index.html` (the files are `home.html`), plus `lassosoft/`, `yosemite/` and `/docs/theming.html`, none of which exist.
- The modern-saas footer links to changelog, contributing, code-of-conduct, privacy, terms, docs/migration, docs/themes, CHANGELOG.md, CONTRIBUTING.md, LICENSE and atomic-design-demo.html. All return 404.
- Others: `docs/features-modern` → `docs/changelog` and `docs/support`; `docs/getting-started` → `/playground/`; `examples/user-dashboard` → `/orders`.
- `sitemap.html` links to README.md, CLAUDE.md, package.json, biome.json and tsconfig.json. Remove those links.

### 4. Skip link

`#main-content` has no target on 20 pages, including `/docs/function` and `/docs/features`. The CSV lists them all. Add the ID to each page's `<main>`.

### 5. 404 page

`netlify.toml` routes unknown URLs to `/404.html`, which doesn't exist. Add one using the standard head and nav.

### 6. Touch icons

17 pages reference 5 apple-touch-icon files that don't exist. Remove the references, or add real icons if Clive supplies them.

### 7. Wrong image path

`themes/classic/contact` references `assets/WEP11901.webp`, which only exists in `themes/green/assets/`.

### 8. External links

- Replace the placeholder repo URLs with the real one: `github.com/your-org/amphibious` (getting-started, twice), `github.com/your-repo/amphibious` (modern-saas, twice) and `github.com/amphibious` (features-modern). Clive confirmed `https://github.com/agency-In-a-box/amphibious` is the public URL. The crawler got a 403 from it, so allow-list it in the Phase 6 check.
- Remove dead links: lassosoft.com (26 pages), mergini.com, twitter.com/cliveMoore, and a.mphibio.us including the `.rdk.zip` download.

## Phase 6: Make this impossible to ship again

- Port `qa/live-site-crawl.py` to `scripts/qa-site.ts`, so CI doesn't need Python. Keep the same checks:
  - every link, script, stylesheet, import and image resolves with the right content type
  - internal links return 200 and their fragments exist
  - `data-lucide` names are in the shipped set
  - no raw `@media (--`, no `.ts` and no `/src/` in the output
- Add a `qa:site` script and a CI job after `build:site` that serves the output, runs `qa-site` and fails on any error. Keep an allow-list file for intentional external links.
- Optional: run it against the Netlify deploy preview on PRs.
- Update CLAUDE.md (the icons line, the Vite version and the `build:site` description) and the knowledge base.

---

## Definition of done

- A crawl of the Netlify deploy preview shows 0 broken stylesheets, scripts and imports; 0 broken internal links; 0 missing nav anchors; 0 unknown icons; 0 □; and 0 raw custom-media.
- A visual check in Chrome passes in light mode, dark mode, and OS-dark with forced light, on `/`, `/docs/foundation`, `/examples/e-commerce-catalog`, `/examples/dashboard-template` and `/examples/buttons-input-groups`.
- Lint, `format:check`, typecheck and tests are green, and the bundle is under 2MB.
- The PR description lists what changed in each phase, the decisions Clive made, and anything deferred.

## Out of scope

- The `@layer` refactor, new components, and npm publish.
- The 674 `href="#"` placeholders in demo content, unless they sit in real navigation.
