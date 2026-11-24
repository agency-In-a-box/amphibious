import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(root, 'includes/navigation.html');

/** Placeholder every page carries where the site navigation belongs. */
export const NAV_MARKER = '<!-- Navigation Include -->';

/** Skip link + <nav> from includes/navigation.html; its comments and module script are dropped. */
function readNavigation() {
  const html = readFileSync(SOURCE, 'utf8');
  const start = html.indexOf('<a href="#main-content"');
  const end = html.indexOf('</nav>', start) + '</nav>'.length;
  if (start === -1 || end < start) throw new Error(`${SOURCE}: skip link or <nav> not found`);
  return html.slice(start, end);
}

/**
 * includes/navigation.html is the single source of the site navigation. This
 * replaces NAV_MARKER with it at build (and dev) time, so there is no runtime
 * fetch, no flash, and it works without JavaScript.
 */
export default function aiabNavigation() {
  return {
    name: 'aiab-navigation',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.includes(NAV_MARKER) ? html.replaceAll(NAV_MARKER, readNavigation()) : html;
      },
    },
  };
}
