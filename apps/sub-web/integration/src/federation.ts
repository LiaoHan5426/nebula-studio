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
import '@nebula-studio/nebula-layout';
import '@nebula-studio/nebula-ui';
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
import { install as installVxePcUi } from 'vxe-pc-ui';
import { install as installVxeTable } from 'vxe-table';

import AppComponent from './App.vue';
import router from './router';
import { bindHostCapabilities } from './shared/hostCapabilityBridge';
import { createIntegrationSession } from './shared/runtime/session';

import '@nebula-studio-renderer/integration/bootstrap-runtime';

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

function isHostDocumentPath(pathname: string): boolean {
  return (
    !pathname ||
    pathname === '/' ||
    pathname.endsWith('/index.html') ||
    pathname.endsWith('.html')
  );
}

function shouldNavigateInitialPath(path: string): boolean {
  const pathname = pathForRouter(path);
  if (isHostDocumentPath(pathname)) {
    return false;
  }
  return router.resolve(pathname).matched.length > 0;
}

export const nebulaIntegrationApplication: NebulaRemoteApplication = {
  contractVersion: CONTRACT_VERSION,
  async mount(options: RemoteMountOptions): Promise<RemoteHandle> {
    stampFederationRuntimeMode();
    const stopAppearance = subscribeRemoteMountAppearance(
      options.container,
      'integration',
      options.capabilities,
    );
    window.__NEBULA_EMBED_SURFACE__ = 'integration';
    bindHostCapabilities(options.capabilities);
    const session = await createIntegrationSession(options.capabilities);
    const offTenant = options.capabilities.events?.subscribe(
      'tenant-changed',
      () => {
        session.resetSession();
      },
    );
    const offLogout = options.capabilities.events?.subscribe(
      'auth-logout',
      () => {
        session.resetSession();
      },
    );

    const app = createApp(wrapSubAppWithAssembly(AppComponent));
    app.provide(HOST_CAPABILITIES_KEY, options.capabilities);
    session.install(app);
    app.use(router);
    installAssemblyForSubApp(app, 'platform-embed', {
      density: 'comfortable',
      theme: options.capabilities.theme?.scheme ?? 'system',
      namespace: 'integration',
    });
    installVxePcUi(app);
    installVxeTable(app);
    app.mount(options.container);

    if (shouldNavigateInitialPath(options.initialPath)) {
      await router.replace(pathForRouter(options.initialPath));
    } else {
      await router.replace('/');
    }

    return {
      navigate(path: string) {
        void router.push(path);
      },
      unmount() {
        stopAppearance();
        offTenant?.();
        offLogout?.();
        bindHostCapabilities(undefined);
        app.unmount();
        session.dispose();
        options.container.replaceChildren();
        clearRemoteMountAppearance(options.container);
        delete window.__NEBULA_EMBED_SURFACE__;
      },
    };
  },
};

export default nebulaIntegrationApplication;
