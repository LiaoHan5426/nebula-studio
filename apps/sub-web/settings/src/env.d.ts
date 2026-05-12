/// <reference types="vite/client" />

import type { ElectronAPI } from '@electron-toolkit/preload';

type ThemeMode = 'light' | 'dark';
declare module '@nebula-studio-internal/tailwind/electron';

declare global {
  const __NEBULA_BUILD_NODE_VERSION__: string;

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
