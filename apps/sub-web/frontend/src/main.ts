import '@nebula-studio-internal/tailwind/electron';
import { ConfigProvider } from '@nebula-studio-electron/electron-shared-vue';
import './assets/main.css';
import './runtime/registerIntegratedApps';

import { createApp, h } from 'vue';
import App from './App.vue';

createApp({
  render() {
    return h(
      ConfigProvider,
      { manageDom: true },
      {
        default: () => h(App),
      },
    );
  },
}).mount('#app');
