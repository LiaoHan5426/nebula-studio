import type { RuntimeMode } from '@nebula-studio/shell-protocol';

import { startApplication } from '@nebula-studio/application-bootstrap';
import AppComponent from '@nebula-studio/login-ui';
import { installWebPresentationUnlessElectron } from '@nebula-studio/shell-host';
import '@nebula-studio/styles/document';

import {
  installAssemblyForSubApp,
  wrapSubAppWithAssembly,
} from '@nebula-studio-renderer/assembly-boot';

/**
 * Login 子应用统一启动入口。
 *
 * 由以下入口调用：
 * - `src/main.ts` — Vite standalone `dev` only
 * Host Web `/?embed=login` 与 Electron 登录窗走 `apps/web/src/auth/bootHostLogin.ts`，不再调用本文件。
 */
export async function bootLogin(opts: { mode: RuntimeMode }): Promise<void> {
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

  installWebPresentationUnlessElectron(mode, {
    scope: 'web-login',
    processVersions: { node: __NEBULA_BUILD_NODE_VERSION__ },
  });

  await startApplication({
    appId: 'login',
    mode,
    rootComponent: wrapSubAppWithAssembly(AppComponent),
    // login 自身即登录页，不启用 auth（避免循环跳转）
    beforeMount(app) {
      installAssemblyForSubApp(app, mode);
    },
  });
}
