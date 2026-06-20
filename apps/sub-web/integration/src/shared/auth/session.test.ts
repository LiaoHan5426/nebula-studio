import { beforeEach, describe, expect, it } from 'vitest';

import {
  clearAuthSession,
  getAuthToken,
  hasValidAuthToken,
  setAuthSession,
} from '@/shared/auth/session';

describe('auth session', () => {
  beforeEach(() => {
    localStorage.clear();
    clearAuthSession();
  });

  it('treats short tokens as invalid', () => {
    setAuthSession('admin', 'short', []);
    expect(hasValidAuthToken()).toBe(false);
  });

  it('accepts JWT-length tokens', () => {
    setAuthSession('admin', 'x'.repeat(32), ['ROLE_ADMIN']);
    expect(hasValidAuthToken()).toBe(true);
    expect(getAuthToken()).toHaveLength(32);
  });

  it('clears stored credentials', () => {
    setAuthSession('admin', 'x'.repeat(32), []);
    clearAuthSession();
    expect(getAuthToken()).toBeNull();
    expect(hasValidAuthToken()).toBe(false);
  });
});
