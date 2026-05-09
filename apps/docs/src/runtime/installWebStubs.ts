import type {
  AppNotifyPayload,
  AppNotifyResponsePayload,
} from '@nebula-studio-electron/electron-shared';

type ThemeListener = (event: unknown, payload: { theme?: string }) => void;

/**
 * GitHub Pages 等纯 Web 环境：注入最小 `window.electron` / `window.api`，
 * 使 `ConfigProvider` 与 `useElectronNotify` 可在无 Electron 时运行（通知为进程内模拟）。
 */
export function installWebStubs(): void {
  const g = globalThis as typeof globalThis & {
    electron?: unknown;
    api?: unknown;
  };
  if (g.electron) return;

  const themeListeners = new Set<ThemeListener>();

  const readStoredTheme = (): 'light' | 'dark' => {
    try {
      return localStorage.getItem('nebula-docs-theme') === 'light'
        ? 'light'
        : 'dark';
    } catch {
      return 'dark';
    }
  };

  g.electron = {
    ipcRenderer: {
      invoke: async (channel: string, ...args: unknown[]) => {
        if (channel === 'settings:theme:get') return readStoredTheme();
        if (channel === 'settings:theme:set') {
          const raw = args[0] as { theme?: string } | undefined;
          const next = raw?.theme === 'light' ? 'light' : 'dark';
          try {
            localStorage.setItem('nebula-docs-theme', next);
          } catch {
            /* ignore */
          }
          for (const l of themeListeners) l(null, { theme: next });
          return next;
        }
        if (channel === 'shell:app-mode:get') return 'build';
        return undefined;
      },
      on: (channel: string, listener: ThemeListener) => {
        if (channel === 'settings:theme:changed') themeListeners.add(listener);
      },
      removeListener: (channel: string, listener: ThemeListener) => {
        if (channel === 'settings:theme:changed')
          themeListeners.delete(listener);
      },
    },
  };

  const appListeners: Array<(payload: AppNotifyPayload) => void> = [];
  const responseListeners: Array<(payload: AppNotifyResponsePayload) => void> =
    [];

  g.api = {
    scope: 'web',
    notify: {
      app: async (payload: AppNotifyPayload) => {
        queueMicrotask(() => {
          for (const l of appListeners) l(payload);
        });
        return null;
      },
      system: async () => {},
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
