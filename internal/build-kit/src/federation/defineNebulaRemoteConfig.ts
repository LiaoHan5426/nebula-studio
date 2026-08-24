import type { Plugin } from 'vite';

import { fileURLToPath } from 'node:url';

import { federation } from '@module-federation/vite';

import { createNebulaRendererViteConfig } from '../config/createNebulaRendererViteConfig.ts';
import { resolveNebulaHostedRemoteEnv } from '../config/nebulaRendererOptimizeDeps.ts';
import { resolveFederationDevRemoteOrigin } from '@nebula-studio-internal/node-kit/runtime-config';
import { loadWindowsConfig } from '@nebula-studio-internal/node-kit/windows-manifest';
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
  const windows = loadWindowsConfig();
  const hostedRemote = resolveNebulaHostedRemoteEnv();
  const hostedByHost = hostedRemote !== undefined;
  const cssNamespace = options.cssNamespace ?? options.appId;
  const plugins: Plugin[] = [
    nebulaCssNamespacePlugin(cssNamespace),
    ...asVitePlugins(
      federation({
        name: options.federationName,
        filename: 'remoteEntry.js',
        manifest: true,
        ...(hostedByHost ? { dts: false } : {}),
        exposes: options.exposes ?? {},
        shared: createNebulaSharedConfig(),
      }),
    ),
  ];

  const remotePort = hostedRemote?.port ?? options.devPort;
  const remoteOrigin =
    hostedRemote?.origin ??
    resolveFederationDevRemoteOrigin(remotePort, windows);

  return createNebulaRendererViteConfig({
    root,
    chunks: { enabled: false },
    hostedRemote: hostedByHost,
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
    merge: {
      plugins,
      ...(hostedRemote
        ? {
            cacheDir: hostedRemote.cacheDir,
          }
        : {}),
    },
  });
}
