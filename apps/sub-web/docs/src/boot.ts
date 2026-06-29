import '@nebula-studio/nebula-ui/utils/highlightNebula';
import '@nebula-studio-internal/tailwind/electron';
import { bootMicroApp, detectRuntimeMode } from '@nebula-studio/runtime';
import type { RuntimeMode } from '@nebula-studio/runtime';
import AppComponent from './App.vue';

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
    webPresentation:
      mode === 'electron'
        ? undefined
        : {
            scope: 'web',
            processVersions: { node: __NEBULA_BUILD_NODE_VERSION__ },
          },
    // docs 不需要 auth
  });
}
