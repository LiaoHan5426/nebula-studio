import { ipcRenderer } from 'electron';
import type { IpcRendererEvent } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import type {
  AppNotifyPayload,
  AppNotifyResponsePayload,
  NotifySource,
  NotifyBridgePayload,
} from '@nebula-studio-electron/electron-bridge';

/**
 * 统一 Notify 能力模块。
 *
 * 根据 `source` 自动选择直连 IPC 通道（`main`）或桥接通道（其余窗口），
 * 消除 `main` 与 `docs` Preload 中 Notify Bridge 的重复实现。
 */
export function createNotifyCapability(source: NotifySource) {
  const useBridge = source !== 'main';

  return {
    app(payload: AppNotifyPayload) {
      const req: NotifyBridgePayload<AppNotifyPayload> = {
        source,
        payload,
      };
      const channel = useBridge ? 'notify:bridge:app' : 'notify:app';
      return electronAPI.ipcRenderer.invoke(channel, req);
    },
    system(payload: { title: string; body: string }) {
      const req: NotifyBridgePayload<{ title: string; body: string }> = {
        source,
        payload,
      };
      const channel = useBridge ? 'notify:bridge:system' : 'notify:system';
      return electronAPI.ipcRenderer.invoke(channel, req);
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
        source,
        payload,
      };
      const channel = useBridge
        ? 'notify:bridge:app:response'
        : 'notify:app:response';
      return electronAPI.ipcRenderer.invoke(channel, req);
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
  };
}
