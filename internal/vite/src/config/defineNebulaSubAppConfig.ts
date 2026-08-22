import type { Plugin } from 'vite';

import type {
  CreateNebulaApiProxyOptions,
  NebulaApiProxyPreset,
} from '../proxy/createNebulaApiProxy.ts';

import { fileURLToPath } from 'node:url';

import { federation } from '@module-federation/vite';

import { asVitePlugins } from '../federation/asVitePlugins.ts';
import { createNebulaSharedConfig } from '../federation/createNebulaSharedConfig.ts';
import { nebulaCssNamespacePlugin } from '../federation/nebulaCssNamespacePlugin.ts';
import { resolveSubAppRoot } from '../plugin/nebulaWorkspaceManifestPlugin.ts';
import { createNebulaApiProxy } from '../proxy/createNebulaApiProxy.ts';
import { createNebulaRendererViteConfig } from './createNebulaRendererViteConfig.ts';
import { resolveStandaloneApp } from './studioRuntime.ts';
import { loadWindowsConfig } from './windowsManifest.ts';

export interface DefineNebulaSubAppConfigOptions {
  /** Sub-app directory name under apps/sub-web (e.g. integration). */
  appId: string;
  /** Renderer chunk splitting. Federation remotes default to off unless set. */
  chunks?: import('./chunks/types.ts').NebulaRendererChunksOptions;
  /** Vite config module URL (`import.meta.url` from the sub-app vite.config.ts). */
  configModuleUrl: string | URL;
  /** Dev server port. Defaults to the renderer standalone.port in windows.json. */
  devPort?: number;
  federation?: {
    cssNamespace?: string;
    exposes: Record<string, string>;
    name: string;
  };
  /** Extra Vite plugins appended to the sub-app config. */
  plugins?: Plugin[];
  /** Options forwarded to createNebulaApiProxy when proxyPreset is set. */
  proxyOptions?: Omit<CreateNebulaApiProxyOptions, 'preset'>;
  /** Proxy preset; set false to disable. Defaults to the renderer proxyPreset in windows.json. */
  proxyPreset?: false | NebulaApiProxyPreset;
}

export function defineNebulaSubAppConfig(
  options: DefineNebulaSubAppConfigOptions,
) {
  const { root } = resolveSubAppRoot(options.configModuleUrl);
  const srcRoot = fileURLToPath(new URL('./src', options.configModuleUrl));
  const windows = loadWindowsConfig();
  let standalone: ReturnType<typeof resolveStandaloneApp> | undefined;
  try {
    standalone = resolveStandaloneApp(options.appId, windows);
  } catch {
    standalone = undefined;
  }

  const server: NonNullable<
    Parameters<typeof createNebulaRendererViteConfig>[0]['server']
  > = {};

  const envPort = Number(process.env.NEBULA_REMOTE_PORT);
  const port =
    Number.isInteger(envPort) && envPort > 0
      ? envPort
      : (options.devPort ?? standalone?.port);
  if (port !== undefined) {
    server.port = port;
  }
  if (process.env.NEBULA_REMOTE_PORT) {
    server.strictPort = true;
    server.host = '127.0.0.1';
  } else if (standalone?.host) {
    server.host = standalone.host;
  }

  const declaredPreset = [
    ...Object.values(windows.windows),
    ...Object.values(windows.modalRenderers ?? {}),
  ].find((entry) => entry.renderer === options.appId)?.proxyPreset;
  const proxyPreset =
    options.proxyPreset === false
      ? false
      : (options.proxyPreset ?? declaredPreset);
  if (proxyPreset) {
    server.proxy = createNebulaApiProxy({
      preset: proxyPreset,
      ...options.proxyOptions,
    });
  }

  const plugins: Plugin[] = [...(options.plugins ?? [])];
  if (options.federation) {
    const cssNamespace = options.federation.cssNamespace ?? options.appId;
    plugins.unshift(
      nebulaCssNamespacePlugin(cssNamespace),
      ...asVitePlugins(
        federation({
          name: options.federation.name,
          filename: 'remoteEntry.js',
          manifest: true,
          exposes: options.federation.exposes,
          shared: createNebulaSharedConfig(),
        }),
      ),
    );
    server.cors = true;
    if (process.env.NEBULA_REMOTE_ORIGIN) {
      server.origin = process.env.NEBULA_REMOTE_ORIGIN;
    } else if (port !== undefined) {
      server.origin = `http://localhost:${port}`;
    }
    server.headers = {
      ...server.headers,
      'Access-Control-Allow-Origin': '*',
    };
  }

  return createNebulaRendererViteConfig({
    root,
    base: process.env.VITE_BASE_PATH ?? standalone?.basePath ?? '/',
    chunks: options.chunks ?? { enabled: false },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    merge: {
      plugins,
      resolve: {
        alias: {
          '@': srcRoot,
        },
      },
      server,
    },
  });
}
