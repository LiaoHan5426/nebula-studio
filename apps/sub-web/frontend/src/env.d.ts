/// <reference types="vite/client" />

import type { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      shell: {
        openLogin(): Promise<boolean | void>;
      };
      auth: {
        login(payload: {
          user: string;
          password: string;
        }): Promise<{ ok: true; user: string }>;
        getSession(): Promise<{ user: string } | null>;
        logout(): Promise<boolean | void>;
      };
    };
  }
}
