import { contextBridge, ipcRenderer } from 'electron';
import type { IpcRendererEvent } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import type {
  AppNotifyPayload,
  AppNotifyResponsePayload,
  NotifySource,
  NotifyBridgePayload,
} from '@nebula-studio-electron/electron-shared';

const SOURCE: NotifySource = 'main';

type AuthLoginResult =
  | { ok: true; user: string }
  | { ok: false; error: string };

const api = {
  shell: {
    openLogin(): Promise<boolean> {
      return electronAPI.ipcRenderer.invoke('shell:open-login');
    },
  },
  auth: {
    async login(payload: { user: string; password: string }) {
      const r = (await electronAPI.ipcRenderer.invoke(
        'auth:login',
        payload,
      )) as AuthLoginResult;
      if (!r.ok) throw new Error(r.error);
      return r;
    },
    getSession(): Promise<{ user: string } | null> {
      return electronAPI.ipcRenderer.invoke('auth:get-session');
    },
    logout(): Promise<boolean> {
      return electronAPI.ipcRenderer.invoke('auth:logout');
    },
  },
  notify: {
    app(payload: AppNotifyPayload) {
      const req: NotifyBridgePayload<AppNotifyPayload> = {
        source: SOURCE,
        payload,
      };
      return electronAPI.ipcRenderer.invoke('notify:app', req);
    },
    system(payload: { title: string; body: string }) {
      const req: NotifyBridgePayload<{ title: string; body: string }> = {
        source: SOURCE,
        payload,
      };
      return electronAPI.ipcRenderer.invoke('notify:system', req);
    },
    onApp(listener: (payload: AppNotifyPayload) => void) {
      const handler = (_event: IpcRendererEvent, payload: AppNotifyPayload) => {
        listener(payload);
      };
      ipcRenderer.on('notify:app', handler);
      return () => ipcRenderer.removeListener('notify:app', handler);
    },
    respond(payload: AppNotifyResponsePayload) {
      const req: NotifyBridgePayload<AppNotifyResponsePayload> = {
        source: SOURCE,
        payload,
      };
      return electronAPI.ipcRenderer.invoke('notify:app:response', req);
    },
    onAppResponse(listener: (payload: AppNotifyResponsePayload) => void) {
      const handler = (
        _event: IpcRendererEvent,
        payload: AppNotifyResponsePayload,
      ) => {
        listener(payload);
      };
      ipcRenderer.on('notify:app:response', handler);
      return () => ipcRenderer.removeListener('notify:app:response', handler);
    },
  },
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-expect-error — non-isolated fallback
  window.electron = electronAPI;
  // @ts-expect-error — non-isolated fallback
  window.api = api;
}
