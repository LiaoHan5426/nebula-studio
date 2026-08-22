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

  return createNebulaRendererViteConfig({
    root,
    chunks: { enabled: false },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      port: options.devPort,
      cors: true,
      origin: `http://localhost:${options.devPort}`,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    merge: { plugins },
  });
}
