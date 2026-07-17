export {
  shellPresentationConfig,
  modalRenderersConfig,
  displayOrderConfig,
  getEmbeddedShellWindowIds,
  isElectronIframeEmbedPresentation,
  WEB_SHELL_EMBED_QUERY,
} from './common/shellPresentationConfig';
export type {
  ShellWindowId,
  EmbeddedShellWindowId,
  ElectronEmbeddedPresentation,
  GeneratedWindowEntry,
  GeneratedModalRendererEntry,
} from './common/shellPresentationConfig';
export {
  GENERATED_WINDOWS,
  GENERATED_DISPLAY_ORDER,
  GENERATED_MODAL_RENDERERS,
} from './common/_generated-windows';
export { installShellIframeElectronBridge } from './electron/installShellIframeElectronBridge';
export {
  getPresentationHost,
  isWebPresentationHost,
  isWebShellHost,
  markWebPresentationHost,
  markWebShellHost,
} from './common/presentationHost';
export type { PresentationHostKind } from './common/presentationHost';
export { installWebPresentation } from './web/installWebPresentation';
export type { InstallWebPresentationOptions } from './web/installWebPresentation';
export {
  registerShellIntegratedApp,
  registerShellIntegratedApps,
  setShellIntegrableOrder,
  getShellIntegratedAppRegistry,
  getShellIntegratedAppMeta,
  tryGetShellIntegratedAppMeta,
  getDefaultEnabledShellIntegrableIds,
  isShellIntegrableAppId,
  isShellIntegratableAppId,
  isShellStandaloneSidebarApp,
  listShellIntegrableAppIds,
  embeddedViewRequiresShellAuth,
} from './common/shellIntegration';
export type { ShellIntegratedAppMeta } from './common/shellIntegration';
export {
  SHELL_AUTH_SESSION_KEY,
  clearWebAuthSession,
  getWebShellEmbedSurface,
  isSafeAuthReturnUrl,
  readWebAuthSession,
  redirectShellToWebLogin,
  shouldRedirectUnauthenticatedWebShell,
  writeWebAuthSession,
  hasValidShellAuthSession,
  isShellIframeEmbed,
  readParentShellAuthSession,
  handleShellAuthUnauthorized,
  isSurfaceEmbed,
  isSurfaceIframeEmbed,
  SHELL_AUTH_UNAUTHORIZED_EVENT,
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
  OrgSummary,
  OrgSummary as BackendOrgSummary,
} from '@nebula-studio/auth-provider/backend';
export { SHELL_ACTIVE_VIEW_STORAGE_KEY } from './common/shellHostStorageKeys';
export {
  readActiveViewPreference,
  persistActiveViewPreference,
  readShellSurfacePreference,
  persistShellSurfacePreference,
  SHELL_SURFACE_WORKSPACE,
  SHELL_SURFACE_INTEGRATION,
} from './common/activeViewPreference';
export type { ShellSurfacePreference } from './common/activeViewPreference';
export {
  SHELL_EMBED_RESET_MESSAGE,
  SHELL_EMBED_RESET_ACK_MESSAGE,
  createShellEmbedResetPayload,
  createShellEmbedResetAckPayload,
  installShellEmbedResetListener,
  isShellEmbedResetPayload,
  isShellEmbedResetAckPayload,
  postShellEmbedReset,
} from './common/shellEmbedMessaging';
export type {
  ShellEmbedResetPayload,
  ShellEmbedResetAckPayload,
} from './common/shellEmbedMessaging';
export {
  getShellHostBridge,
  type ShellHostBridge,
  type ShellHostKind,
} from './common/shellHostBridge';
export {
  LAYOUT_PREFERENCES_STORAGE_KEY,
  getLayoutHostMode,
  isShellEmbedSurface,
} from './common/layoutHost';
export type { LayoutHostMode, ShellEmbedSurface } from './common/layoutHost';
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
