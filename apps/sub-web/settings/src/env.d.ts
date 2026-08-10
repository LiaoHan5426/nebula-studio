// / <reference types="vite/client" />

import type { ElectronAPI } from '@electron-toolkit/preload';

type ThemeMode = 'dark' | 'light';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      scope: 'settings';
      settings: {
        getTheme(): Promise<ThemeMode>;
        onThemeChanged(
          listener: (payload: { theme: ThemeMode }) => void,
        ): () => void;
        setTheme(theme: ThemeMode): Promise<ThemeMode>;
      };
    };
  }
}
