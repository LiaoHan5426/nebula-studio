import type {
  NebulaRemoteApplication,
  RemoteHandle,
  RemoteMountOptions,
} from '@nebula-studio/application-contract';

import { createApp } from 'vue';

import {
  CONTRACT_VERSION,
  HOST_CAPABILITIES_KEY,
} from '@nebula-studio/application-contract';
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

function pathForRouter(initialPath: string): string {
  const hashIndex = initialPath.indexOf('#');
  if (hashIndex >= 0) {
    const hash = initialPath.slice(hashIndex + 1);
    if (hash.startsWith('/')) {
      return hash.split('?')[0] ?? hash;
    }
  }
  return initialPath.split('?')[0] ?? '';
}

function shouldNavigateInitialPath(path: string): boolean {
  const pathname = pathForRouter(path);
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

export const nebulaSettingsApplication: NebulaRemoteApplication = {
  contractVersion: CONTRACT_VERSION,
  async mount(options: RemoteMountOptions): Promise<RemoteHandle> {
    stampFederationRuntimeMode();
    applyRemoteMountAppearance(options.container, {
      cssNamespace: 'settings',
      scheme: options.capabilities.theme?.scheme,
      locale: options.capabilities.locale?.locale,
    });

    const app = createApp(wrapSubAppWithAssembly(AppComponent));
    app.provide(HOST_CAPABILITIES_KEY, options.capabilities);
    app.use(router);
    installAssemblyForSubApp(app, 'platform-embed', {
      density: 'comfortable',
      theme: options.capabilities.theme?.scheme ?? 'system',
    });
    app.mount(options.container);

    if (shouldNavigateInitialPath(options.initialPath)) {
      await router.replace(pathForRouter(options.initialPath));
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

export default nebulaSettingsApplication;
