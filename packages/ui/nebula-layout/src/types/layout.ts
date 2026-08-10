export type NebulaThemeMode = 'dark' | 'light';

export type ThemePreferenceMode = 'system' | NebulaThemeMode;

export type ExperienceSurface =
  | 'admin'
  | 'auth'
  | 'docs'
  | 'portal'
  | 'provider'
  | 'settings'
  | 'shell';

export type ExperienceDensity = 'comfortable' | 'compact';

export type ContentWidth = 'full' | 'reading' | 'standard' | 'wide';

export type ExperiencePageMeta = Record<PropertyKey, unknown> & {
  density: ExperienceDensity;
  description?: string;
  helpKey: string;
  keywords?: readonly string[];
  returnTo?: string;
  roles?: readonly string[];
  surface: ExperienceSurface;
  title: string;
};

export function defineExperiencePageMeta(
  meta: ExperiencePageMeta,
): ExperiencePageMeta {
  return meta;
}

export interface SubNavItem {
  key: string;
  label: string;
  to: string;
}

export interface NavChild {
  label: string;
  to: string;
}

export interface NavItem {
  children?: NavChild[];
  icon?: string;
  key: string;
  label: string;
  to?: string;
}

export interface LayoutPreferences {
  accentPreset: string;
  collapsed: boolean;
  contentCompact: boolean;
  expandOnHover: boolean;
  pinned: boolean;
  showBreadcrumb: boolean;
  showTagsBar: boolean;
  themeMode: ThemePreferenceMode;
  version?: number;
}

export const DEFAULT_LAYOUT_PREFERENCES: LayoutPreferences = {
  version: 3,
  collapsed: true,
  pinned: false,
  expandOnHover: true,
  showTagsBar: true,
  showBreadcrumb: true,
  contentCompact: false,
  themeMode: 'dark',
  accentPreset: 'default',
};

export interface BreadcrumbSegment {
  icon?: 'file' | 'folder' | 'home' | 'integration' | 'settings';
  key?: string;
  label: string;
  to?: string;
}

export interface ShellTagItem {
  closable?: boolean;
  icon?: 'home';
  key: string;
  label: string;
}

export interface AccentPreset {
  id: string;
  label: string;
  primary: string;
}

export const ACCENT_PRESETS: AccentPreset[] = [
  { id: 'default', label: '默认', primary: '217 91% 60%' },
  { id: 'violet', label: '紫罗兰', primary: '262 83% 58%' },
  { id: 'pink', label: '樱花粉', primary: '330 81% 60%' },
  { id: 'yellow', label: '柠檬黄', primary: '45 93% 47%' },
  { id: 'sky', label: '天蓝色', primary: '199 89% 48%' },
  { id: 'green', label: '浅绿色', primary: '142 71% 45%' },
  { id: 'zinc', label: '锌色灰', primary: '240 5% 65%' },
  { id: 'blue-dark', label: '深蓝色', primary: '224 76% 48%' },
];
