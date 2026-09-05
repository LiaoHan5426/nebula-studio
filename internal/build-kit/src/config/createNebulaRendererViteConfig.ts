import type { UserConfig } from 'vite';

import type { NebulaRendererChunksOptions } from './chunks/types.ts';
import type { NebulaRendererPluginSelection } from './nebulaRendererPlugins.ts';

import tailwindcss from '@tailwindcss/vite';
import { mergeConfig } from 'vite';
import { defineConfig } from 'vite-plus';

import {
  nebulaBuildNodeVersionDefine,
  nebulaMswDefine,
} from '../env/nebulaBuildDefines.ts';
import { nebulaClientDefinePlugin } from '../plugin/nebulaClientDefine.ts';
import { nebulaTailwindSourcePlugin } from '../plugin/nebulaTailwindSourcePlugin.ts';
import { nebulaRendererChunkBuildPartial } from './chunks/index.ts';
import { createNebulaOptimizeDeps } from './nebulaRendererOptimizeDeps.ts';
import { resolveNebulaRendererPluginList } from './nebulaRendererPlugins.ts';
import { nebulaRendererResolve } from './nebulaRendererResolve.ts';
import {
  NEBULA_RENDERER_CHUNK_SIZE_WARNING_LIMIT_KB,
  nebulaRendererRolldownOptions,
} from './nebulaRendererWarnings.ts';

export interface CreateNebulaRendererViteConfigOptions {
  base?: string;
  build?: UserConfig['build'];
  /** Renderer 构建 chunk 策略，与 `nebulaElectronRendererPartial` 一致；默认开启。 */
  chunks?: NebulaRendererChunksOptions;
  define?: UserConfig['define'];
  /**
   * 最后与默认配置合并（后者覆盖前者冲突项以 `merge` 为准）。
   *
   * **与 Nebula UI 相关的覆盖入口（择一或组合）：**
   *
   * 1. **语义色 / 结构约束**：在 `@nebula-studio-internal/tailwind/theme` 或本应用 CSS 里重写
   *    `:root` / `html.dark` 上的 CSS 变量（`--foreground`、`--card` 等）；Nebula UI 的 `styles.css`
   *    大量依赖 `hsl(var(--…))`，不依赖 Sass 变量。
   *
   * 2. **全局 SCSS 注入（组件 `lang="scss"`）**：传入例如
   *    `merge: { css: { preprocessorOptions: { scss: { additionalData: '@use "…" as *;\\n' } } } }`，
   *    便于在 renderer 层统一变量、mixins，而不改 `packages/nebula-ui` 源码。
   *
   * 3. **额外全局样式**：在 boot 中于 `@nebula-studio/styles/document` 或 `/remote` 之后 `import` 本应用覆盖表，
   *    用更高优先级或更具体选择器覆盖 `.nebula-*`（注意与 scoped 的权重）。
   */
  merge?: UserConfig;
  /**
   * 内置插件：`builtins` 覆盖默认（默认仅 `vue`）；`extra` 追加第三方插件。
   * 新增内置能力时先在 `nebulaRendererPlugins.ts` 的 `NebulaRendererPluginId` / `BUILTIN_REGISTRY` 登记。
   */
  plugins?: NebulaRendererPluginSelection;
  /**
   * Host-composed Module Federation remotes. Disables optimizer rediscovery so
   * Vite 8 does not crash with `browserHash` of undefined during parallel boot.
   */
  hostedRemote?: boolean;
  root: string;
  server?: UserConfig['server'];
}

export function createNebulaRendererViteConfig(
  opts: CreateNebulaRendererViteConfigOptions,
): ReturnType<typeof defineConfig> {
  const {
    root,
    base = process.env.VITE_BASE_PATH ?? '/',
    define: defineExtra,
    server,
    build,
    plugins: pluginSelection,
    merge: userMerge,
    chunks: chunksOptions,
    hostedRemote = false,
  } = opts;

  let baseConfig: UserConfig = {
    plugins: [
      nebulaTailwindSourcePlugin(root),
      nebulaClientDefinePlugin(),
      tailwindcss(),
      ...resolveNebulaRendererPluginList(pluginSelection),
    ],
    base,
    root,
    resolve: nebulaRendererResolve,
    optimizeDeps: createNebulaOptimizeDeps({ root, hostedRemote }),
    define: {
      ...nebulaBuildNodeVersionDefine(),
      ...nebulaMswDefine(),
      ...defineExtra,
    },
    build: {
      rolldownOptions: nebulaRendererRolldownOptions,
      chunkSizeWarningLimit: NEBULA_RENDERER_CHUNK_SIZE_WARNING_LIMIT_KB,
    },
  };

  const chunkPartial = nebulaRendererChunkBuildPartial(chunksOptions);
  if (chunkPartial) {
    baseConfig = mergeConfig(baseConfig, chunkPartial);
  }

  if (server !== undefined) {
    baseConfig.server = server;
  }
  if (build !== undefined) {
    baseConfig = mergeConfig(baseConfig, { build });
  }

  return defineConfig(mergeConfig(baseConfig, userMerge ?? {}));
}

export type { NebulaRendererPluginSelection };
