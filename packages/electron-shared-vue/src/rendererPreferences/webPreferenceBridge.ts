export const UNHANDLED = Symbol.for('nebula.webIpc.unhandled');

export type WebIpcListener = (
  event: unknown,
  payload: Record<string, unknown>,
) => void;

export interface WebPreferenceBridge {
  handleInvoke(channel: string, args: unknown[]): unknown;
  on(channel: string, listener: WebIpcListener): void;
  removeListener(channel: string, listener: WebIpcListener): void;
}

export interface WebPreferenceChannels {
  readonly get: string;
  readonly set: string;
  readonly changed: string;
}

export interface CreateWebPreferenceBridgeOptions<T> {
  channels: WebPreferenceChannels;
  /** Payload field broadcast on set, e.g. `theme` or `locale`. */
  field: string;
  read: () => T;
  write: (value: T) => void;
  normalizeFromInvokeArgs: (args: unknown[]) => T;
}

/**
 * Minimal `ipcRenderer`-like preference bridge for static Web builds:
 * get/set via `invoke`, live updates via `on(fieldChangedChannel)`.
 */
export function createWebPreferenceBridge<T>(
  options: CreateWebPreferenceBridgeOptions<T>,
): WebPreferenceBridge {
  const { channels, field, read, write, normalizeFromInvokeArgs } = options;
  const listeners = new Set<WebIpcListener>();

  const notify = (value: T) => {
    const payload: Record<string, unknown> = { [field]: value };
    for (const l of listeners) l(null, payload);
  };

  return {
    handleInvoke(channel, args) {
      if (channel === channels.get) return read();
      if (channel === channels.set) {
        const next = normalizeFromInvokeArgs(args);
        write(next);
        notify(next);
        return next;
      }
      return UNHANDLED;
    },
    on(channel, listener) {
      if (channel === channels.changed) listeners.add(listener);
    },
    removeListener(channel, listener) {
      if (channel === channels.changed) listeners.delete(listener);
    },
  };
}

export function mergeWebPreferenceBridges(
  bridges: WebPreferenceBridge[],
): WebPreferenceBridge {
  return {
    handleInvoke(channel, args) {
      for (const b of bridges) {
        const result = b.handleInvoke(channel, args);
        if (result !== UNHANDLED) return result;
      }
      return UNHANDLED;
    },
    on(channel, listener) {
      for (const b of bridges) b.on(channel, listener);
    },
    removeListener(channel, listener) {
      for (const b of bridges) b.removeListener(channel, listener);
    },
  };
}
