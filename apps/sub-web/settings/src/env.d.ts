// / <reference types="vite/client" />
// / <reference types="@nebula-studio/types/sub-web" />

import type { ElectronAPI } from '@nebula-studio-electron/electron-bridge';

type ThemeMode = 'dark' | 'light';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      scope: 'settings';
      settings: {
        getLocale(): Promise<string>;
        getTheme(): Promise<ThemeMode>;
        onLocaleChanged(
          listener: (payload: { locale: string }) => void,
        ): () => void;
        onThemeChanged(
          listener: (payload: { theme: ThemeMode }) => void,
        ): () => void;
        setLocale(locale: string): Promise<string>;
        setTheme(theme: ThemeMode): Promise<ThemeMode>;
      };
    };
  }
}
