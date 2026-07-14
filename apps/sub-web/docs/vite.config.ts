import {
  defineNebulaSubAppConfig,
  nebulaVueDemoPlugin,
} from '@nebula-studio-internal/vite';

export default defineNebulaSubAppConfig({
  configModuleUrl: import.meta.url,
  appId: 'docs',
  proxyPreset: false,
  devPort: 5176,
  plugins: [nebulaVueDemoPlugin()],
});
