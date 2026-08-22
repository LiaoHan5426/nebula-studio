import { bootMicroApp } from '@nebula-studio/runtime';
import type { RuntimeMode } from '@nebula-studio/runtime';
import { installWebPresentationUnlessElectron } from '@nebula-studio/shell-host';
import {
  installAssemblyForSubApp,
  wrapSubAppWithAssembly,
} from '@nebula-studio-renderer/assembly-boot';
import LoginApp from '@nebula-studio-renderer/login/app';

import '@nebula-studio-internal/tailwind/electron';

/**
 * Host-owned login surface for Web `/?embed=login` and the Electron login window.
 * UI remains `@nebula-studio-renderer/login/app`; lifecycle is Host boot, not login/boot.
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

  await bootMicroApp({
    appId: 'host-login',
    mode,
    rootComponent: wrapSubAppWithAssembly(LoginApp),
    beforeMount(app) {
      installAssemblyForSubApp(app, mode);
    },
  });
}
