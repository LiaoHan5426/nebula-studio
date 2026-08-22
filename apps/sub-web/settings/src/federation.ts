import { createApp } from 'vue';

import type {
  NebulaRemoteApplication,
  RemoteHandle,
  RemoteMountOptions,
} from '@nebula-studio/application-contract';
import {
  CONTRACT_VERSION,
  HOST_CAPABILITIES_KEY,
} from '@nebula-studio/application-contract';
import {
  installAssemblyForSubApp,
  wrapSubAppWithAssembly,
} from '@nebula-studio-renderer/assembly-boot';
import { stampFederationRuntimeMode } from '@nebula-studio/shell-protocol';

import AppComponent from './App.vue';
import router from './router';

import '@nebula-studio-internal/tailwind/electron';

function applyHostAppearance(options: RemoteMountOptions): void {
  const root = document.documentElement;
  const scheme = options.capabilities.theme?.scheme;
  const locale = options.capabilities.locale?.locale;

  root.dataset.nebulaCss = 'settings';
  options.container.dataset.nebulaCss = 'settings';

  if (scheme === 'dark' || scheme === 'light') {
    root.dataset.nebulaTheme = scheme;
    options.container.dataset.nebulaTheme = scheme;
    root.classList.toggle('dark', scheme === 'dark');
  }
  if (locale) {
    root.lang = locale;
    options.container.dataset.nebulaLocale = locale;
  }
}

function clearHostAppearance(container: HTMLElement): void {
  const root = document.documentElement;
  delete root.dataset.nebulaCss;
  delete root.dataset.nebulaTheme;
  delete container.dataset.nebulaCss;
  delete container.dataset.nebulaTheme;
  delete container.dataset.nebulaLocale;
}

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
    applyHostAppearance(options);

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
        clearHostAppearance(options.container);
      },
    };
  },
};

export default nebulaSettingsApplication;
