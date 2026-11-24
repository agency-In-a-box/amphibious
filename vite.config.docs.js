import { readdirSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import aiabIcons from './scripts/vite-plugin-icons.js';
import aiabNavigation from './scripts/vite-plugin-nav.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/** Directories whose HTML is never deployed. */
const EXCLUDED_DIRS = new Set(['_archive', 'node_modules']);

/** Root-level pages plus every HTML file under these directories is deployed. */
const ROOT_PAGES = ['index.html', 'sitemap.html', '404.html'];
const PAGE_DIRS = ['docs', 'examples', 'demos'];

function collectHtml(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.has(entry.name)) found.push(...collectHtml(join(dir, entry.name)));
    } else if (entry.name.endsWith('.html')) {
      found.push(join(dir, entry.name));
    }
  }
  return found;
}

/**
 * One Rollup input per deployable page. Vite mirrors the source path in the
 * output (docs/foundation.html -> dist-site/docs/foundation.html), so public
 * URLs are unchanged.
 */
function pageInputs() {
  const files = [
    ...ROOT_PAGES.map((page) => resolve(__dirname, page)),
    ...PAGE_DIRS.flatMap((dir) => collectHtml(resolve(__dirname, dir))),
  ];
  return Object.fromEntries(
    files.map((file) => [
      relative(__dirname, file)
        .split(sep)
        .join('/')
        .replace(/\.html$/, ''),
      file,
    ]),
  );
}

export default defineConfig({
  plugins: [aiabIcons(), aiabNavigation()],
  root: __dirname,
  base: '/',

  build: {
    outDir: 'dist-site',
    assetsDir: 'assets',
    emptyOutDir: true,

    // Hidden source maps - not referenced in output files but available for error reporting
    sourcemap: 'hidden',

    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },

    // Page-specific stylesheets must stay scoped to the pages that link them.
    cssCodeSplit: true,
    cssMinify: true,

    rollupOptions: {
      input: pageInputs(),

      output: {
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0] ?? assetInfo.name ?? '';

          if (/\.(css)$/i.test(name)) {
            return 'css/[name].[hash][extname]';
          }

          if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(name)) {
            return 'images/[name].[hash][extname]';
          }

          if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
            return 'fonts/[name].[hash][extname]';
          }

          return 'assets/[name].[hash][extname]';
        },
      },
    },

    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
  },

  css: {
    postcss: './postcss.config.js',
  },
});
