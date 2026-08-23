import type { ApplicationHandle } from '@nebula-studio/application-bootstrap';
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
import { loadDocsMessages } from './i18n/loadMessages.ts';
import router from './router';

/**
 * Docs standalone 启动入口（`src/main.ts`）。
 *
 * Host Federation 走 `src/federation.ts`，不再经过 startApplication。
 */
export async function bootDocs(opts: {
  mode: RuntimeMode;
}): Promise<ApplicationHandle | undefined> {
  const mode = opts.mode;
  document.documentElement.dataset.nebulaCss = 'docs';

  installWebPresentationUnlessElectron(mode, {
    scope: 'docs-standalone',
    processVersions: { node: __NEBULA_BUILD_NODE_VERSION__ },
  });

  const capabilities = createWebEmbedHostCapabilities();
  const i18nHandle = await bootNebulaI18n({
    appId: 'docs',
    locale: normalizeNebulaLocale(capabilities.locale?.locale),
    loadMessages: loadDocsMessages,
  });
  const stopLocale = bindI18nToHostLocale(i18nHandle, capabilities.locale);

  const handle = await startApplication({
    appId: 'docs',
    mode,
    rootComponent: wrapSubAppWithAssembly(AppComponent),
    router,
    auth: { enabled: false },
    beforeMount(app) {
      app.use(i18nHandle.i18n);
      app.provide(HOST_CAPABILITIES_KEY, capabilities);
      installAssemblyForSubApp(app, mode);
    },
  });

  if (!handle) {
    stopLocale();
    i18nHandle.dispose();
    delete document.documentElement.dataset.nebulaCss;
    return handle;
  }

  const dispose = (): void => {
    stopLocale();
    i18nHandle.dispose();
    delete document.documentElement.dataset.nebulaCss;
    handle.dispose();
  };
  return {
    ...handle,
    dispose,
    unmount: dispose,
  };
}
