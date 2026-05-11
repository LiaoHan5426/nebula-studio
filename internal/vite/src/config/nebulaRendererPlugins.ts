import type { PluginOption } from 'vite';
import { nebulaVue } from '../plugin/nebulaVue.ts';
import { nebulaWebShellPlugin } from '../plugin/nebulaWebShell.ts';

export type NebulaRendererPreset = 'docs' | 'web';

/** 内置、可按配置启用的插件 id（在 `resolveNebulaRendererPluginList` 中注册） */
export type NebulaRendererPluginId = 'vue' | 'webShell';

const BUILTIN_REGISTRY: Record<
  NebulaRendererPluginId,
  () => PluginOption
> = {
  vue: () => nebulaVue(),
  webShell: () => nebulaWebShellPlugin(),
};

const PRESET_BUILTINS: Record<NebulaRendererPreset, NebulaRendererPluginId[]> =
  {
    docs: ['vue'],
    web: ['vue', 'webShell'],
  };

export interface NebulaRendererPluginSelection {
  /**
   * 覆盖当前 `preset` 的默认内置插件集合（顺序即注册顺序）。
   * 未传时沿用 `preset`：`docs` → vue；`web` → vue + webShell。
   */
  builtins?: NebulaRendererPluginId[];
  /** 追加在末尾的任意 Vite 插件 */
  extra?: PluginOption[];
}

export function resolveNebulaRendererPluginList(
  preset: NebulaRendererPreset,
  selection?: NebulaRendererPluginSelection,
): PluginOption[] {
  const ids =
    selection?.builtins !== undefined
      ? [...selection.builtins]
      : [...PRESET_BUILTINS[preset]];

  const core = ids.map((id) => BUILTIN_REGISTRY[id]());
  const extra = selection?.extra ?? [];
  return [...core, ...extra];
}

/** @deprecated 请使用 `resolveNebulaRendererPluginList` + `NebulaRendererPluginSelection` */
export function nebulaRendererPlugins(
  preset: NebulaRendererPreset,
): PluginOption[] {
  return resolveNebulaRendererPluginList(preset);
}
