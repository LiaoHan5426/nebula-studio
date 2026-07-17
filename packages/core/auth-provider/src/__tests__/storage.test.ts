import { beforeEach, describe, expect, it } from 'vitest';

import {
  clearWebAuthSession,
  hasValidShellAuthSession,
  readWebAuthSession,
  SHELL_AUTH_SESSION_KEY,
  writeWebAuthSession,
} from '../storage.ts';

describe('auth session storage', () => {
  beforeEach(() => sessionStorage.clear());

  it('round-trips and clears the shared shell session', () => {
    const session = {
      user: 'tester',
      token: 'a'.repeat(20),
      roles: ['admin'],
      userId: '42',
    };

    writeWebAuthSession(session);

    expect(sessionStorage.getItem(SHELL_AUTH_SESSION_KEY)).not.toBeNull();
    expect(readWebAuthSession()).toEqual(session);
    expect(hasValidShellAuthSession(readWebAuthSession())).toBe(true);

    clearWebAuthSession();
    expect(readWebAuthSession()).toBeNull();
  });

  it('rejects malformed and incomplete sessions', () => {
    sessionStorage.setItem(SHELL_AUTH_SESSION_KEY, '{invalid');
    expect(readWebAuthSession()).toBeNull();
    expect(hasValidShellAuthSession({ user: 'tester', token: 'short' })).toBe(
      false,
    );
  });
});
