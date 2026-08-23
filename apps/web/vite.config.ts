import { fileURLToPath } from 'node:url';

import {
  createNebulaApiProxy,
  defineNebulaConfig,
  nebulaFederationHostPlugin,
  nebulaHostCspNoncePlugin,
  nebulaSubWebAliasPlugin,
  nebulaVueDemoPlugin,
  nebulaWorkspaceManifestPlugin,
  resolveShellWeb,
} from '@nebula-studio-internal/build-kit';

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
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    plugins: [
      ...nebulaFederationHostPlugin('nebula_web_host'),
      nebulaHostCspNoncePlugin(),
      nebulaWorkspaceManifestPlugin(),
      nebulaSubWebAliasPlugin(),
      nebulaVueDemoPlugin(),
    ],
    server: {
      // Listen on IPv4 as well as localhost so iframe-cross-demo (127.0.0.1) can load.
      host: true,
      allowedHosts: ['localhost', '127.0.0.1'],
      port: shellWeb.port,
      proxy: createNebulaApiProxy({ preset: 'integration' }),
    },
  },
});
