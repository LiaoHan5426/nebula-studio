import { describe, expect, it } from 'vitest';

import {
  mapFrontendRuntimeEntryFromGenerated,
  mapUserFromGenerated,
} from '../mappers.ts';

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

  it('maps generated frontend runtime views to FrontendRuntimeEntry', () => {
    expect(
      mapFrontendRuntimeEntryFromGenerated({
        id: 'docs',
        name: '文档',
        driver: 'federation',
        source: 'frontend',
        webEnabled: true,
        electronEnabled: true,
        roles: ['public'],
        manifestUrl: 'http://localhost:5176/mf-manifest.json',
        remoteName: 'nebula_docs',
      }),
    ).toMatchObject({
      id: 'docs',
      driver: 'federation',
      source: 'frontend',
      remoteName: 'nebula_docs',
    });
  });
});
