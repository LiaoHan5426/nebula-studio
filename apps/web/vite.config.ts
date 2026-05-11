import { createNebulaRendererViteConfig } from '@nebula-studio-internal/vite';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

export default createNebulaRendererViteConfig({
  preset: 'web',
  root,
  base: process.env.VITE_BASE_PATH ?? '/',
  build: {
    outDir: 'dist-web',
    emptyOutDir: true,
  },
});
