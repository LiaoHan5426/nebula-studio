import type { PluginOption } from 'vite';
import { nebulaVue } from '../plugin/nebulaVue.ts';
import { nebulaWebShellPlugin } from '../plugin/nebulaWebShell.ts';

/** 内置、可按配置启用的 **Vite 插件** id（在 `resolveNebulaRendererPluginList` 中注册） */
export type NebulaRendererPluginId =
  /** `@vitejs/plugin-vue`（经 `nebulaVue`） */
  | 'vue'
  /** {@link nebulaWebShell} 构建期插件，非运行时壳 */
  | 'webShell';

const BUILTIN_REGISTRY: Record<NebulaRendererPluginId, () => PluginOption> = {
  vue: () => nebulaVue(),
  webShell: () => nebulaWebShellPlugin(),
};

/**
 * 未指定 `plugins.builtins` 时使用的默认内置插件 id（仅 Vue）。
 * 需要 `webShell` 时在调用处传 `plugins: { builtins: ['vue', 'webShell'] }`。
 */
export const NEBULA_DEFAULT_RENDERER_BUILTIN_IDS: readonly NebulaRendererPluginId[] =
  ['vue'];

export interface NebulaRendererPluginSelection {
  /**
   * 覆盖默认内置插件集合（顺序即注册顺序）。
   * 未传时等价于 {@link NEBULA_DEFAULT_RENDERER_BUILTIN_IDS}。
   */
  builtins?: NebulaRendererPluginId[];
  /** 追加在末尾的任意 Vite 插件 */
  extra?: PluginOption[];
}

export function resolveNebulaRendererPluginList(
  selection?: NebulaRendererPluginSelection,
): PluginOption[] {
  const ids =
    selection?.builtins !== undefined
      ? [...selection.builtins]
      : [...NEBULA_DEFAULT_RENDERER_BUILTIN_IDS];

  const core = ids.map((id) => BUILTIN_REGISTRY[id]());
  const extra = selection?.extra ?? [];
  return [...core, ...extra];
}

/** @deprecated 请使用 `resolveNebulaRendererPluginList()` */
export function nebulaRendererPlugins(): PluginOption[] {
  return resolveNebulaRendererPluginList();
}
