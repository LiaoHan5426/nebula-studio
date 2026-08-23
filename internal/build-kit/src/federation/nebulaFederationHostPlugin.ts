import type { Plugin } from 'vite';

import { federation } from '@module-federation/vite';

import { asVitePlugins } from './asVitePlugins.ts';
import { createNebulaSharedConfig } from './createNebulaSharedConfig.ts';
import { nebulaHostDevRemotesPlugin } from './nebulaHostDevRemotesPlugin.ts';

export function nebulaFederationHostPlugin(federationName: string): Plugin[] {
  return [
    nebulaHostDevRemotesPlugin(),
    ...asVitePlugins(
      federation({
        name: federationName,
        filename: 'remoteEntry.js',
        remotes: {},
        shared: createNebulaSharedConfig(),
        // Host has no exposes; dts worker looks for ./tsconfig.json next to the
        // Vite root (Electron renderer is src/renderer, which has no tsconfig).
        dts: false,
      }),
    ),
  ];
}
