import '@nebula-studio-internal/tailwind/electron';
import '@nebula-studio-renderer/integration/bootstrap-runtime';
import { installWebPresentation } from '@nebula-studio/app-shell';
import { ConfigProvider } from '@nebula-studio-electron/electron-shared-vue';
import { createApp, h } from 'vue';
import { install as installVxeTable } from 'vxe-table';
import { install as installVxePcUi } from 'vxe-pc-ui';
import App from './App.vue';
import router from './router';

installWebPresentation({
  scope: 'integration-standalone',
  processVersions: {
    node: __NEBULA_BUILD_NODE_VERSION__,
  },
});

const app = createApp({
  render() {
    return h(
      ConfigProvider,
      { manageDom: true },
      {
        default: () => h(App),
      },
    );
  },
});

installVxePcUi(app);
installVxeTable(app);

app.use(router).mount('#app');
