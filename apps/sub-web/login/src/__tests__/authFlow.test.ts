import { describe, expect, it } from 'vitest';

import { classifyAuthFailure, readAuthEntryContext } from '../authFlow';

describe('auth flow failure classification', () => {
  it.each([
    ['invalid password', 'invalid-credentials'],
    ['account locked', 'account-locked'],
    ['Failed to fetch', 'network'],
    ['403 forbidden', 'permission-changed'],
    ['503 service unavailable', 'service'],
    ['MFA_REQUIRED', 'mfa-required'],
  ] as const)('classifies %s as %s', (message, kind) => {
    expect(classifyAuthFailure(new Error(message)).kind).toBe(kind);
  });

  it('preserves a safe unknown failure message', () => {
    expect(classifyAuthFailure(new Error('unexpected')).message).toBe(
      'unexpected',
    );
  });
});

describe('auth flow entry context', () => {
  it('recognizes recoverable shell return reasons', () => {
    expect(readAuthEntryContext('?reason=session-expired')).toBe(
      'session-expired',
    );
    expect(readAuthEntryContext('?reason=permission-changed')).toBe(
      'permission-changed',
    );
  });

  it('ignores unknown reasons', () => {
    expect(readAuthEntryContext('?reason=anything')).toBeNull();
  });
});
