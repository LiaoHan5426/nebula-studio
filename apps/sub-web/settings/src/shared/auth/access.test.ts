import { describe, expect, it } from 'vitest';

import { resolveSettingsAccess } from './access';

describe('settings access matrix', () => {
  it('keeps governance hidden from a normal authenticated user', () => {
    expect(resolveSettingsAccess(['USER'], 'member')).toEqual({
      organization: false,
      platform: false,
    });
  });

  it('allows organization admins to manage members but not platform runtime', () => {
    expect(resolveSettingsAccess(['ORG_ADMIN'], 'org-admin')).toEqual({
      organization: true,
      platform: false,
    });
  });

  it('allows platform admins to access every settings layer', () => {
    expect(resolveSettingsAccess(['ROLE_ADMIN'], 'platform-admin')).toEqual({
      organization: true,
      platform: true,
    });
  });
});
