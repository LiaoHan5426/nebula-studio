import {
  createNebulaApiProxy,
  defineNebulaConfig,
  getNebulaAppManifest,
  nebulaWorkspaceManifestPlugin,
} from '@nebula-studio-internal/vite';
import { resolve } from 'node:path';

const electronPreloadSrcDir = resolve(
  import.meta.dirname,
  '../electron-preload/src',
);

const manifest = getNebulaAppManifest();

export default defineNebulaConfig({
  platform: 'electron',
  configModuleUrl: import.meta.url,
  unifiedPreload: {
    sourceDir: electronPreloadSrcDir,
    windowIds: manifest.preloadIds,
  },
  merge: {
    renderer: {
      plugins: [nebulaWorkspaceManifestPlugin()],
      server: {
        proxy: createNebulaApiProxy({ preset: 'integration' }),
      },
    },
  },
});
