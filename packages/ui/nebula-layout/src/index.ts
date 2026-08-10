import './styles/layout-tokens.css';
import './styles/layout-transitions.css';
import './styles/layout-chrome.css';
import './styles/layout-experience.css';

export { default as NebulaAdminContent } from './components/admin/NebulaAdminContent.vue';
export { default as NebulaAdminLayout } from './components/admin/NebulaAdminLayout.vue';
export { default as NebulaAdminSubNav } from './components/admin/NebulaAdminSubNav.vue';
export { default as NebulaAdminVerticalNav } from './components/admin/NebulaAdminVerticalNav.vue';
export { default as NebulaAuthLayout } from './components/auth/NebulaAuthLayout.vue';
export { default as NebulaBreadcrumb } from './components/chrome/NebulaBreadcrumb.vue';
export { default as NebulaUserMenu } from './components/chrome/NebulaUserMenu.vue';
export { default as NebulaPreferencesDrawer } from './components/preferences/NebulaPreferencesDrawer.vue';
export { default as NebulaShellHeader } from './components/shell/NebulaShellHeader.vue';
export { default as NebulaShellLayout } from './components/shell/NebulaShellLayout.vue';
export { default as NebulaShellTagsBar } from './components/shell/NebulaShellTagsBar.vue';
export { default as NebulaSurfaceLayout } from './components/surfaces/NebulaSurfaceLayout.vue';
export {
  NebulaDocsLayout,
  NebulaPortalLayout,
  NebulaProviderLayout,
  NebulaSettingsLayout,
} from './components/surfaces/surfaceLayouts';

export {
  tryUseLayoutContext,
  useLayoutContext,
} from './composables/useLayoutContext';
export { useLayoutPreferences } from './composables/useLayoutPreferences';
export { useShellHosted } from './composables/useShellHosted';

export type {
  AccentPreset,
  BreadcrumbSegment,
  ContentWidth,
  ExperienceDensity,
  ExperiencePageMeta,
  ExperienceSurface,
  LayoutPreferences,
  NavChild,
  NavItem,
  NebulaThemeMode,
  ShellTagItem,
  SubNavItem,
  ThemePreferenceMode,
} from './types/layout';
export {
  ACCENT_PRESETS,
  DEFAULT_LAYOUT_PREFERENCES,
  defineExperiencePageMeta,
} from './types/layout';
