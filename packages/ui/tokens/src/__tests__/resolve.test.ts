import { describe, expect, it } from 'vitest';

import { generateAccentPalette } from '../palette.ts';
import { resolveTheme } from '../resolve.ts';
import { PRODUCT_DEFAULT_PREFERENCE, STATUS_TOKENS } from '../types.ts';

describe('resolveTheme', () => {
  it('maps system preference to the provided system scheme', () => {
    const dark = resolveTheme(PRODUCT_DEFAULT_PREFERENCE, 'dark');
    const light = resolveTheme(PRODUCT_DEFAULT_PREFERENCE, 'light');
    expect(dark.scheme).toBe('dark');
    expect(light.scheme).toBe('light');
  });

  it('snapshots light/dark token keys for visual baseline', () => {
    const light = resolveTheme(
      { ...PRODUCT_DEFAULT_PREFERENCE, colorScheme: 'light' },
      'light',
    );
    const dark = resolveTheme(
      { ...PRODUCT_DEFAULT_PREFERENCE, colorScheme: 'dark' },
      'dark',
    );
    expect(Object.keys(light.tokens).toSorted()).toEqual(
      Object.keys(dark.tokens).toSorted(),
    );
    expect(light.tokens['action-primary']).toBeTruthy();
    expect(dark.tokens.success).toBe(STATUS_TOKENS.dark.success);
  });

  it('keeps status tokens independent of accent', () => {
    const red = resolveTheme(
      {
        ...PRODUCT_DEFAULT_PREFERENCE,
        colorScheme: 'light',
        accent: { kind: 'custom', color: '#ff0000' },
      },
      'light',
    );
    expect(red.tokens.success).toBe(STATUS_TOKENS.light.success);
    expect(red.tokens.destructive).toBe(STATUS_TOKENS.light.destructive);
    expect(red.tokens.warning).toBe(STATUS_TOKENS.light.warning);
    expect(red.tokens['action-primary']).toBeTruthy();
    expect(red.tokens['action-primary']).not.toBe(red.tokens.success);
  });
});

describe('generateAccentPalette', () => {
  it('adjusts a washed-out seed so primary content stays readable', () => {
    const pale = generateAccentPalette('#eeeeee');
    expect(pale['action-primary']).toMatch(/^\d+ \d+% \d+%$/);
    expect(pale['action-primary-content']).toBeTruthy();
    expect(pale.success).toBeUndefined();
  });
});
