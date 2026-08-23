import type { Plugin } from 'vite';

import { fileURLToPath } from 'node:url';

import { federation } from '@module-federation/vite';

import { createNebulaRendererViteConfig } from '../config/createNebulaRendererViteConfig.ts';
import { asVitePlugins } from './asVitePlugins.ts';
import { createNebulaSharedConfig } from './createNebulaSharedConfig.ts';
import { nebulaCssNamespacePlugin } from './nebulaCssNamespacePlugin.ts';

export interface DefineNebulaRemoteConfigOptions {
  appId: string;
  configModuleUrl: string | URL;
  cssNamespace?: string;
  devPort: number;
  exposes?: Record<string, string>;
  federationName: string;
}

export function defineNebulaRemoteConfig(
  options: DefineNebulaRemoteConfigOptions,
) {
  const root = fileURLToPath(new URL('.', options.configModuleUrl));
  const cssNamespace = options.cssNamespace ?? options.appId;
  const plugins: Plugin[] = [
    nebulaCssNamespacePlugin(cssNamespace),
    ...asVitePlugins(
      federation({
        name: options.federationName,
        filename: 'remoteEntry.js',
        manifest: true,
        exposes: options.exposes ?? {},
        shared: createNebulaSharedConfig(),
      }),
    ),
  ];

  const remotePort = Number(process.env.NEBULA_REMOTE_PORT) || options.devPort;
  const remoteOrigin =
    process.env.NEBULA_REMOTE_ORIGIN ??
    `http://localhost:${String(remotePort)}`;

  return createNebulaRendererViteConfig({
    root,
    chunks: { enabled: false },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      port: remotePort,
      cors: true,
      origin: remoteOrigin,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    merge: { plugins },
  });
}
