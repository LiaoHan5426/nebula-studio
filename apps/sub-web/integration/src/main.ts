import '@nebula-studio-internal/tailwind/electron';
import '@nebula-studio-renderer/integration/bootstrap-runtime';
import { installWebPresentation } from '@nebula-studio/app-shell';
import { bootSubApp } from '@nebula-studio-electron/electron-bridge/vue';
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

bootSubApp({
  App,
  router,
  beforeMount(app) {
    installVxePcUi(app);
    installVxeTable(app);
  },
});
