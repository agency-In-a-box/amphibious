import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: process.cwd(),
  base: '/',
  server: {
    port: 2960,
    host: true,
    fs: {
      strict: false
    }
  },
  preview: {
    port: 2961,
    host: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@css': resolve(__dirname, './src/css'),
      '@js': resolve(__dirname, './src/js'),
      '@components': resolve(__dirname, './src/components')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2
      },
      mangle: true,
      format: {
        comments: false
      }
    },
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Amphibious',
      fileName: (format) => `amphibious.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css' || assetInfo.name?.endsWith('.css')) {
            return 'amphibious.css';
          }
          return assetInfo.name || 'asset';
        }
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false
      }
    },
    chunkSizeWarningLimit: 500
  },
  css: {
    devSourcemap: true,
    postcss: {}
  }
});