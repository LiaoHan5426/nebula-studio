import { createMemoryStorage } from '@nebula-studio/storage';

import { describe, expect, it } from 'vitest';

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

  it('persists only picked fields across multiple policies', () => {
    const storage = createMemoryStorage();
    const handle = createNebulaPinia({
      appId: 'integration',
      storage,
      persistStores: {
        portal: [
          {
            key: 'nebula.portal.device',
            pick: ['favorites'],
            privacy: 'device',
          },
          {
            key: 'nebula.portal.session',
            pick: ['drafts'],
            privacy: 'session',
          },
        ],
      },
    });
    const usePortal = defineStore('portal', {
      state: () => ({
        favorites: [] as string[],
        drafts: {} as Record<string, string>,
      }),
    });
    const store = usePortal(handle.pinia);
    store.$patch({ favorites: ['res-1'], drafts: { res: 'wip' } });
    expect(storage.get('nebula.portal.device')).toEqual({
      favorites: ['res-1'],
    });
    expect(storage.get('nebula.portal.session')).toEqual({
      drafts: { res: 'wip' },
    });
    handle.dispose();
  });
});
