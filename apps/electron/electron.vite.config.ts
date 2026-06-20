import { defineNebulaConfig } from '@nebula-studio-internal/vite';

import { integrationApiProxy } from '../sub-web/integration/vite.integrationProxy';

export default defineNebulaConfig({
  platform: 'electron',
  configModuleUrl: import.meta.url,
  merge: {
    renderer: {
      server: {
        proxy: integrationApiProxy(),
      },
    },
  },
});
