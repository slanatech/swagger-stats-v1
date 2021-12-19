import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

const customElements = ['trace-viewer', 'perspective-viewer'];

export default defineConfig({
  base: '/',
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => {
            return customElements.includes(tag);
          },
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true,
  },
  server: {
    open: true,
    proxy: {
      '/stats': {
        target: 'http://localhost:3060',
        changeOrigin: true,
        secure: false,
      },
      '/sws': {
        target: 'http://localhost:8086',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});
