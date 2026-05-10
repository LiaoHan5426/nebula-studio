import type {
  AppNotifyLevel,
  AppNotifyPayload,
  AppNotifyResponsePayload,
  AppNotifyType,
} from '@nebula-studio-electron/electron-shared';
import {
  IPC_CHANNELS,
  UNHANDLED,
  createWebPreferenceBridge,
  mergeWebPreferenceBridges,
} from '@nebula-studio-electron/electron-shared-vue';

import { getEmbeddedShellWindowIds } from './shellPresentationConfig';
import type { EmbeddedShellWindowId } from './shellPresentationConfig';
import {
  getDefaultEnabledShellIntegratableIds,
  isShellIntegratableAppId,
  listShellIntegratableAppIds,
} from './shellIntegration';
import { markWebPresentationHost } from './presentationHost';
import {
  clearWebAuthSession,
  readWebAuthSession,
  redirectShellToWebLogin,
  writeWebAuthSession,
} from './webAuth';

type ThemeMode = 'light' | 'dark';

type PreferenceIpcListener = (
  event: unknown,
  payload: Record<string, unknown>,
) => void;

const DEFAULT_WEB_THEME_KEY = 'nebula-studio-web-theme';
const DEFAULT_WEB_LOCALE_KEY = 'nebula-studio-web-locale';

function chromeMajorFromUserAgent(): string {
  if (typeof navigator === 'undefined') return '0';
  const m = /Chrome\/(\d+)/.exec(navigator.userAgent);
  return m?.[1] ?? '0';
}

export interface InstallWebPresentationOptions {
  scope?: string;
  /**
   * 为壳层页面注册 `shell:*` IPC stub（Web 多页宿主与 Electron 行为对齐）。
   * 仅应在加载 `frontend` 宿主入口时开启。
   */
  registerShellHostIpc?: boolean;
  theme?: {
    storageKey?: string;
    default?: ThemeMode;
    /** 与另一文档（iframe）共用同一 key 时，监听 `storage` 以同步主题 */
    crossDocumentStorageKey?: string;
  };
  locale?: {
    storageKey?: string;
    default?: string;
    crossDocumentStorageKey?: string;
  };
  /** @deprecated Use `theme.storageKey`. */
  storageKey?: string;
  /** @deprecated Use `theme.default`. */
  defaultTheme?: ThemeMode;
  /**
   * 覆盖 `window.electron.process.versions`（Web 无 Node 运行时，`node` 可传 **构建时** 注入的版本号）。
   */
  processVersions?: Partial<{
    chrome: string;
    electron: string;
    node: string;
  }>;
}

function normalizeAppNotifyPayload(
  payload: AppNotifyPayload,
): AppNotifyPayload {
  const type: AppNotifyType =
    payload.type === 'notification' ? 'notification' : 'message';
  const level: AppNotifyLevel =
    payload.level === 'success' ||
    payload.level === 'warning' ||
    payload.level === 'danger'
      ? payload.level
      : 'info';
  const durationMs =
    typeof payload.durationMs === 'number' &&
    Number.isFinite(payload.durationMs) &&
    payload.durationMs > 0
      ? Math.floor(payload.durationMs)
      : undefined;

  return {
    ...payload,
    type,
    level,
    showCloseButton:
      typeof payload.showCloseButton === 'boolean'
        ? payload.showCloseButton
        : type === 'message',
    durationMs: type === 'notification' ? (durationMs ?? 5000) : durationMs,
  } satisfies AppNotifyPayload;
}

function createWebNotifyApi(scope: string) {
  const appListeners: Array<(payload: AppNotifyPayload) => void> = [];
  const responseListeners: Array<(payload: AppNotifyResponsePayload) => void> =
    [];

  return {
    scope,
    notify: {
      app: async (payload: AppNotifyPayload) => {
        const normalized = normalizeAppNotifyPayload(payload);
        queueMicrotask(() => {
          for (const l of appListeners) l(normalized);
        });
        return null;
      },
      system: async (payload: { title: string; body: string }) => {
        const NotificationCtor = globalThis.Notification;
        if (!NotificationCtor) {
          throw new Error(
            'System Notification is not supported in this browser.',
          );
        }

        const show = () =>
          new NotificationCtor(payload.title, {
            body: payload.body,
          });

        if (NotificationCtor.permission === 'granted') {
          show();
          return;
        }

        if (NotificationCtor.permission === 'denied') {
          throw new Error(
            'System Notification permission is denied. Please enable it in browser settings.',
          );
        }

        const permission = await NotificationCtor.requestPermission();
        if (permission === 'granted') {
          show();
          return;
        }

        throw new Error(
          'System Notification permission was not granted by user action.',
        );
      },
      onApp: (listener: (payload: AppNotifyPayload) => void) => {
        appListeners.push(listener);
        return () => {
          const i = appListeners.indexOf(listener);
          if (i >= 0) appListeners.splice(i, 1);
        };
      },
      respond: async (payload: AppNotifyResponsePayload) => {
        queueMicrotask(() => {
          for (const l of responseListeners) l(payload);
        });
      },
      onAppResponse: (
        listener: (payload: AppNotifyResponsePayload) => void,
      ) => {
        responseListeners.push(listener);
        return () => {
          const i = responseListeners.indexOf(listener);
          if (i >= 0) responseListeners.splice(i, 1);
        };
      },
    },
  };
}

/**
 * 纯 Web / GitHub Pages：注入最小 `window.electron` / `window.api`，
 * 使壳层与子应用 renderer 与 Electron 下使用同一套 composable（主题、语言、通知等）。
 */
export function installWebPresentation(
  options: InstallWebPresentationOptions = {},
): void {
  const g = globalThis as typeof globalThis & {
    electron?: unknown;
    api?: unknown;
  };
  if (g.electron) return;

  markWebPresentationHost();

  const themeStorageKey =
    options.theme?.storageKey ?? options.storageKey ?? DEFAULT_WEB_THEME_KEY;
  const themeCrossKey =
    options.theme?.crossDocumentStorageKey ?? themeStorageKey;
  const defaultTheme: ThemeMode =
    options.theme?.default === 'light'
      ? 'light'
      : options.defaultTheme === 'light'
        ? 'light'
        : 'dark';

  const localeStorageKey = options.locale?.storageKey ?? DEFAULT_WEB_LOCALE_KEY;
  const localeCrossKey =
    options.locale?.crossDocumentStorageKey ?? localeStorageKey;
  const defaultLocale = options.locale?.default?.trim() || 'zh-CN';

  const readStoredTheme = (): ThemeMode => {
    try {
      const raw = localStorage.getItem(themeStorageKey);
      if (raw === 'light') return 'light';
      if (raw === 'dark') return 'dark';
      return defaultTheme;
    } catch {
      return defaultTheme;
    }
  };

  const writeStoredTheme = (value: ThemeMode) => {
    try {
      localStorage.setItem(themeStorageKey, value);
    } catch {
      /* ignore */
    }
  };

  const readStoredLocale = (): string => {
    try {
      const raw = localStorage.getItem(localeStorageKey);
      if (typeof raw === 'string' && raw.trim()) return raw.trim();
      return defaultLocale;
    } catch {
      return defaultLocale;
    }
  };

  const writeStoredLocale = (value: string) => {
    try {
      localStorage.setItem(localeStorageKey, value);
    } catch {
      /* ignore */
    }
  };

  const themeBridge = createWebPreferenceBridge({
    channels: IPC_CHANNELS.theme,
    field: 'theme',
    read: readStoredTheme,
    write: writeStoredTheme,
    normalizeFromInvokeArgs: (args) => {
      const raw = args[0] as { theme?: string } | undefined;
      return raw?.theme === 'light' ? 'light' : 'dark';
    },
    crossDocumentStorageKey: themeCrossKey,
  });

  const localeBridge = createWebPreferenceBridge({
    channels: IPC_CHANNELS.locale,
    field: 'locale',
    read: readStoredLocale,
    write: writeStoredLocale,
    normalizeFromInvokeArgs: (args) => {
      const raw = args[0] as { locale?: unknown } | undefined;
      if (typeof raw?.locale === 'string' && raw.locale.trim()) {
        return raw.locale.trim();
      }
      return defaultLocale;
    },
    crossDocumentStorageKey: localeCrossKey,
  });

  const preferences = mergeWebPreferenceBridges([themeBridge, localeBridge]);

  const embeddedIds = getEmbeddedShellWindowIds();
  const WEB_ENABLED_STORAGE_KEY = 'nebula-studio-shell-enabled-integrations';

  const computeDefaultEnabledEmbeddedIds = (): Set<EmbeddedShellWindowId> => {
    const integratable = new Set(listShellIntegratableAppIds());
    const defaultOn = new Set(getDefaultEnabledShellIntegratableIds());
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
  let enabledEmbeddedViewIds = new Set<EmbeddedShellWindowId>();
  let activeEmbeddedViewId: string | null = null;

  const ensureEnabledEmbeddedLoaded = (): void => {
    if (enabledEmbeddedLoaded) return;
    enabledEmbeddedLoaded = true;
    try {
      const raw = localStorage.getItem(WEB_ENABLED_STORAGE_KEY);
      if (raw) {
        const parsed = normalizeEnabledList(JSON.parse(raw) as unknown);
        if (parsed) {
          enabledEmbeddedViewIds = new Set(parsed);
          return;
        }
      }
    } catch {
      /* 使用默认 */
    }
    enabledEmbeddedViewIds = computeDefaultEnabledEmbeddedIds();
  };

  const persistWebEnabledEmbedded = (): void => {
    localStorage.setItem(
      WEB_ENABLED_STORAGE_KEY,
      JSON.stringify([...enabledEmbeddedViewIds]),
    );
  };

  const availableEmbeddedIds = (): EmbeddedShellWindowId[] =>
    embeddedIds.filter((id) => enabledEmbeddedViewIds.has(id));

  const dormantIntegratableIds = (): EmbeddedShellWindowId[] =>
    listShellIntegratableAppIds().filter(
      (id) => !enabledEmbeddedViewIds.has(id),
    );

  const ensureActiveEmbeddedConsistent = (): void => {
    const avail = availableEmbeddedIds();
    if (
      activeEmbeddedViewId &&
      avail.includes(activeEmbeddedViewId as EmbeddedShellWindowId)
    ) {
      return;
    }
    activeEmbeddedViewId = avail[0] ?? null;
  };

  const shellGetState = () => {
    ensureEnabledEmbeddedLoaded();
    ensureActiveEmbeddedConsistent();
    return {
      activeViewId: activeEmbeddedViewId,
      availableViewIds: [...availableEmbeddedIds()],
      dormantIntegratableIds: dormantIntegratableIds(),
    };
  };

  const shellSetActiveView = (viewId: string): boolean => {
    ensureEnabledEmbeddedLoaded();
    if (!embeddedIds.includes(viewId as (typeof embeddedIds)[number])) {
      return false;
    }
    if (!enabledEmbeddedViewIds.has(viewId as EmbeddedShellWindowId)) {
      return false;
    }
    activeEmbeddedViewId = viewId;
    return true;
  };

  const shellEnableEmbeddedView = (viewId: string): boolean => {
    ensureEnabledEmbeddedLoaded();
    if (!isShellIntegratableAppId(viewId)) return false;
    if (!embeddedIds.includes(viewId)) return false;
    if (enabledEmbeddedViewIds.has(viewId)) {
      activeEmbeddedViewId = viewId;
      return true;
    }
    enabledEmbeddedViewIds.add(viewId);
    persistWebEnabledEmbedded();
    activeEmbeddedViewId = viewId;
    return true;
  };

  const scope = options.scope ?? 'web';

  const pv = options.processVersions ?? {};
  const processVersions = {
    chrome: pv.chrome ?? chromeMajorFromUserAgent(),
    electron: pv.electron ?? 'web',
    node: pv.node ?? '—',
  };

  g.electron = {
    process: {
      versions: processVersions,
    },
    ipcRenderer: {
      invoke: async (channel: string, ...args: unknown[]) => {
        const result = preferences.handleInvoke(channel, args);
        if (result !== UNHANDLED) return result;

        if (channel === 'shell:app-mode:get') return 'build';

        if (options.registerShellHostIpc) {
          if (channel === 'shell:get-state') return shellGetState();
          if (channel === 'shell:set-active-view') {
            const raw = args[0] as { viewId?: string } | undefined;
            const viewId = raw?.viewId;
            if (typeof viewId !== 'string' || !viewId) return false;
            return shellSetActiveView(viewId);
          }
          if (channel === 'shell:enable-embedded-view') {
            const raw = args[0] as { viewId?: string } | undefined;
            const viewId = raw?.viewId;
            if (typeof viewId !== 'string' || !viewId) return false;
            return shellEnableEmbeddedView(viewId);
          }
        }

        return undefined;
      },
      send: (_channel: string, ..._args: unknown[]) => {
        /* Web stub：无与主进程对等的 send 监听 */
      },
      on: (channel: string, listener: PreferenceIpcListener) => {
        preferences.on(channel, listener);
      },
      removeListener: (channel: string, listener: PreferenceIpcListener) => {
        preferences.removeListener(channel, listener);
      },
    },
  };

  const ipc = (
    g.electron as {
      ipcRenderer: {
        invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
        on: (channel: string, listener: PreferenceIpcListener) => void;
        removeListener: (
          channel: string,
          listener: PreferenceIpcListener,
        ) => void;
      };
    }
  ).ipcRenderer;

  g.api = {
    ...createWebNotifyApi(scope),
    settings: {
      getTheme: () => ipc.invoke('settings:theme:get') as Promise<ThemeMode>,
      setTheme: (theme: ThemeMode) =>
        ipc.invoke('settings:theme:set', { theme }) as Promise<ThemeMode>,
      onThemeChanged: (listener: (payload: { theme: ThemeMode }) => void) => {
        const wrap: PreferenceIpcListener = (_event, payload) => {
          const t = payload.theme;
          listener({
            theme: t === 'light' ? 'light' : 'dark',
          });
        };
        ipc.on('settings:theme:changed', wrap);
        return () => ipc.removeListener('settings:theme:changed', wrap);
      },
    },
    shell: {
      openLogin: async () => {
        redirectShellToWebLogin(window.location.href);
      },
    },
    auth: {
      login: async (payload: { user: string; password: string }) => {
        const u = payload.user?.trim();
        if (!u) throw new Error('请输入用户名');
        if (payload.password !== 'demo') {
          throw new Error('演示环境请使用密码：demo');
        }
        writeWebAuthSession({ user: u, token: 'web-demo' });
        return { ok: true as const, user: u };
      },
      getSession: async () => readWebAuthSession(),
      logout: async () => {
        clearWebAuthSession();
        redirectShellToWebLogin(window.location.href);
      },
    },
  };
}
