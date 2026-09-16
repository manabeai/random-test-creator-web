import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import masterCSS from '@master/css.vite';

export default defineConfig({
  plugins: [masterCSS({ mode: 'static', injectRuntime: false }), preact()],
  root: '.',
  base: '/',
  build: {
    outDir: 'dist',
  },
});
