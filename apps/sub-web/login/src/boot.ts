import '@nebula-studio-internal/tailwind/electron';
import { bootMicroApp, detectRuntimeMode } from '@nebula-studio/runtime';
import type { RuntimeMode } from '@nebula-studio/runtime';
import AppComponent from './App.vue';

/**
 * Login 子应用统一启动入口。
 *
 * 由以下入口调用：
 * - `src/main.ts` — Vite standalone dev / Electron renderer
 * - `apps/web/src/embed/login-entry.ts` — Web shell iframe embed
 */
export async function bootLogin(opts?: { mode?: RuntimeMode }): Promise<void> {
  const mode = opts?.mode ?? detectRuntimeMode();

  await bootMicroApp({
    appId: 'login',
    mode,
    rootComponent: AppComponent,
    webPresentation:
      mode === 'electron'
        ? undefined
        : {
            scope: 'web-login',
            processVersions: { node: __NEBULA_BUILD_NODE_VERSION__ },
          },
    // login 自身即登录页，不启用 auth（避免循环跳转）
  });
}
