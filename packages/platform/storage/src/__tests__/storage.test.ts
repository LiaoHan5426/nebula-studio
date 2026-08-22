import { describe, expect, it } from 'vitest';

import {
  clearOnLogout,
  createMemoryStorage,
  createWebStorage,
} from '../index.ts';

describe('nebula storage', () => {
  it('honours TTL and logout session clear', () => {
    const storage = createMemoryStorage();
    storage.set('theme', { colorScheme: 'dark' }, { privacy: 'device' });
    storage.set('token', 'secret', { privacy: 'session' });
    clearOnLogout(storage);
    expect(storage.get('theme')).toEqual({ colorScheme: 'dark' });
    expect(storage.get('token')).toBeUndefined();
  });

  it('drops expired web storage records', () => {
    const storage = createWebStorage();
    storage.set('ephemeral', 1, { ttlMs: -1 });
    expect(storage.get('ephemeral')).toBeUndefined();
  });
});
