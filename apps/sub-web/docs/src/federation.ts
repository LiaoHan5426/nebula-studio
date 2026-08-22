import type {
  NebulaRemoteApplication,
  RemoteHandle,
  RemoteMountOptions,
} from '@nebula-studio/application-contract';

import { createApp } from 'vue';

import { CONTRACT_VERSION } from '@nebula-studio/application-contract';
import {
  applyRemoteMountAppearance,
  clearRemoteMountAppearance,
  stampFederationRuntimeMode,
} from '@nebula-studio/shell-protocol';
import '@nebula-studio/styles/remote';

import {
  installAssemblyForSubApp,
  wrapSubAppWithAssembly,
} from '@nebula-studio-renderer/assembly-boot';

import AppComponent from './App.vue';
import router from './router';

function shouldNavigateInitialPath(path: string): boolean {
  const pathname = path.split('?')[0] ?? '';
  if (
    !pathname ||
    pathname === '/' ||
    pathname.endsWith('/index.html') ||
    pathname.endsWith('.html')
  ) {
    return false;
  }
  return router.resolve(pathname).matched.length > 0;
}

export const nebulaDocsApplication: NebulaRemoteApplication = {
  contractVersion: CONTRACT_VERSION,
  async mount(options: RemoteMountOptions): Promise<RemoteHandle> {
    stampFederationRuntimeMode();
    applyRemoteMountAppearance(options.container, {
      cssNamespace: 'docs',
      scheme: options.capabilities.theme?.scheme,
      locale: options.capabilities.locale?.locale,
    });

    const app = createApp(wrapSubAppWithAssembly(AppComponent));
    app.use(router);
    installAssemblyForSubApp(app, 'platform-embed', {
      density: 'comfortable',
      theme: options.capabilities.theme?.scheme ?? 'system',
      namespace: 'docs',
    });
    app.mount(options.container);

    if (shouldNavigateInitialPath(options.initialPath)) {
      await router.replace(options.initialPath.split('?')[0] ?? '/');
    }

    return {
      navigate(path: string) {
        void router.push(path);
      },
      unmount() {
        app.unmount();
        options.container.replaceChildren();
        clearRemoteMountAppearance(options.container);
      },
    };
  },
};

export default nebulaDocsApplication;
