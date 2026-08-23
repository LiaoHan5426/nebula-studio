/** @vitest-environment happy-dom */

import { CONTRACT_VERSION } from '@nebula-studio/application-contract';
import { LOCALE_STORAGE_KEY } from '@nebula-studio/i18n';
import { createWebStorage } from '@nebula-studio/storage';
import {
  PRODUCT_DEFAULT_PREFERENCE,
  THEME_STORAGE_KEY,
} from '@nebula-studio/tokens';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createPocHostCapabilities } from '../index';
import { resetHostThemeCapabilityForTests } from '../themeHost';

beforeEach(() => {
  resetHostThemeCapabilityForTests();
  localStorage.clear();
  sessionStorage.clear();
  vi.restoreAllMocks();
});

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

  it('exposes locale setLocale and subscribe', async () => {
    const capabilities = createPocHostCapabilities();
    expect(capabilities.locale?.setLocale).toEqual(expect.any(Function));
    const seen: string[] = [];
    const stop = capabilities.locale?.subscribe?.((locale) => {
      seen.push(locale);
    });
    await capabilities.locale?.setLocale?.('en-US');
    expect(capabilities.locale?.locale).toBe('en-US');
    expect(seen).toContain('en-US');
    stop?.();
  });

  it('applies a locale written by another same-origin frame', async () => {
    const capabilities = createPocHostCapabilities();
    await capabilities.locale?.setLocale?.('zh-CN');
    const seen: string[] = [];
    const stop = capabilities.locale?.subscribe?.((locale) => {
      seen.push(locale);
    });

    localStorage.setItem(LOCALE_STORAGE_KEY, 'en-US');
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: LOCALE_STORAGE_KEY,
        newValue: 'en-US',
      }),
    );

    expect(capabilities.locale?.locale).toBe('en-US');
    expect(seen).toContain('en-US');
    stop?.();
  });

  it('applies a theme written by another same-origin frame', async () => {
    const capabilities = createPocHostCapabilities();
    await capabilities.theme?.setPreference?.({
      ...PRODUCT_DEFAULT_PREFERENCE,
      colorScheme: 'dark',
    });
    expect(capabilities.theme?.scheme).toBe('dark');

    createWebStorage(localStorage).set(
      THEME_STORAGE_KEY,
      { ...PRODUCT_DEFAULT_PREFERENCE, colorScheme: 'light' },
      { privacy: 'device' },
    );
    window.dispatchEvent(
      new StorageEvent('storage', { key: THEME_STORAGE_KEY }),
    );

    expect(capabilities.theme?.scheme).toBe('light');
    expect(capabilities.theme?.resolved?.scheme).toBe('light');
  });

  it('loads the organization default when the user has no preference', async () => {
    localStorage.setItem('nebula_current_org_id', 'org-1');
    sessionStorage.setItem(
      'nebula-studio-auth-session',
      JSON.stringify({ user: 'member', token: 'token-1' }),
    );
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            ...PRODUCT_DEFAULT_PREFERENCE,
            colorScheme: 'dark',
            density: 'compact',
          },
        }),
      }),
    );

    const capabilities = createPocHostCapabilities();
    await vi.waitFor(() => {
      expect(capabilities.theme?.preference?.colorScheme).toBe('dark');
      expect(capabilities.theme?.preference?.density).toBe('compact');
    });
  });
});
