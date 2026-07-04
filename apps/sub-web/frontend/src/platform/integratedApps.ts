import {
  getEmbeddedShellWindowIds,
  registerShellIntegratedApps,
  setShellIntegrableOrder,
  GENERATED_WINDOWS,
  GENERATED_DISPLAY_ORDER,
} from '@nebula-studio/app-shell';
import type {
  EmbeddedShellWindowId,
  ShellIntegratedAppMeta,
} from '@nebula-studio/app-shell';

type ShellIntegratedAppCatalogEntry = Omit<ShellIntegratedAppMeta, 'id'>;

/**
 * Nebula Studio 平台入口：同仓库 `apps/sub-web/*` 在壳层「应用集成」中的展示元数据。
 *
 * **单源**：所有 label / iconSvg / integratable / requiresAuth 均来自
 * `configs/windows.json` → codegen → `_generated-windows.ts`，
 * 新增子应用只需编辑 `windows.json` 并重新生成。
 */
const _embeddedIds = getEmbeddedShellWindowIds();

const _catalog: Record<string, ShellIntegratedAppCatalogEntry> = {};
for (const id of _embeddedIds) {
  const w = GENERATED_WINDOWS[id];
  if (w) {
    const entry: ShellIntegratedAppCatalogEntry = {
      label: w.label,
      iconSvg: w.iconSvg ?? '',
    };
    if (w.integratable !== undefined) entry.integratable = w.integratable;
    if (w.requiresAuth !== undefined) entry.requiresAuth = w.requiresAuth;
    _catalog[id] = entry;
  }
}

export const shellIntegratedAppsCatalog = _catalog as Readonly<
  Record<EmbeddedShellWindowId, ShellIntegratedAppCatalogEntry>
>;

/** 应用集成面板中的展示顺序（不含侧栏固定入口如「设置」），来自 `configs/windows.json` 的 `displayOrder` */
export const shellIntegrableDisplayOrder =
  GENERATED_DISPLAY_ORDER as readonly EmbeddedShellWindowId[];

export function buildShellIntegratedAppMetas(): ShellIntegratedAppMeta[] {
  return _embeddedIds.map((id) => ({
    id,
    ...shellIntegratedAppsCatalog[id],
  }));
}

/** Web / Electron 主进程 / 壳 renderer 统一调用，注册可集成子应用元数据 */
export function bootstrapShellIntegratedApps(): void {
  registerShellIntegratedApps(buildShellIntegratedAppMetas());
  setShellIntegrableOrder([...shellIntegrableDisplayOrder]);
}
