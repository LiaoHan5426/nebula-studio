import { defineNebulaConfig } from '@nebula-studio-internal/vite';

export default defineNebulaConfig({
  platform: 'electron',
  configModuleUrl: import.meta.url,
});
