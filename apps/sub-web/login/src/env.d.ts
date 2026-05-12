/// <reference types="vite/client" />

import type { ElectronAPI } from '@electron-toolkit/preload';

declare module '@nebula-studio-internal/tailwind/electron';

type AuthApi = {
  login(payload: {
    user: string;
    password: string;
  }): Promise<{ ok: true; user: string }>;
  getSession(): Promise<{ user: string } | null>;
  logout(): Promise<boolean | void>;
};

type ShellApi = {
  openLogin(): Promise<void>;
};

declare global {
  const __NEBULA_BUILD_NODE_VERSION__: string;

  interface Window {
    electron: ElectronAPI;
    api: {
      scope: string;
      notify: unknown;
      settings?: unknown;
      auth: AuthApi;
      shell: ShellApi;
    };
  }
}
