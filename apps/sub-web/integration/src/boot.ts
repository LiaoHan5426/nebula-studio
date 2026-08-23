import type { RuntimeMode, ShellEventBus } from '@nebula-studio/shell-protocol';

import { startApplication } from '@nebula-studio/application-bootstrap';
import { HOST_CAPABILITIES_KEY } from '@nebula-studio/application-contract';
import { clearWebAuthSession } from '@nebula-studio/auth-provider/storage';
import { createWebEmbedHostCapabilities } from '@nebula-studio/host-capabilities';
import '@nebula-studio/nebula-layout';
import '@nebula-studio/nebula-ui';
import { installWebPresentationUnlessElectron } from '@nebula-studio/shell-host';
import { resolveShellEventBus } from '@nebula-studio/shell-protocol';
import '@nebula-studio/styles/document';

import {
  installAssemblyForSubApp,
  wrapSubAppWithAssembly,
} from '@nebula-studio-renderer/assembly-boot';
import { install as installVxePcUi } from 'vxe-pc-ui';
import { install as installVxeTable } from 'vxe-table';

import AppComponent from './App.vue';
import router from './router';
import { bindHostCapabilities } from './shared/hostCapabilityBridge';
import { createIntegrationSession } from './shared/runtime/session';

import '@nebula-studio-renderer/integration/bootstrap-runtime';

/**
 * Integration 子应用统一启动入口。
 *
 * 由以下入口调用：
 * - `src/dev/main.ts` — Vite standalone dev（端口来自 configs/windows.json）
 * - `src/main.ts` — Electron 非 federation 调试
 * Host Federation 走 `src/federation.ts`，不再经过 startApplication。
 */
export async function bootIntegration(opts: {
  mode: RuntimeMode;
  shellEventBus?: ShellEventBus;
}): Promise<void> {
  const mode = opts.mode;
  const shellEventBus = resolveShellEventBus(opts?.shellEventBus);
  document.documentElement.dataset.nebulaCss = 'integration';

  // 供鉴权/嵌入检测在 History 丢掉 ?embed= 后仍能识别 iframe 子应用
  window.__NEBULA_RUNTIME_MODE__ = mode;
  if (mode === 'platform-embed') {
    window.__NEBULA_EMBED_SURFACE__ = 'integration';
  }

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
      mode === 'platform-embed'
        ? 'web-embed-integration'
        : 'integration-standalone',
    processVersions: { node: __NEBULA_BUILD_NODE_VERSION__ },
  });

  const capabilities = createWebEmbedHostCapabilities();
  const session = await createIntegrationSession(capabilities);

  await startApplication({
    appId: 'integration',
    mode,
    rootComponent: wrapSubAppWithAssembly(AppComponent),
    router,
    // 统一认证：由 AuthBootstrap 按 mode 自动选择策略
    auth: { enabled: true },
    shellEventBus,
    shellEventBusHandlers: {
      onTenantChanged: () => {
        session.resetSession();
      },
      onAuthLogout: () => {
        clearWebAuthSession();
        session.resetSession();
      },
    },
    embedDefaultRoute: mode === 'platform-embed' ? '/catalog' : undefined,
    beforeMount(app) {
      bindHostCapabilities(capabilities);
      app.provide(HOST_CAPABILITIES_KEY, capabilities);
      session.install(app);
      installAssemblyForSubApp(app, mode);
      installVxePcUi(app);
      installVxeTable(app);
    },
  });
}
