import type { Plugin, PluginOption } from 'vite';

export interface NebulaWebShellPluginOptions {
  /**
   * 写入 `__NEBULA_BUILD_NODE_VERSION__`，供 `installWebPresentation({ processVersions: { node } })` 使用。
   * 默认取当前进程的 `process.version`（去掉前缀 `v`）。
   */
  buildNodeVersion?: string;
}

/**
 * **标准 Vite 插件**（`Plugin`）：在 `config` 中注入与 Web 壳展示相关的构建期 `define`
 *（当前主要为 `__NEBULA_BUILD_NODE_VERSION__`，与 `createNebulaRendererViteConfig` 内
 * `nebulaBuildNodeVersionDefine()` 重叠；保留便于将来在此集中加壳专用构建逻辑）。
 *
 * 与「运行时 Web 壳」`installWebPresentation` 不同：后者在浏览器里跑，本模块只在 Vite 构建链中生效。
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

/** 供内置插件表注册：无参包装 */
export function nebulaWebShellPlugin(): PluginOption {
  return nebulaWebShell();
}
