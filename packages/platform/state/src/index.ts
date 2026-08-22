import { createPinia, defineStore } from 'pinia';
import { createApp } from 'vue';

import type { NebulaStorage } from '@nebula-studio/storage';

export interface NebulaPiniaHandle {
  dispose(): void;
  pinia: ReturnType<typeof createPinia>;
}

export function createNebulaPinia(options: {
  appId: string;
  persistStores?: Record<string, string>;
  storage?: NebulaStorage;
}): NebulaPiniaHandle {
  const pinia = createPinia();
  const app = createApp({ name: `nebula-state-${options.appId}` });
  app.use(pinia);
  if (options.storage) {
    pinia.use(({ store }) => {
      const persistKey = options.persistStores?.[store.$id];
      if (!persistKey || persistKey.includes('token')) {
        return;
      }
      const saved = options.storage?.get<unknown>(persistKey);
      if (saved && typeof saved === 'object') {
        store.$patch(saved);
      }
      store.$subscribe((_mutation, state) => {
        options.storage?.set(persistKey, state, { privacy: 'device' });
      });
    });
  }
  return {
    pinia,
    dispose() {
      app.unmount();
    },
  };
}

export { defineStore };
