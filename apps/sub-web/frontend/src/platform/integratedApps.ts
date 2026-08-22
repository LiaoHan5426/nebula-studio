import type { FrontendRuntimeEntry } from '@nebula-studio/contracts/system';
import type {
  EmbeddedShellWindowId,
  ShellIntegratedAppMeta,
} from '@nebula-studio/app-shell';

import {
  getEmbeddedShellWindowIds,
  readWebAuthSession,
  registerShellIntegratedApps,
  resetShellIntegratedAppRegistry,
  setShellIntegrableOrder,
} from '@nebula-studio/app-shell';
import {
  iframeRegistrationFromRuntime,
  isExternalRuntimeEntry,
  isIframeRuntimeEntry,
  resolveExternalHref,
  fetchFrontendRuntimeEntries,
} from '@nebula-studio/application-runtime';

import {
  SHELL_CHROME_CATALOG,
  SHELL_INTEGRABLE_DISPLAY_ORDER,
} from './shellChromeCatalog';

type ShellIntegratedAppCatalogEntry = Omit<ShellIntegratedAppMeta, 'id'>;

const SHELL_CATEGORIES = new Set<
  NonNullable<ShellIntegratedAppMeta['category']>
>(['product', 'settings', 'support', 'workspace']);

/**
 * Fallback catalog when `/api/system/frontend-apps/runtime` is unavailable.
 * Labels come from `shellChromeCatalog` (registry snapshot), not `windows.json`.
 */
const _embeddedIds = getEmbeddedShellWindowIds();

const _catalog: Record<string, ShellIntegratedAppCatalogEntry> = {};
for (const id of _embeddedIds) {
  const w = SHELL_CHROME_CATALOG[id];
  if (w) {
    _catalog[id] = { ...w };
  }
}

export const shellIntegratedAppsCatalog = _catalog as Readonly<
  Record<EmbeddedShellWindowId, ShellIntegratedAppCatalogEntry>
>;

/** 应用集成面板中的展示顺序（不含侧栏固定入口如「设置」），runtime 不可用时回退 */
export const shellIntegrableDisplayOrder = SHELL_INTEGRABLE_DISPLAY_ORDER;

let rememberedRuntimeEntries: FrontendRuntimeEntry[] = [];

export function rememberRuntimeEntries(
  entries: readonly FrontendRuntimeEntry[],
): void {
  rememberedRuntimeEntries = [...entries];
}

export function getRememberedRuntimeEntry(
  id: string,
): FrontendRuntimeEntry | undefined {
  return rememberedRuntimeEntries.find((entry) => entry.id === id);
}

export function isRememberedIframeApp(id: string): boolean {
  const entry = getRememberedRuntimeEntry(id);
  return Boolean(entry && isIframeRuntimeEntry(entry));
}

export function isRememberedExternalApp(id: string): boolean {
  const entry = getRememberedRuntimeEntry(id);
  return Boolean(entry && isExternalRuntimeEntry(entry));
}

export function listRememberedIframeAppIds(): string[] {
  return rememberedRuntimeEntries
    .filter(
      (entry) => entry.webEnabled !== false && isIframeRuntimeEntry(entry),
    )
    .map((entry) => entry.id);
}

export function listRememberedExternalAppIds(): string[] {
  return rememberedRuntimeEntries
    .filter(
      (entry) => entry.webEnabled !== false && isExternalRuntimeEntry(entry),
    )
    .map((entry) => entry.id);
}

export function resolveRememberedIframeSrc(id: string): string | undefined {
  const entry = getRememberedRuntimeEntry(id);
  if (!entry || !isIframeRuntimeEntry(entry)) return undefined;
  try {
    return iframeRegistrationFromRuntime(entry).src;
  } catch {
    return undefined;
  }
}

export function resolveRememberedExternalHref(id: string): string | undefined {
  const entry = getRememberedRuntimeEntry(id);
  if (!entry || !isExternalRuntimeEntry(entry)) return undefined;
  try {
    return resolveExternalHref(entry);
  } catch {
    return undefined;
  }
}

const RUNTIME_DRIVER_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>';

function runtimeEntryToMeta(
  entry: FrontendRuntimeEntry,
): ShellIntegratedAppMeta {
  const category = asShellCategory(entry.category) ?? 'product';
  const meta: ShellIntegratedAppMeta = {
    id: entry.id,
    label: entry.name?.trim() || entry.id,
    iconSvg: entry.icon?.trim() || RUNTIME_DRIVER_ICON,
    category,
    integratable: entry.integratable !== false,
    requiresAuth: entry.requiresAuth !== false,
    defaultEnabled: entry.defaultEnabled !== false,
  };
  if (entry.description !== undefined) meta.description = entry.description;
  if (entry.helpKey !== undefined) meta.helpKey = entry.helpKey;
  if (entry.searchKeywords !== undefined)
    meta.searchKeywords = entry.searchKeywords;
  if (entry.roles !== undefined && entry.roles.length > 0)
    meta.roles = entry.roles;
  if (entry.returnTo !== undefined) meta.returnTo = entry.returnTo;
  return meta;
}

function isRuntimeDriverCatalogEntry(entry: FrontendRuntimeEntry): boolean {
  return (
    entry.webEnabled !== false &&
    (isIframeRuntimeEntry(entry) || isExternalRuntimeEntry(entry)) &&
    !isEmbeddedCatalogId(entry.id)
  );
}

function asShellCategory(
  value: string | undefined,
): ShellIntegratedAppMeta['category'] | undefined {
  if (
    value &&
    SHELL_CATEGORIES.has(
      value as NonNullable<ShellIntegratedAppMeta['category']>,
    )
  ) {
    return value as NonNullable<ShellIntegratedAppMeta['category']>;
  }
  return undefined;
}

function isEmbeddedCatalogId(id: string): id is EmbeddedShellWindowId {
  return _embeddedIds.includes(id as EmbeddedShellWindowId);
}

export function overlayRuntimeOnWindowsCatalog(
  entries: readonly FrontendRuntimeEntry[],
): ShellIntegratedAppMeta[] {
  const byId = new Map(
    entries
      .filter((entry) => entry.webEnabled !== false)
      .map((entry) => [entry.id, entry]),
  );
  const chrome = _embeddedIds.map((id) => {
    const base: ShellIntegratedAppMeta = {
      id,
      ...shellIntegratedAppsCatalog[id],
    };
    const entry = byId.get(id);
    if (!entry) {
      return base;
    }
    const category = asShellCategory(entry.category) ?? base.category;
    const overlay: ShellIntegratedAppMeta = {
      ...base,
      label: entry.name?.trim() || base.label,
      iconSvg: entry.icon?.trim() || base.iconSvg,
    };
    if (entry.description !== undefined)
      overlay.description = entry.description;
    if (category !== undefined) overlay.category = category;
    if (entry.helpKey !== undefined) overlay.helpKey = entry.helpKey;
    if (entry.searchKeywords !== undefined)
      overlay.searchKeywords = entry.searchKeywords;
    if (entry.roles !== undefined && entry.roles.length > 0)
      overlay.roles = entry.roles;
    if (entry.returnTo !== undefined) overlay.returnTo = entry.returnTo;
    if (entry.integratable !== undefined)
      overlay.integratable = entry.integratable;
    if (entry.requiresAuth !== undefined)
      overlay.requiresAuth = entry.requiresAuth;
    if (entry.defaultEnabled !== undefined)
      overlay.defaultEnabled = entry.defaultEnabled;
    return overlay;
  });
  return [
    ...chrome,
    ...entries.filter(isRuntimeDriverCatalogEntry).map(runtimeEntryToMeta),
  ];
}

function isRuntimeIntegratable(entry: FrontendRuntimeEntry): boolean {
  if (entry.integratable !== undefined) {
    return entry.integratable;
  }
  if (isRuntimeDriverCatalogEntry(entry)) {
    return true;
  }
  if (!isEmbeddedCatalogId(entry.id)) {
    return false;
  }
  return shellIntegratedAppsCatalog[entry.id].integratable !== false;
}

export function integrableOrderFromRuntime(
  entries: readonly FrontendRuntimeEntry[],
): string[] {
  const ordered = [...entries]
    .filter(
      (entry) =>
        (isEmbeddedCatalogId(entry.id) || isRuntimeDriverCatalogEntry(entry)) &&
        entry.webEnabled !== false &&
        isRuntimeIntegratable(entry),
    )
    .toSorted((left, right) => {
      const sort = (left.sortOrder ?? 0) - (right.sortOrder ?? 0);
      return sort !== 0 ? sort : left.id.localeCompare(right.id);
    })
    .map((entry) => entry.id);
  return ordered.length > 0 ? ordered : [...shellIntegrableDisplayOrder];
}

export function buildShellIntegratedAppMetas(): ShellIntegratedAppMeta[] {
  return overlayRuntimeOnWindowsCatalog([]);
}

/** Web / Electron 主进程 / 壳 renderer 统一调用，注册可集成子应用元数据 */
export function bootstrapShellIntegratedApps(): void {
  resetShellIntegratedAppRegistry();
  registerShellIntegratedApps(buildShellIntegratedAppMetas());
  setShellIntegrableOrder([...shellIntegrableDisplayOrder]);
}

function hostRuntimeAuth(): { tenantId: string; token?: string } {
  const session = readWebAuthSession();
  const tenantId =
    (typeof localStorage === 'undefined'
      ? null
      : localStorage.getItem('tenant_id')) ?? 'tenant-a';
  return { token: session?.token, tenantId };
}

/** Overlay Host sidebar / 应用集成 metadata from the frontend runtime API. */
export async function hydrateShellIntegratedAppsFromRuntime(): Promise<void> {
  try {
    const entries = await fetchFrontendRuntimeEntries(hostRuntimeAuth());
    rememberRuntimeEntries(entries);
    resetShellIntegratedAppRegistry();
    registerShellIntegratedApps(overlayRuntimeOnWindowsCatalog(entries));
    setShellIntegrableOrder(integrableOrderFromRuntime(entries));
  } catch (error) {
    console.warn(
      '[integrated-apps] frontend runtime unavailable, keeping chrome catalog fallback',
      error,
    );
    rememberRuntimeEntries([]);
    bootstrapShellIntegratedApps();
  }
}
