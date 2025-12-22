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
        foundation: resolve(__dirname, 'docs/foundation.html'),
        form: resolve(__dirname, 'docs/form.html'),
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