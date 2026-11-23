/**
 * PostCSS plugin: scope system-dark rules so an explicit light theme wins.
 *
 * Inside `@media (prefers-color-scheme: dark)` every selector must carry the
 * `:root:not([data-theme="light"])` qualifier (see CLAUDE.md, Dark Mode
 * Architecture). Without it, an OS in dark mode overrides pages that are
 * hard-set to `data-theme="light"`. Selectors that already mention
 * `data-theme` are left alone.
 */
export const DARK_GUARD = ':root:not([data-theme="light"])';

const DARK_MEDIA = /\(\s*prefers-color-scheme\s*:\s*dark\s*\)/;

export function guardSelector(selector) {
  if (selector.includes('data-theme')) return selector;
  const trimmed = selector.trim();
  if (trimmed === ':root' || trimmed === 'html') return DARK_GUARD;
  if (trimmed.startsWith(':root')) return `${DARK_GUARD}${trimmed.slice(':root'.length)}`;
  return `${DARK_GUARD} ${trimmed}`;
}

function isInKeyframes(rule) {
  for (let node = rule.parent; node; node = node.parent) {
    if (node.type === 'atrule' && /keyframes$/i.test(node.name)) return true;
  }
  return false;
}

const plugin = () => ({
  postcssPlugin: 'aiab-guard-dark-mode',
  AtRule: {
    media(atRule) {
      if (!DARK_MEDIA.test(atRule.params)) return;
      atRule.walkRules((rule) => {
        if (isInKeyframes(rule)) return;
        const guarded = rule.selectors.map(guardSelector);
        if (guarded.join(',') !== rule.selectors.join(',')) rule.selectors = guarded;
      });
    },
  },
});
plugin.postcss = true;

export default plugin;
