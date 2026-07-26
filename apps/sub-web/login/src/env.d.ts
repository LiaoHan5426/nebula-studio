/// <reference types="vite/client" />

import type { ElectronAPI } from '@electron-toolkit/preload';
import type { ElectronAuthApi } from '@nebula-studio/contracts/auth';

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
      auth: ElectronAuthApi;
      shell: ShellApi;
    };
  }
}
