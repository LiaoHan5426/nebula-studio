import './styles/layout-tokens.css';
import './styles/layout-transitions.css';
import './styles/layout-chrome.css';
import './styles/layout-experience.css';

export { default as NebulaShellLayout } from './components/shell/NebulaShellLayout.vue';
export { default as NebulaShellHeader } from './components/shell/NebulaShellHeader.vue';
export { default as NebulaShellTagsBar } from './components/shell/NebulaShellTagsBar.vue';
export { default as NebulaBreadcrumb } from './components/chrome/NebulaBreadcrumb.vue';
export { default as NebulaUserMenu } from './components/chrome/NebulaUserMenu.vue';
export { default as NebulaPreferencesDrawer } from './components/preferences/NebulaPreferencesDrawer.vue';
export { default as NebulaAdminLayout } from './components/admin/NebulaAdminLayout.vue';
export { default as NebulaAdminContent } from './components/admin/NebulaAdminContent.vue';
export { default as NebulaAdminSubNav } from './components/admin/NebulaAdminSubNav.vue';
export { default as NebulaAdminVerticalNav } from './components/admin/NebulaAdminVerticalNav.vue';
export { default as NebulaSurfaceLayout } from './components/surfaces/NebulaSurfaceLayout.vue';
export {
  NebulaPortalLayout,
  NebulaProviderLayout,
  NebulaSettingsLayout,
  NebulaDocsLayout,
} from './components/surfaces/surfaceLayouts';
export { default as NebulaAuthLayout } from './components/auth/NebulaAuthLayout.vue';

export { useLayoutPreferences } from './composables/useLayoutPreferences';
export {
  useLayoutContext,
  tryUseLayoutContext,
} from './composables/useLayoutContext';
export { useShellHosted } from './composables/useShellHosted';

export type {
  LayoutPreferences,
  BreadcrumbSegment,
  ShellTagItem,
  AccentPreset,
  NebulaThemeMode,
  ThemePreferenceMode,
  SubNavItem,
  NavItem,
  NavChild,
  ExperienceDensity,
  ExperiencePageMeta,
  ExperienceSurface,
  ContentWidth,
} from './types/layout';
export {
  DEFAULT_LAYOUT_PREFERENCES,
  ACCENT_PRESETS,
  defineExperiencePageMeta,
} from './types/layout';
