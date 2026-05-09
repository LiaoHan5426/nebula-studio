import { contextBridge, ipcRenderer } from 'electron';
import type { IpcRendererEvent } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

type ThemeMode = 'light' | 'dark';

const api = {
  scope: 'settings' as const,
  settings: {
    getTheme(): Promise<ThemeMode> {
      return electronAPI.ipcRenderer.invoke('settings:theme:get');
    },
    setTheme(theme: ThemeMode): Promise<ThemeMode> {
      return electronAPI.ipcRenderer.invoke('settings:theme:set', { theme });
    },
    onThemeChanged(listener: (payload: { theme: ThemeMode }) => void) {
      const handler = (
        _event: IpcRendererEvent,
        payload: { theme: ThemeMode },
      ) => {
        listener(payload);
      };
      ipcRenderer.on('settings:theme:changed', handler);
      return () =>
        ipcRenderer.removeListener('settings:theme:changed', handler);
    },
  },
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-expect-error - non-isolated fallback
  window.electron = electronAPI;
  // @ts-expect-error - non-isolated fallback
  window.api = api;
}
