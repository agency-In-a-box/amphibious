/**
 * postcss-theme-scope — make `prefers-color-scheme: dark` follow the theme toggle.
 *
 * The site has three theme states, set on <html> by DarkModeToggle:
 *   data-theme="light"   always light
 *   data-theme="dark"    always dark
 *   (no attribute)       follow the OS
 *
 * Bare `@media (prefers-color-scheme: dark)` rules only know about the OS, so
 * they leaked dark styles onto light pages and ignored an explicit "dark"
 * choice on a light-mode OS. For every rule in such a block this plugin:
 *
 *   1. scopes the original so data-theme="light" opts out
 *        .card → :where(html:not([data-theme="light"])) .card
 *   2. emits a copy outside the media query for an explicit dark choice
 *        .card → :where(html[data-theme="dark"]) .card
 *
 * :where() keeps specificity unchanged, so the cascade is otherwise untouched.
 * Selectors that already mention [data-theme …] are converted, not wrapped.
 * Runs in OnceExit so CSS nesting has already been flattened.
 */

const DARK_QUERY = /\(\s*prefers-color-scheme\s*:\s*dark\s*\)/i;
const ONLY_DARK = /^\s*\(\s*prefers-color-scheme\s*:\s*dark\s*\)\s*$/i;

function scope(sel, state, light, dark) {
  const s = sel.trim();
  if (!s) return sel;
  const notLight = `:not(${light})`;
  if (s.includes('[data-theme')) {
    // Author already scoped it: keep as-is inside the query, convert for the explicit copy.
    return state === 'os' ? s : s.replace(/:not\(\[data-theme=["']?light["']?\]\)/g, dark);
  }
  const cond = state === 'os' ? notLight : dark;
  if (/^:root(?![\w-])/.test(s)) return s.replace(/^:root/, `:root:where(${cond})`);
  if (/^html(?![\w-])/.test(s)) return s.replace(/^html/, `html:where(${cond})`);
  return `:where(html${cond}) ${s}`;
}

function rewriteRules(container, state, light, dark) {
  container.walkRules((rule) => {
    const parent = rule.parent;
    if (parent?.type === 'atrule' && /keyframes$/i.test(parent.name)) return;
    if (parent?.type === 'rule') return;
    rule.selectors = rule.selectors.map((sel) => scope(sel, state, light, dark));
  });
}

const themeScope = (opts = {}) => {
  const light = opts.lightSelector || '[data-theme="light"]';
  const dark = opts.darkSelector || '[data-theme="dark"]';
  return {
    postcssPlugin: 'amphibious-theme-scope',
    OnceExit(root) {
      const blocks = [];
      root.walkAtRules('media', (atRule) => {
        if (DARK_QUERY.test(atRule.params)) blocks.push(atRule);
      });
      for (const atRule of blocks) {
        const explicit = atRule.clone();
        // Keyframes copied outside the query would redefine the animation for every theme.
        explicit.walkAtRules(/keyframes$/i, (kf) => kf.remove());
        rewriteRules(atRule, 'os', light, dark);
        rewriteRules(explicit, 'explicit', light, dark);
        if (ONLY_DARK.test(atRule.params)) {
          // Unwrap: the explicit copy applies regardless of OS setting.
          atRule.after(explicit.nodes);
        } else {
          // Keep the other conditions (e.g. `screen and …`), drop the colour-scheme part.
          explicit.params = atRule.params
            .replace(/\s*and\s*\(\s*prefers-color-scheme\s*:\s*dark\s*\)/i, '')
            .replace(/\(\s*prefers-color-scheme\s*:\s*dark\s*\)\s*and\s*/i, '');
          atRule.after(explicit);
        }
      }
    },
  };
};
themeScope.postcss = true;

export default themeScope;
