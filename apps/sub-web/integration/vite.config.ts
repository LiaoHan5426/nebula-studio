import { defineNebulaSubAppConfig } from '@nebula-studio-internal/vite';

export default defineNebulaSubAppConfig({
  configModuleUrl: import.meta.url,
  appId: 'integration',
  proxyPreset: 'integration',
  devPort: 5174,
});
