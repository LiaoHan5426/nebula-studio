export type ColorSchemePreference = 'dark' | 'light' | 'system';

export type ThemeDensity = 'comfortable' | 'compact';

export type ThemeContrast = 'high' | 'normal';

export type AccentPreference =
  | { color: string; kind: 'custom' }
  | { id: string; kind: 'preset' };

export interface ThemePreference {
  accent: AccentPreference;
  colorScheme: ColorSchemePreference;
  contrast: ThemeContrast;
  density: ThemeDensity;
}

export interface ResolvedTheme {
  accentId: string;
  contractVersion: 1;
  contrast: ThemeContrast;
  density: ThemeDensity;
  scheme: 'dark' | 'light';
  tokens: Record<string, string>;
}

export const THEME_STORAGE_KEY = 'nebula.theme.v1';

export const PRODUCT_DEFAULT_PREFERENCE: ThemePreference = {
  colorScheme: 'system',
  accent: { kind: 'preset', id: 'nebula-blue' },
  density: 'comfortable',
  contrast: 'normal',
};

/** Organization default is a product constant until a backend API exists. */
export const ORGANIZATION_DEFAULT_PREFERENCE: ThemePreference =
  PRODUCT_DEFAULT_PREFERENCE;

export const ACCENT_PRESETS: Record<string, string> = {
  'nebula-blue': '#4d7cff',
  'nebula-teal': '#0d9488',
  'nebula-violet': '#7c3aed',
};

export const STATUS_TOKENS = {
  light: {
    destructive: '0 76% 56%',
    'destructive-foreground': '0 0% 100%',
    success: '146 62% 41%',
    'success-foreground': '0 0% 100%',
    warning: '40 92% 53%',
    'warning-foreground': '30 70% 14%',
  },
  dark: {
    destructive: '0 72% 58%',
    'destructive-foreground': '0 0% 100%',
    success: '146 55% 48%',
    'success-foreground': '0 0% 100%',
    warning: '40 88% 56%',
    'warning-foreground': '30 80% 12%',
  },
} as const;
