import type { PluginOption } from 'vite';

import type { NebulaRendererChunksOptions } from '../config/chunks/types.ts';
import type { PreloadCapability } from '@nebula-studio-internal/node-kit/windows-manifest';

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { mergeConfig } from 'vite';

import { nebulaElectronRendererPartial } from '../config/nebulaElectronRenderer.ts';

/**
 * 统一 Preload 配置：源文件所在目录 + 需要构建的 preload capability map。
 *
 * 每个 preload ID 会生成一个虚拟 Rollup 入口，并把从 `windows.json`
 * 派生的能力集合直接传给统一的 `bootstrap()`。
 */
export interface UnifiedPreloadOptions {
  /** Preload ID → 该入口需要暴露的能力集合 */
  entries: Record<string, PreloadCapability[]>;
  /** 统一 preload 源文件所在目录的绝对路径（如 `apps/electron-preload/src`） */
  sourceDir: string;
}

/**
 * Rollup 插件：为每个窗口 ID 生成虚拟 Preload 入口。
 *
 * 虚拟入口的模块代码：
 * ```js
 * import { bootstrap } from '<sourceDir>/unified.ts';
 * bootstrap({ id: '<preloadId>', capabilities: ['auth'] });
 * ```
 *
 * `unified.ts` 不含顶层副作用，所有初始化逻辑封装在 `bootstrap()` 中。
 */
function createUnifiedPreloadVirtualEntries(
  opts: UnifiedPreloadOptions,
): PluginOption {
  const prefix = '\0nebula-preload-entry:';
  const sourceDir = opts.sourceDir.replace(/\\/g, '/');

  return {
    name: 'nebula-unified-preload',
    resolveId(source: string) {
      if (source.startsWith(prefix)) {
        return source;
      }
      return null;
    },
    load(id: string) {
      if (!id.startsWith(prefix)) return null;
      const preloadId = id.slice(prefix.length);
      const capabilities = opts.entries[preloadId];
      if (!capabilities) {
        throw new Error(
          `[nebula-vite] Missing capabilities for preload "${preloadId}"`,
        );
      }
      const unifiedPath = `${sourceDir}/unified.ts`;
      return [
        `import { bootstrap } from ${JSON.stringify(unifiedPath)};`,
        `bootstrap(${JSON.stringify({ id: preloadId, capabilities })});`,
      ].join('\n');
    },
  };
}

export interface DefineNebulaElectronViteConfigOptions {
  /** 传给 `nebulaElectronRendererPartial({ chunks })`。 */
  chunks?: NebulaRendererChunksOptions;
  /**
   * 传入本配置文件（如 `electron.vite.config.ts`）的 `import.meta.url`，
   * 用于解析 `apps/electron` 根目录与 preload 包路径，且不依赖 `process.cwd()`。
   */
  configModuleUrl: string | URL;
  /** 深度合并进默认 `main` 段。 */
  main?: Record<string, unknown>;
  /** 深度合并进整条 `electron-vite` 配置（最后应用，可覆盖上述各段）。 */
  merge?: Record<string, unknown>;
  /** 深度合并进默认 `preload` 段。 */
  preload?: Record<string, unknown>;
  /** 覆盖默认 preload 输入（窗口 ID → 文件路径）。一般无需设置，使用 `unifiedPreload` 即可。 */
  preloadInputs?: Record<string, string>;
  /**
   * 统一 Preload 配置：使用单一源文件 + 构建时注入窗口 ID，
   * 替代为每个窗口创建独立 preload 包的方式。
   * 与 `preloadInputs` 互斥，优先使用本字段。
   */
  unifiedPreload?: UnifiedPreloadOptions;
}

/**
 * 使用 **动态 `import('electron-vite')`**；仅 Electron 应用应调用（或通过 `defineNebulaConfig({ platform: 'electron' })`）。
 */
export async function defineNebulaElectronViteConfig(
  opts: DefineNebulaElectronViteConfigOptions,
): Promise<unknown> {
  const { defineConfig } = await import('electron-vite');
  const href =
    typeof opts.configModuleUrl === 'string'
      ? opts.configModuleUrl
      : opts.configModuleUrl.href;
  const electronAppDir = dirname(fileURLToPath(href));

  // 构建 preload 输入：优先使用 unifiedPreload 虚拟入口
  let preloadInput: Record<string, string>;
  const unifiedPlugin = opts.unifiedPreload
    ? createUnifiedPreloadVirtualEntries(opts.unifiedPreload)
    : null;

  if (opts.unifiedPreload) {
    preloadInput = {};
    for (const id of Object.keys(opts.unifiedPreload.entries)) {
      preloadInput[id] = `\0nebula-preload-entry:${id}`;
    }
  } else {
    const preloadPkgs = opts.preloadInputs ?? {};
    preloadInput = {};
    for (const [key, entryPath] of Object.entries(preloadPkgs)) {
      preloadInput[key] = entryPath;
    }
  }

  const base = {
    main: mergeConfig(
      {
        build: {
          watch: {},
          // 这些包的 exports 指向 .ts；externalize 后 Electron 会用 Node ESM
          // 加载源码，相对导入无扩展名会 ERR_MODULE_NOT_FOUND。
          externalizeDeps: {
            exclude: [
              '@electron-toolkit/utils',
              '@nebula-studio-electron/electron-bridge',
              '@nebula-studio-internal/node-kit',
              '@nebula-studio/app-shell',
              '@nebula-studio/application-runtime',
              '@nebula-studio/auth-provider',
              '@nebula-studio/contracts',
              '@nebula-studio/federation-protocol',
              '@nebula-studio/host-capabilities',
              '@nebula-studio/shell-host',
              '@nebula-studio/shell-protocol',
              '@nebula-studio/tokens',
              'yaml',
            ],
          },
        },
      },
      opts.main ?? {},
    ),
    preload: mergeConfig(
      {
        build: {
          watch: {},
          rollupOptions: {
            input: preloadInput,
            external: ['electron'],
            plugins: unifiedPlugin ? [unifiedPlugin] : [],
          },
        },
      },
      opts.preload ?? {},
    ),
    renderer: mergeConfig(
      nebulaElectronRendererPartial({
        chunks: opts.chunks,
        appRoot: electronAppDir,
      }),
      {
        build: {
          rollupOptions: {
            input: join(electronAppDir, 'src/renderer/index.html'),
          },
        },
      },
    ),
  };

  return defineConfig(mergeConfig(base, opts.merge ?? {}) as never);
}
