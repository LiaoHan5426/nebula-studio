import '@nebula-studio-internal/tailwind/electron';
import {
  installWebPresentation,
  redirectShellToWebLogin,
  registerShellIntegratedApps,
  setShellIntegrableOrder,
  shouldRedirectUnauthenticatedWebShell,
} from '@nebula-studio/app-shell';
import { INTEGRATED_APPS, INTEGRABLE_ORDER } from './integratedAppsConfig';
import { ConfigProvider } from '@nebula-studio-electron/electron-shared-vue';
import { createApp, h } from 'vue';
import App from '@nebula-studio-renderer/main/app';

registerShellIntegratedApps(INTEGRATED_APPS);
setShellIntegrableOrder(INTEGRABLE_ORDER);

installWebPresentation({
  scope: 'web-shell',
  registerShellHostIpc: true,
  processVersions: {
    node: __NEBULA_BUILD_NODE_VERSION__,
  },
});

if (shouldRedirectUnauthenticatedWebShell()) {
  redirectShellToWebLogin(window.location.href);
} else {
  createApp({
    render: () =>
      h(
        ConfigProvider,
        { manageDom: true },
        {
          default: () => h(App),
        },
      ),
  }).mount('#app');
}
