#!/usr/bin/env bun
/**
 * Crawls the built documentation site and fails on anything that would be
 * broken in a browser. Ported from the Python crawler that found the Task 6
 * live-site problems, so CI needs no Python.
 *
 *   bun run build:site && bun scripts/qa-site.ts            # serve dist-site locally and crawl it
 *   bun scripts/qa-site.ts --base https://deploy-preview-N--amphibious-aiab.netlify.app
 *   bun scripts/qa-site.ts --no-external                     # skip third-party link checks
 *
 * Checks: every stylesheet, script, module import, image and internal link
 * resolves with a sensible content type; in-page fragments exist; every
 * data-lucide name is in the shipped icon set; pages using icons load the icon
 * code; no raw `@media (--*)` / `@custom-media`; no `.ts` file or `/src/` page
 * reference in the output. Intentional exceptions live in
 * scripts/qa-site.allowlist.json.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { Window } from 'happy-dom';
import { iconSVGs } from '../src/js/icon-set.generated';
import { startStaticServer } from './static-server';

type Issue = { type: string; page: string; ref?: string; url?: string; detail?: string };
type AllowEntry = { type: string; page?: string; ref?: string; url?: string; reason: string };
type Fetched = { url: string; status: number; ctype: string; body?: string; error?: string };

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const option = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const root = resolve(import.meta.dir, '..');
const outDir = resolve(root, option('--dir') ?? 'dist-site');
const allowlist: AllowEntry[] = JSON.parse(
  readFileSync(join(root, 'scripts/qa-site.allowlist.json'), 'utf8'),
).allow;

// --- fetching -------------------------------------------------------------------------------

const server = option('--base') ? null : startStaticServer(outDir);
const BASE = (option('--base') ?? `http://localhost:${server?.port}`).replace(/\/$/, '');
const HOST = new URL(BASE).host;
const cache = new Map<string, Promise<Fetched>>();

function fetchOnce(url: string, wantBody: boolean): Promise<Fetched> {
  const key = `${wantBody ? 'b' : 'h'}:${url}`;
  let promise = cache.get(key);
  if (!promise) {
    promise = (async (): Promise<Fetched> => {
      try {
        const response = await fetch(url, {
          redirect: 'follow',
          signal: AbortSignal.timeout(25000),
          headers: { 'user-agent': 'Mozilla/5.0 (AmphibiousQA crawler)' },
        });
        const ctype = (response.headers.get('content-type') ?? '').split(';')[0].trim();
        const textual = /html|css|javascript|svg/.test(ctype);
        const body =
          wantBody && response.status === 200 && textual ? await response.text() : undefined;
        if (body === undefined) await response.body?.cancel();
        return { url, status: response.status, ctype, body };
      } catch (error) {
        return { url, status: 0, ctype: '', error: String(error).slice(0, 150) };
      }
    })();
    cache.set(key, promise);
  }
  return promise;
}

const get = (url: string) => fetchOnce(url, true);
const head = (url: string) => fetchOnce(url, false);

const isInternal = (url: string) => new URL(url).host === HOST;
const strip = (url: string) => url.split('#')[0];

// --- per-page audit -------------------------------------------------------------------------

const ICON_SET = new Set(Object.keys(iconSVGs));
const CSS_IMPORT = /@import\s+(?:url\()?\s*['"]([^'"]+)['"]/g;
const CSS_URL = /url\(\s*['"]?([^'")]+)['"]?\s*\)/g;
const JS_IMPORT =
  /(?:import|export)\s+(?:[\w*{}\s,$]+\s+from\s+)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;
const RAW_CUSTOM_MEDIA = /@custom-media|@media\s*\(\s*--/;

/** Private notes, backups, scratch pages and archived pages must never ship. */
const UNPUBLISHABLE =
  /\.md$|\.backup|\.bak$|-broken\.html$|\/_archive\/|\/(?:internal|planning|qa-reports)\//i;

const issues: Issue[] = [];
const warnings: Issue[] = [];

async function auditCss(page: string, cssUrl: string, body: string, depth = 0) {
  if (RAW_CUSTOM_MEDIA.test(body)) issues.push({ type: 'css-raw-custom-media', page, url: cssUrl });
  const refs: Array<[string, string]> = [];
  for (const m of body.matchAll(CSS_IMPORT)) refs.push(['css-import', m[1]]);
  for (const m of body.matchAll(CSS_URL)) {
    const value = m[1].trim();
    if (!/^(data:|#|var\()/.test(value)) refs.push(['css-url', value]);
  }
  for (const [kind, ref] of refs) {
    const target = new URL(ref, cssUrl).href;
    if (!target.startsWith('http')) continue;
    const result = await get(target);
    const wrongType =
      kind === 'css-import' && result.status === 200 && !result.ctype.includes('css');
    if (result.status !== 200 || wrongType) {
      issues.push({
        type: `${kind}-broken`,
        page,
        ref,
        url: target,
        detail: `${result.status} ${result.ctype}`,
      });
    } else if (kind === 'css-import' && depth < 4 && result.body) {
      await auditCss(page, target, result.body, depth + 1);
    }
  }
}

async function auditJs(page: string, jsUrl: string, body: string) {
  for (const m of body.matchAll(JS_IMPORT)) {
    const spec = m[1] ?? m[2];
    if (!spec) continue;
    if (!/^(\.|\/|http)/.test(spec)) {
      issues.push({ type: 'js-bare-import', page, ref: spec, url: jsUrl });
      continue;
    }
    const target = new URL(spec, jsUrl).href;
    const result = await head(target);
    const okType = result.ctype.includes('javascript') || result.ctype.includes('css');
    if (result.status !== 200 || spec.endsWith('.ts') || !okType) {
      issues.push({
        type: 'js-import-broken',
        page,
        ref: spec,
        url: target,
        detail: `${result.status} ${result.ctype}`,
      });
    }
  }
}

type Link = { ref: string; url: string; frag: string };

async function auditPage(pageUrl: string): Promise<{ links: Link[]; external: Link[] }> {
  const page = new URL(pageUrl).pathname;
  const record = await get(pageUrl);
  const links: Link[] = [];
  const external: Link[] = [];
  if (record.status !== 200 || !record.ctype.includes('html') || !record.body) {
    issues.push({ type: 'page-broken', page, detail: `${record.status} ${record.ctype}` });
    return { links, external };
  }

  const window = new Window({
    url: pageUrl,
    settings: {
      disableJavaScriptEvaluation: true,
      disableJavaScriptFileLoading: true,
      disableCSSFileLoading: true,
      disableComputedStyleRendering: true,
    },
  });
  const doc = window.document;
  doc.write(record.body);
  const resolveRef = (ref: string) => new URL(ref, pageUrl).href;

  // stylesheets and other <link> resources
  for (const link of doc.querySelectorAll('link[href]')) {
    const rel = (link.getAttribute('rel') ?? '').toLowerCase();
    const ref = (link.getAttribute('href') ?? '').trim();
    const target = resolveRef(ref);
    if (rel.includes('stylesheet')) {
      const result = await get(target);
      if (result.status !== 200 || !result.ctype.includes('css')) {
        issues.push({
          type: 'stylesheet-broken',
          page,
          ref,
          url: target,
          detail: `${result.status} ${result.ctype}`,
        });
      } else if (result.body && isInternal(target)) {
        await auditCss(page, target, result.body);
      }
    } else if (/icon|preload|modulepreload|manifest/.test(rel) && isInternal(target)) {
      const result = await head(target);
      if (result.status !== 200)
        issues.push({
          type: 'link-resource-broken',
          page,
          ref,
          url: target,
          detail: `${rel} ${result.status}`,
        });
    }
  }

  // scripts, and whether the icon code is reachable from this page
  const codeUrls: string[] = [];
  for (const script of doc.querySelectorAll('script')) {
    const src = script.getAttribute('src');
    const isModule = script.getAttribute('type') === 'module';
    if (src) {
      const target = resolveRef(src.trim());
      if (!isInternal(target)) continue;
      const result = await get(target);
      const badModuleType = isModule && !result.ctype.includes('javascript');
      if (
        result.status !== 200 ||
        src.endsWith('.ts') ||
        badModuleType ||
        /\/src\//.test(new URL(target).pathname)
      ) {
        issues.push({
          type: 'script-broken',
          page,
          ref: src,
          url: target,
          detail: `${result.status} ${result.ctype}`,
        });
      } else {
        codeUrls.push(target);
        if (isModule && result.body) await auditJs(page, target, result.body);
      }
    } else if (isModule && script.textContent) {
      await auditJs(page, pageUrl, script.textContent);
    }
  }
  for (const link of doc.querySelectorAll('link[rel="modulepreload"][href]')) {
    codeUrls.push(resolveRef(link.getAttribute('href') ?? ''));
  }

  for (const style of doc.querySelectorAll('style')) {
    if (style.textContent) await auditCss(page, pageUrl, style.textContent);
  }

  // images and other embedded media
  for (const el of doc.querySelectorAll(
    'img[src],source[src],video[src],audio[src],iframe[src],embed[src]',
  )) {
    const ref = (el.getAttribute('src') ?? '').trim();
    if (!ref || /^(data:|blob:|about:|javascript:)/.test(ref)) continue;
    const target = resolveRef(ref);
    const status = isInternal(target) ? (await head(target)).status : null;
    if (status !== null && status !== 200)
      issues.push({ type: 'media-broken', page, ref, url: target, detail: String(status) });
  }

  // icons
  const iconNames = [...doc.querySelectorAll('[data-lucide]')].map(
    (el) => el.getAttribute('data-lucide') ?? '',
  );
  for (const name of new Set(iconNames)) {
    if (!ICON_SET.has(name)) issues.push({ type: 'icon-unknown', page, ref: name });
  }
  if (iconNames.length > 0) {
    let loadsIcons = false;
    for (const url of new Set(codeUrls)) {
      if ((await get(url)).body?.includes('[data-lucide]')) {
        loadsIcons = true;
        break;
      }
    }
    if (!loadsIcons)
      issues.push({
        type: 'icons-not-loaded',
        page,
        detail: `${iconNames.length} data-lucide elements, no icon code`,
      });
  }

  // anchors
  for (const a of doc.querySelectorAll('a[href]')) {
    const ref = (a.getAttribute('href') ?? '').trim();
    if (!ref || /^(mailto:|tel:|data:)/.test(ref)) continue;
    if (ref.startsWith('javascript:')) {
      warnings.push({ type: 'link-javascript-href', page, ref });
      continue;
    }
    if (ref === '#') {
      warnings.push({ type: 'link-placeholder-hash', page });
      continue;
    }
    const target = resolveRef(ref);
    const link = { ref, url: strip(target), frag: new URL(target).hash.slice(1) };
    (isInternal(target) ? links : external).push(link);
  }
  window.close();
  return { links, external };
}

// --- driver ---------------------------------------------------------------------------------

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(full);
    return entry.name.endsWith('.html') ? [full] : [];
  });
}

function filesIn(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? filesIn(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

function matches(entry: AllowEntry, issue: Issue): boolean {
  return (
    entry.type === issue.type &&
    (!entry.page || entry.page === issue.page) &&
    (!entry.ref || entry.ref === issue.ref) &&
    (!entry.url || entry.url === issue.url)
  );
}

async function pool<T, R>(items: T[], size: number, work: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const index = next++;
        results[index] = await work(items[index]);
      }
    }),
  );
  return results;
}

async function main() {
  if (!existsSync(outDir)) {
    console.error(`${outDir} not found. Run \`bun run build:site\` first.`);
    process.exit(2);
  }

  // output hygiene: nothing private or unrunnable is published
  for (const file of filesIn(outDir)) {
    const url = `/${relative(outDir, file).split(sep).join('/')}`;
    if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      issues.push({ type: 'ts-in-output', page: '/', url });
    } else if (UNPUBLISHABLE.test(url)) {
      issues.push({ type: 'leaked-file', page: '/', url });
    }
  }

  const seeds = htmlFiles(outDir).map((file) => {
    const path = `/${relative(outDir, file).split(sep).join('/')}`;
    return `${BASE}${path}`;
  });
  const results = await pool(seeds, 8, auditPage);
  const pageByUrl = new Map(seeds.map((url, i) => [url, results[i]]));

  // internal links and fragments
  const idCache = new Map<string, Set<string>>();
  const idsFor = async (url: string): Promise<Set<string> | null> => {
    const cached = idCache.get(url);
    if (cached) return cached;
    const record = await get(url);
    if (record.status !== 200 || !record.ctype.includes('html') || !record.body) return null;
    const window = new Window({
      settings: {
        disableJavaScriptEvaluation: true,
        disableJavaScriptFileLoading: true,
        disableCSSFileLoading: true,
      },
    });
    window.document.write(record.body);
    const ids = new Set<string>();
    for (const el of window.document.querySelectorAll('[id],a[name]')) {
      ids.add(el.getAttribute('id') ?? el.getAttribute('name') ?? '');
    }
    window.close();
    idCache.set(url, ids);
    return ids;
  };

  for (const [pageUrl, { links, external }] of pageByUrl) {
    const page = new URL(pageUrl).pathname;
    for (const link of links) {
      const record = await head(link.url);
      if (record.status !== 200) {
        issues.push({
          type: 'link-broken',
          page,
          ref: link.ref,
          url: link.url,
          detail: String(record.status),
        });
        continue;
      }
      if (link.frag) {
        const ids = await idsFor(link.url);
        if (ids && !ids.has(decodeURIComponent(link.frag))) {
          issues.push({ type: 'link-fragment-missing', page, ref: link.ref, url: link.url });
        }
      }
    }
    pageByUrl.set(pageUrl, { links, external });
  }

  // third-party links: 404/410/DNS failures fail; bot blocks and 5xx only warn
  if (!flag('--no-external')) {
    const externals = new Map<string, string[]>();
    for (const [pageUrl, { external }] of pageByUrl) {
      for (const link of external) {
        if (!/^https?:/.test(link.url)) continue;
        externals.set(link.url, [...(externals.get(link.url) ?? []), new URL(pageUrl).pathname]);
      }
    }
    await pool([...externals], 8, async ([url, pages]) => {
      let status = 0;
      try {
        let response = await fetch(url, {
          method: 'HEAD',
          redirect: 'follow',
          signal: AbortSignal.timeout(15000),
        });
        if (response.status >= 400) {
          response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000) });
          await response.body?.cancel();
        }
        status = response.status;
      } catch {
        status = 0;
      }
      if (status >= 200 && status < 400) return;
      const blocked = [401, 403, 429].includes(status) || status >= 500;
      for (const page of new Set(pages)) {
        (blocked ? warnings : issues).push({
          type: 'link-external-broken',
          page,
          url,
          detail: String(status),
        });
      }
    });
  }

  const unlisted = issues.filter((issue) => !allowlist.some((entry) => matches(entry, issue)));
  const allowed = issues.length - unlisted.length;
  const unusedAllow = allowlist.filter((entry) => !issues.some((issue) => matches(entry, issue)));

  const byType = new Map<string, number>();
  for (const issue of unlisted) byType.set(issue.type, (byType.get(issue.type) ?? 0) + 1);
  for (const issue of unlisted) {
    console.error(
      `${issue.type}  ${issue.page}  ${issue.ref ?? issue.url ?? ''}  ${issue.detail ?? ''}`.trimEnd(),
    );
  }
  const warnCounts = new Map<string, number>();
  for (const warning of warnings)
    warnCounts.set(warning.type, (warnCounts.get(warning.type) ?? 0) + 1);

  console.log(`\nPages crawled: ${seeds.length}`);
  console.log(`Warnings: ${[...warnCounts].map(([t, n]) => `${t}=${n}`).join(', ') || 'none'}`);
  console.log(`Allow-listed issues: ${allowed}`);
  for (const entry of unusedAllow)
    console.log(`Unused allow-list entry (remove it): ${JSON.stringify(entry)}`);
  console.log(
    `Errors: ${unlisted.length}${unlisted.length ? ` (${[...byType].map(([t, n]) => `${t}=${n}`).join(', ')})` : ''}`,
  );

  server?.stop(true);
  process.exit(unlisted.length > 0 ? 1 : 0);
}

await main();
