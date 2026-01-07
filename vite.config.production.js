import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: process.cwd(),
  base: '/',

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,

    // Enable source maps
    sourcemap: true,

    // Minification
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

    // CSS optimization
    cssCodeSplit: false,
    cssMinify: true,

    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // Docs pages
        'docs/foundation': resolve(__dirname, 'docs/foundation.html'),
        'docs/form': resolve(__dirname, 'docs/form.html'),
        'docs/features': resolve(__dirname, 'docs/features.html'),
        'docs/function': resolve(__dirname, 'docs/function.html'),
        'docs/api-reference': resolve(__dirname, 'docs/api-reference.html'),
        'docs/carousel': resolve(__dirname, 'docs/carousel.html'),
        'docs/getting-started': resolve(__dirname, 'docs/getting-started.html'),
        'docs/grid-system': resolve(__dirname, 'docs/grid-system.html'),
        'docs/icons': resolve(__dirname, 'docs/icons.html'),
        'docs/index': resolve(__dirname, 'docs/index.html'),
        // Examples pages
        'examples/index': resolve(__dirname, 'examples/index.html'),
        'examples/navigation-showcase': resolve(__dirname, 'examples/navigation-showcase.html'),
        'examples/atomic-design-demo': resolve(__dirname, 'examples/atomic-design-demo.html'),
        'examples/cards-demo': resolve(__dirname, 'examples/cards-demo.html'),
        'examples/carousel-showcase': resolve(__dirname, 'examples/carousel-showcase.html'),
        'examples/modal': resolve(__dirname, 'examples/modal.html'),
        'examples/tabs-pagination-steps-demo': resolve(__dirname, 'examples/tabs-pagination-steps-demo.html'),
      },

      output: {
        // Asset naming
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          const { name } = assetInfo;

          if (/\.(css)$/i.test(name)) {
            return 'css/[name].[hash][extname]';
          }

          if (/\.(png|jpe?g|gif|svg|webp)$/i.test(name)) {
            return 'images/[name].[hash][extname]';
          }

          if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
            return 'fonts/[name].[hash][extname]';
          }

          return 'assets/[name].[hash][extname]';
        },
      },
    },

    // Report compressed size
    reportCompressedSize: true,

    // Chunk size warning
    chunkSizeWarningLimit: 500,
  },

  css: {
    postcss: './postcss.config.js',
  },
});
