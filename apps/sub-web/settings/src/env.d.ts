/// <reference types="vite/client" />

import type { ElectronAPI } from '@electron-toolkit/preload';

type ThemeMode = 'light' | 'dark';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      scope: 'settings';
      settings: {
        getTheme(): Promise<ThemeMode>;
        setTheme(theme: ThemeMode): Promise<ThemeMode>;
        onThemeChanged(
          listener: (payload: { theme: ThemeMode }) => void,
        ): () => void;
      };
    };
  }
}
