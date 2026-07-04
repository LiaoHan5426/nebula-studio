export type NebulaThemeMode = 'light' | 'dark';

export type ThemePreferenceMode = NebulaThemeMode | 'system';

export interface SubNavItem {
  key: string;
  label: string;
  to: string;
}

export interface NavChild {
  to: string;
  label: string;
}

export interface NavItem {
  key: string;
  label: string;
  icon?: string;
  to?: string;
  children?: NavChild[];
}

export interface LayoutPreferences {
  version?: number;
  collapsed: boolean;
  pinned: boolean;
  expandOnHover: boolean;
  showTagsBar: boolean;
  showBreadcrumb: boolean;
  contentCompact: boolean;
  themeMode: ThemePreferenceMode;
  accentPreset: string;
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
  key?: string;
  label: string;
  icon?: 'home' | 'folder' | 'file' | 'settings' | 'integration';
  to?: string;
}

export interface ShellTagItem {
  key: string;
  label: string;
  icon?: 'home';
  closable?: boolean;
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
