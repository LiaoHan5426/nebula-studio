import type { IpcRendererEvent } from 'electron';
import type { ThemePreference } from '@nebula-studio/tokens';
import { electronAPI } from '@electron-toolkit/preload';
import { ipcRenderer } from 'electron';

type ThemeMode = 'dark' | 'light' | 'system';

export function createSettingsCapability() {
  return {
    getTheme(): Promise<ThemeMode> {
      return electronAPI.ipcRenderer.invoke('settings:theme:get');
    },
    setTheme(theme: ThemeMode): Promise<ThemeMode> {
      return electronAPI.ipcRenderer.invoke('settings:theme:set', { theme });
    },
    getPreference(): Promise<ThemePreference> {
      return electronAPI.ipcRenderer.invoke('settings:theme:getPreference');
    },
    setPreference(preference: ThemePreference): Promise<ThemePreference> {
      return electronAPI.ipcRenderer.invoke('settings:theme:setPreference', {
        preference,
      });
    },
    onThemeChanged(
      listener: (payload: {
        preference?: ThemePreference;
        theme: ThemeMode;
      }) => void,
    ) {
      const handler = (
        _event: IpcRendererEvent,
        payload: { preference?: ThemePreference; theme: ThemeMode },
      ) => {
        listener(payload);
      };
      ipcRenderer.on('settings:theme:changed', handler);
      return () =>
        ipcRenderer.removeListener('settings:theme:changed', handler);
    },
  };
}
