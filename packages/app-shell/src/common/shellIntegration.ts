import type { EmbeddedShellWindowId } from './shellPresentationConfig';

export interface ShellIntegratedAppMeta {
  id: EmbeddedShellWindowId;
  label: string;
  iconSvg: string;
  defaultEnabled?: boolean;
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
  const orderedIds = shellIntegrableOrder.filter(
    (id) => id in shellIntegratedAppRegistry,
  );
  const unorderedIds = Object.keys(shellIntegratedAppRegistry).filter(
    (id) => !orderedIds.includes(id as EmbeddedShellWindowId),
  ) as EmbeddedShellWindowId[];
  return [...orderedIds, ...unorderedIds];
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
