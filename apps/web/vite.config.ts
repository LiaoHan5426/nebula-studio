import {
  createNebulaApiProxy,
  defineNebulaConfig,
  nebulaSubWebAliasPlugin,
  nebulaVueDemoPlugin,
  nebulaWorkspaceManifestPlugin,
} from '@nebula-studio-internal/vite';
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
  merge: {
    plugins: [
      nebulaWorkspaceManifestPlugin(),
      nebulaSubWebAliasPlugin(),
      nebulaVueDemoPlugin(),
    ],
    server: {
      port: 5173,
      proxy: createNebulaApiProxy({ preset: 'integration' }),
    },
  },
});
