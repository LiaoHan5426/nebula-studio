export type AppNotifyType = 'message' | 'notification';
export type AppNotifyLevel = 'success' | 'info' | 'warning' | 'danger';
export type NotifySource = string;

export interface AppNotifyDetailChoice {
  key: string;
  label: string;
  variant?: 'primary' | 'default' | 'danger';
}

export type AppNotifyDetail =
  | {
      title: string;
      content: string;
      mode: 'choice';
      choices?: AppNotifyDetailChoice[];
    }
  | {
      title: string;
      content: string;
      mode: 'ack';
      confirmText?: string;
    };

export interface AppNotifyPayload {
  type: AppNotifyType;
  level: AppNotifyLevel;
  title?: string;
  message: string;
  showCloseButton?: boolean;
  durationMs?: number;
  requestId?: string;
  detail?: AppNotifyDetail;
}

export interface AppNotifyResponsePayload {
  requestId: string;
  action: string;
}

export interface NotifyBridgePayload<T> {
  source: NotifySource;
  payload: T;
}

export interface NotifyClient {
  app(payload: AppNotifyPayload): Promise<string | null>;
  system(payload: { title: string; body: string }): Promise<unknown>;
  onApp(listener: (payload: AppNotifyPayload) => void): () => void;
  respond(payload: AppNotifyResponsePayload): Promise<void>;
  onAppResponse(
    listener: (payload: AppNotifyResponsePayload) => void,
  ): () => void;
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
