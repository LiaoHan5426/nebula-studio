import type { IpcRendererEvent } from 'electron';

import type { ThemePreference } from '@nebula-studio/tokens';

import { ipcRenderer } from 'electron';

import { electronAPI } from '../electronApi.ts';

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
    getLocale(): Promise<string> {
      return electronAPI.ipcRenderer.invoke('settings:locale:get');
    },
    setLocale(locale: string): Promise<string> {
      return electronAPI.ipcRenderer.invoke('settings:locale:set', { locale });
    },
    onLocaleChanged(listener: (payload: { locale: string }) => void) {
      const handler = (
        _event: IpcRendererEvent,
        payload: { locale: string },
      ) => {
        listener(payload);
      };
      ipcRenderer.on('settings:locale:changed', handler);
      return () =>
        ipcRenderer.removeListener('settings:locale:changed', handler);
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
