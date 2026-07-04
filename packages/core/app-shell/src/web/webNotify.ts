import type {
  AppNotifyLevel,
  AppNotifyPayload,
  AppNotifyResponsePayload,
  AppNotifyType,
} from '@nebula-studio-electron/electron-bridge';

function normalizeAppNotifyPayload(
  payload: AppNotifyPayload,
): AppNotifyPayload {
  const type: AppNotifyType =
    payload.type === 'notification' ? 'notification' : 'message';
  const level: AppNotifyLevel =
    payload.level === 'success' ||
    payload.level === 'warning' ||
    payload.level === 'danger'
      ? payload.level
      : 'info';
  const durationMs =
    typeof payload.durationMs === 'number' &&
    Number.isFinite(payload.durationMs) &&
    payload.durationMs > 0
      ? Math.floor(payload.durationMs)
      : undefined;

  return {
    ...payload,
    type,
    level,
    showCloseButton:
      typeof payload.showCloseButton === 'boolean'
        ? payload.showCloseButton
        : type === 'message',
    durationMs: type === 'notification' ? (durationMs ?? 5000) : durationMs,
  } satisfies AppNotifyPayload;
}

export function createWebNotifyApi(scope: string) {
  const appListeners: Array<(payload: AppNotifyPayload) => void> = [];
  const responseListeners: Array<(payload: AppNotifyResponsePayload) => void> =
    [];

  return {
    scope,
    notify: {
      app: async (payload: AppNotifyPayload) => {
        const normalized = normalizeAppNotifyPayload(payload);
        queueMicrotask(() => {
          for (const l of appListeners) l(normalized);
        });
        return null;
      },
      system: async (payload: { title: string; body: string }) => {
        const NotificationCtor = globalThis.Notification;
        if (!NotificationCtor) {
          throw new Error(
            'System Notification is not supported in this browser.',
          );
        }

        const show = () =>
          new NotificationCtor(payload.title, {
            body: payload.body,
          });

        if (NotificationCtor.permission === 'granted') {
          show();
          return;
        }

        if (NotificationCtor.permission === 'denied') {
          throw new Error(
            'System Notification permission is denied. Please enable it in browser settings.',
          );
        }

        const permission = await NotificationCtor.requestPermission();
        if (permission === 'granted') {
          show();
          return;
        }

        throw new Error(
          'System Notification permission was not granted by user action.',
        );
      },
      onApp: (listener: (payload: AppNotifyPayload) => void) => {
        appListeners.push(listener);
        return () => {
          const i = appListeners.indexOf(listener);
          if (i >= 0) appListeners.splice(i, 1);
        };
      },
      respond: async (payload: AppNotifyResponsePayload) => {
        queueMicrotask(() => {
          for (const l of responseListeners) l(payload);
        });
      },
      onAppResponse: (
        listener: (payload: AppNotifyResponsePayload) => void,
      ) => {
        responseListeners.push(listener);
        return () => {
          const i = responseListeners.indexOf(listener);
          if (i >= 0) responseListeners.splice(i, 1);
        };
      },
    },
  };
}
