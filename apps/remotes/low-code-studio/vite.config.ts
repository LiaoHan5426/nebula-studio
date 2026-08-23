import { defineNebulaRemoteConfig } from '@nebula-studio-internal/build-kit';

export default defineNebulaRemoteConfig({
  configModuleUrl: import.meta.url,
  appId: 'low-code-studio',
  federationName: 'nebula_low_code_studio',
  devPort: 5194,
  exposes: {
    './application': './src/application.ts',
    './runtime-application': './src/runtime-application.ts',
  },
});
