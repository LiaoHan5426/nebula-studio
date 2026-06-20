import type { ElectronAPI } from '@electron-toolkit/preload';
import type {
  AppNotifyPayload,
  AppNotifyResponsePayload,
} from '@nebula-studio-electron/electron-shared';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      shell: {
        openLogin(): Promise<boolean>;
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
        logout(): Promise<boolean>;
      };
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
