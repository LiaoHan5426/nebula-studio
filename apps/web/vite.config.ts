import { fileURLToPath } from 'node:url';

import {
  createNebulaApiProxy,
  defineNebulaConfig,
  nebulaSubWebAliasPlugin,
  nebulaVueDemoPlugin,
  nebulaWorkspaceManifestPlugin,
  resolveShellWeb,
} from '@nebula-studio-internal/vite';

const root = fileURLToPath(new URL('.', import.meta.url));
const shellWeb = resolveShellWeb();

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
      port: shellWeb.port,
      proxy: createNebulaApiProxy({ preset: 'integration' }),
    },
  },
});
