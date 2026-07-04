import type { UserConfig } from 'vite';
import { mergeConfig } from 'vite';
import { defineConfig } from 'vite-plus';
import tailwindcss from '@tailwindcss/vite';
import { nebulaRendererChunkBuildPartial } from './chunks/index.ts';
import type { NebulaRendererChunksOptions } from './chunks/types.ts';
import {
  nebulaBuildNodeVersionDefine,
  nebulaMswDefine,
} from '../env/nebulaBuildDefines.ts';
import { nebulaRendererOptimizeDeps } from './nebulaRendererOptimizeDeps.ts';
import { resolveNebulaRendererPluginList } from './nebulaRendererPlugins.ts';
import type { NebulaRendererPluginSelection } from './nebulaRendererPlugins.ts';
import { nebulaRendererResolve } from './nebulaRendererResolve.ts';

export interface CreateNebulaRendererViteConfigOptions {
  root: string;
  base?: string;
  define?: UserConfig['define'];
  server?: UserConfig['server'];
  build?: UserConfig['build'];
  /**
   * 内置插件：`builtins` 覆盖默认（默认仅 `vue`）；`extra` 追加第三方插件。
   * 新增内置能力时先在 `nebulaRendererPlugins.ts` 的 `NebulaRendererPluginId` / `BUILTIN_REGISTRY` 登记。
   */
  plugins?: NebulaRendererPluginSelection;
  /** Renderer 构建 chunk 策略，与 `nebulaElectronRendererPartial` 一致；默认开启。 */
  chunks?: NebulaRendererChunksOptions;
  /**
   * 最后与默认配置合并（后者覆盖前者冲突项以 `merge` 为准）。
   *
   * **与 Nebula UI 相关的覆盖入口（择一或组合）：**
   *
   * 1. **语义色 / 结构约束**：在 `@nebula-studio-internal/tailwind` 主题或本应用 CSS 里重写
   *    `:root` / `html.dark` 上的 CSS 变量（`--foreground`、`--card` 等）；Nebula UI 的 `styles.css`
   *    大量依赖 `hsl(var(--…))`，不依赖 Sass 变量。
   *
   * 2. **全局 SCSS 注入（组件 `lang="scss"`）**：传入例如
   *    `merge: { css: { preprocessorOptions: { scss: { additionalData: '@use "…" as *;\\n' } } } }`，
   *    便于在 renderer 层统一变量、mixins，而不改 `packages/nebula-ui` 源码。
   *
   * 3. **额外全局样式**：在 `main.ts` 中于 `@nebula-studio-internal/tailwind` 之后 `import` 本应用覆盖表，
   *    用更高优先级或更具体选择器覆盖 `.nebula-*`（注意与 scoped 的权重）。
   */
  merge?: UserConfig;
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
  } = opts;

  let baseConfig: UserConfig = {
    plugins: [
      tailwindcss(),
      ...resolveNebulaRendererPluginList(pluginSelection),
    ],
    base,
    root,
    resolve: nebulaRendererResolve,
    optimizeDeps: nebulaRendererOptimizeDeps,
    define: {
      ...nebulaBuildNodeVersionDefine(),
      ...nebulaMswDefine(),
      ...defineExtra,
    },
    build: {
      rolldownOptions: {
        onwarn(warning, defaultHandler) {
          // @vueuse/core 中 /* #__PURE__ */ 注解位置不符合 Rolldown 规范，不影响产物
          if (warning.code === 'INVALID_ANNOTATION') return;
          defaultHandler(warning);
        },
      },
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
