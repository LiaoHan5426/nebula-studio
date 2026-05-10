import { SHELL_ACTIVE_VIEW_STORAGE_KEY } from './shellHostStorageKeys';

export function readActiveViewPreference(): string | null {
  try {
    const raw = window.localStorage.getItem(SHELL_ACTIVE_VIEW_STORAGE_KEY);
    return typeof raw === 'string' && raw.trim() ? raw : null;
  } catch {
    return null;
  }
}

export function persistActiveViewPreference(viewId: string | null): void {
  try {
    if (typeof viewId === 'string' && viewId) {
      window.localStorage.setItem(SHELL_ACTIVE_VIEW_STORAGE_KEY, viewId);
    } else {
      window.localStorage.removeItem(SHELL_ACTIVE_VIEW_STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}
