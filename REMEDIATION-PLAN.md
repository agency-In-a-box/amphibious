# Amphibious 2.0 - Remediation Plan

**Created**: February 25, 2026
**Based on**: AUDIT-REPORT-2026-02-25.md
**Status**: PENDING REVIEW
**Estimated Total Effort**: ~97 hours (~12 developer-days)

---

## Phase 1: Security & Blocking (Week 1) - ~12 hours

> **Gate**: Must complete before any deployment to external consumers.

### C1: Fix XSS in dropdown-enhanced.js (CRITICAL) - 2h

**File**: `src/js/dropdown-enhanced.js:730`
**Problem**: User search term inserted into innerHTML via highlight function without sanitization.
**Vector**: User types `<img src=x onerror=alert(1)>` in search field.

**Fix**:
```javascript
// Before (UNSAFE):
element.innerHTML = highlighted;

// After (SAFE):
// Import or use the existing _escapeHTML pattern, then highlight with safe markup
const escaped = this._escapeHTML(text);
const safeHighlighted = escaped.replace(
  new RegExp(`(${this._escapeHTML(searchTerm)})`, 'gi'),
  '<mark>$1</mark>'
);
element.innerHTML = safeHighlighted;
```

**Verification**: Search for `<script>alert(1)</script>` in dropdown - should render as text, not execute.

- [ ] Fix applied
- [ ] Manual XSS test passed
- [ ] Existing functionality preserved

---

### C2: Fix XSS in form-builder.js (CRITICAL) - 2h

**File**: `src/js/form-builder.js:1682`
**Problem**: `wrapper.innerHTML = field.content || ''` - user content injected without sanitization.

**Fix**:
```javascript
// Before (UNSAFE):
wrapper.innerHTML = field.content || '';

// After (SAFE):
wrapper.innerHTML = this._sanitizeHTML(field.content || '');
```

Also audit all other innerHTML assignments in form-builder.js (lines 515, 577, 613, 1143) for similar patterns.

**Verification**: Create a form field with content `<img onerror=alert(1)>` - should be stripped.

- [ ] Fix applied at line 1682
- [ ] All innerHTML sites in form-builder.js audited
- [ ] Manual XSS test passed

---

### H1: Fix npm vulnerabilities - 1h

**Problem**: 2 high-severity minimatch ReDoS vulnerabilities.

**Fix**:
```bash
npm audit fix
# If that doesn't resolve:
npm update minimatch
```

**Verification**: `npm audit --audit-level=high` returns 0 vulnerabilities.

- [ ] `npm audit fix` run
- [ ] Zero high/critical vulnerabilities confirmed
- [ ] `bun test` still passes
- [ ] `bun run build` still succeeds

---

### M2: Fix docs source map exposure - 0.5h

**File**: `vite.config.docs.js:17`
**Problem**: `sourcemap: true` generates public source maps exposing full source code.

**Fix**: Change to `sourcemap: 'hidden'` (generates maps for error reporting but doesn't reference them in output files).

- [ ] Changed to `'hidden'`
- [ ] Docs build still succeeds

---

### H4: Add skip-navigation link - 2h

**Problem**: No skip-nav pattern in framework CSS or documentation templates.

**Fix**:
1. Add `.aiab-skip-nav` class to CSS (atoms or helpers):
```css
.aiab-skip-nav {
  position: absolute;
  top: -100%;
  left: 0;
  z-index: 10000;
  padding: 0.75em 1.5em;
  background: var(--color-primary);
  color: white;
  text-decoration: none;
  font-weight: 600;
}
.aiab-skip-nav:focus {
  top: 0;
}
```
2. Add to docs/examples HTML templates before `<nav>`:
```html
<a href="#main-content" class="aiab-skip-nav">Skip to main content</a>
```

- [ ] CSS class added
- [ ] Skip link added to docs pages
- [ ] Keyboard test: Tab from page load focuses skip link

---

### H3: Add carousel keyboard support - 4h

**File**: `src/js/carousel.ts`
**Problem**: Zero keyboard navigation. Mouse-only interaction.

**Fix**: Add keydown handler to carousel container:
- ArrowLeft/ArrowUp: Previous slide
- ArrowRight/ArrowDown: Next slide
- Home: First slide
- End: Last slide
- Add `tabindex="0"` and `role="region"` with `aria-label`

**Verification**: Navigate carousel using only keyboard.

- [ ] Arrow key navigation works
- [ ] Home/End keys work
- [ ] ARIA attributes added
- [ ] Test updated

---

### M8: Remove debug console statements - 0.5h

**Remove these 6 lines:**
- `src/js/icons.ts:11` - `console.log('Icons initialized', options)`
- `src/js/icons-lightweight.ts:71` - `console.log('[Amphibious] Initializing icons...')`
- `src/js/icons-lightweight.ts:75` - `console.log('[Amphibious] Processing icon:', iconName)`
- `src/js/icons-lightweight.ts:109` - `console.warn('[Amphibious] Icon not found...')`
- `src/js/form-builder.js:1644` - `console.log('Form Data:', ...)`
- `src/js/form-builder.js:2029` - `console.log('Add step functionality...')`

- [ ] All 6 removed
- [ ] Lint still passes

---

### Phase 1 Commit Strategy

```
Commit 1: "Fix critical XSS vulnerabilities in dropdown-enhanced and form-builder"
  - dropdown-enhanced.js
  - form-builder.js

Commit 2: "Fix npm vulnerabilities and remove debug console statements"
  - package.json / lockfile
  - icons.ts, icons-lightweight.ts, form-builder.js

Commit 3: "Add skip-nav link and carousel keyboard support"
  - CSS file(s)
  - carousel.ts
  - docs/examples HTML templates

Commit 4: "Fix docs source map exposure"
  - vite.config.docs.js
```

### Phase 1 Verification Checklist

- [ ] `bun run lint` - 0 errors
- [ ] `bun run typecheck` - 0 errors
- [ ] `bun test` - 210+ tests pass
- [ ] `bun run build` - succeeds, dist/ correct
- [ ] `npm audit --audit-level=high` - 0 vulnerabilities
- [ ] Manual XSS tests on dropdown search and form builder
- [ ] Keyboard-only navigation through carousel
- [ ] Skip-nav link visible on Tab from page load

---

## Phase 2: Quality & Compliance (Weeks 2-3) - ~45 hours

### M3: Extract shared `_escapeHTML()` utility - 3h

**Problem**: Same function duplicated in 6 files.
**Fix**: Create `src/utils/escape-html.ts`, export `escapeHTML()`. Update all 6 consumers.

**Files to update**:
- `src/js/dropdown.js`
- `src/js/dropdown-enhanced.js`
- `src/js/toast.js`
- `src/js/form-builder.js`
- `src/js/search-bar.js` (or search-bar-enhanced.js)
- One additional file (identify during implementation)

- [ ] Utility created
- [ ] All 6 files updated to import shared utility
- [ ] Tests pass

---

### M4 + M5: Remove duplicate module implementations - 4h

**Problem**: Both `modal.js` + `modal.ts` and `navigation.js` + `navigation.ts` exist.

**Fix**:
1. Verify `modal.ts` covers all `modal.js` functionality
2. Remove `modal.js`, update any imports
3. Verify `navigation.ts` covers all `navigation.js` functionality
4. Remove `navigation.js`, update any imports
5. Update `src/index.ts` if needed

- [ ] modal.js removed
- [ ] navigation.js removed
- [ ] All imports updated
- [ ] Tests pass

---

### M1: Fix primary orange WCAG AA contrast - 4h

**Problem**: `#ed8b00` on white = 2.95:1 (needs 4.5:1 for AA).

**Options**:
1. Darken primary to `#b36b00` (~4.5:1) - changes brand identity
2. Keep `#ed8b00` only on dark backgrounds, use `#a65e00` for text on white
3. Use existing `--color-primary-accessible` token approach from contrast-fixes.css

**Files**: `src/css/tokens/design-tokens.css`, `src/css/accessibility/contrast-fixes.css`

- [ ] Approach decided
- [ ] Design tokens updated
- [ ] Contrast-fixes verified
- [ ] All text-on-white meets 4.5:1

---

### M10: Add prefers-reduced-motion checks in JS - 4h

**Problem**: JS animations in tooltip, carousel, modal don't respect user's motion preference.

**Fix**: Check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` before animating.

**Files**: `src/js/tooltip.ts`, `src/js/carousel.ts`, `src/js/modal.ts`

- [ ] Motion preference check added to each file
- [ ] Animations skip/reduce when preference set

---

### H5 + H6: Fix memory leak patterns - 12h

**Problem**: Untracked setTimeout calls and high addEventListener:removeEventListener ratio (5.7:1).

**Files to audit and fix**:
- `src/js/navigation.js:215` - setTimeout without cleanup
- `src/js/timeline.js:898,907` - Multiple setTimeout without cleanup
- `src/js/file-upload.js:264+` - addEventListener without tracking
- `src/js/data-table.js:315` - searchTimeout cleanup unclear
- `src/js/dropdown-enhanced.js:480` - searchDebounceTimer cleanup

**Fix pattern**: Store timer IDs, clear in destroy(). Track all event listeners in a Set/Map, remove in destroy().

- [ ] All setTimeout instances tracked and cleared
- [ ] All addEventListener instances have corresponding removeEventListener
- [ ] Ratio improved to < 3:1

---

### M6: Create CHANGELOG.md - 2h

Create a CHANGELOG following [Keep a Changelog](https://keepachangelog.com/) format documenting:
- v2.0.0 release features
- Namespace isolation migration
- Component library additions
- Breaking changes from v1.x

- [ ] CHANGELOG.md created
- [ ] Covers all major features/changes

---

### H2 (partial): Add tests for 4 priority modules - 20h

**Target modules** (highest risk, most used):
1. `accordion.js` - ~5h, 15-20 tests
2. `dropdown.js` - ~5h, 15-20 tests
3. `toast.js` - ~5h, 15-20 tests
4. `datepicker.js` - ~5h, 15-20 tests

**Test scope per module**:
- Initialization and DOM structure
- User interaction (click, keyboard)
- ARIA attributes
- Cleanup/destroy
- Edge cases

**Target**: Test count from 210 to 280+

- [ ] accordion.test.ts created (15+ tests)
- [ ] dropdown.test.ts created (15+ tests)
- [ ] toast.test.ts created (15+ tests)
- [ ] datepicker.test.ts created (15+ tests)
- [ ] All 280+ tests passing

---

### Phase 2 Verification Checklist

- [ ] `bun run lint` - 0 errors
- [ ] `bun run typecheck` - 0 errors
- [ ] `bun test` - 280+ tests pass
- [ ] `bun run build` - succeeds
- [ ] addEventListener:removeEventListener ratio < 3:1
- [ ] WCAG AA color contrast verified for all text
- [ ] No duplicate module implementations
- [ ] `_escapeHTML()` exists in exactly 1 location
- [ ] CHANGELOG.md complete

---

## Phase 3: Polish & Optimization (Weeks 4-5) - ~40 hours

### M7: Expand JSDoc coverage to 30%+ - 16h

Add `@param`, `@returns`, `@example` tags to all public methods in:
- modal.ts, forms.ts, navigation.ts, tooltip.ts
- carousel.ts, tabs.ts, smooth-scroll.ts
- icons.ts, sanitize.ts

- [ ] All public methods documented
- [ ] Coverage > 30%

---

### L1: Standardize BEM naming convention - 8h

**Decision**: Choose either `.aiab-card-header` OR `.aiab-card__header` (not both).
**Recommendation**: Use hyphenated (`.aiab-card-header`) for simplicity.

Update ~20 CSS files that use double-underscore to use hyphenated instead. Update corresponding HTML in docs/examples.

- [ ] Convention decided and documented
- [ ] All files updated
- [ ] No mixed conventions remain

---

### H2 (continued): Add tests for 4 more modules - 16h

**Target modules**:
1. `file-upload.js` - ~4h
2. `search-bar.js` - ~4h
3. `data-table.js` - ~4h
4. `range-slider.js` - ~4h

**Target**: Test count from 280 to 350+

- [ ] 4 new test files created
- [ ] 350+ total tests passing

---

### Quick wins batch - 2.5h

- [ ] L2: Add `.browserslistrc` (0.5h)
- [ ] L3: Remove deprecated `-webkit-overflow-scrolling` from tables.css:57, data-table.css:441 (0.5h)
- [ ] L4: Fix tsconfig.json `vite.config.*.ts` -> `vite.config.*.js` (0.5h)
- [ ] L6: Remove unused deps autoprefixer, purgecss from package.json (0.5h)
- [ ] L9: Replace `String.substr()` with `substring()` in forms.ts:295 (0.5h)

---

### Phase 3 Verification Checklist

- [ ] `bun run lint` - 0 errors
- [ ] `bun run typecheck` - 0 errors
- [ ] `bun test` - 350+ tests pass
- [ ] `bun run build` - succeeds
- [ ] JSDoc coverage > 30%
- [ ] Consistent BEM naming throughout
- [ ] Zero deprecated API usage

---

## Summary Timeline

| Phase | Scope | Hours | Target Week | Gate |
|-------|-------|-------|-------------|------|
| **Phase 1** | Security + blocking | 12h | Week 1 | Deploy to internal consumers |
| **Phase 2** | Quality + compliance | 45h | Weeks 2-3 | npm publication ready |
| **Phase 3** | Polish + optimization | 40h | Weeks 4-5 | Public open-source release |
| **Total** | | **97h** | **5 weeks** | |

---

## Post-Remediation Target Scores

| Category | Current | Phase 1 | Phase 2 | Phase 3 |
|----------|---------|---------|---------|---------|
| Architecture | 9.0 | 9.0 | 9.0 | 9.5 |
| Code Quality | 7.5 | 8.0 | 8.5 | 9.0 |
| Testing & CI/CD | 7.0 | 7.5 | 8.5 | 9.0 |
| Security | 6.5 | 9.0 | 9.0 | 9.0 |
| Performance | 8.5 | 8.5 | 8.5 | 9.0 |
| Documentation | 6.5 | 6.5 | 7.5 | 8.5 |
| **Overall** | **7.63** | **8.1** | **8.7** | **9.0** |
