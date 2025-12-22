import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import compression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: process.cwd(),
  base: '/',

  server: {
    port: 2960,
    host: true,
    fs: {
      strict: false,
    },
  },

  preview: {
    port: 2961,
    host: true,
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@css': resolve(__dirname, './src/css'),
      '@js': resolve(__dirname, './src/js'),
      '@components': resolve(__dirname, './src/components'),
    },
  },

  plugins: [
    // Gzip compression
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // Only compress files > 10KB
      deleteOriginFile: false,
    }),

    // Brotli compression
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
      deleteOriginFile: false,
    }),

    // Bundle size visualization (only in analyze mode)
    process.env.ANALYZE && visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'sunburst',
    }),
  ].filter(Boolean),

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,

    // Enable source maps for production debugging
    sourcemap: 'hidden', // Hidden source maps (not referenced in files)

    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
        ecma: 2015,
      },
    },

    // CSS code splitting
    cssCodeSplit: true,

    // Asset handling
    assetsInlineLimit: 4096, // Inline assets < 4KB

    // Rollup specific options
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // Add other entry points as needed
        foundation: resolve(__dirname, 'docs/foundation.html'),
        form: resolve(__dirname, 'docs/form.html'),
        function: resolve(__dirname, 'docs/function.html'),
        features: resolve(__dirname, 'docs/features.html'),
      },

      output: {
        // Manual chunks for better caching
        manualChunks: {
          // Core framework CSS
          'amphibious-core': [
            './src/css/tokens/design-tokens.css',
            './src/css/normalize.css',
            './src/css/typography.css',
            './src/css/grid-modern.css',
          ],

          // Components
          'amphibious-components': [
            './src/css/navigation-unified.css',
            './src/css/atoms/buttons.css',
            './src/css/organisms/forms.css',
            './src/css/organisms/modal.css',
          ],

          // Utilities
          'amphibious-utils': [
            './src/css/helpers.css',
            './src/css/print.css',
          ],
        },

        // Asset naming
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          const { name } = assetInfo;

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

      // Tree shaking
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 500,

    // Report compressed size
    reportCompressedSize: true,
  },

  css: {
    // PostCSS configuration is loaded from postcss.config.js
    postcss: './postcss.config.js',

    // CSS modules configuration (if needed)
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },

    // Preprocessor options
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@css/tokens/design-tokens.css";`,
      },
    },
  },

  // Optimizations
  optimizeDeps: {
    include: ['@splidejs/splide'],
    exclude: [],
  },

  // Environment variables
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
});