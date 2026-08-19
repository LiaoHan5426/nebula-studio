import { describe, expect, it } from 'vitest';

import { resolveBoundUsername } from '../useTenantPage';

describe('useTenantPage helpers', () => {
  it('resolves bound username from console users', () => {
    expect(
      resolveBoundUsername('u-1', [
        { id: 'u-1', username: 'demo' },
        { id: 'u-2', username: 'admin' },
      ]),
    ).toBe('demo');
  });

  it('returns fallback labels for missing users', () => {
    expect(resolveBoundUsername(undefined, [])).toBe('未绑定');
    expect(resolveBoundUsername('missing', [])).toBe('未绑定');
  });
});
