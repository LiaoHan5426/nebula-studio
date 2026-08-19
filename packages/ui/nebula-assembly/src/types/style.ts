export type NebulaThemeMode = 'dark' | 'light' | 'system';
export type NebulaDensity = 'comfortable' | 'compact';

export interface StyleContract {
  density?: NebulaDensity;
  namespace?: string;
  theme?: NebulaThemeMode;
}

export const STYLE_CONTRACT_ATTR = 'data-nebula-assembly';
export const STYLE_THEME_ATTR = 'data-nebula-theme';
export const STYLE_DENSITY_ATTR = 'data-nebula-density';
export const STYLE_NAMESPACE_ATTR = 'data-nebula-namespace';
