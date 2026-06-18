import { onUnmounted, ref } from 'vue';

import { INTEGRATION_BASE } from '@/shared/api/client';
import { getAuthToken } from '@/shared/auth/session';

export interface SseEventRecord {
  id: string;
  event: string;
  data: string;
  receivedAt: string;
}

export type SseConnectionState = 'idle' | 'connecting' | 'connected' | 'error';

const CONNECT_TIMEOUT_MS = 10_000;
const READY_STATE_POLL_MS = 200;
const READY_STATE_POLL_MAX = 25;

function markConnected(
  connectionState: { value: SseConnectionState },
  error: { value: string | null },
) {
  connectionState.value = 'connected';
  error.value = null;
}

export function useSubscriptionEvents() {
  const events = ref<SseEventRecord[]>([]);
  const connectionState = ref<SseConnectionState>('idle');
  const error = ref<string | null>(null);

  let source: EventSource | null = null;
  let openListener: (() => void) | null = null;
  let messageListener: ((ev: MessageEvent) => void) | null = null;
  let errorListener: (() => void) | null = null;
  let connectedListener: ((ev: Event) => void) | null = null;
  let subscriptionEventListener: ((ev: Event) => void) | null = null;
  let readyStateTimer: ReturnType<typeof setTimeout> | null = null;
  let connectTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
  let readyStatePollTimer: ReturnType<typeof setInterval> | null = null;
  let disconnecting = false;

  function clearTimers() {
    if (readyStateTimer) {
      clearTimeout(readyStateTimer);
      readyStateTimer = null;
    }
    if (connectTimeoutTimer) {
      clearTimeout(connectTimeoutTimer);
      connectTimeoutTimer = null;
    }
    if (readyStatePollTimer) {
      clearInterval(readyStatePollTimer);
      readyStatePollTimer = null;
    }
  }

  function failConnect(message: string) {
    clearTimers();
    connectionState.value = 'error';
    error.value = message;
    if (source) {
      source.close();
      source = null;
    }
  }

  function recordEvent(eventName: string, data: string, lastEventId?: string) {
    events.value.unshift({
      id: lastEventId || String(Date.now()),
      event: eventName,
      data,
      receivedAt: new Date().toISOString(),
    });
  }

  function isConnectedHandshake(data: string): boolean {
    try {
      const parsed = JSON.parse(data) as { status?: string };
      return parsed.status === 'connected';
    } catch {
      return false;
    }
  }

  function connect(subscriptionId: string) {
    disconnect();
    disconnecting = false;
    error.value = null;
    connectionState.value = 'connecting';

    const token = getAuthToken();
    if (!token) {
      connectionState.value = 'error';
      error.value = '未登录，请先在 Shell 登录后再监听事件';
      return;
    }

    const params = new URLSearchParams();
    params.set('token', token);
    const url = `${INTEGRATION_BASE}/subscriptions/${subscriptionId}/events?${params.toString()}`;

    source = new EventSource(url);

    openListener = () => {
      clearTimers();
      markConnected(connectionState, error);
    };
    source.addEventListener('open', openListener);

    connectedListener = () => {
      clearTimers();
      markConnected(connectionState, error);
    };
    source.addEventListener('connected', connectedListener);

    messageListener = (ev: MessageEvent) => {
      markConnected(connectionState, error);
      if (!isConnectedHandshake(ev.data)) {
        recordEvent('message', ev.data, ev.lastEventId);
      }
    };
    source.addEventListener('message', messageListener);

    subscriptionEventListener = (ev) => {
      markConnected(connectionState, error);
      const event = ev as MessageEvent<string>;
      recordEvent('subscription-event', event.data, event.lastEventId);
    };
    source.addEventListener('subscription-event', subscriptionEventListener);

    readyStateTimer = setTimeout(() => {
      if (
        source?.readyState === EventSource.OPEN &&
        connectionState.value === 'connecting'
      ) {
        clearTimers();
        markConnected(connectionState, error);
      }
    }, 500);

    let pollCount = 0;
    readyStatePollTimer = setInterval(() => {
      pollCount += 1;
      if (connectionState.value !== 'connecting' || !source) {
        if (readyStatePollTimer) {
          clearInterval(readyStatePollTimer);
          readyStatePollTimer = null;
        }
        return;
      }
      if (source.readyState === EventSource.OPEN) {
        clearTimers();
        markConnected(connectionState, error);
        return;
      }
      if (pollCount >= READY_STATE_POLL_MAX) {
        if (readyStatePollTimer) {
          clearInterval(readyStatePollTimer);
          readyStatePollTimer = null;
        }
      }
    }, READY_STATE_POLL_MS);

    connectTimeoutTimer = setTimeout(() => {
      if (connectionState.value === 'connecting') {
        failConnect('SSE 连接超时，请确认 demo-camel-integration 已启动');
      }
    }, CONNECT_TIMEOUT_MS);

    errorListener = () => {
      if (disconnecting || connectionState.value === 'idle' || !source) {
        return;
      }
      if (source.readyState === EventSource.CONNECTING) {
        return;
      }
      if (connectionState.value === 'connecting') {
        failConnect('SSE 连接失败，请确认后端已启动且登录 token 有效');
        return;
      }
      if (connectionState.value === 'connected') {
        connectionState.value = 'error';
        error.value = 'SSE 连接已断开';
      }
    };
    source.addEventListener('error', errorListener);
  }

  function disconnect() {
    disconnecting = true;
    clearTimers();
    connectionState.value = 'idle';
    error.value = null;
    if (source) {
      if (openListener) {
        source.removeEventListener('open', openListener);
        openListener = null;
      }
      if (messageListener) {
        source.removeEventListener('message', messageListener);
        messageListener = null;
      }
      if (errorListener) {
        source.removeEventListener('error', errorListener);
        errorListener = null;
      }
      if (connectedListener) {
        source.removeEventListener('connected', connectedListener);
        connectedListener = null;
      }
      if (subscriptionEventListener) {
        source.removeEventListener(
          'subscription-event',
          subscriptionEventListener,
        );
        subscriptionEventListener = null;
      }
      source.close();
      source = null;
    }
    disconnecting = false;
  }

  function clearEvents() {
    events.value = [];
  }

  onUnmounted(disconnect);

  return {
    events,
    connectionState,
    error,
    connect,
    disconnect,
    clearEvents,
  };
}
