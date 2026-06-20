import {
  getEmbeddedShellWindowIds,
  registerShellIntegratedApps,
  setShellIntegrableOrder,
} from '@nebula-studio/app-shell';
import type {
  EmbeddedShellWindowId,
  ShellIntegratedAppMeta,
} from '@nebula-studio/app-shell';

const ICON_DOCS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`;

const ICON_INTEGRATION = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;

const ICON_SETTINGS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`;

type ShellIntegratedAppCatalogEntry = Omit<ShellIntegratedAppMeta, 'id'>;

/**
 * Nebula Studio 平台入口：同仓库 `apps/sub-web/*` 在壳层「应用集成」中的展示元数据。
 * 新增子应用时：先在 `@nebula-studio/app-shell` 的 `shellPresentationConfig.windows` 声明窗口，再在此补充 label / icon。
 */
export const shellIntegratedAppsCatalog = {
  docs: {
    label: '文档',
    iconSvg: ICON_DOCS,
  },
  integration: {
    label: '集成平台',
    iconSvg: ICON_INTEGRATION,
    requiresAuth: true,
  },
  settings: {
    label: '设置',
    iconSvg: ICON_SETTINGS,
    integratable: false,
    requiresAuth: true,
  },
} as const satisfies Record<
  EmbeddedShellWindowId,
  ShellIntegratedAppCatalogEntry
>;

/** 应用集成面板中的展示顺序（不含侧栏固定入口如「设置」） */
export const shellIntegrableDisplayOrder = [
  'docs',
  'integration',
] as const satisfies readonly EmbeddedShellWindowId[];

function assertCatalogAlignedWithWindows(): void {
  const windowIds = new Set(getEmbeddedShellWindowIds());
  for (const id of shellIntegrableDisplayOrder) {
    if (!(id in shellIntegratedAppsCatalog)) {
      throw new Error(
        `[platform] shellIntegrableDisplayOrder 含 "${id}"，但 shellIntegratedAppsCatalog 未定义`,
      );
    }
    if (!windowIds.has(id)) {
      throw new Error(
        `[platform] shellIntegrableDisplayOrder 含 "${id}"，但 shellPresentationConfig.windows 未声明`,
      );
    }
  }
  for (const id of Object.keys(
    shellIntegratedAppsCatalog,
  ) as EmbeddedShellWindowId[]) {
    if (!windowIds.has(id)) {
      throw new Error(
        `[platform] shellIntegratedAppsCatalog 含 "${id}"，但 shellPresentationConfig.windows 未声明`,
      );
    }
  }
}

export function buildShellIntegratedAppMetas(): ShellIntegratedAppMeta[] {
  assertCatalogAlignedWithWindows();
  return (
    Object.keys(shellIntegratedAppsCatalog) as EmbeddedShellWindowId[]
  ).map((id) => ({
    id,
    ...shellIntegratedAppsCatalog[id],
  }));
}

/** Web / Electron 主进程 / 壳 renderer 统一调用，注册可集成子应用元数据 */
export function bootstrapShellIntegratedApps(): void {
  registerShellIntegratedApps(buildShellIntegratedAppMetas());
  setShellIntegrableOrder([...shellIntegrableDisplayOrder]);
}
