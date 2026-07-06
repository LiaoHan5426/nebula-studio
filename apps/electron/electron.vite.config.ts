import {
  defineNebulaConfig,
  nebulaProxyDiscovery,
} from '@nebula-studio-internal/vite';
import { resolve } from 'node:path';

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
      plugins: [
        nebulaProxyDiscovery({
          subApps: ['integration', 'frontend', 'login', 'settings', 'docs'],
        }),
      ],
    },
  },
});
