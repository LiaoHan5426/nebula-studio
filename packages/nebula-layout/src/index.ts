import './styles/layout-tokens.css';
import './styles/layout-transitions.css';
import './styles/layout-chrome.css';

export { default as NebulaShellLayout } from './components/shell/NebulaShellLayout.vue';
export { default as NebulaShellHeader } from './components/shell/NebulaShellHeader.vue';
export { default as NebulaShellTagsBar } from './components/shell/NebulaShellTagsBar.vue';
export { default as NebulaBreadcrumb } from './components/chrome/NebulaBreadcrumb.vue';
export { default as NebulaUserMenu } from './components/chrome/NebulaUserMenu.vue';
export { default as NebulaPreferencesDrawer } from './components/preferences/NebulaPreferencesDrawer.vue';
export { default as NebulaAdminLayout } from './components/admin/NebulaAdminLayout.vue';
export { default as NebulaAdminContent } from './components/admin/NebulaAdminContent.vue';
export { default as NebulaAdminSubNav } from './components/admin/NebulaAdminSubNav.vue';

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
  ThemePreferenceMode,
  SubNavItem,
} from './types/layout';
export { DEFAULT_LAYOUT_PREFERENCES, ACCENT_PRESETS } from './types/layout';
