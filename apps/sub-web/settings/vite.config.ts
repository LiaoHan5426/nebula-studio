import { defineNebulaSubAppConfig } from '@nebula-studio-internal/build-kit';

export default defineNebulaSubAppConfig({
  configModuleUrl: import.meta.url,
  appId: 'settings',
  federation: {
    name: 'nebula_settings',
    exposes: {
      './application': './src/federation.ts',
    },
  },
});
