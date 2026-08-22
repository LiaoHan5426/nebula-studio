import { SHELL_ACTIVE_VIEW_STORAGE_KEY } from './storageKeys';

/** 无子应用、展示空工作台 */
export const SHELL_SURFACE_WORKSPACE = '__workspace__';
/** 展示应用集成层 */
export const SHELL_SURFACE_INTEGRATION = '__integration__';

export type ShellSurfacePreference =
  | { kind: 'integration' }
  | { kind: 'view'; viewId: string }
  | { kind: 'workspace' };

export function readShellSurfacePreference(): null | ShellSurfacePreference {
  try {
    const raw = window.sessionStorage.getItem(SHELL_ACTIVE_VIEW_STORAGE_KEY);
    if (raw === null) return null;
    const id = raw.trim();
    if (!id) return { kind: 'integration' };
    if (id === SHELL_SURFACE_WORKSPACE) return { kind: 'workspace' };
    if (id === SHELL_SURFACE_INTEGRATION) return { kind: 'integration' };
    return { kind: 'view', viewId: id };
  } catch {
    return null;
  }
}

export function persistShellSurfacePreference(
  surface: ShellSurfacePreference,
): void {
  try {
    const value =
      surface.kind === 'workspace'
        ? SHELL_SURFACE_WORKSPACE
        : surface.kind === 'integration'
          ? SHELL_SURFACE_INTEGRATION
          : surface.viewId;
    window.sessionStorage.setItem(SHELL_ACTIVE_VIEW_STORAGE_KEY, value);
  } catch {
    /* ignore */
  }
}

export function readActiveViewPreference(): null | string {
  const surface = readShellSurfacePreference();
  if (!surface || surface.kind !== 'view') return null;
  return surface.viewId;
}

export function persistActiveViewPreference(viewId: null | string): void {
  if (typeof viewId === 'string' && viewId.trim()) {
    persistShellSurfacePreference({ kind: 'view', viewId: viewId.trim() });
    return;
  }
  try {
    window.sessionStorage.removeItem(SHELL_ACTIVE_VIEW_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
