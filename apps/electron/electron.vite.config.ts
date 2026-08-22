import { resolve } from 'node:path';

import {
  createNebulaApiProxy,
  defineNebulaConfig,
  getNebulaAppManifest,
  nebulaFederationHostPlugin,
  nebulaHostCspNoncePlugin,
  nebulaWorkspaceManifestPlugin,
} from '@nebula-studio-internal/vite';

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
    entries: manifest.preloadCapabilities,
  },
  merge: {
    renderer: {
      resolve: {
        alias: {
          '@nebula-host-boot/workspace': resolve(
            import.meta.dirname,
            '../web/src/workspace/bootHostWorkspace.ts',
          ),
          '@nebula-host-boot/login': resolve(
            import.meta.dirname,
            '../web/src/auth/bootHostLogin.ts',
          ),
        },
      },
      plugins: [
        ...nebulaFederationHostPlugin('nebula_electron_host'),
        nebulaHostCspNoncePlugin(),
        nebulaWorkspaceManifestPlugin(),
      ],
      publicDir: resolve(import.meta.dirname, 'public'),
      server: {
        host: true,
        allowedHosts: ['localhost', '127.0.0.1'],
        proxy: createNebulaApiProxy({ preset: 'integration' }),
      },
    },
  },
});
