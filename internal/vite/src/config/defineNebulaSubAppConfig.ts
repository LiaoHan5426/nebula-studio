import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import { createNebulaRendererViteConfig } from './createNebulaRendererViteConfig.ts';
import { createNebulaApiProxy } from '../proxy/createNebulaApiProxy.ts';
import type {
  CreateNebulaApiProxyOptions,
  NebulaApiProxyPreset,
} from '../proxy/createNebulaApiProxy.ts';
import { resolveSubAppRoot } from '../plugin/nebulaWorkspaceManifestPlugin.ts';

export interface DefineNebulaSubAppConfigOptions {
  /** Vite config module URL (`import.meta.url` from the sub-app vite.config.ts). */
  configModuleUrl: string | URL;
  /** Sub-app directory name under apps/sub-web (e.g. integration). */
  appId: string;
  /** Dev server port. */
  devPort?: number;
  /** Proxy preset; set false to disable dev proxy. */
  proxyPreset?: NebulaApiProxyPreset | false;
  /** Options forwarded to createNebulaApiProxy when proxyPreset is set. */
  proxyOptions?: Omit<CreateNebulaApiProxyOptions, 'preset'>;
  /** Extra Vite plugins appended to the sub-app config. */
  plugins?: Plugin[];
}

export function defineNebulaSubAppConfig(
  options: DefineNebulaSubAppConfigOptions,
) {
  const { root } = resolveSubAppRoot(options.configModuleUrl);
  const srcRoot = fileURLToPath(new URL('./src', options.configModuleUrl));

  const server: NonNullable<
    Parameters<typeof createNebulaRendererViteConfig>[0]['server']
  > = {};

  if (options.devPort !== undefined) {
    server.port = options.devPort;
  }

  if (options.proxyPreset) {
    server.proxy = createNebulaApiProxy({
      preset: options.proxyPreset,
      ...options.proxyOptions,
    });
  }

  return createNebulaRendererViteConfig({
    root,
    base: process.env.VITE_BASE_PATH ?? '/',
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
