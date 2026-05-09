import type {
  AppNotifyLevel,
  AppNotifyPayload,
  AppNotifyType,
  AppNotifyResponsePayload,
} from '@nebula-studio-electron/electron-shared';
import {
  IPC_CHANNELS,
  UNHANDLED,
  createWebPreferenceBridge,
  mergeWebPreferenceBridges,
} from '@nebula-studio-electron/electron-shared-vue';

type ThemeMode = 'light' | 'dark';

type PreferenceIpcListener = (
  event: unknown,
  payload: Record<string, unknown>,
) => void;

export interface InstallWebStubsOptions {
  scope?: string;
  /**
   * @deprecated Use `theme.storageKey`.
   */
  storageKey?: string;
  /**
   * @deprecated Use `theme.default`.
   */
  defaultTheme?: ThemeMode;
  theme?: {
    storageKey?: string;
    default?: ThemeMode;
  };
  locale?: {
    storageKey?: string;
    default?: string;
  };
}

/**
 * GitHub Pages 等纯 Web 环境：注入最小 `window.electron` / `window.api`，
 * 使 `ConfigProvider` 与 `useElectronNotify` 可在无 Electron 时运行（通知为进程内模拟）。
 */
export function installWebStubs(options: InstallWebStubsOptions = {}): void {
  const g = globalThis as typeof globalThis & {
    electron?: unknown;
    api?: unknown;
  };
  if (g.electron) return;

  const themeStorageKey =
    options.theme?.storageKey ?? options.storageKey ?? 'nebula-docs-theme';
  const defaultTheme: ThemeMode =
    options.theme?.default === 'light'
      ? 'light'
      : options.defaultTheme === 'light'
        ? 'light'
        : 'dark';

  const localeStorageKey = options.locale?.storageKey ?? 'nebula-docs-locale';
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
  });

  const preferences = mergeWebPreferenceBridges([themeBridge, localeBridge]);

  const scope = options.scope ?? 'web';

  g.electron = {
    ipcRenderer: {
      invoke: async (channel: string, ...args: unknown[]) => {
        const result = preferences.handleInvoke(channel, args);
        if (result !== UNHANDLED) return result;
        if (channel === 'shell:app-mode:get') return 'build';
        return undefined;
      },
      on: (channel: string, listener: PreferenceIpcListener) => {
        preferences.on(channel, listener);
      },
      removeListener: (channel: string, listener: PreferenceIpcListener) => {
        preferences.removeListener(channel, listener);
      },
    },
  };

  const appListeners: Array<(payload: AppNotifyPayload) => void> = [];
  const responseListeners: Array<(payload: AppNotifyResponsePayload) => void> =
    [];

  const normalizeAppNotifyPayload = (payload: AppNotifyPayload) => {
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
  };

  g.api = {
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
