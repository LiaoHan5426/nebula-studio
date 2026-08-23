import type { RuntimeMode } from '@nebula-studio/shell-protocol';

import { startApplication } from '@nebula-studio/application-bootstrap';
import { HOST_CAPABILITIES_KEY } from '@nebula-studio/application-contract';
import { createWebEmbedHostCapabilities } from '@nebula-studio/host-capabilities';
import {
  bindI18nToHostLocale,
  bootNebulaI18n,
  normalizeNebulaLocale,
} from '@nebula-studio/i18n';
import { installWebPresentationUnlessElectron } from '@nebula-studio/shell-host';
import '@nebula-studio/styles/document';

import {
  installAssemblyForSubApp,
  wrapSubAppWithAssembly,
} from '@nebula-studio-renderer/assembly-boot';

import AppComponent from './App.vue';
import { loadSettingsMessages } from './i18n/loadMessages.ts';
import router from './router';

/**
 * Settings 子应用统一启动入口。
 *
 * 由以下入口调用：
 * - `src/main.ts` — Vite standalone / Electron 非 federation 调试
 * Host Federation 走 `src/federation.ts`，不再经过 startApplication。
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

  const capabilities = createWebEmbedHostCapabilities();
  const i18nHandle = await bootNebulaI18n({
    appId: 'settings',
    locale: normalizeNebulaLocale(capabilities.locale?.locale),
    loadMessages: loadSettingsMessages,
  });
  const stopLocale = bindI18nToHostLocale(i18nHandle, capabilities.locale);

  await startApplication({
    appId: 'settings',
    mode,
    rootComponent: wrapSubAppWithAssembly(AppComponent),
    router,
    auth: { enabled: true },
    embedDefaultRoute: mode === 'platform-embed' ? '/users' : undefined,
    beforeMount(app) {
      app.use(i18nHandle.i18n);
      app.provide(HOST_CAPABILITIES_KEY, capabilities);
      installAssemblyForSubApp(app, mode);
    },
  });

  void stopLocale;
}
