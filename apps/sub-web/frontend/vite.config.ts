import { defineNebulaSubAppConfig } from '@nebula-studio-internal/build-kit';

export default defineNebulaSubAppConfig({
  configModuleUrl: import.meta.url,
  appId: 'frontend',
});
