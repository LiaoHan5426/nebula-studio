import { describe, expect, it } from 'vitest';

import { createNebulaQueryClient } from '../index.ts';

describe('createNebulaQueryClient', () => {
  it('scopes keys to the app id', () => {
    const query = createNebulaQueryClient({ appId: 'integration' });
    expect(query.key('catalog')).toEqual(['integration', 'catalog']);
    query.dispose();
  });
});
