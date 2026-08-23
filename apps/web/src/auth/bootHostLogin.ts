import type { RuntimeMode } from '@nebula-studio/shell-protocol';

import { startApplication } from '@nebula-studio/application-bootstrap';
import LoginApp from '@nebula-studio/login-ui';
import { installWebPresentationUnlessElectron } from '@nebula-studio/shell-host';
import '@nebula-studio/styles/document';

import {
  installAssemblyForSubApp,
  wrapSubAppWithAssembly,
} from '@nebula-studio-renderer/assembly-boot';

/**
 * Host-owned login surface for Web `/?embed=login` and the Electron login window.
 * UI is `@nebula-studio/login-ui`; lifecycle is Host boot, not login/boot.
 */
export async function bootHostLogin(mode: RuntimeMode): Promise<void> {
  window.__NEBULA_RUNTIME_MODE__ = mode;

  if (__NEBULA_MSW_ENABLED__) {
    const { worker } = await import('@nebula-studio/msw/browser');
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: `${__NEBULA_MSW_BASE_PATH__ || '/'}mockServiceWorker.js`,
      },
    });
  }

  installWebPresentationUnlessElectron(mode, {
    scope: 'web-login',
    processVersions: { node: __NEBULA_BUILD_NODE_VERSION__ },
  });

  await startApplication({
    appId: 'host-login',
    mode,
    rootComponent: wrapSubAppWithAssembly(LoginApp),
    beforeMount(app) {
      installAssemblyForSubApp(app, mode);
    },
  });
}
