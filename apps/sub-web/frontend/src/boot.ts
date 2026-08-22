import type { RuntimeMode } from '@nebula-studio/shell-protocol';

import {
  redirectShellToWebLogin,
  shouldRedirectUnauthenticatedWebShell,
} from '@nebula-studio/auth-provider/web';
import '@nebula-studio/nebula-layout';
import '@nebula-studio/nebula-ui';
import { bootMicroApp } from '@nebula-studio/runtime';
import {
  installShellHostBridge,
  installWebPresentationUnlessElectron,
} from '@nebula-studio/shell-host';
import { resolveShellEventBus } from '@nebula-studio/shell-protocol';
import '@nebula-studio/styles/document';

import {
  installAssemblyForSubApp,
  wrapSubAppWithAssembly,
} from '@nebula-studio-renderer/assembly-boot';

import AppComponent from './App.vue';
import {
  bootstrapShellIntegratedApps,
  hydrateShellIntegratedAppsFromRuntime,
} from './platform/integratedApps';

/**
 * Frontend (Shell) 子应用统一启动入口。
 *
 * 由以下入口调用：
 * - `src/main.ts` — Vite standalone `dev` only
 * Host Web / Electron 工作台走 `apps/web/src/workspace/bootHostWorkspace.ts`，不再调用本文件。
 */
export async function bootFrontend(opts: { mode: RuntimeMode }): Promise<void> {
  const mode = opts.mode;

  // MSW mock：仅 GitHub demo 部署时启用（构建时由 NEBULA_MSW_ENABLED 环境变量注入）
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

  const shellEventBus = resolveShellEventBus();

  // standalone 模式下未登录时重定向到登录页
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
    appId: 'frontend',
    mode,
    rootComponent: wrapSubAppWithAssembly(AppComponent),
    // Electron shell owns the login UI and must mount before a session exists.
    // Gating it here makes a fresh desktop launch return without mounting Vue,
    // leaving an intentional-but-silent blank window.
    auth: { enabled: mode !== 'electron' },
    shellEventBus,
    beforeMountAsync: async () => {
      const { registerIntegratedApps } =
        await import('./runtime/registerIntegratedApps');
      await registerIntegratedApps();
    },
    beforeMount(app) {
      installAssemblyForSubApp(app, mode);
    },
  });
}
