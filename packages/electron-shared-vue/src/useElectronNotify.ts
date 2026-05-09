import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { toToastItem } from '@nebula-studio-electron/electron-shared';
import type {
  AppNotifyLevel,
  AppNotifyPayload,
  AppNotifyType,
  NotifyClient,
  ToastItem,
} from '@nebula-studio-electron/electron-shared';

function resolveNotifyClient(): NotifyClient {
  const w = globalThis as { api?: { notify?: NotifyClient } };
  const client = w.api?.notify;
  if (!client) {
    throw new Error(
      'Notify client is unavailable. Ensure preload exposes window.api.notify.',
    );
  }
  return client;
}

export function useElectronNotify(
  client: NotifyClient = resolveNotifyClient(),
) {
  const toasts = ref<ToastItem[]>([]);
  const detailModalToast = ref<ToastItem | null>(null);
  const responseLogs = ref<string[]>([]);
  let toastId = 1;
  let disposeNotifyListener: (() => void) | undefined;
  let disposeResponseListener: (() => void) | undefined;

  const removeToast = (id: number) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  const pushToast = (payload: AppNotifyPayload) => {
    const item = toToastItem(payload, toastId++);
    toasts.value.unshift(item);
    if (item.durationMs) {
      window.setTimeout(() => {
        removeToast(item.id);
      }, item.durationMs);
    }
  };

  const messageToasts = computed(() =>
    toasts.value.filter((toast) => toast.type === 'message'),
  );
  const notificationToasts = computed(() =>
    toasts.value.filter((toast) => toast.type === 'notification'),
  );

  const sendAppNotify = async (
    type: AppNotifyType,
    level: AppNotifyLevel,
    options?: Partial<AppNotifyPayload>,
  ) => {
    const payload = {
      type,
      level,
      ...options,
    };
    await client.app({
      ...payload,
      message: payload.message ?? `In-app ${type}`,
    });
  };

  const sendSystemNotification = async (payload: {
    title: string;
    body: string;
  }) => {
    await client.system(payload);
  };

  const openNotificationDetail = (toast: ToastItem) => {
    if (toast.type !== 'notification' || !toast.detail) {
      return;
    }
    detailModalToast.value = toast;
  };

  const submitDetailAction = async (action: string) => {
    const toast = detailModalToast.value;
    if (!toast) return;
    if (toast.requestId) {
      await client.respond({
        requestId: toast.requestId,
        action,
      });
    }
    detailModalToast.value = null;
  };

  onMounted(() => {
    disposeNotifyListener = client.onApp((payload) => {
      pushToast(payload);
    });
    disposeResponseListener = client.onAppResponse((payload) => {
      responseLogs.value.unshift(
        `requestId=${payload.requestId}, action=${payload.action}`,
      );
      responseLogs.value = responseLogs.value.slice(0, 6);
    });
  });

  onBeforeUnmount(() => {
    disposeNotifyListener?.();
    disposeNotifyListener = undefined;
    disposeResponseListener?.();
    disposeResponseListener = undefined;
  });

  return {
    messageToasts,
    notificationToasts,
    detailModalToast,
    responseLogs,
    removeToast,
    openNotificationDetail,
    submitDetailAction,
    sendAppNotify,
    sendSystemNotification,
  };
}
