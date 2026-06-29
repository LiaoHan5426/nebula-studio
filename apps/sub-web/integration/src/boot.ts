import '@nebula-studio-internal/tailwind/electron';
import '@nebula-studio-renderer/integration/bootstrap-runtime';
import { bootMicroApp, detectRuntimeMode } from '@nebula-studio/runtime';
import type { RuntimeMode } from '@nebula-studio/runtime';
import { bootstrapAuthFromShell } from '@nebula-studio-renderer/integration/bootstrap-auth';
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
}): Promise<void> {
  const mode = opts?.mode ?? detectRuntimeMode();

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
    authGuard:
      mode === 'platform-embed'
        ? async () => {
            await bootstrapAuthFromShell();
            return true;
          }
        : undefined,
    embedDefaultRoute: mode === 'platform-embed' ? '/subscriptions' : undefined,
    beforeMount(app) {
      installVxePcUi(app);
      installVxeTable(app);
    },
  });
}
