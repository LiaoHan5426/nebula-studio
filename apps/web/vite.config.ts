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
  // The shell only owns async surface loaders. Automatic code splitting keeps
  // domain/editor chunks out of the synchronous shell entry.
  chunks: { enabled: false },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    manifest: true,
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
