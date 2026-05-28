export {
  shellPresentationConfig,
  getEmbeddedShellWindowIds,
  WEB_SHELL_EMBED_QUERY,
} from './common/shellPresentationConfig';
export type {
  ShellWindowId,
  EmbeddedShellWindowId,
} from './common/shellPresentationConfig';
export {
  getPresentationHost,
  isWebPresentationHost,
  markWebPresentationHost,
} from './common/presentationHost';
export type { PresentationHostKind } from './common/presentationHost';
export { installWebPresentation } from './web/installWebPresentation';
export type { InstallWebPresentationOptions } from './web/installWebPresentation';
export {
  shellIntegratedAppRegistry,
  getShellIntegratedAppMeta,
  getDefaultEnabledShellIntegrableIds,
  isShellIntegrableAppId,
  listShellIntegrableAppIds,
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
} from './web/webAuth';
export type { ShellAuthSessionPayload } from './web/webAuth';
export { SHELL_ACTIVE_VIEW_STORAGE_KEY } from './common/shellHostStorageKeys';
export {
  readActiveViewPreference,
  persistActiveViewPreference,
} from './common/activeViewPreference';
export {
  getShellHostBridge,
  type ShellHostBridge,
  type ShellHostKind,
} from './common/shellHostBridge';
