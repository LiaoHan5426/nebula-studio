export type StoragePrivacy = 'device' | 'session';

export interface StorageEnvelope<T> {
  expiresAt?: number;
  privacy: StoragePrivacy;
  v: number;
  value: T;
}

export interface NebulaStorage {
  clear(options?: { privacy?: StoragePrivacy }): void;
  get<T>(key: string): T | undefined;
  remove(key: string): void;
  set<T>(
    key: string,
    value: T,
    options?: { privacy?: StoragePrivacy; ttlMs?: number; version?: number },
  ): void;
}

function now(): number {
  return Date.now();
}

export function createMemoryStorage(): NebulaStorage {
  const map = new Map<string, StorageEnvelope<unknown>>();
  return {
    get(key) {
      const envelope = map.get(key);
      if (!envelope) return undefined;
      if (envelope.expiresAt && envelope.expiresAt < now()) {
        map.delete(key);
        return undefined;
      }
      return envelope.value as never;
    },
    set(key, value, options) {
      const ttlMs = options?.ttlMs;
      map.set(key, {
        v: options?.version ?? 1,
        privacy: options?.privacy ?? 'device',
        expiresAt: ttlMs ? now() + ttlMs : undefined,
        value,
      });
    },
    remove(key) {
      map.delete(key);
    },
    clear(options) {
      if (!options?.privacy) {
        map.clear();
        return;
      }
      for (const [key, envelope] of map) {
        if (envelope.privacy === options.privacy) {
          map.delete(key);
        }
      }
    },
  };
}

export function createWebStorage(
  backend: Storage = globalThis.localStorage,
): NebulaStorage {
  function read(key: string): StorageEnvelope<unknown> | undefined {
    const raw = backend.getItem(key);
    if (!raw) return undefined;
    try {
      return JSON.parse(raw) as StorageEnvelope<unknown>;
    } catch {
      return undefined;
    }
  }
  return {
    get(key) {
      const envelope = read(key);
      if (!envelope) return undefined;
      if (envelope.expiresAt && envelope.expiresAt < now()) {
        backend.removeItem(key);
        return undefined;
      }
      return envelope.value as never;
    },
    set(key, value, options) {
      const ttlMs = options?.ttlMs;
      const envelope: StorageEnvelope<unknown> = {
        v: options?.version ?? 1,
        privacy: options?.privacy ?? 'device',
        expiresAt: ttlMs ? now() + ttlMs : undefined,
        value,
      };
      backend.setItem(key, JSON.stringify(envelope));
    },
    remove(key) {
      backend.removeItem(key);
    },
    clear(options) {
      const keys = [];
      for (let index = 0; index < backend.length; index += 1) {
        const key = backend.key(index);
        if (key) keys.push(key);
      }
      for (const key of keys) {
        if (!options?.privacy) {
          backend.removeItem(key);
          continue;
        }
        const envelope = read(key);
        if (envelope?.privacy === options.privacy) {
          backend.removeItem(key);
        }
      }
    },
  };
}

export function clearOnLogout(storage: NebulaStorage): void {
  storage.clear({ privacy: 'session' });
}

export function clearOnTenantSwitch(storage: NebulaStorage): void {
  storage.clear({ privacy: 'session' });
}
