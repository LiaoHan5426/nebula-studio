import { fileURLToPath } from 'node:url';

import { defineNebulaConfig } from '@nebula-studio-internal/vite';

const root = fileURLToPath(new URL('.', import.meta.url));
const CONSOLE_TARGET = 'http://localhost:8080';

export default defineNebulaConfig({
  platform: 'web',
  root,
  base: process.env.VITE_BASE_PATH ?? '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  merge: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: CONSOLE_TARGET,
          changeOrigin: true,
        },
      },
    },
  },
});
