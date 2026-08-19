/// <reference types="vite/client" />
/// <reference types="@nebula-studio/types/sub-web" />

import type { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      auth: {
        establishSession(payload: {
          roles?: string[];
          token: string;
          user: string;
          userId?: string;
        }): Promise<boolean>;
        getSession(): Promise<null | {
          roles?: string[];
          token?: string;
          user: string;
          userId?: string;
        }>;
        login(payload: {
          password: string;
          user: string;
        }): Promise<{ ok: true; user: string }>;
        logout(): Promise<boolean | void>;
      };
      shell: {
        openLogin(): Promise<boolean | void>;
      };
    };
  }
}
