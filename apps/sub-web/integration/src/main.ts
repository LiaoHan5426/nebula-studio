import '@nebula-studio-internal/tailwind/electron';
import { ConfigProvider } from '@nebula-studio-electron/electron-shared-vue';
import { createApp, h } from 'vue';
import { install as installVxeTable } from 'vxe-table';
import { install as installVxePcUi } from 'vxe-pc-ui';
import App from './App.vue';
import router from './router';

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
