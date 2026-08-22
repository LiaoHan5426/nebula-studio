import type { MicroAppHandle, RuntimeMode } from '@nebula-studio/runtime';

import { bootMicroApp } from '@nebula-studio/runtime';
import { installWebPresentationUnlessElectron } from '@nebula-studio/shell-host';
import {
  installAssemblyForSubApp,
  wrapSubAppWithAssembly,
} from '@nebula-studio-renderer/assembly-boot';

import AppComponent from './App.vue';
import router from './router';

import '@nebula-studio-internal/tailwind/electron';

/**
 * Docs standalone 启动入口（`src/main.ts`）。
 *
 * Host Federation 走 `src/federation.ts`，不再经过 bootMicroApp。
 */
export async function bootDocs(opts: {
  mode: RuntimeMode;
}): Promise<MicroAppHandle | undefined> {
  const mode = opts.mode;
  document.documentElement.dataset.nebulaCss = 'docs';

  installWebPresentationUnlessElectron(mode, {
    scope: 'docs-standalone',
    processVersions: { node: __NEBULA_BUILD_NODE_VERSION__ },
  });

  const handle = await bootMicroApp({
    appId: 'docs',
    mode,
    rootComponent: wrapSubAppWithAssembly(AppComponent),
    router,
    auth: { enabled: false },
    beforeMount(app) {
      installAssemblyForSubApp(app, mode);
    },
  });

  if (!handle) {
    delete document.documentElement.dataset.nebulaCss;
    return handle;
  }

  const dispose = (): void => {
    delete document.documentElement.dataset.nebulaCss;
    handle.dispose();
  };
  return {
    ...handle,
    dispose,
    unmount: dispose,
  };
}
