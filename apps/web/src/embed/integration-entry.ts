import '@nebula-studio-internal/tailwind/electron';
import { installWebPresentation } from '@nebula-studio/app-shell';
import { ConfigProvider } from '@nebula-studio-electron/electron-shared-vue';
import { createApp, h } from 'vue';
import App from '@nebula-studio-renderer/integration/app';
import router from '@nebula-studio-renderer/integration/router';

installWebPresentation({
  scope: 'web-embed-integration',
  processVersions: {
    node: __NEBULA_BUILD_NODE_VERSION__,
  },
});

createApp({
  render: () =>
    h(
      ConfigProvider,
      { manageDom: true },
      {
        default: () => h(App),
      },
    ),
})
  .use(router)
  .mount('#app');
