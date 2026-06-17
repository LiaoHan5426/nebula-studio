import {
  IPC_CHANNELS,
  createWebPreferenceBridge,
  mergeWebPreferenceBridges,
} from '@nebula-studio-electron/electron-shared-vue';

import { markWebPresentationHost } from '../common/presentationHost';
import {
  clearWebAuthSession,
  readWebAuthSession,
  redirectShellToWebLogin,
  writeWebAuthSession,
} from './webAuth';
import { loginWithBackendAuth } from './webBackendAuth';
import { createWebNotifyApi } from './webNotify';
import { createWebShellEmbeddedStateHandlers } from './webShellEmbeddedState';
import type { PreferenceIpcListener } from './webShellEmbeddedState';

type ThemeMode = 'light' | 'dark';

const DEFAULT_WEB_THEME_KEY = 'nebula-studio-web-theme';
const DEFAULT_WEB_LOCALE_KEY = 'nebula-studio-web-locale';

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

  const scope = options.scope ?? 'web';
  const pv = options.processVersions ?? {};

  function chromeMajorFromUserAgent(): string {
    if (typeof navigator === 'undefined') return '0';
    const m = /Chrome\/(\d+)/.exec(navigator.userAgent);
    return m?.[1] ?? '0';
  }

  const processVersions = {
    chrome: pv.chrome ?? chromeMajorFromUserAgent(),
    electron: pv.electron ?? 'web',
    node: pv.node ?? '—',
  };

  const embeddedHandlers = createWebShellEmbeddedStateHandlers({
    registerShellHostIpc: Boolean(options.registerShellHostIpc),
    tryHandlePreferenceInvoke: (channel, args) =>
      preferences.handleInvoke(channel, args),
    preferenceOn: preferences.on,
    preferenceRemoveListener: preferences.removeListener,
  });

  g.electron = {
    process: {
      versions: processVersions,
    },
    ipcRenderer: {
      invoke: (channel: string, ...args: unknown[]) =>
        embeddedHandlers.tryHandleInvoke(channel, args),
      send: (_channel: string, ..._args: unknown[]) => {
        /* Web stub：无与主进程对等的 send 监听 */
      },
      on: (channel: string, listener: PreferenceIpcListener) => {
        embeddedHandlers.preferenceOn(channel, listener);
      },
      removeListener: (channel: string, listener: PreferenceIpcListener) => {
        embeddedHandlers.preferenceRemoveListener(channel, listener);
      },
    },
  };

  const ipc = (
    g.electron as {
      ipcRenderer: {
        invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
        on: (
          channel: string,
          listener: (event: unknown, payload: Record<string, unknown>) => void,
        ) => void;
        removeListener: (
          channel: string,
          listener: (event: unknown, payload: Record<string, unknown>) => void,
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
        const wrap = (_event: unknown, payload: Record<string, unknown>) => {
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
        const result = await loginWithBackendAuth(
          payload.user,
          payload.password,
        );
        writeWebAuthSession({
          user: result.username,
          token: result.token,
        });
        return { ok: true as const, user: result.username };
      },
      getSession: async () => readWebAuthSession(),
      logout: async () => {
        clearWebAuthSession();
        redirectShellToWebLogin(window.location.href);
      },
    },
  };
}
