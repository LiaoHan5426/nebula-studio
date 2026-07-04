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
