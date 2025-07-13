import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/bezier-curve/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
