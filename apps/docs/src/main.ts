import '@nebula-studio/nebula-ui/utils/highlightNebula';
import '@nebula-studio-internal/tailwind/electron';
import { ConfigProvider } from '@nebula-studio-electron/electron-shared-vue';
import { createApp, h } from 'vue';
import App from './App.vue';
import { installWebStubs } from './runtime/installWebStubs';

installWebStubs({
  scope: 'web',
  theme: {
    storageKey: 'nebula-docs-theme',
    default: 'dark',
  },
  locale: {
    storageKey: 'nebula-docs-locale',
    default: 'zh-CN',
  },
  processVersions: {
    node: __NEBULA_BUILD_NODE_VERSION__,
  },
});

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
