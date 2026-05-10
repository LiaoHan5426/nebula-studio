import type { Plugin } from 'vite';

export interface NebulaWebShellPluginOptions {
  /**
   * 写入 `__NEBULA_BUILD_NODE_VERSION__`，供 `installWebPresentation({ processVersions: { node } })` 使用。
   * 默认取当前进程的 `process.version`（去掉前缀 `v`）。
   */
  buildNodeVersion?: string;
}

/**
 * Nebula Web 壳：单 `index.html`，`?embed=` 区分 iframe surface（见 `web-boot.ts` / `embed/*-entry.ts`）。
 * 本插件统一注入构建期常量等。
 */
export function nebulaWebShell(
  options: NebulaWebShellPluginOptions = {},
): Plugin {
  const buildNodeVersion =
    options.buildNodeVersion ?? process.version.replace(/^v/, '');

  return {
    name: 'nebula-web-shell',
    config() {
      return {
        define: {
          __NEBULA_BUILD_NODE_VERSION__: JSON.stringify(buildNodeVersion),
        },
      };
    },
  };
}
