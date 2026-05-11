import { createNebulaRendererViteConfig } from '@nebula-studio-internal/vite';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

export default createNebulaRendererViteConfig({
  preset: 'docs',
  root,
  base: process.env.VITE_BASE_PATH ?? '/',
  server: {
    port: 5174,
    strictPort: true,
  },
  build: {
    outDir: 'dist-web',
    emptyOutDir: true,
  },
});
