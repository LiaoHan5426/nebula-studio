import { createNebulaPinia } from '@nebula-studio/state';
import { createMemoryStorage } from '@nebula-studio/storage';

import { beforeEach, describe, expect, it } from 'vitest';

import {
  PORTAL_DEVICE_PERSIST_KEY,
  PORTAL_SESSION_PERSIST_KEY,
  usePortalStore,
} from '../src/shared/state/portalStore.ts';

describe('portal store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists favorites on device and drafts on session', () => {
    const storage = createMemoryStorage();
    const handle = createNebulaPinia({
      appId: 'integration',
      storage,
      persistStores: {
        portal: [
          {
            key: PORTAL_DEVICE_PERSIST_KEY,
            pick: ['favorites', 'recents'],
            privacy: 'device',
          },
          {
            key: PORTAL_SESSION_PERSIST_KEY,
            pick: ['drafts'],
            privacy: 'session',
          },
        ],
      },
    });
    const store = usePortalStore(handle.pinia);
    store.toggleFavorite('res-1');
    store.writeDraft('res-1', {
      purpose: 'draft',
      environment: 'TEST',
      duration: '30_DAYS',
      scope: 'read',
      sensitivityConfirmed: true,
    });
    expect(storage.get(PORTAL_DEVICE_PERSIST_KEY)).toMatchObject({
      favorites: ['res-1'],
    });
    expect(storage.get(PORTAL_SESSION_PERSIST_KEY)).toMatchObject({
      drafts: { 'res-1': { purpose: 'draft' } },
    });
    store.resetForSessionChange();
    expect(store.drafts).toEqual({});
    expect(store.favorites).toEqual(['res-1']);
    handle.dispose();
  });
});
