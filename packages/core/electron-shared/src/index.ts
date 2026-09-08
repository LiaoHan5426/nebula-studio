export type AppNotifyType = 'message' | 'notification';
export type AppNotifyLevel = 'danger' | 'info' | 'success' | 'warning';
export type NotifySource = string;

export type {
  ElectronAPI,
  ElectronIpcRenderer,
  ElectronNodeProcess,
  ElectronWebFrame,
  ElectronWebUtils,
  IpcRendererListener,
} from './electronApi';

export interface AppNotifyDetailChoice {
  key: string;
  label: string;
  variant?: 'danger' | 'default' | 'primary';
}

export type AppNotifyDetail =
  | {
      choices?: AppNotifyDetailChoice[];
      content: string;
      mode: 'choice';
      title: string;
    }
  | {
      confirmText?: string;
      content: string;
      mode: 'ack';
      title: string;
    };

export interface AppNotifyPayload {
  detail?: AppNotifyDetail;
  durationMs?: number;
  level: AppNotifyLevel;
  message: string;
  requestId?: string;
  showCloseButton?: boolean;
  title?: string;
  type: AppNotifyType;
}

export interface AppNotifyResponsePayload {
  action: string;
  requestId: string;
}

export interface NotifyBridgePayload<T> {
  payload: T;
  source: NotifySource;
}

export interface NotifyClient {
  app(payload: AppNotifyPayload): Promise<null | string>;
  onApp(listener: (payload: AppNotifyPayload) => void): () => void;
  onAppResponse(
    listener: (payload: AppNotifyResponsePayload) => void,
  ): () => void;
  respond(payload: AppNotifyResponsePayload): Promise<void>;
  system(payload: { body: string; title: string }): Promise<unknown>;
}

export interface ToastItem extends AppNotifyPayload {
  id: number;
}

export function toToastItem(payload: AppNotifyPayload, id: number): ToastItem {
  const type: AppNotifyType =
    payload.type === 'notification' ? 'notification' : 'message';
  const level: AppNotifyLevel =
    payload.level === 'success' ||
    payload.level === 'warning' ||
    payload.level === 'danger'
      ? payload.level
      : 'info';
  return {
    ...payload,
    id,
    type,
    level,
    showCloseButton:
      typeof payload.showCloseButton === 'boolean'
        ? payload.showCloseButton
        : type === 'message',
    durationMs:
      typeof payload.durationMs === 'number' && payload.durationMs > 0
        ? Math.floor(payload.durationMs)
        : undefined,
  };
}
