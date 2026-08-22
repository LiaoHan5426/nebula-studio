import { describe, expect, it } from 'vitest';

import { createMemoryStorage } from '@nebula-studio/storage';

import { createNebulaPinia, defineStore } from '../index.ts';

describe('createNebulaPinia', () => {
  it('disposes without throwing', () => {
    const handle = createNebulaPinia({ appId: 'settings' });
    const useProbe = defineStore('probe', {
      state: () => ({ n: 1 }),
    });
    const store = useProbe(handle.pinia);
    expect(store.n).toBe(1);
    handle.dispose();
  });

  it('does not persist keys that look like tokens', () => {
    const storage = createMemoryStorage();
    const handle = createNebulaPinia({
      appId: 'settings',
      storage,
      persistStores: { probe: 'nebula.settings.token.cache' },
    });
    const useProbe = defineStore('probe', {
      state: () => ({ n: 1 }),
    });
    useProbe(handle.pinia).$patch({ n: 2 });
    handle.dispose();
    expect(storage.get('nebula.settings.token.cache')).toBeUndefined();
  });

  it('persists allowlisted stores', () => {
    const storage = createMemoryStorage();
    const handle = createNebulaPinia({
      appId: 'settings',
      storage,
      persistStores: { appearance: 'nebula.settings.appearance' },
    });
    const useAppearance = defineStore('appearance', {
      state: () => ({ density: 'comfortable' }),
    });
    useAppearance(handle.pinia).$patch({ density: 'compact' });
    expect(storage.get('nebula.settings.appearance')).toMatchObject({
      density: 'compact',
    });
    handle.dispose();
  });
});
