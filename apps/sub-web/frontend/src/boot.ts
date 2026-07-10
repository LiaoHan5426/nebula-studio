import '@nebula-studio/nebula-ui';
import '@nebula-studio/nebula-layout';
import '@nebula-studio-internal/tailwind/electron';
import {
  redirectShellToWebLogin,
  resolveShellEventBus,
  shouldRedirectUnauthenticatedWebShell,
} from '@nebula-studio/app-shell';
import { bootMicroApp, detectRuntimeMode } from '@nebula-studio/runtime';
import type { RuntimeMode } from '@nebula-studio/runtime';
import { bootstrapShellIntegratedApps } from './platform/integratedApps';
import AppComponent from './App.vue';

/**
 * Frontend (Shell) 子应用统一启动入口。
 *
 * 由以下入口调用：
 * - `src/main.ts` — Vite standalone dev / Electron renderer
 * - `apps/web/src/shell-entry.ts` — Web shell 薄 re-export
 */
export async function bootFrontend(opts?: {
  mode?: RuntimeMode;
}): Promise<void> {
  const mode = opts?.mode ?? detectRuntimeMode();

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

  const shellEventBus = resolveShellEventBus();

  // standalone 模式下未登录时重定向到登录页
  if (mode === 'standalone' && shouldRedirectUnauthenticatedWebShell()) {
    redirectShellToWebLogin(window.location.href);
    return;
  }

  await bootMicroApp({
    appId: 'frontend',
    mode,
    rootComponent: AppComponent,
    webPresentation:
      mode === 'electron'
        ? undefined
        : {
            scope: 'web-shell',
            registerShellHostIpc: mode !== 'platform-embed',
            processVersions: { node: __NEBULA_BUILD_NODE_VERSION__ },
          },
    auth: { enabled: true },
    shellEventBus,
    beforeMountAsync: async () => {
      // 动态导入 registerIntegratedApps（保持原有副作用）
      await import('./runtime/registerIntegratedApps');
    },
  });
}
