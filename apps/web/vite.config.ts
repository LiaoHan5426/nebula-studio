import { defineNebulaConfig } from '@nebula-studio-internal/vite';
import { fileURLToPath } from 'node:url';

import { integrationApiProxy } from '../sub-web/integration/vite.integrationProxy';
import { createRendererAliasPlugin } from './vite.rendererAlias';

const root = fileURLToPath(new URL('.', import.meta.url));
const rendererSrc = {
  main: fileURLToPath(new URL('../sub-web/frontend/src', import.meta.url)),
  integration: fileURLToPath(
    new URL('../sub-web/integration/src', import.meta.url),
  ),
  settings: fileURLToPath(new URL('../sub-web/settings/src', import.meta.url)),
};

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
      createRendererAliasPlugin([
        { marker: '@nebula-studio-renderer/main/', src: rendererSrc.main },
        { marker: '/sub-web/frontend/', src: rendererSrc.main },
        {
          marker: '@nebula-studio-renderer/integration/',
          src: rendererSrc.integration,
        },
        { marker: '/sub-web/integration/', src: rendererSrc.integration },
        {
          marker: '@nebula-studio-renderer/settings/',
          src: rendererSrc.settings,
        },
        { marker: '/sub-web/settings/', src: rendererSrc.settings },
      ]),
    ],
    server: {
      port: 5173,
      proxy: integrationApiProxy(),
    },
  },
});
