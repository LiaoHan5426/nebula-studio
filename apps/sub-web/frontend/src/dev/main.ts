import '@nebula-studio-internal/tailwind/electron';
import {
  installWebPresentation,
  redirectShellToWebLogin,
  shouldRedirectUnauthenticatedWebShell,
} from '@nebula-studio/app-shell';
import { ConfigProvider } from '@nebula-studio-electron/electron-bridge/vue';
import { createApp, h } from 'vue';
import App from '../App.vue';
import '../assets/main.css';
import '../runtime/registerIntegratedApps';

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
