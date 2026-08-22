/**
 * @nebula-studio/nebula-shell
 *
 * Product Shell container: workspace chrome, iframe host, app lifecycle.
 * Embed messaging, window manifest, and host bridges stay in `app-shell`.
 * Overlay / style / editor-host assembly stays in `nebula-assembly`.
 */

export { default as AppDock } from './components/AppDock.vue';
export { default as GlobalCommandPalette } from './components/GlobalCommandPalette.vue';

export { default as IframeHost } from './components/IframeHost.vue';

export { default as NotificationCenter } from './components/NotificationCenter.vue';

export type { ShellNotification } from './components/NotificationCenter.vue';

// Components
export { default as OrgSwitcher } from './components/OrgSwitcher.vue';

export type { OrgOption } from './components/OrgSwitcher.vue';
export { default as PersonalWorkspace } from './components/PersonalWorkspace.vue';

export { default as ShellRecoveryState } from './components/ShellRecoveryState.vue';
export type { ShellRecoveryKind } from './components/ShellRecoveryState.vue';

export { useAppIntegration } from './composables/useAppIntegration.js';

export type { UseAppIntegrationOptions } from './composables/useAppIntegration.js';
export { useAppLifecycle } from './composables/useAppLifecycle.js';

export type {
  AppMode,
  ThemeMode,
  UseAppLifecycleOptions,
} from './composables/useAppLifecycle.js';
export { useEmbeddedViews } from './composables/useEmbeddedViews.js';

export type { EmbeddedViewsOptions } from './composables/useEmbeddedViews.js';
// Composables
export { useShellAuthWaiter } from './composables/useShellAuthWaiter.js';

export type { ShellAuthWaiterOptions } from './composables/useShellAuthWaiter.js';
export type {
  GlobalSearchItem,
  GlobalSearchKind,
  WorkspaceLink,
  WorkspaceModel,
  WorkspaceSummary,
} from './types/workspace.js';
