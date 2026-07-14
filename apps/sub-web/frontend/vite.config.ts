import { defineNebulaSubAppConfig } from '@nebula-studio-internal/vite';

export default defineNebulaSubAppConfig({
  configModuleUrl: import.meta.url,
  appId: 'frontend',
  proxyPreset: 'standard',
  devPort: 5175,
});
