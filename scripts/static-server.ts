#!/usr/bin/env bun
/**
 * Static file server that behaves like Netlify for the built site: pretty URLs
 * (/docs/form -> docs/form.html), directory index.html, and a 404 status with
 * 404.html for anything missing.
 *
 *   bun scripts/static-server.ts [dir=dist-site] [port=4173]
 *
 * Shared by scripts/qa-site.ts and the Playwright e2e run.
 */
import { existsSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const MIME: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ico': 'image/x-icon',
};

export function startStaticServer(outDir: string, port = 0) {
  const root = resolve(outDir);

  const fileFor = (pathname: string): string | null => {
    const clean = decodeURIComponent(pathname).replace(/\/+$/, '');
    for (const candidate of [clean, `${clean}.html`, `${clean}/index.html`]) {
      const full = resolve(root, `.${candidate}`);
      if (!full.startsWith(root)) continue;
      if (existsSync(full) && statSync(full).isFile()) return full;
    }
    return null;
  };

  return Bun.serve({
    port,
    fetch(request) {
      const file = fileFor(new URL(request.url).pathname);
      const target = file ?? join(root, '404.html');
      if (!existsSync(target)) return new Response('Not found', { status: 404 });
      return new Response(Bun.file(target), {
        status: file ? 200 : 404,
        headers: { 'content-type': MIME[extname(target)] ?? 'application/octet-stream' },
      });
    },
  });
}

if (import.meta.main) {
  const [dir = 'dist-site', port = '4173'] = process.argv.slice(2);
  if (!existsSync(resolve(dir))) {
    console.error(`${dir} not found. Run \`bun run build:site\` first.`);
    process.exit(2);
  }
  const server = startStaticServer(dir, Number(port));
  console.log(`Serving ${dir} at http://localhost:${server.port}`);
}
