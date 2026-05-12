import { defineNebulaConfig } from '@nebula-studio-internal/vite';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineNebulaConfig({
  platform: 'web',
  root,
  base: process.env.VITE_BASE_PATH ?? '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
