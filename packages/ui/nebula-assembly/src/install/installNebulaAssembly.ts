import type { App } from 'vue';

import { overlayContainerKey } from '@nebula-studio/nebula-ui';

import type {
  InstallNebulaAssemblyOptions,
  NebulaAssemblyContext,
} from '../types/context';

import { createNebulaComponentContext } from '../context/createNebulaComponentContext';
import { applyStyleContract } from '../style/applyStyleContract';
import { nebulaAssemblyKey } from '../types/context';

export function provideNebulaAssembly(
  app: App,
  context: NebulaAssemblyContext,
): void {
  app.provide(nebulaAssemblyKey, context);
  app.provide(overlayContainerKey, context.overlay.teleportTarget);
}

export function installNebulaAssembly(
  options: InstallNebulaAssemblyOptions,
): NebulaAssemblyContext {
  const mountRoot =
    options.mountRoot === undefined
      ? typeof document !== 'undefined'
        ? document.querySelector<HTMLElement>('#app')
        : null
      : options.mountRoot;

  const context = createNebulaComponentContext({
    ...options,
    mountRoot,
  });

  if (mountRoot) {
    applyStyleContract(mountRoot, context.style);
    context.mountRoot = mountRoot;
  }

  provideNebulaAssembly(options.app, context);
  return context;
}
