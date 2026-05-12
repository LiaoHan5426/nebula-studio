import type { UserConfig } from 'vite';
import { mergeConfig } from 'vite';
import { nebulaRendererChunkBuildPartial } from './chunks/index.ts';
import { nebulaBuildNodeVersionDefine } from '../env/nebulaBuildDefines.ts';
import { nebulaRendererOptimizeDeps } from './nebulaRendererOptimizeDeps.ts';
import { resolveNebulaRendererPluginList } from './nebulaRendererPlugins.ts';
import type { NebulaRendererPluginSelection } from './nebulaRendererPlugins.ts';
import { nebulaRendererResolve } from './nebulaRendererResolve.ts';
import type {
  NebulaManualChunkMeta,
  NebulaRendererChunksOptions,
} from './chunks/types.ts';

/**
 * 供 `electron-vite` 的 `renderer` 使用。`build` 不直接沿用 `vite` 的 `UserConfig['build']`，
 * 以免 workspace 内多份 `vite`（不同 `@types/node` peer）时与 `RendererBuildOptions` 冲突。
 */
export type NebulaElectronRendererPatch = Pick<
  UserConfig,
  'define' | 'plugins' | 'resolve' | 'optimizeDeps'
> & {
  build?: {
    rollupOptions?: {
      output?: {
        manualChunks?: (
          id: string,
          meta?: NebulaManualChunkMeta,
        ) => string | undefined;
      };
    };
  };
};

export interface NebulaElectronRendererOptions {
  /**
   * 内置插件集合，与 `createNebulaRendererViteConfig` 的 `plugins` 一致；默认仅 `vue`。
   * 需要 `webShell` 时传 `plugins: { builtins: ['vue', 'webShell'] }`。
   */
  plugins?: NebulaRendererPluginSelection;
  /** Renderer 产物 chunk 策略；默认开启，可用 `enabled: false` 关闭。 */
  chunks?: NebulaRendererChunksOptions;
}

/**
 * `electron-vite` 的 `renderer` 段：集中插件 / resolve / 预构建 / define。
 * 可通过 `plugins` 与纯 Vite renderer 对齐策略。
 */
export function nebulaElectronRendererPartial(
  options: NebulaElectronRendererOptions = {},
): NebulaElectronRendererPatch {
  const base: Pick<
    UserConfig,
    'define' | 'plugins' | 'resolve' | 'optimizeDeps'
  > = {
    define: nebulaBuildNodeVersionDefine(),
    plugins: resolveNebulaRendererPluginList(options.plugins),
    resolve: nebulaRendererResolve,
    optimizeDeps: nebulaRendererOptimizeDeps,
  };
  const chunkPartial = nebulaRendererChunkBuildPartial(options.chunks);
  const merged = chunkPartial ? mergeConfig(base, chunkPartial) : base;
  return merged as NebulaElectronRendererPatch;
}
