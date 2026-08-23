import { defineNebulaRemoteConfig } from '@nebula-studio-internal/build-kit';

export default defineNebulaRemoteConfig({
  configModuleUrl: import.meta.url,
  appId: 'hello-dual',
  federationName: 'nebula_hello_dual',
  devPort: 5193,
  exposes: {
    './application': './src/application.ts',
    './runtime-application': './src/runtime-application.ts',
  },
});
