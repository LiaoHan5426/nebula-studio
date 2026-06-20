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
        getSession(): Promise<{ user: string; token?: string } | null>;
        establishSession(payload: {
          user: string;
          token: string;
        }): Promise<boolean>;
        logout(): Promise<boolean | void>;
      };
    };
  }
}
