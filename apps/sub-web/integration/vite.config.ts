import { defineNebulaSubAppConfig } from '@nebula-studio-internal/vite';

export default defineNebulaSubAppConfig({
  configModuleUrl: import.meta.url,
  appId: 'integration',
  federation: {
    name: 'nebula_integration',
    exposes: {
      './application': './src/federation.ts',
    },
  },
});
