import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

/** Canonical origin of the published site. Override with SITE_URL for other hosts. */
export const SITE_URL = (process.env.SITE_URL || 'https://amphibious.aiab.app').replace(/\/$/, '');

/** /docs/form.html -> /docs/form, /index.html and /docs/index.html -> / and /docs/ */
export function cleanPath(htmlPath) {
  return `/${htmlPath.replace(/^\//, '')}`.replace(/index\.html$/, '').replace(/\.html$/, '');
}

const attr = (html, pattern) => html.match(pattern)?.[1]?.trim() ?? '';

/**
 * SEO and site metadata for the documentation site:
 * - canonical URL and Open Graph tags on every page (404 excluded)
 * - sitemap.xml and robots.txt
 * - replaces %APP_VERSION% with the version in package.json, so pages cannot
 *   drift from the published package
 */
export default function aiabSeo() {
  return {
    name: 'aiab-seo',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const page = ctx?.path ?? '';
        const out = html.replaceAll('%APP_VERSION%', version);
        if (/(^|\/)404\.html$/.test(page) || /rel="canonical"/.test(out)) return out;

        const url = `${SITE_URL}${cleanPath(page)}`;
        const title = attr(out, /<title>([^<]*)<\/title>/);
        const description = attr(out, /<meta\s+name="description"\s+content="([^"]*)"/);
        const tags = [
          `<link rel="canonical" href="${url}">`,
          '<meta property="og:type" content="website">',
          '<meta property="og:site_name" content="Amphibious">',
          `<meta property="og:url" content="${url}">`,
          title && `<meta property="og:title" content="${title}">`,
          description && `<meta property="og:description" content="${description}">`,
          '<meta name="twitter:card" content="summary">',
        ].filter(Boolean);
        return out.replace('</head>', `  ${tags.join('\n  ')}\n</head>`);
      },
    },
    // 'post' so Vite's own HTML handling has already put every page in the bundle
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const urls = Object.keys(bundle)
          .filter((name) => name.endsWith('.html') && name !== '404.html')
          .map((name) => `${SITE_URL}${cleanPath(name)}`)
          .sort();
        const entries = urls.map((loc) => `  <url><loc>${loc}</loc></url>`).join('\n');
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`,
        });
        this.emitFile({
          type: 'asset',
          fileName: 'robots.txt',
          source: `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
        });
      },
    },
  };
}
