import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },

  build: {
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Amphibious',
      fileName: 'amphibious',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'amphibious.css';
          return assetInfo.name;
        },
      },
    },
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2020',
  },

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/css/variables.css";`,
      },
    },
  },

  server: {
    port: 3000,
    open: true,
  },

  preview: {
    port: 3001,
  },
});
