import type { Plugin } from 'vite';

import type {
  CreateNebulaApiProxyOptions,
  NebulaApiProxyPreset,
} from '../proxy/createNebulaApiProxy.ts';

import { fileURLToPath } from 'node:url';

import { resolveSubAppRoot } from '../plugin/nebulaWorkspaceManifestPlugin.ts';
import { createNebulaApiProxy } from '../proxy/createNebulaApiProxy.ts';
import { createNebulaRendererViteConfig } from './createNebulaRendererViteConfig.ts';
import { resolveStandaloneApp } from './studioRuntime.ts';
import { loadWindowsConfig } from './windowsManifest.ts';

export interface DefineNebulaSubAppConfigOptions {
  /** Sub-app directory name under apps/sub-web (e.g. integration). */
  appId: string;
  /** Vite config module URL (`import.meta.url` from the sub-app vite.config.ts). */
  configModuleUrl: string | URL;
  /** Dev server port. Defaults to the renderer standalone.port in windows.json. */
  devPort?: number;
  /** Extra Vite plugins appended to the sub-app config. */
  plugins?: Plugin[];
  /** Options forwarded to createNebulaApiProxy when proxyPreset is set. */
  proxyOptions?: Omit<CreateNebulaApiProxyOptions, 'preset'>;
  /** Proxy preset; set false to disable. Defaults to the renderer proxyPreset in windows.json. */
  proxyPreset?: false | NebulaApiProxyPreset;
}

export function defineNebulaSubAppConfig (
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

  const port = options.devPort ?? standalone?.port;
  if (port !== undefined) {
    server.port = port;
  }
  if (standalone?.host) {
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

  return createNebulaRendererViteConfig({
    root,
    base: process.env.VITE_BASE_PATH ?? standalone?.basePath ?? '/',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    merge: {
      plugins: options.plugins,
      resolve: {
        alias: {
          '@': srcRoot,
        },
      },
      server,
    },
  });
}
