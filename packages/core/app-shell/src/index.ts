/**
 * Shell runtime SDK: generated window config, auth session helpers,
 * integration registry, and protocol re-exports.
 *
 * Web/Electron composition-root adapters live in `@nebula-studio/shell-host`.
 * Host-agnostic embed messaging / event bus / presentation marks live in
 * `@nebula-studio/shell-protocol` and are re-exported here for compatibility.
 * Do not add UI assembly, overlay, or editor host here.
 */

export {
  GENERATED_DISPLAY_ORDER,
  GENERATED_MODAL_RENDERERS,
  GENERATED_STANDALONE_APPS,
  GENERATED_WINDOWS,
} from './common/_generated-windows';
export {
  persistActiveViewPreference,
  persistShellSurfacePreference,
  readActiveViewPreference,
  readShellSurfacePreference,
  SHELL_SURFACE_INTEGRATION,
  SHELL_SURFACE_WORKSPACE,
} from '@nebula-studio/shell-protocol';
export type { ShellSurfacePreference } from '@nebula-studio/shell-protocol';
export {
  HELP_TOPICS,
  readTaskGuideState,
  resolveHelpTopic,
  TASK_GUIDE_STORAGE_KEY,
  TASK_GUIDES,
  writeTaskGuideState,
} from './common/helpCenter';
export type { HelpTopic, TaskGuide, TaskGuideId } from './common/helpCenter';
export {
  getLayoutHostMode,
  isShellEmbedSurface,
  LAYOUT_PREFERENCES_STORAGE_KEY,
  layoutHostModeFromRuntimeMode,
} from '@nebula-studio/shell-protocol';
export type {
  LayoutHostMode,
  ShellEmbedSurface,
} from '@nebula-studio/shell-protocol';
export {
  getPresentationHost,
  isWebPresentationHost,
  isWebShellHost,
  markWebPresentationHost,
  markWebShellHost,
} from '@nebula-studio/shell-protocol';
export type { PresentationHostKind } from '@nebula-studio/shell-protocol';
export {
  createShellEmbedResetAckPayload,
  createShellEmbedResetPayload,
  installShellEmbedNavigationListener,
  installShellEmbedResetListener,
  isShellEmbedNavigatePayload,
  isShellEmbedPageMetaPayload,
  isShellEmbedResetAckPayload,
  isShellEmbedResetPayload,
  postShellEmbedNavigate,
  postShellEmbedPageMeta,
  postShellEmbedReset,
  SHELL_EMBED_NAVIGATE_MESSAGE,
  SHELL_EMBED_PAGE_META_MESSAGE,
  SHELL_EMBED_RESET_ACK_MESSAGE,
  SHELL_EMBED_RESET_MESSAGE,
} from '@nebula-studio/shell-protocol';
export type {
  ShellEmbedNavigatePayload,
  ShellEmbedPageMetaPayload,
  ShellEmbedResetAckPayload,
  ShellEmbedResetPayload,
} from '@nebula-studio/shell-protocol';
export {
  createEventBus,
  resolveShellEventBus,
  wireShellEventBus,
} from '@nebula-studio/shell-protocol';
export type {
  ShellEventBus,
  ShellEventMap,
  WireShellEventBusOptions,
} from '@nebula-studio/shell-protocol';
export {
  getShellHostBridge,
  type ShellHostBridge,
  type ShellHostKind,
} from '@nebula-studio/shell-protocol';
export { SHELL_ACTIVE_VIEW_STORAGE_KEY } from '@nebula-studio/shell-protocol';
export {
  embeddedViewRequiresShellAuth,
  getDefaultEnabledShellIntegrableIds,
  getShellIntegratedAppMeta,
  getShellIntegratedAppRegistry,
  isShellIntegrableAppId,
  isShellIntegratableAppId,
  isShellStandaloneSidebarApp,
  listShellIntegrableAppIds,
  registerShellIntegratedApp,
  registerShellIntegratedApps,
  resetShellIntegratedAppRegistry,
  setShellIntegrableOrder,
  tryGetShellIntegratedAppMeta,
} from './common/shellIntegration';
export type { ShellIntegratedAppMeta } from './common/shellIntegration';
export {
  displayOrderConfig,
  getEmbeddedShellWindowIds,
  isElectronIframeEmbedPresentation,
  modalRenderersConfig,
  shellPresentationConfig,
} from './common/shellPresentationConfig';
export { WEB_SHELL_EMBED_QUERY } from '@nebula-studio/shell-protocol';
export type {
  ElectronEmbeddedPresentation,
  EmbeddedShellWindowId,
  GeneratedModalRendererEntry,
  GeneratedWindowEntry,
  ShellWindowId,
} from './common/shellPresentationConfig';
export {
  getWebShellEmbedSurface,
  isShellIframeEmbed,
  isSurfaceEmbed,
  isSurfaceIframeEmbed,
} from '@nebula-studio/shell-protocol';
export {
  buildWebShellLoginHref,
  handleShellAuthUnauthorized,
  isSafeAuthReturnUrl,
  readParentShellAuthSession,
  redirectShellToWebLogin,
  SHELL_AUTH_UNAUTHORIZED_EVENT,
  shouldRedirectUnauthenticatedWebShell,
} from '@nebula-studio/auth-provider/web';
export {
  clearWebAuthSession,
  hasValidShellAuthSession,
  readWebAuthSession,
  SHELL_AUTH_SESSION_KEY,
  writeWebAuthSession,
} from '@nebula-studio/auth-provider/storage';
export type { ShellAuthSessionPayload } from '@nebula-studio/auth-provider/storage';
