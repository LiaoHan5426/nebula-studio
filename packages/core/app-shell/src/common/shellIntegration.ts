import type { EmbeddedShellWindowId } from './shellPresentationConfig';

export interface ShellIntegratedAppMeta {
  id: EmbeddedShellWindowId;
  label: string;
  iconSvg: string;
  defaultEnabled?: boolean;
  /** 为 false 时仅作为嵌入子应用（如侧栏「设置」），不出现在「应用集成」网格 */
  integratable?: boolean;
  /** 打开该嵌入视图前需 Shell 登录态（含 JWT） */
  requiresAuth?: boolean;
}

export type ShellIntegratedAppRegistry = Partial<
  Record<EmbeddedShellWindowId, ShellIntegratedAppMeta>
>;

const shellIntegratedAppRegistry: ShellIntegratedAppRegistry = {};

let shellIntegrableOrder: EmbeddedShellWindowId[] = [];

export function registerShellIntegratedApp(meta: ShellIntegratedAppMeta): void {
  shellIntegratedAppRegistry[meta.id] = meta;
}

export function registerShellIntegratedApps(
  apps: ShellIntegratedAppMeta[],
): void {
  for (const app of apps) {
    registerShellIntegratedApp(app);
  }
}

export function setShellIntegrableOrder(order: EmbeddedShellWindowId[]): void {
  shellIntegrableOrder = order;
}

export function getShellIntegratedAppRegistry(): ShellIntegratedAppRegistry {
  return shellIntegratedAppRegistry;
}

export function listShellIntegrableAppIds(): EmbeddedShellWindowId[] {
  const isIntegratable = (id: EmbeddedShellWindowId): boolean => {
    const meta = shellIntegratedAppRegistry[id];
    return meta !== undefined && meta.integratable !== false;
  };
  const orderedIds = shellIntegrableOrder.filter(
    (id) => id in shellIntegratedAppRegistry && isIntegratable(id),
  );
  const unorderedIds = Object.keys(shellIntegratedAppRegistry).filter(
    (id) =>
      !orderedIds.includes(id as EmbeddedShellWindowId) &&
      isIntegratable(id as EmbeddedShellWindowId),
  ) as EmbeddedShellWindowId[];
  return [...orderedIds, ...unorderedIds];
}

export function isShellIntegratableAppId(
  id: string,
): id is EmbeddedShellWindowId {
  return (
    isShellIntegrableAppId(id) &&
    shellIntegratedAppRegistry[id]?.integratable !== false
  );
}

export function isShellIntegrableAppId(
  id: string,
): id is EmbeddedShellWindowId {
  return id in shellIntegratedAppRegistry;
}

export function getDefaultEnabledShellIntegrableIds(): EmbeddedShellWindowId[] {
  return listShellIntegrableAppIds().filter((id) => {
    const meta = shellIntegratedAppRegistry[id];
    return meta !== undefined && meta.defaultEnabled !== false;
  });
}

export function getShellIntegratedAppMeta(
  id: EmbeddedShellWindowId,
): ShellIntegratedAppMeta {
  const meta = shellIntegratedAppRegistry[id];
  if (meta !== undefined) {
    return meta;
  }
  return {
    id,
    label: id,
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/></svg>`,
  };
}

export function tryGetShellIntegratedAppMeta(
  id: EmbeddedShellWindowId,
): ShellIntegratedAppMeta | undefined {
  return shellIntegratedAppRegistry[id];
}

export function embeddedViewRequiresShellAuth(viewId: string): boolean {
  if (!isShellIntegrableAppId(viewId)) return false;
  return tryGetShellIntegratedAppMeta(viewId)?.requiresAuth === true;
}

/**
 * 判断给定 viewId 是否为独立侧边栏应用（非工作台、非应用集成网格项）。
 *
 * 依据 `windows.json` 中 `integratable: false` 的嵌入窗口自动推导，
 * 新增子应用只需在 `windows.json` 中声明 `integratable: false`，
 * 无需修改壳层代码。
 */
export function isShellStandaloneSidebarApp(
  id: string,
): id is EmbeddedShellWindowId {
  return (
    id !== 'main' &&
    id in shellIntegratedAppRegistry &&
    shellIntegratedAppRegistry[id as EmbeddedShellWindowId]?.integratable ===
      false
  );
}
