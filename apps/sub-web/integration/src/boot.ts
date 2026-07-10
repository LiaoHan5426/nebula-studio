import '@nebula-studio-internal/tailwind/electron';
import '@nebula-studio-renderer/integration/bootstrap-runtime';
import {
  clearWebAuthSession,
  resolveShellEventBus,
  wireShellEventBus,
} from '@nebula-studio/app-shell';
import type { ShellEventBus } from '@nebula-studio/app-shell';
import { bootMicroApp, detectRuntimeMode } from '@nebula-studio/runtime';
import type { RuntimeMode } from '@nebula-studio/runtime';
import { install as installVxeTable } from 'vxe-table';
import { install as installVxePcUi } from 'vxe-pc-ui';
import AppComponent from './App.vue';
import router from './router';

/**
 * Integration 子应用统一启动入口。
 *
 * 由以下入口调用：
 * - `src/dev/main.ts` — Vite standalone dev (:5174)
 * - `src/main.ts` — Electron renderer
 * - `apps/web/src/embed/integration-entry.ts` — Web shell iframe embed
 */
export async function bootIntegration(opts?: {
  mode?: RuntimeMode;
  shellEventBus?: ShellEventBus;
}): Promise<void> {
  const mode = opts?.mode ?? detectRuntimeMode();
  const shellEventBus = resolveShellEventBus(opts?.shellEventBus);
  wireShellEventBus(shellEventBus, {
    onTenantChanged: () => {
      window.location.reload();
    },
    onAuthLogout: () => {
      clearWebAuthSession();
      window.location.reload();
    },
  });

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

  await bootMicroApp({
    appId: 'integration',
    mode,
    rootComponent: AppComponent,
    router,
    webPresentation:
      mode === 'electron'
        ? undefined
        : {
            scope:
              mode === 'platform-embed'
                ? 'web-embed-integration'
                : 'integration-standalone',
            processVersions: { node: __NEBULA_BUILD_NODE_VERSION__ },
          },
    // 统一认证：由 AuthBootstrap 按 mode 自动选择策略
    auth: { enabled: true },
    shellEventBus,
    embedDefaultRoute: mode === 'platform-embed' ? '/subscriptions' : undefined,
    beforeMount(app) {
      installVxePcUi(app);
      installVxeTable(app);
    },
  });
}
