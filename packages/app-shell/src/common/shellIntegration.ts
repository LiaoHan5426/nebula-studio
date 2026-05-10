import type { EmbeddedShellWindowId } from './shellPresentationConfig';

export interface ShellIntegratedAppMeta {
  id: EmbeddedShellWindowId;
  /** 顶栏与 tooltip 展示名 */
  label: string;
  /** 完整内联 SVG（固定资源，供壳层 v-html） */
  iconSvg: string;
  /**
   * 为 `false` 时首次不进入工作台，需在集成界面通过「添加」启用。
   * 省略或为 `true` 时默认启用。
   */
  defaultEnabled?: boolean;
}

/** 参与壳层「应用坞」集成的子应用（不含登录等独立模块） */
export const shellIntegratedAppRegistry: Record<
  EmbeddedShellWindowId,
  ShellIntegratedAppMeta
> = {
  docs: {
    id: 'docs',
    label: '文档',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  },
  settings: {
    id: 'settings',
    label: '设置',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
  },
};

/** 集成界面展示顺序（与注册表键一致时可维护顺序） */
const SHELL_INTEGRABLE_ORDER = [
  'docs',
  'settings',
] as const satisfies readonly EmbeddedShellWindowId[];

export function listShellIntegrableAppIds(): EmbeddedShellWindowId[] {
  return SHELL_INTEGRABLE_ORDER.filter(
    (id) => id in shellIntegratedAppRegistry,
  );
}

export function isShellIntegrableAppId(
  id: string,
): id is EmbeddedShellWindowId {
  return id in shellIntegratedAppRegistry;
}

/** 注册表中默认应启用的集成子应用 */
export function getDefaultEnabledShellIntegrableIds(): EmbeddedShellWindowId[] {
  return listShellIntegrableAppIds().filter((id) => {
    const meta = shellIntegratedAppRegistry[id];
    return meta.defaultEnabled !== false;
  });
}

export function getShellIntegratedAppMeta(
  id: EmbeddedShellWindowId,
): ShellIntegratedAppMeta {
  return shellIntegratedAppRegistry[id];
}
