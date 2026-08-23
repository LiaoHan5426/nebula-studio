import { describe, expect, it } from 'vitest';

import {
  createNebulaQueryClient,
  createQueryKey,
  createTestQueryClient,
} from '../index.ts';

describe('createNebulaQueryClient', () => {
  it('scopes keys to the app id', () => {
    const query = createNebulaQueryClient({ appId: 'integration' });
    expect(query.key('catalog', 'tenant-a')).toEqual([
      'integration',
      'catalog',
      'tenant-a',
    ]);
    query.dispose();
  });

  it('creates a test client that does not retry', () => {
    const query = createTestQueryClient({ appId: 'integration' });
    expect(query.client.getDefaultOptions().queries?.retry).toBe(0);
    query.dispose();
  });

  it('exposes a shared key factory', () => {
    expect(createQueryKey('docs', 'topic', 1)).toEqual(['docs', 'topic', 1]);
  });
});
