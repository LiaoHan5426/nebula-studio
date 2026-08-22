import { defineNebulaRemoteConfig } from '@nebula-studio-internal/vite';

export default defineNebulaRemoteConfig({
  configModuleUrl: import.meta.url,
  appId: 'hello-style-b',
  federationName: 'nebula_hello_style_b',
  devPort: 5192,
  exposes: {
    './application': './src/federation.ts',
  },
});
