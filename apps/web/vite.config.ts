import { defineNebulaConfig } from '@nebula-studio-internal/vite';
import { fileURLToPath } from 'node:url';

import { integrationApiProxy } from '../sub-web/integration/vite.integrationProxy';

const root = fileURLToPath(new URL('.', import.meta.url));
/** integration renderer 在 embed 模式下通过 `@/` 引用自身 src，需与 sub-web/integration/vite.config 保持一致 */
const integrationSrc = fileURLToPath(
  new URL('../sub-web/integration/src', import.meta.url),
);

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
        '@': integrationSrc,
      },
    },
    server: {
      port: 5173,
      proxy: integrationApiProxy(),
    },
  },
});
