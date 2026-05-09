type ThemeMode = 'light' | 'dark';

interface ThemePayload {
  theme?: ThemeMode;
}

interface ElectronLike {
  ipcRenderer: {
    invoke(channel: string, ...args: unknown[]): Promise<unknown>;
    on(
      channel: string,
      listener: (event: unknown, payload: ThemePayload) => void,
    ): void;
    removeListener(
      channel: string,
      listener: (event: unknown, payload: ThemePayload) => void,
    ): void;
  };
}

function resolveElectron(): ElectronLike {
  const g = globalThis as { electron?: ElectronLike };
  if (!g.electron) {
    throw new Error('window.electron is unavailable.');
  }
  return g.electron;
}

function applyDomTheme(theme: ThemeMode): void {
  const html = document.documentElement;
  html.dataset.theme = theme;
  html.classList.toggle('dark', theme === 'dark');
  html.classList.add('theme-ready');
}

export function setupRendererThemeSync(): () => void {
  const electron = resolveElectron();
  let disposed = false;

  const onThemeChanged = (_event: unknown, payload: ThemePayload): void => {
    if (disposed) return;
    applyDomTheme(payload?.theme === 'light' ? 'light' : 'dark');
  };

  void electron.ipcRenderer.invoke('settings:theme:get').then((theme) => {
    if (disposed) return;
    applyDomTheme(theme === 'light' ? 'light' : 'dark');
  });

  electron.ipcRenderer.on('settings:theme:changed', onThemeChanged);
  return () => {
    disposed = true;
    electron.ipcRenderer.removeListener(
      'settings:theme:changed',
      onThemeChanged,
    );
  };
}
