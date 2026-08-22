import type { PreferenceIpcListener } from './webShellEmbeddedState';

import { loginWithBackendAuth } from '@nebula-studio/auth-provider/backend';
import {
  clearWebAuthSession,
  readWebAuthSession,
  writeWebAuthSession,
} from '@nebula-studio/auth-provider/storage';
import { redirectShellToWebLogin } from '@nebula-studio/auth-provider/web';
import {
  markWebPresentationHost,
  markWebShellHost,
} from '@nebula-studio/shell-protocol';

import {
  createWebPreferenceBridge,
  IPC_CHANNELS,
  mergeWebPreferenceBridges,
} from '@nebula-studio-electron/electron-bridge/vue';

import { createWebNotifyApi } from './webNotify';
import { createWebShellEmbeddedStateHandlers } from './webShellEmbeddedState';

type ThemeMode = 'dark' | 'light';

const DEFAULT_WEB_THEME_KEY = 'nebula-studio-web-theme';
const DEFAULT_WEB_LOCALE_KEY = 'nebula-studio-web-locale';

export interface InstallWebPresentationOptions {
  locale?: {
    crossDocumentStorageKey?: string;
    default?: string;
    storageKey?: string;
  };
  /**
   * 覆盖 Web `window.api.process.versions`（无 Node 运行时，`node` 可传构建时注入的版本号）。
   */
  processVersions?: Partial<{
    chrome: string;
    electron: string;
    node: string;
  }>;
  /**
   * 为壳层页面注册 `shell:*` IPC stub（Web 多页宿主与 Electron 行为对齐）。
   * 仅应在加载 `frontend` 宿主入口时开启。
   */
  registerShellHostIpc?: boolean;
  scope?: string;
  theme?: {
    /** 与另一文档（iframe）共用同一 key 时，监听 `storage` 以同步主题 */
    crossDocumentStorageKey?: string;
    default?: ThemeMode;
    storageKey?: string;
  };
}

/**
 * 纯 Web / GitHub Pages：注入 `window.api`（含 ipc / 认证 / 通知 / 主题），
 * 使壳层 composable 与 Electron preload 对齐，但不伪造 `window.electron`。
 */
export function installWebPresentation(
  options: InstallWebPresentationOptions = {},
): void {
  const g = globalThis as typeof globalThis & {
    api?: {
      [key: string]: unknown;
      auth?: unknown;
      ipc?: unknown;
    };
  };
  if (g.api?.ipc && g.api?.auth) return;

  markWebPresentationHost();

  if (options.registerShellHostIpc) {
    markWebShellHost();
  }

  const themeStorageKey = options.theme?.storageKey ?? DEFAULT_WEB_THEME_KEY;
  const themeCrossKey =
    options.theme?.crossDocumentStorageKey ?? themeStorageKey;
  const defaultTheme: ThemeMode =
    options.theme?.default === 'light' ? 'light' : 'dark';

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
      const raw = args[0] as undefined | { theme?: string };
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
      const raw = args[0] as undefined | { locale?: unknown };
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

  const ipc = {
    invoke: (channel: string, ...args: unknown[]) =>
      embeddedHandlers.tryHandleInvoke(channel, args),
    send: (_channel: string, ..._args: unknown[]) => {
      /* Web：无与主进程对等的 send 监听 */
    },
    on: (channel: string, listener: PreferenceIpcListener) => {
      embeddedHandlers.preferenceOn(channel, listener);
    },
    removeListener: (channel: string, listener: PreferenceIpcListener) => {
      embeddedHandlers.preferenceRemoveListener(channel, listener);
    },
  };

  g.api = {
    ipc,
    process: {
      platform: 'web',
      versions: processVersions,
    },
    ...createWebNotifyApi(scope),
    settings: {
      getTheme: () => ipc.invoke('settings:theme:get') as Promise<ThemeMode>,
      setTheme: (theme: ThemeMode) =>
        ipc.invoke('settings:theme:set', { theme }) as Promise<ThemeMode>,
      onThemeChanged: (listener: (payload: { theme: ThemeMode }) => void) => {
        const wrap = (_event: unknown, ...args: unknown[]) => {
          const payload = args[0] as Record<string, unknown> | undefined;
          const t = payload?.theme;
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
      login: async (payload: { password: string; user: string }) => {
        const result = await loginWithBackendAuth(
          payload.user,
          payload.password,
        );
        if (result.needsOrgSelection) {
          return {
            ok: false as const,
            needsOrgSelection: true as const,
            pending: result,
          };
        }
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

export function installWebPresentationUnlessElectron(
  mode: 'electron' | 'platform-embed' | 'standalone',
  options: InstallWebPresentationOptions,
): void {
  if (mode === 'electron') return;
  installWebPresentation(options);
}
