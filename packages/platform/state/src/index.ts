import type { NebulaStorage } from '@nebula-studio/storage';

import type { NebulaPersistStores } from './persistPlugin.ts';

import { createApp } from 'vue';

import { createPinia, defineStore, storeToRefs } from 'pinia';

import { createNebulaPersistPlugin } from './persistPlugin.ts';

export type {
  NebulaPersistPolicy,
  NebulaPersistStores,
} from './persistPlugin.ts';

export interface NebulaPiniaHandle {
  dispose(): void;
  pinia: ReturnType<typeof createPinia>;
}

export function createNebulaPinia(options: {
  appId: string;
  persistStores?: NebulaPersistStores;
  storage?: NebulaStorage;
}): NebulaPiniaHandle {
  const pinia = createPinia();
  if (options.storage && options.persistStores) {
    pinia.use(
      createNebulaPersistPlugin({
        storage: options.storage,
        stores: options.persistStores,
      }),
    );
  }
  const host = createApp({ name: `nebula-state-${options.appId}` });
  host.use(pinia);
  return {
    pinia,
    dispose() {
      host.unmount();
    },
  };
}

export { createNebulaPersistPlugin, defineStore, storeToRefs };
