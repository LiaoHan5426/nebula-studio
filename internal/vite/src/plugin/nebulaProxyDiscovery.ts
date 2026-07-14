import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Plugin, ProxyOptions } from 'vite';
import { getNebulaAppManifest } from './nebulaWorkspaceManifestPlugin.ts';

export interface NebulaProxyDiscoveryOptions {
  /**
   * Sub-app directory names under apps/sub-web.
   * Defaults to manifest subApps from configs/windows.json.
   */
  subApps?: string[];
  subAppsRoot?: string;
}

/**
 * Discover and merge optional per-sub-app `vite.proxy.ts` exports.
 * Throws when a proxy module exists but fails to load or exports invalid data.
 */
export function nebulaProxyDiscovery(
  options: NebulaProxyDiscoveryOptions = {},
): Plugin {
  return {
    name: 'nebula-proxy-discovery',
    enforce: 'pre',

    async config(config) {
      const root = config.root ?? process.cwd();
      const subAppsRoot = options.subAppsRoot ?? join(root, '..', 'sub-web');
      const subApps = options.subApps ?? getNebulaAppManifest().subApps;
      const merged: Record<string, ProxyOptions> = {};

      for (const app of subApps) {
        const proxyFile = join(subAppsRoot, app, 'vite.proxy.ts');
        let mod: { proxy?: Record<string, ProxyOptions> };
        try {
          mod = await import(pathToFileURL(proxyFile).href);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          if (
            message.includes('ENOENT') ||
            message.includes('Cannot find module')
          ) {
            continue;
          }
          throw new Error(
            `[nebula-proxy-discovery] Failed to load ${proxyFile}: ${message}`,
            { cause: error },
          );
        }

        const proxyConfig = mod.proxy;
        if (proxyConfig === undefined) {
          continue;
        }
        if (typeof proxyConfig !== 'object' || proxyConfig === null) {
          throw new Error(
            `[nebula-proxy-discovery] ${proxyFile} must export a "proxy" object`,
          );
        }

        for (const [route, existing] of Object.entries(merged)) {
          if (route in proxyConfig) {
            throw new Error(
              `[nebula-proxy-discovery] Duplicate proxy route "${route}" from ${app} (already defined)`,
            );
          }
          void existing;
        }
        Object.assign(merged, proxyConfig);
      }

      if (Object.keys(merged).length === 0) return;

      config.server ??= {};
      config.server.proxy = {
        ...merged,
        ...(config.server.proxy as Record<string, ProxyOptions> | undefined),
      };
    },
  };
}
