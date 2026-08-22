import type {
  NebulaHostCapabilitiesInput,
  StyleContract,
} from '@nebula-studio/nebula-assembly';
import type { RuntimeMode } from '@nebula-studio/shell-protocol';
import type { App, Component } from 'vue';

import {
  installNebulaAssemblyFromMode,
  wrapWithAssemblyRoot,
} from '@nebula-studio/nebula-assembly';

type ElectronApi = {
  notify?: { show?(message: string): void };
  shell?: { openExternal?(url: string): Promise<void> | void };
};

/**
 * Collect host capabilities at app boot only.
 * This module may read window globals; adapters must not.
 */
export function collectBootHostCapabilities(
  mode: RuntimeMode,
): NebulaHostCapabilitiesInput {
  const surface =
    mode === 'electron'
      ? 'electron'
      : mode === 'platform-embed'
        ? 'platform-embed'
        : 'standalone';

  if (mode !== 'electron') {
    return { surface };
  }

  const api = (window as Window & { api?: ElectronApi }).api;

  return {
    surface,
    notify: api?.notify?.show
      ? (message) => {
          api.notify?.show?.(message);
        }
      : undefined,
    openExternal: api?.shell?.openExternal
      ? (url) => api.shell?.openExternal?.(url)
      : undefined,
  };
}

export function installAssemblyForSubApp(
  app: App,
  mode: RuntimeMode,
  style?: StyleContract,
): void {
  installNebulaAssemblyFromMode({
    app,
    mode,
    hostCapabilities: collectBootHostCapabilities(mode),
    mountRoot: null,
    style: style ?? { density: 'comfortable', theme: 'system' },
  });
}

export function wrapSubAppWithAssembly(
  rootComponent: Component,
  style?: StyleContract,
): Component {
  return wrapWithAssemblyRoot(rootComponent, { styleContract: style });
}
