import { defineNebulaConfig } from '@nebula-studio-internal/vite';
import { resolve } from 'node:path';

import { integrationApiProxy } from '../sub-web/integration/vite.integrationProxy';

const electronPreloadSrcDir = resolve(
  import.meta.dirname,
  '../electron-preload/src',
);

export default defineNebulaConfig({
  platform: 'electron',
  configModuleUrl: import.meta.url,
  unifiedPreload: {
    sourceDir: electronPreloadSrcDir,
    windowIds: ['main', 'docs', 'settings'],
  },
  merge: {
    renderer: {
      server: {
        proxy: integrationApiProxy(),
      },
    },
  },
});
