import { describe, expect, it } from 'vitest';

import { CONTRACT_VERSION } from '@nebula-studio/application-contract';

import { createPocHostCapabilities } from '../index.ts';

describe('createPocHostCapabilities', () => {
  it('handshakes contractVersion 1', () => {
    const capabilities = createPocHostCapabilities();
    expect(capabilities.contractVersion).toBe(CONTRACT_VERSION);
    expect(capabilities.theme?.setScheme).toEqual(expect.any(Function));
    expect(capabilities.auth?.getToken?.()).toBeNull();
    expect(capabilities.api?.createClient().getToken()).toBeNull();
    expect(
      capabilities.events?.subscribe('auth-logout', () => undefined),
    ).toEqual(expect.any(Function));
  });
});
