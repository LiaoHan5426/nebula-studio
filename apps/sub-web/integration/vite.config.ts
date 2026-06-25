import { fileURLToPath } from 'node:url';

import { defineNebulaConfig } from '@nebula-studio-internal/vite';

import { integrationApiProxy } from './vite.integrationProxy.ts';

const root = fileURLToPath(new URL('.', import.meta.url));

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
      port: 5174,
      proxy: integrationApiProxy(),
    },
  },
});
