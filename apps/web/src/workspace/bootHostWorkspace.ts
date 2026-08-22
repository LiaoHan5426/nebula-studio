import {
  redirectShellToWebLogin,
  resolveShellEventBus,
  shouldRedirectUnauthenticatedWebShell,
} from '@nebula-studio/app-shell';
import {
  installShellHostBridge,
  installWebPresentationUnlessElectron,
} from '@nebula-studio/shell-host';
import '@nebula-studio/nebula-layout';
import '@nebula-studio/nebula-ui';
import {
  installAssemblyForSubApp,
  wrapSubAppWithAssembly,
} from '@nebula-studio-renderer/assembly-boot';
import FrontendApp from '@nebula-studio-renderer/main/app';
import {
  bootstrapShellIntegratedApps,
  hydrateShellIntegratedAppsFromRuntime,
} from '@nebula-studio-renderer/main/platform/integrated-apps';
import { bootMicroApp } from '@nebula-studio/runtime';
import type { RuntimeMode } from '@nebula-studio/runtime';

import '@nebula-studio-internal/tailwind/electron';

/**
 * Host-owned workspace shell for Web (no embed query) and the Electron main window.
 * UI remains `@nebula-studio-renderer/main/app`; lifecycle is Host boot, not main/boot.
 */
export async function bootHostWorkspace(mode: RuntimeMode): Promise<void> {
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

  bootstrapShellIntegratedApps();
  await hydrateShellIntegratedAppsFromRuntime();

  if (mode === 'standalone' && shouldRedirectUnauthenticatedWebShell()) {
    redirectShellToWebLogin(window.location.href);
    return;
  }

  installShellHostBridge(mode);
  installWebPresentationUnlessElectron(mode, {
    scope: 'web-shell',
    registerShellHostIpc: mode !== 'platform-embed',
    processVersions: { node: __NEBULA_BUILD_NODE_VERSION__ },
  });

  await bootMicroApp({
    appId: 'host-workspace',
    mode,
    rootComponent: wrapSubAppWithAssembly(FrontendApp),
    auth: { enabled: mode !== 'electron' },
    shellEventBus: resolveShellEventBus(),
    beforeMountAsync: async () => {
      await hydrateShellIntegratedAppsFromRuntime();
    },
    beforeMount(app) {
      installAssemblyForSubApp(app, mode);
    },
  });
}
