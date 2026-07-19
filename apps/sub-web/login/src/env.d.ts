/// <reference types="vite/client" />

import type { ElectronAPI } from '@electron-toolkit/preload';

type AuthApi = {
  login(payload: {
    user: string;
    password: string;
  }): Promise<{ ok: true; user: string }>;
  getSession(): Promise<{
    user: string;
    token?: string;
    roles?: string[];
    userId?: string;
  } | null>;
  establishSession(payload: {
    user: string;
    token: string;
    roles?: string[];
    userId?: string;
  }): Promise<boolean>;
  logout(): Promise<boolean | void>;
};

type ShellApi = {
  openLogin(): Promise<void>;
};

declare global {
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
