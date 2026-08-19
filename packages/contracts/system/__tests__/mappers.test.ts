import { describe, expect, it } from 'vitest';

import { mapUserFromGenerated } from '../mappers.ts';

describe('system contract mappers', () => {
  it('maps generated user schema to UserRecord', () => {
    expect(
      mapUserFromGenerated({
        id: 'u-1',
        username: 'demo',
        email: 'demo@example.com',
      }),
    ).toEqual({
      id: 'u-1',
      username: 'demo',
      avatar: undefined,
      createdAt: undefined,
      email: 'demo@example.com',
      lastLoginAt: undefined,
      phone: undefined,
      realName: undefined,
      status: undefined,
      updatedAt: undefined,
    });
  });
});
