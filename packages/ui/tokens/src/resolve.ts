import { generateAccentPalette } from './palette.ts';
import type {
  ColorSchemePreference,
  ResolvedTheme,
  ThemePreference,
} from './types.ts';
import {
  ACCENT_PRESETS,
  ORGANIZATION_DEFAULT_PREFERENCE,
  PRODUCT_DEFAULT_PREFERENCE,
  STATUS_TOKENS,
} from './types.ts';

export function mergeThemePreference(
  user?: null | Partial<ThemePreference> | ThemePreference,
  organization: ThemePreference = ORGANIZATION_DEFAULT_PREFERENCE,
  product: ThemePreference = PRODUCT_DEFAULT_PREFERENCE,
): ThemePreference {
  return {
    colorScheme:
      user?.colorScheme ?? organization.colorScheme ?? product.colorScheme,
    accent: user?.accent ?? organization.accent ?? product.accent,
    density: user?.density ?? organization.density ?? product.density,
    contrast: user?.contrast ?? organization.contrast ?? product.contrast,
  };
}

export function readSystemScheme(
  matchMedia:
    | ((query: string) => { matches: boolean })
    | undefined = globalThis.matchMedia,
): 'dark' | 'light' {
  try {
    return matchMedia?.('(prefers-color-scheme: dark)')?.matches
      ? 'dark'
      : 'light';
  } catch {
    return 'light';
  }
}

export function resolveScheme(
  colorScheme: ColorSchemePreference,
  systemScheme: 'dark' | 'light',
): 'dark' | 'light' {
  if (colorScheme === 'system') {
    return systemScheme;
  }
  return colorScheme;
}

export function resolveAccentSeed(preference: ThemePreference): {
  accentId: string;
  seed: string;
} {
  if (preference.accent.kind === 'preset') {
    const seed =
      ACCENT_PRESETS[preference.accent.id] ?? ACCENT_PRESETS['nebula-blue'];
    return { accentId: preference.accent.id, seed: seed ?? '#4d7cff' };
  }
  return { accentId: 'custom', seed: preference.accent.color };
}

export function resolveTheme(
  preference: ThemePreference,
  systemScheme: 'dark' | 'light',
): ResolvedTheme {
  const scheme = resolveScheme(preference.colorScheme, systemScheme);
  const { accentId, seed } = resolveAccentSeed(preference);
  const accent = generateAccentPalette(seed);
  const status = STATUS_TOKENS[scheme];
  const densityPad =
    preference.density === 'compact'
      ? {
          'control-height': '2rem',
          'surface-padding': '0.75rem',
        }
      : {
          'control-height': '2.5rem',
          'surface-padding': '1.25rem',
        };
  const tokens: Record<string, string> = {
    ...status,
    ...accent,
    ...densityPad,
  };
  if (preference.contrast === 'high') {
    tokens.foreground = scheme === 'dark' ? '0 0% 100%' : '233 45% 8%';
  }

  return {
    contractVersion: 1,
    scheme,
    accentId,
    density: preference.density,
    contrast: preference.contrast,
    tokens,
  };
}

export function applyResolvedTheme(
  element: HTMLElement,
  theme: ResolvedTheme,
): void {
  element.classList.toggle('dark', theme.scheme === 'dark');
  element.dataset.nebulaTheme = theme.scheme;
  element.dataset.nebulaDensity = theme.density;
  element.dataset.nebulaContrast = theme.contrast;
  for (const [name, value] of Object.entries(theme.tokens)) {
    element.style.setProperty(`--${name}`, value);
  }
}
