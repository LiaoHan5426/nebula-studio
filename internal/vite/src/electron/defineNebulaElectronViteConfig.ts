import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';
import type { PluginOption } from 'vite';
import { nebulaElectronRendererPartial } from '../config/nebulaElectronRenderer.ts';
import type { NebulaRendererChunksOptions } from '../config/chunks/types.ts';

/**
 * 统一 Preload 配置：源文件所在目录 + 需要构建的窗口 ID 列表。
 *
 * 每个窗口 ID 会生成一个虚拟 Rollup 入口，该入口在模块初始化时调用
 * `setWindowId('<id>')` 设置窗口标识，然后加载统一的 `unified.ts`。
 */
export interface UnifiedPreloadOptions {
  /** 统一 preload 源文件所在目录的绝对路径（如 `apps/electron-preload/src`） */
  sourceDir: string;
  /** 窗口 ID 列表，每个窗口会生成一个独立的 preload 构建入口 */
  windowIds: string[];
}

/**
 * Rollup 插件：为每个窗口 ID 生成虚拟 Preload 入口。
 *
 * 虚拟入口的模块代码：
 * ```js
 * import { setWindowId, bootstrap } from '<sourceDir>/unified.ts';
 * setWindowId('<windowId>');
 * bootstrap();
 * ```
 *
 * `unified.ts` 不含顶层副作用，所有初始化逻辑封装在 `bootstrap()` 中。
 * ES module 加载顺序保证：
 * 1. `unified.ts` 被加载（仅定义函数，无顶层副作用）
 * 2. 入口模块体执行：`setWindowId('<id>')` → `bootstrap()`
 * 3. `bootstrap()` 内部调用 `getWindowPreloadConfig()` 读取已设置的窗口标识
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
      const windowId = id.slice(prefix.length);
      const unifiedPath = `${sourceDir}/unified.ts`;
      return [
        `import { setWindowId, bootstrap } from ${JSON.stringify(unifiedPath)};`,
        `setWindowId(${JSON.stringify(windowId)});`,
        `bootstrap();`,
      ].join('\n');
    },
  };
}

export interface DefineNebulaElectronViteConfigOptions {
  /**
   * 传入本配置文件（如 `electron.vite.config.ts`）的 `import.meta.url`，
   * 用于解析 `apps/electron` 根目录与 preload 包路径，且不依赖 `process.cwd()`。
   */
  configModuleUrl: string | URL;
  /** 覆盖默认 preload 输入（窗口 ID → 文件路径）。一般无需设置，使用 `unifiedPreload` 即可。 */
  preloadInputs?: Record<string, string>;
  /**
   * 统一 Preload 配置：使用单一源文件 + 构建时注入窗口 ID，
   * 替代为每个窗口创建独立 preload 包的方式。
   * 与 `preloadInputs` 互斥，优先使用本字段。
   */
  unifiedPreload?: UnifiedPreloadOptions;
  /** 传给 `nebulaElectronRendererPartial({ chunks })`。 */
  chunks?: NebulaRendererChunksOptions;
  /** 深度合并进默认 `main` 段。 */
  main?: Record<string, unknown>;
  /** 深度合并进默认 `preload` 段。 */
  preload?: Record<string, unknown>;
  /** 深度合并进整条 `electron-vite` 配置（最后应用，可覆盖上述各段）。 */
  merge?: Record<string, unknown>;
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
    for (const id of opts.unifiedPreload.windowIds) {
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
          externalizeDeps: {
            exclude: ['@nebula-studio/app-shell'],
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
      nebulaElectronRendererPartial({ chunks: opts.chunks }),
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
