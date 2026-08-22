import { IPC_CHANNELS } from './rendererPreferences/ipcChannels.ts';
import { resolveRendererIpc } from './resolveRendererIpc.ts';

type ThemeMode = 'dark' | 'light' | 'system';

const THEME = IPC_CHANNELS.theme;

interface ThemePayload {
  theme?: ThemeMode;
}

function applyDomTheme(theme: ThemeMode): void {
  const resolved =
    theme === 'system'
      ? globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme === 'light'
        ? 'light'
        : 'dark';
  const html = document.documentElement;
  html.dataset.theme = resolved;
  html.classList.toggle('dark', resolved === 'dark');
  html.classList.add('theme-ready');
}

export function setupRendererThemeSync(): () => void {
  const electron = { ipcRenderer: resolveRendererIpc() };
  let disposed = false;

  const onThemeChanged = (_event: unknown, ...args: unknown[]): void => {
    if (disposed) return;
    const payload = args[0] as ThemePayload | undefined;
    applyDomTheme(
      payload?.theme === 'light' || payload?.theme === 'system'
        ? payload.theme
        : 'dark',
    );
  };

  void electron.ipcRenderer.invoke(THEME.get).then((theme) => {
    if (disposed) return;
    applyDomTheme(theme === 'light' || theme === 'system' ? theme : 'dark');
  });

  electron.ipcRenderer.on(THEME.changed, onThemeChanged);
  return () => {
    disposed = true;
    electron.ipcRenderer.removeListener(THEME.changed, onThemeChanged);
  };
}
