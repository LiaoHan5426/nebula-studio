import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';
import { nebulaElectronRendererPartial } from '../config/nebulaElectronRenderer.ts';
import type { NebulaRendererChunksOptions } from '../config/chunks/types.ts';

const DEFAULT_PRELOAD_INPUTS: Record<string, string> = {
  main: '@nebula-studio-preload/main',
  docs: '@nebula-studio-preload/docs',
  settings: '@nebula-studio-preload/settings',
};

export interface DefineNebulaElectronViteConfigOptions {
  /**
   * 传入本配置文件（如 `electron.vite.config.ts`）的 `import.meta.url`，
   * 用于解析 `apps/electron` 根目录与 preload 包路径，且不依赖 `process.cwd()`。
   */
  configModuleUrl: string | URL;
  /** 覆盖默认 preload 包名 → `src/index.ts` 映射。 */
  preloadInputs?: Record<string, string>;
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
  const require = createRequire(href);
  const electronAppDir = dirname(fileURLToPath(href));

  const preloadPkgs = opts.preloadInputs ?? DEFAULT_PRELOAD_INPUTS;
  const preloadInput: Record<string, string> = {};
  for (const [key, pkg] of Object.entries(preloadPkgs)) {
    preloadInput[key] = join(
      dirname(require.resolve(`${pkg}/package.json`)),
      'src/index.ts',
    );
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
