import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const entries = {
  carousel: resolve(__dirname, 'src/entries/carousel.ts'),
  modal: resolve(__dirname, 'src/entries/modal.ts'),
  forms: resolve(__dirname, 'src/entries/forms.ts'),
  tabs: resolve(__dirname, 'src/entries/tabs.ts'),
  tooltip: resolve(__dirname, 'src/entries/tooltip.ts'),
  accordion: resolve(__dirname, 'src/entries/accordion.ts'),
  toast: resolve(__dirname, 'src/entries/toast.ts'),
  'smooth-scroll': resolve(__dirname, 'src/entries/smooth-scroll.ts'),
  navigation: resolve(__dirname, 'src/entries/navigation.ts'),
  'dark-mode-toggle': resolve(__dirname, 'src/entries/dark-mode-toggle.ts'),
  icons: resolve(__dirname, 'src/entries/icons.ts'),
  'form-builder': resolve(__dirname, 'src/entries/form-builder.ts'),
  'file-upload': resolve(__dirname, 'src/entries/file-upload.ts'),
  'search-bar': resolve(__dirname, 'src/entries/search-bar.ts'),
  dropdown: resolve(__dirname, 'src/entries/dropdown.ts'),
  'color-picker': resolve(__dirname, 'src/entries/color-picker.ts'),
  timeline: resolve(__dirname, 'src/entries/timeline.ts'),
  datepicker: resolve(__dirname, 'src/entries/datepicker.ts'),
  'range-slider': resolve(__dirname, 'src/entries/range-slider.ts'),
  'data-table': resolve(__dirname, 'src/entries/data-table.ts'),
  'component-registry': resolve(__dirname, 'src/entries/component-registry.ts'),
  sanitize: resolve(__dirname, 'src/entries/sanitize.ts'),
  loaders: resolve(__dirname, 'src/loaders.ts'),
};

export default defineConfig({
  resolve: {
    extensions: ['.ts', '.mjs', '.js', '.mts', '.jsx', '.tsx', '.json'],
    alias: {
      '@': resolve(__dirname, './src'),
      '@css': resolve(__dirname, './src/css'),
      '@js': resolve(__dirname, './src/js'),
    },
  },
  build: {
    outDir: 'dist/esm',
    emptyOutDir: true,
    sourcemap: 'hidden',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,
      },
      mangle: true,
      format: {
        comments: false,
      },
    },
    lib: {
      entry: entries,
      formats: ['es'],
    },
    rollupOptions: {
      external: ['@splidejs/splide', 'dompurify'],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '_shared/[name].js',
      },
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
});
