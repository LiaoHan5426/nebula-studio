import { fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite-plus';

const root = fileURLToPath(new URL('.', import.meta.url));

const buildNodeVersion = process.version.replace(/^v/, '');

export default defineConfig({
  plugins: [vue()],
  base: process.env.VITE_BASE_PATH ?? '/',
  root,
  resolve: {
    dedupe: ['vue'],
  },
  optimizeDeps: {
    include: ['marked'],
  },
  server: {
    port: 5174,
    strictPort: true,
  },
  define: {
    __NEBULA_BUILD_NODE_VERSION__: JSON.stringify(buildNodeVersion),
  },
  build: {
    outDir: 'dist-web',
    emptyOutDir: true,
  },
});
