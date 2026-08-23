import { describe, expect, it } from 'vitest';

import { resolveTheme } from '../resolve';
import { PRODUCT_DEFAULT_PREFERENCE, STATUS_TOKENS } from '../types';

const BASELINE_KEYS = [
  'action-primary',
  'success',
  'warning',
  'destructive',
] as const;

function pickBaseline(tokens: Record<string, string>) {
  return Object.fromEntries(BASELINE_KEYS.map((key) => [key, tokens[key]]));
}

describe('host vs standalone token JSON baseline', () => {
  it('light/dark + one accent share the same resolveTheme output', () => {
    const preference = {
      ...PRODUCT_DEFAULT_PREFERENCE,
      colorScheme: 'light' as const,
      accent: { kind: 'preset' as const, id: 'nebula-teal' },
    };
    const light = resolveTheme(preference, 'light');
    const dark = resolveTheme({ ...preference, colorScheme: 'dark' }, 'dark');
    expect(pickBaseline(light.tokens)).toMatchObject({
      success: STATUS_TOKENS.light.success,
      warning: STATUS_TOKENS.light.warning,
      destructive: STATUS_TOKENS.light.destructive,
    });
    expect(pickBaseline(dark.tokens)).toMatchObject({
      success: STATUS_TOKENS.dark.success,
      warning: STATUS_TOKENS.dark.warning,
      destructive: STATUS_TOKENS.dark.destructive,
    });
    expect(light.tokens['action-primary']).not.toBe(light.tokens.success);
    expect(dark.tokens['action-primary']).not.toBe(dark.tokens.success);
  });
});
