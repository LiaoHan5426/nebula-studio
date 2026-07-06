import {
  defineNebulaConfig,
  nebulaProxyDiscovery,
  resolveRendererSources,
} from '@nebula-studio-internal/vite';
import { fileURLToPath } from 'node:url';

import { createRendererAliasPlugin } from './vite.rendererAlias';

const root = fileURLToPath(new URL('.', import.meta.url));
const rendererSources = resolveRendererSources(import.meta.url);

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
      nebulaProxyDiscovery({
        subApps: ['integration', 'frontend', 'login', 'settings', 'docs'],
      }),
      createRendererAliasPlugin(
        rendererSources.flatMap(({ rendererName, dirName, srcPath }) => [
          { marker: `@nebula-studio-renderer/${rendererName}/`, src: srcPath },
          { marker: `/sub-web/${dirName}/`, src: srcPath },
        ]),
      ),
    ],
    server: {
      port: 5173,
    },
  },
});
