import type { EmbeddedShellWindowId } from '@nebula-studio/app-shell/shell-config';

import { getEmbeddedShellWindowIds } from '@nebula-studio/app-shell/shell-config';
import {
  getDefaultEnabledShellIntegrableIds,
  isShellIntegrableAppId,
  listShellIntegrableAppIds,
} from '@nebula-studio/app-shell/shell-integration';
import {
  persistActiveViewPreference,
  SHELL_ACTIVE_VIEW_STORAGE_KEY,
} from '@nebula-studio/shell-protocol';

import { UNHANDLED } from '@nebula-studio-electron/electron-bridge/vue';

type PreferenceIpcListener = (
  event: unknown,
  payload: Record<string, unknown>,
) => void;

const WEB_ENABLED_STORAGE_KEY = 'nebula-studio-shell-enabled-integrations';

/**
 * Web 宿主：在内存 + localStorage（启用列表）+ sessionStorage（当前子应用视图）中模拟 `shell:get-state` / 子应用启停，
 * 与 Electron 主进程行为对齐；**仅**在 `registerShellHostIpc: true` 时注册 IPC 通道。
 */
export function createWebShellEmbeddedStateHandlers(options: {
  preferenceOn: (channel: string, listener: PreferenceIpcListener) => void;
  preferenceRemoveListener: (
    channel: string,
    listener: PreferenceIpcListener,
  ) => void;
  registerShellHostIpc: boolean;
  tryHandlePreferenceInvoke: (
    channel: string,
    args: unknown[],
  ) => typeof UNHANDLED | unknown;
}) {
  const embeddedIds = getEmbeddedShellWindowIds();

  const isEmbeddedChromeId = (id: string): id is EmbeddedShellWindowId =>
    embeddedIds.includes(id as EmbeddedShellWindowId);

  const computeDefaultEnabledEmbeddedIds = (): Set<EmbeddedShellWindowId> => {
    const integratable = new Set(listShellIntegrableAppIds());
    const defaultOn = new Set(getDefaultEnabledShellIntegrableIds());
    const out = new Set<EmbeddedShellWindowId>();
    for (const id of embeddedIds) {
      if (!integratable.has(id)) out.add(id);
      else if (defaultOn.has(id)) out.add(id);
    }
    return out;
  };

  const normalizeEnabledList = (
    raw: unknown,
  ): EmbeddedShellWindowId[] | null => {
    if (!Array.isArray(raw)) return null;
    const valid = new Set(embeddedIds);
    const out = raw.filter(
      (x): x is EmbeddedShellWindowId =>
        typeof x === 'string' && valid.has(x as EmbeddedShellWindowId),
    );
    return out.length ? out : null;
  };

  let enabledEmbeddedLoaded = false;
  let enabledEmbeddedViewOrder: EmbeddedShellWindowId[] = [];
  let activeEmbeddedViewId: null | string = null;

  const ensureEnabledEmbeddedLoaded = (): void => {
    if (enabledEmbeddedLoaded) return;
    enabledEmbeddedLoaded = true;
    try {
      const raw = localStorage.getItem(WEB_ENABLED_STORAGE_KEY);
      if (raw) {
        const parsed = normalizeEnabledList(JSON.parse(raw) as unknown);
        if (parsed) {
          enabledEmbeddedViewOrder = [...parsed];
          return;
        }
      }
    } catch {
      /* 使用默认 */
    }
    enabledEmbeddedViewOrder = [...computeDefaultEnabledEmbeddedIds()];
  };

  const persistWebEnabledEmbedded = (): void => {
    localStorage.setItem(
      WEB_ENABLED_STORAGE_KEY,
      JSON.stringify([...enabledEmbeddedViewOrder]),
    );
  };

  const hasEnabledEmbedded = (id: EmbeddedShellWindowId): boolean =>
    enabledEmbeddedViewOrder.includes(id);

  const availableEmbeddedIds = (): string[] => {
    const chrome = enabledEmbeddedViewOrder.filter((id) =>
      isEmbeddedChromeId(id),
    );
    const extras = listShellIntegrableAppIds().filter(
      (id) => !isEmbeddedChromeId(id),
    );
    return [...chrome, ...extras];
  };

  const dormantIntegrableIds = (): EmbeddedShellWindowId[] =>
    listShellIntegrableAppIds().filter(
      (id): id is EmbeddedShellWindowId =>
        isEmbeddedChromeId(id) && !hasEnabledEmbedded(id),
    );

  const ensureActiveEmbeddedConsistent = (): void => {
    const avail = availableEmbeddedIds();
    if (
      activeEmbeddedViewId &&
      avail.includes(activeEmbeddedViewId as EmbeddedShellWindowId)
    ) {
      return;
    }
    try {
      const raw = sessionStorage.getItem(SHELL_ACTIVE_VIEW_STORAGE_KEY);
      const id = typeof raw === 'string' ? raw.trim() : '';
      if (
        id &&
        avail.includes(id as EmbeddedShellWindowId) &&
        embeddedIds.includes(id as EmbeddedShellWindowId)
      ) {
        activeEmbeddedViewId = id;
        return;
      }
    } catch {
      /* ignore */
    }
    // 无本地偏好时不默认落到首个子应用，否则「回到集成首页」清空键后刷新仍会得到 docs，集成层无法优先
    activeEmbeddedViewId = null;
  };

  const shellGetState = () => {
    ensureEnabledEmbeddedLoaded();
    ensureActiveEmbeddedConsistent();
    return {
      activeViewId: activeEmbeddedViewId,
      availableViewIds: [...availableEmbeddedIds()],
      dormantIntegrableIds: dormantIntegrableIds(),
    };
  };

  const shellSetActiveView = (viewId: string): boolean => {
    ensureEnabledEmbeddedLoaded();
    if (isShellIntegrableAppId(viewId) && !isEmbeddedChromeId(viewId)) {
      activeEmbeddedViewId = viewId;
      persistActiveViewPreference(viewId);
      return true;
    }
    if (!isEmbeddedChromeId(viewId)) {
      return false;
    }
    if (!hasEnabledEmbedded(viewId as EmbeddedShellWindowId)) {
      return false;
    }
    activeEmbeddedViewId = viewId;
    persistActiveViewPreference(viewId);
    return true;
  };

  const shellEnableEmbeddedView = (viewId: string): boolean => {
    ensureEnabledEmbeddedLoaded();
    if (!isShellIntegrableAppId(viewId)) return false;
    if (!isEmbeddedChromeId(viewId)) return false;
    if (hasEnabledEmbedded(viewId)) {
      activeEmbeddedViewId = viewId;
      persistActiveViewPreference(viewId);
      return true;
    }
    enabledEmbeddedViewOrder.push(viewId);
    persistWebEnabledEmbedded();
    activeEmbeddedViewId = viewId;
    persistActiveViewPreference(viewId);
    return true;
  };

  const shellDisableEmbeddedView = (viewId: string): boolean => {
    ensureEnabledEmbeddedLoaded();
    if (!isShellIntegrableAppId(viewId)) return false;
    if (!isEmbeddedChromeId(viewId)) return false;
    if (!hasEnabledEmbedded(viewId)) return true;
    enabledEmbeddedViewOrder = enabledEmbeddedViewOrder.filter(
      (id) => id !== viewId,
    );
    persistWebEnabledEmbedded();
    ensureActiveEmbeddedConsistent();
    persistActiveViewPreference(activeEmbeddedViewId);
    return true;
  };

  const shellReorderEmbeddedViews = (orderedViewIds: string[]): boolean => {
    ensureEnabledEmbeddedLoaded();
    const next = orderedViewIds.filter(
      (id): id is EmbeddedShellWindowId =>
        typeof id === 'string' &&
        embeddedIds.includes(id as EmbeddedShellWindowId) &&
        hasEnabledEmbedded(id as EmbeddedShellWindowId),
    );
    if (next.length !== enabledEmbeddedViewOrder.length) return false;
    const nextSet = new Set(next);
    if (nextSet.size !== enabledEmbeddedViewOrder.length) return false;
    enabledEmbeddedViewOrder = [...next];
    persistWebEnabledEmbedded();
    ensureActiveEmbeddedConsistent();
    persistActiveViewPreference(activeEmbeddedViewId);
    return true;
  };

  const tryHandleInvoke = async (
    channel: string,
    args: unknown[],
  ): Promise<unknown> => {
    const pref = options.tryHandlePreferenceInvoke(channel, args);
    if (pref !== UNHANDLED) return pref;

    if (channel === 'shell:app-mode:get')
      return import.meta.env.DEV ? 'dev' : 'build';

    if (options.registerShellHostIpc) {
      if (channel === 'shell:get-state') return shellGetState();
      if (channel === 'shell:set-active-view') {
        const raw = args[0] as undefined | { viewId?: string };
        const viewId = raw?.viewId;
        if (typeof viewId !== 'string' || !viewId) return false;
        return shellSetActiveView(viewId);
      }
      if (channel === 'shell:enable-embedded-view') {
        const raw = args[0] as undefined | { viewId?: string };
        const viewId = raw?.viewId;
        if (typeof viewId !== 'string' || !viewId) return false;
        return shellEnableEmbeddedView(viewId);
      }
      if (channel === 'shell:disable-embedded-view') {
        const raw = args[0] as undefined | { viewId?: string };
        const viewId = raw?.viewId;
        if (typeof viewId !== 'string' || !viewId) return false;
        return shellDisableEmbeddedView(viewId);
      }
      if (channel === 'shell:reorder-embedded-views') {
        const raw = args[0] as undefined | { orderedViewIds?: string[] };
        if (!Array.isArray(raw?.orderedViewIds)) return false;
        return shellReorderEmbeddedViews(raw.orderedViewIds);
      }
    }

    return undefined;
  };

  return {
    tryHandleInvoke,
    preferenceOn: options.preferenceOn,
    preferenceRemoveListener: options.preferenceRemoveListener,
  };
}

export type { PreferenceIpcListener };
