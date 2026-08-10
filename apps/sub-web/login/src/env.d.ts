// / <reference types="vite/client" />

import type { ElectronAPI } from '@electron-toolkit/preload';

import type { ElectronAuthApi } from '@nebula-studio/contracts/auth';

type ShellApi = {
  openLogin(): Promise<void>;
};

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      auth: ElectronAuthApi;
      notify: unknown;
      scope: string;
      settings?: unknown;
      shell: ShellApi;
    };
  }
}
