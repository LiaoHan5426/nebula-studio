import { nebulaWebShell } from '@nebula-studio/vite-plugin-web-shell';
import { fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite-plus';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [vue(), nebulaWebShell()],
  base: process.env.VITE_BASE_PATH ?? '/',
  root,
  resolve: {
    dedupe: ['highlight.js', 'vue'],
  },
  optimizeDeps: {
    include: ['highlight.js/lib/common', 'marked'],
  },
  build: {
    outDir: 'dist-web',
    emptyOutDir: true,
  },
});
