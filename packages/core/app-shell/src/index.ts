/**
 * Shared Web/Electron shell protocol: window manifest, embed messaging,
 * event bus, auth session, and host bridges.
 *
 * Do not add UI assembly, overlay, style/density contract, or editor host
 * here. Those live in `nebula-assembly` and are wired at apps boot.
 */

export {
  GENERATED_DISPLAY_ORDER,
  GENERATED_MODAL_RENDERERS,
  GENERATED_WINDOWS,
} from './common/_generated-windows';
export {
  persistActiveViewPreference,
  persistShellSurfacePreference,
  readActiveViewPreference,
  readShellSurfacePreference,
  SHELL_SURFACE_INTEGRATION,
  SHELL_SURFACE_WORKSPACE,
} from './common/activeViewPreference';
export type { ShellSurfacePreference } from './common/activeViewPreference';
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
} from './common/layoutHost';
export type { LayoutHostMode, ShellEmbedSurface } from './common/layoutHost';
export {
  getPresentationHost,
  isWebPresentationHost,
  isWebShellHost,
  markWebPresentationHost,
  markWebShellHost,
} from './common/presentationHost';
export type { PresentationHostKind } from './common/presentationHost';
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
} from './common/shellEmbedMessaging';
export type {
  ShellEmbedNavigatePayload,
  ShellEmbedPageMetaPayload,
  ShellEmbedResetAckPayload,
  ShellEmbedResetPayload,
} from './common/shellEmbedMessaging';
export {
  createEventBus,
  resolveShellEventBus,
  wireShellEventBus,
} from './common/shellEventBus';
export type {
  ShellEventBus,
  ShellEventMap,
  WireShellEventBusOptions,
} from './common/shellEventBus';
export {
  getShellHostBridge,
  type ShellHostBridge,
  type ShellHostKind,
} from './common/shellHostBridge';
export { SHELL_ACTIVE_VIEW_STORAGE_KEY } from './common/shellHostStorageKeys';
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
  WEB_SHELL_EMBED_QUERY,
} from './common/shellPresentationConfig';
export type {
  ElectronEmbeddedPresentation,
  EmbeddedShellWindowId,
  GeneratedModalRendererEntry,
  GeneratedWindowEntry,
  ShellWindowId,
} from './common/shellPresentationConfig';
export { installShellIframeElectronBridge } from './electron/installShellIframeElectronBridge';
export { installWebPresentation } from './web/installWebPresentation';
export type { InstallWebPresentationOptions } from './web/installWebPresentation';
export {
  clearWebAuthSession,
  getWebShellEmbedSurface,
  handleShellAuthUnauthorized,
  hasValidShellAuthSession,
  isSafeAuthReturnUrl,
  isShellIframeEmbed,
  isSurfaceEmbed,
  isSurfaceIframeEmbed,
  readParentShellAuthSession,
  readWebAuthSession,
  redirectShellToWebLogin,
  SHELL_AUTH_SESSION_KEY,
  SHELL_AUTH_UNAUTHORIZED_EVENT,
  shouldRedirectUnauthenticatedWebShell,
  writeWebAuthSession,
} from './web/webAuth';
export type { ShellAuthSessionPayload } from './web/webAuth';
export {
  completeLoginWithOrg,
  fetchAuthMode,
  loginWithBackendAuth,
} from '@nebula-studio/auth-provider/backend';
export type {
  AuthMode,
  BackendLoginResult,
  OrgSummary as BackendOrgSummary,
  OrgSummary,
} from '@nebula-studio/auth-provider/backend';
