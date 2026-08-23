import type { PiniaPlugin, PiniaPluginContext } from 'pinia';

import type { NebulaStorage, StoragePrivacy } from '@nebula-studio/storage';

export interface NebulaPersistPolicy {
  key: string;
  pick?: readonly string[];
  privacy?: StoragePrivacy;
  schemaVersion?: number;
  ttlMs?: number;
}

export type NebulaPersistStores = Record<
  string,
  NebulaPersistPolicy | readonly NebulaPersistPolicy[] | string
>;

function normalizePolicies(
  value: NebulaPersistPolicy | readonly NebulaPersistPolicy[] | string,
): NebulaPersistPolicy[] {
  if (typeof value === 'string') {
    return [{ key: value, privacy: 'device' }];
  }
  if ('key' in value) {
    return [value];
  }
  return [...value];
}

function isBlockedKey(key: string): boolean {
  return key.toLowerCase().includes('token');
}

function pickState(
  state: Record<string, unknown>,
  pick?: readonly string[],
): Record<string, unknown> {
  if (!pick) {
    return { ...state };
  }
  const next: Record<string, unknown> = {};
  for (const field of pick) {
    if (field in state) {
      next[field] = state[field];
    }
  }
  return next;
}

export function createNebulaPersistPlugin(options: {
  storage: NebulaStorage;
  stores: NebulaPersistStores;
}): PiniaPlugin {
  return (context: PiniaPluginContext) => {
    const configured = options.stores[context.store.$id];
    if (!configured) {
      return;
    }
    const policies = normalizePolicies(configured).filter(
      (policy) => !isBlockedKey(policy.key),
    );
    if (policies.length === 0) {
      return;
    }

    for (const policy of policies) {
      const saved = options.storage.get<unknown>(policy.key);
      if (saved && typeof saved === 'object') {
        context.store.$patch((state) => {
          Object.assign(
            state,
            pickState(saved as Record<string, unknown>, policy.pick),
          );
        });
      }
    }

    context.store.$subscribe(
      (_mutation, state) => {
        const record = state as Record<string, unknown>;
        for (const policy of policies) {
          options.storage.set(policy.key, pickState(record, policy.pick), {
            privacy: policy.privacy ?? 'device',
            ttlMs: policy.ttlMs,
            version: policy.schemaVersion ?? 1,
          });
        }
      },
      { flush: 'sync' },
    );
  };
}
