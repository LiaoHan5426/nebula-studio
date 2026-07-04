import { ipcRenderer } from 'electron';
import type { IpcRendererEvent } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

type ThemeMode = 'light' | 'dark';

/**
 * 统一 Settings 能力模块。
 *
 * 封装 `settings:theme:*` IPC 通道调用，供设置窗口 Preload 使用。
 */
export function createSettingsCapability() {
  return {
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
  };
}
