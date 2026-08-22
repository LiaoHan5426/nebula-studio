import { defineNebulaRemoteConfig } from '@nebula-studio-internal/vite';

export default defineNebulaRemoteConfig({
  configModuleUrl: import.meta.url,
  appId: 'hello',
  federationName: 'nebula_hello',
  devPort: 5191,
  exposes: {
    './application': './src/federation.ts',
  },
});
