import type { RuntimeMode } from '@nebula-studio/shell-protocol';

import { HOST_CAPABILITIES_KEY } from '@nebula-studio/application-contract';
import { createWebEmbedHostCapabilities } from '@nebula-studio/host-capabilities';
import { bootMicroApp } from '@nebula-studio/runtime';
import { installWebPresentationUnlessElectron } from '@nebula-studio/shell-host';
import '@nebula-studio/styles/document';

import {
  installAssemblyForSubApp,
  wrapSubAppWithAssembly,
} from '@nebula-studio-renderer/assembly-boot';

import AppComponent from './App.vue';
import router from './router';

/**
 * Settings 子应用统一启动入口。
 *
 * 由以下入口调用：
 * - `src/main.ts` — Vite standalone / Electron 非 federation 调试
 * Host Federation 走 `src/federation.ts`，不再经过 bootMicroApp。
 */
export async function bootSettings(opts: { mode: RuntimeMode }): Promise<void> {
  const mode = opts.mode;
  document.documentElement.dataset.nebulaCss = 'settings';

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
    scope:
      mode === 'platform-embed' ? 'web-embed-settings' : 'settings-standalone',
    processVersions: { node: __NEBULA_BUILD_NODE_VERSION__ },
  });

  await bootMicroApp({
    appId: 'settings',
    mode,
    rootComponent: wrapSubAppWithAssembly(AppComponent),
    router,
    auth: { enabled: true },
    embedDefaultRoute: mode === 'platform-embed' ? '/users' : undefined,
    beforeMount(app) {
      app.provide(HOST_CAPABILITIES_KEY, createWebEmbedHostCapabilities());
      installAssemblyForSubApp(app, mode);
    },
  });
}
