import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Plugin, ProxyOptions } from 'vite';

export interface NebulaProxyDiscoveryOptions {
  /**
   * 需要扫描代理配置的子应用目录名列表（`apps/sub-web/` 下的目录名）。
   *
   * @example
   * ['integration', 'frontend', 'login', 'settings', 'docs']
   */
  subApps: string[];
  /**
   * 子应用所在的根目录绝对路径（默认为 monorepo 的 `apps/sub-web`）。
   * 插件会在该目录下查找各子应用的 `vite.proxy.ts`。
   */
  subAppsRoot?: string;
}

/**
 * Vite 插件：自动发现并合并各子应用的 `vite.proxy.ts` 代理配置。
 *
 * 在 `config` 钩子中动态导入每个子应用导出的代理规则，
 * 合并后写入 `server.proxy`，使 Web 壳 / Electron 启动时
 * 无需跨应用引入即可拥有完整的 API 代理路由。
 *
 * @example
 * ```ts
 * // apps/web/vite.config.ts
 * export default defineNebulaConfig({
 *   platform: 'web',
 *   root,
 *   merge: {
 *     plugins: [
 *       nebulaProxyDiscovery({
 *         subApps: ['integration', 'frontend', 'login', 'settings', 'docs'],
 *       }),
 *     ],
 *   },
 * });
 * ```
 */
export function nebulaProxyDiscovery(
  options: NebulaProxyDiscoveryOptions,
): Plugin {
  const { subApps } = options;

  return {
    name: 'nebula-proxy-discovery',
    enforce: 'pre',

    async config(config) {
      const root = config.root ?? process.cwd();
      const subAppsRoot = options.subAppsRoot ?? join(root, '..', 'sub-web');
      const merged: Record<string, ProxyOptions> = {};

      for (const app of subApps) {
        const proxyFile = join(subAppsRoot, app, 'vite.proxy.ts');
        try {
          const mod = await import(pathToFileURL(proxyFile).href);
          const proxyConfig = mod.proxy as
            | Record<string, ProxyOptions>
            | undefined;
          if (proxyConfig && typeof proxyConfig === 'object') {
            Object.assign(merged, proxyConfig);
          }
        } catch {
          // 子应用无 vite.proxy.ts 时静默跳过
        }
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
