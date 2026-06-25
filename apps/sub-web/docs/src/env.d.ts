/// <reference types="vite/client" />

import type { ElectronAPI } from '@electron-toolkit/preload';
import type {
  AppNotifyPayload,
  AppNotifyResponsePayload,
} from '@nebula-studio-electron/electron-bridge';

declare module '@nebula-studio-internal/tailwind/electron';

declare global {
  const __NEBULA_BUILD_NODE_VERSION__: string;

  interface Window {
    electron: ElectronAPI;
    api: {
      scope: 'docs' | 'web';
      notify: {
        app(payload: AppNotifyPayload): Promise<string | null>;
        system(payload: { title: string; body: string }): Promise<unknown>;
        onApp(listener: (payload: AppNotifyPayload) => void): () => void;
        respond(payload: AppNotifyResponsePayload): Promise<void>;
        onAppResponse(
          listener: (payload: AppNotifyResponsePayload) => void,
        ): () => void;
      };
    };
  }
}
