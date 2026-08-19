import {
  defineNebulaSubAppConfig,
  nebulaVueDemoPlugin,
} from '@nebula-studio-internal/vite';

export default defineNebulaSubAppConfig({
  configModuleUrl: import.meta.url,
  appId: 'docs',
  plugins: [nebulaVueDemoPlugin()],
});
