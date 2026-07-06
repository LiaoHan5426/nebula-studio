import '@nebula-studio-internal/tailwind/electron';
import { bootMicroApp, detectRuntimeMode } from '@nebula-studio/runtime';
import type { RuntimeMode } from '@nebula-studio/runtime';
import AppComponent from './App.vue';
import router from './router';

/**
 * Docs 子应用统一启动入口。
 *
 * 由以下入口调用：
 * - `src/main.ts` — Vite standalone dev / Electron renderer
 * - `apps/web/src/embed/docs-entry.ts` — Web shell iframe embed
 */
export async function bootDocs(opts?: { mode?: RuntimeMode }): Promise<void> {
  const mode = opts?.mode ?? detectRuntimeMode();

  await bootMicroApp({
    appId: 'docs',
    mode,
    rootComponent: AppComponent,
    router,
    webPresentation:
      mode === 'electron'
        ? undefined
        : {
            scope: 'docs-standalone',
            processVersions: { node: __NEBULA_BUILD_NODE_VERSION__ },
          },
    auth: { enabled: false },
  });
}
