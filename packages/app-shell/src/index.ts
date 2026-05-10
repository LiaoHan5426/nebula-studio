export {
  shellPresentationConfig,
  getEmbeddedShellWindowIds,
  WEB_SHELL_EMBED_QUERY,
} from './shellPresentationConfig';
export type {
  ShellWindowId,
  EmbeddedShellWindowId,
} from './shellPresentationConfig';
export {
  getPresentationHost,
  isWebPresentationHost,
  markWebPresentationHost,
} from './presentationHost';
export type { PresentationHostKind } from './presentationHost';
export { installWebPresentation } from './installWebPresentation';
export type { InstallWebPresentationOptions } from './installWebPresentation';
export {
  shellIntegratedAppRegistry,
  getShellIntegratedAppMeta,
  getDefaultEnabledShellIntegratableIds,
  isShellIntegratableAppId,
  listShellIntegratableAppIds,
} from './shellIntegration';
export type { ShellIntegratedAppMeta } from './shellIntegration';
export {
  SHELL_AUTH_SESSION_KEY,
  clearWebAuthSession,
  getWebShellEmbedSurface,
  isSafeAuthReturnUrl,
  readWebAuthSession,
  redirectShellToWebLogin,
  shouldRedirectUnauthenticatedWebShell,
  writeWebAuthSession,
} from './webAuth';
export type { ShellAuthSessionPayload } from './webAuth';
