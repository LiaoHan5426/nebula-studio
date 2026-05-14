import type { CreateNebulaRendererViteConfigOptions } from './config/createNebulaRendererViteConfig.ts';
import { createNebulaRendererViteConfig } from './config/createNebulaRendererViteConfig.ts';
import type { DefineNebulaElectronViteConfigOptions } from './electron/defineNebulaElectronViteConfig.ts';

export type DefineNebulaWebConfigOptions =
  CreateNebulaRendererViteConfigOptions & {
    platform: 'web';
  };

export type DefineNebulaElectronConfigOptions =
  DefineNebulaElectronViteConfigOptions & {
    platform: 'electron';
  };

export type DefineNebulaConfigOptions =
  | DefineNebulaWebConfigOptions
  | DefineNebulaElectronConfigOptions;

type NebulaRendererConfigReturn = ReturnType<
  typeof createNebulaRendererViteConfig
>;

/**
 * 统一入口：`web` 同步返回 `createNebulaRendererViteConfig`；`electron` 返回 Promise，
 * 内部 **动态** `import('electron-vite')`，主包不静态依赖 `electron-vite`。
 */
export function defineNebulaConfig(
  opts: DefineNebulaWebConfigOptions,
): NebulaRendererConfigReturn;
export function defineNebulaConfig(
  opts: DefineNebulaElectronConfigOptions,
): Promise<unknown>;
export function defineNebulaConfig(
  opts: DefineNebulaConfigOptions,
): NebulaRendererConfigReturn | Promise<unknown> {
  if (opts.platform === 'web') {
    const { platform: _p, ...rest } = opts;
    void _p;
    return createNebulaRendererViteConfig(rest);
  }
  const { platform: _p, ...rest } = opts;
  void _p;
  return import('./electron/defineNebulaElectronViteConfig.ts').then((m) =>
    m.defineNebulaElectronViteConfig(rest),
  );
}
