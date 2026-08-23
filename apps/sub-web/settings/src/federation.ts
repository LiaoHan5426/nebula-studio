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
  bindI18nToHostLocale,
  bootNebulaI18n,
  normalizeNebulaLocale,
} from '@nebula-studio/i18n';
import {
  clearRemoteMountAppearance,
  stampFederationRuntimeMode,
  subscribeRemoteMountAppearance,
} from '@nebula-studio/shell-protocol';
import '@nebula-studio/styles/remote';

import {
  installAssemblyForSubApp,
  wrapSubAppWithAssembly,
} from '@nebula-studio-renderer/assembly-boot';

import AppComponent from './App.vue';
import { loadSettingsMessages } from './i18n/loadMessages.ts';
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
    const stopAppearance = subscribeRemoteMountAppearance(
      options.container,
      'settings',
      options.capabilities,
    );

    const i18nHandle = await bootNebulaI18n({
      appId: 'settings',
      locale: normalizeNebulaLocale(options.capabilities.locale?.locale),
      loadMessages: loadSettingsMessages,
    });

    const app = createApp(wrapSubAppWithAssembly(AppComponent));
    app.provide(HOST_CAPABILITIES_KEY, options.capabilities);
    app.use(i18nHandle.i18n);
    app.use(router);
    installAssemblyForSubApp(app, 'platform-embed', {
      density: 'comfortable',
      theme: options.capabilities.theme?.scheme ?? 'system',
      namespace: 'settings',
    });
    app.mount(options.container);

    const stopLocale = bindI18nToHostLocale(
      i18nHandle,
      options.capabilities.locale,
    );

    if (shouldNavigateInitialPath(options.initialPath)) {
      await router.replace(pathForRouter(options.initialPath));
    }

    return {
      navigate(path: string) {
        void router.push(path);
      },
      unmount() {
        stopLocale();
        stopAppearance();
        i18nHandle.dispose();
        app.unmount();
        options.container.replaceChildren();
        clearRemoteMountAppearance(options.container);
      },
    };
  },
};

export default nebulaSettingsApplication;
