import type { UserConfig } from 'vite';
import { nebulaBuildNodeVersionDefine } from '../env/nebulaBuildDefines.ts';
import { nebulaRendererOptimizeDeps } from './nebulaRendererOptimizeDeps.ts';
import { resolveNebulaRendererPluginList } from './nebulaRendererPlugins.ts';
import type {
  NebulaRendererPluginSelection,
  NebulaRendererPreset,
} from './nebulaRendererPlugins.ts';
import { nebulaRendererResolve } from './nebulaRendererResolve.ts';

export interface NebulaElectronRendererOptions {
  /**
   * 与 `createNebulaRendererViteConfig` 的 `preset` 语义一致，用于默认内置插件集合。
   * 默认 `docs`（仅 vue）；若某入口需要与 web 一致可设为 `web` 或改用 `plugins.builtins`。
   */
  preset?: NebulaRendererPreset;
  plugins?: NebulaRendererPluginSelection;
}

/**
 * `electron-vite` 的 `renderer` 段：集中插件 / resolve / 预构建 / define。
 * 可通过 `plugins` / `preset` 与纯 Vite renderer 对齐策略。
 */
export function nebulaElectronRendererPartial(
  options: NebulaElectronRendererOptions = {},
): Pick<UserConfig, 'define' | 'plugins' | 'resolve' | 'optimizeDeps'> {
  const preset = options.preset ?? 'docs';
  return {
    define: nebulaBuildNodeVersionDefine(),
    plugins: resolveNebulaRendererPluginList(preset, options.plugins),
    resolve: nebulaRendererResolve,
    optimizeDeps: nebulaRendererOptimizeDeps,
  };
}
