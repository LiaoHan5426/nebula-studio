import '@nebula-studio/nebula-ui/utils/highlightNebula';
import '@nebula-studio-internal/tailwind/electron';
import { bootSubApp } from '@nebula-studio-electron/electron-bridge/vue';
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

bootSubApp({ App });
