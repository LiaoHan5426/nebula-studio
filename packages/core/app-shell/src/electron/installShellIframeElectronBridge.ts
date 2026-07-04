type ThemeMode = 'light' | 'dark';

type ShellParentWindow = Window & {
  electron?: ShellElectronBridge;
  api?: Record<string, unknown>;
};

type ShellIframeApiHost = {
  api: Record<string, unknown>;
};

type ShellElectronBridge = {
  ipcRenderer: {
    invoke(channel: string, ...args: unknown[]): Promise<unknown>;
    on(
      channel: string,
      listener: (event: unknown, ...args: unknown[]) => void,
    ): void;
    removeListener(
      channel: string,
      listener: (event: unknown, ...args: unknown[]) => void,
    ): void;
  };
};

function createSettingsApi(electron: ShellElectronBridge) {
  return {
    getTheme(): Promise<ThemeMode> {
      return electron.ipcRenderer.invoke(
        'settings:theme:get',
      ) as Promise<ThemeMode>;
    },
    setTheme(theme: ThemeMode): Promise<ThemeMode> {
      return electron.ipcRenderer.invoke('settings:theme:set', {
        theme,
      }) as Promise<ThemeMode>;
    },
    onThemeChanged(listener: (payload: { theme: ThemeMode }) => void) {
      const handler = (_event: unknown, ...args: unknown[]) => {
        const payload = args[0] as { theme: ThemeMode };
        listener(payload);
      };
      electron.ipcRenderer.on('settings:theme:changed', handler);
      return () =>
        electron.ipcRenderer.removeListener('settings:theme:changed', handler);
    },
  };
}

/**
 * Electron 壳层 iframe 内嵌子应用时，子 frame 无独立 preload；
 * 与父窗口同源，复用壳层 `window.electron`，并按需补齐子应用 API（如 settings）。
 */
export function installShellIframeElectronBridge(): void {
  if (window.parent === window) return;

  const self = window as unknown as ShellParentWindow;
  if (self.electron) return;

  let parentWin: ShellParentWindow;
  try {
    parentWin = window.parent as ShellParentWindow;
  } catch {
    return;
  }

  const electron = parentWin.electron;
  if (!electron) return;

  self.electron = electron;

  const parentApi: Record<string, unknown> =
    typeof parentWin.api === 'object' && parentWin.api !== null
      ? { ...(parentWin.api as Record<string, unknown>) }
      : {};

  if (parentApi.settings === undefined) {
    parentApi.settings = createSettingsApi(electron);
  }

  (self as unknown as ShellIframeApiHost).api = parentApi;
}
