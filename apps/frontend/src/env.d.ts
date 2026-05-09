/// <reference types="vite/client" />

import type { ElectronAPI } from '@electron-toolkit/preload';

declare module '@nebula-studio-internal/tailwind/electron';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: unknown;
  }
}
