/**
 * Shell 标准事件总线：跨子应用状态同步。
 */
export type ShellEventMap = {
  'tenant:changed': { tenantId: string };
  'auth:logout': { reason?: string };
  'theme:changed': { theme: string };
  'notification:received': { id?: string; title?: string; content?: string };
};

type Handler<T> = (payload: T) => void;

export interface ShellEventBus {
  on<K extends keyof ShellEventMap>(
    event: K,
    handler: Handler<ShellEventMap[K]>,
  ): () => void;
  emit<K extends keyof ShellEventMap>(
    event: K,
    payload: ShellEventMap[K],
  ): void;
}

export function createEventBus(): ShellEventBus {
  const handlers = new Map<string, Set<Handler<unknown>>>();

  return {
    on(event, handler) {
      const set = handlers.get(event) ?? new Set();
      set.add(handler as Handler<unknown>);
      handlers.set(event, set);
      return () => set.delete(handler as Handler<unknown>);
    },
    emit(event, payload) {
      handlers.get(event)?.forEach((h) => h(payload));
    },
  };
}

declare global {
  interface Window {
    __NEBULA_SHELL_EVENT_BUS__?: ShellEventBus;
  }
}

/** 解析当前上下文可用的 Shell 事件总线（宿主优先，否则创建并挂载到 window）。 */
export function resolveShellEventBus(existing?: ShellEventBus): ShellEventBus {
  if (existing) {
    window.__NEBULA_SHELL_EVENT_BUS__ = existing;
    return existing;
  }

  try {
    if (window.parent !== window && window.parent.__NEBULA_SHELL_EVENT_BUS__) {
      return window.parent.__NEBULA_SHELL_EVENT_BUS__;
    }
  } catch {
    // cross-origin iframe
  }

  if (window.__NEBULA_SHELL_EVENT_BUS__) {
    return window.__NEBULA_SHELL_EVENT_BUS__;
  }

  const bus = createEventBus();
  window.__NEBULA_SHELL_EVENT_BUS__ = bus;
  return bus;
}

export interface WireShellEventBusOptions {
  onTenantChanged?: (tenantId: string) => void;
  onAuthLogout?: (reason?: string) => void;
}

/** 注册标准 Shell 事件监听（tenant:changed / auth:logout）。 */
export function wireShellEventBus(
  bus: ShellEventBus,
  options: WireShellEventBusOptions = {},
): () => void {
  const unsubs = [
    bus.on('tenant:changed', ({ tenantId }) => {
      options.onTenantChanged?.(tenantId);
    }),
    bus.on('auth:logout', ({ reason }) => {
      options.onAuthLogout?.(reason);
    }),
  ];
  return () => unsubs.forEach((off) => off());
}
