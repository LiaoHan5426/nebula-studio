/**
 * @nebula-studio/nebula-shell
 *
 * Plan-11: 从 `frontend/App.vue` 拆出的 Shell 层组件与 composable。
 * 提供布局骨架、iframe 嵌入管理、认证等待等能力。
 */

// Components
export { default as OrgSwitcher } from './components/OrgSwitcher.vue';
export type { OrgOption } from './components/OrgSwitcher.vue';

export { default as IframeHost } from './components/IframeHost.vue';

export { default as AppDock } from './components/AppDock.vue';

export { default as PersonalWorkspace } from './components/PersonalWorkspace.vue';

export { default as GlobalCommandPalette } from './components/GlobalCommandPalette.vue';

export { default as ShellRecoveryState } from './components/ShellRecoveryState.vue';
export type { ShellRecoveryKind } from './components/ShellRecoveryState.vue';

export { default as NotificationCenter } from './components/NotificationCenter.vue';
export type { ShellNotification } from './components/NotificationCenter.vue';

export type {
  GlobalSearchItem,
  GlobalSearchKind,
  WorkspaceLink,
  WorkspaceModel,
  WorkspaceSummary,
} from './types/workspace.js';

// Composables
export { useShellAuthWaiter } from './composables/useShellAuthWaiter.js';
export type { ShellAuthWaiterOptions } from './composables/useShellAuthWaiter.js';

export { useEmbeddedViews } from './composables/useEmbeddedViews.js';
export type { EmbeddedViewsOptions } from './composables/useEmbeddedViews.js';

export { useAppIntegration } from './composables/useAppIntegration.js';
export type { UseAppIntegrationOptions } from './composables/useAppIntegration.js';

export { useAppLifecycle } from './composables/useAppLifecycle.js';
export type {
  UseAppLifecycleOptions,
  ThemeMode,
  AppMode,
} from './composables/useAppLifecycle.js';
