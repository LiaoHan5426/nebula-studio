import { CONTRACT_VERSION } from '@nebula-studio/application-contract';

import { describe, expect, it } from 'vitest';

import { createPocHostCapabilities } from '../index.ts';

describe('createPocHostCapabilities', () => {
  it('handshakes contractVersion 1', () => {
    const capabilities = createPocHostCapabilities();
    expect(capabilities.contractVersion).toBe(CONTRACT_VERSION);
    expect(capabilities.theme?.setScheme).toEqual(expect.any(Function));
    expect(capabilities.theme?.setPreference).toEqual(expect.any(Function));
    expect(capabilities.theme?.preference?.colorScheme).toBeDefined();
    expect(capabilities.theme?.resolved?.contractVersion).toBe(1);
    expect(capabilities.auth?.getToken?.()).toBeNull();
    expect(capabilities.api?.createClient().getToken()).toBeNull();
    expect(
      capabilities.events?.subscribe('auth-logout', () => undefined),
    ).toEqual(expect.any(Function));
  });

  it('resolves system scheme without dropping the preference', async () => {
    const capabilities = createPocHostCapabilities();
    await capabilities.theme?.setScheme?.('system');
    expect(capabilities.theme?.scheme).toBe('system');
    expect(capabilities.theme?.resolved?.scheme).toMatch(/light|dark/);
  });
});
