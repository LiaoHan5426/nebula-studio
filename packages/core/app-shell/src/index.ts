/**
 * Shell runtime SDK: generated window config, help center, and integration registry.
 *
 * Web/Electron composition-root adapters live in `@nebula-studio/shell-host`.
 * Embed messaging / event bus / presentation marks live in `@nebula-studio/shell-protocol`.
 * Auth session helpers live in `@nebula-studio/auth-provider`.
 * Do not re-export those packages from here.
 */

export {
  GENERATED_DISPLAY_ORDER,
  GENERATED_MODAL_RENDERERS,
  GENERATED_STANDALONE_APPS,
  GENERATED_WINDOWS,
} from './common/_generated-windows';
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
  bootstrapShellChromeIntegratedApps,
  buildShellChromeIntegratedAppMetas,
  SHELL_CHROME_CATALOG,
  SHELL_INTEGRABLE_DISPLAY_ORDER,
} from './common/shellChromeCatalog';
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
export type {
  ElectronEmbeddedPresentation,
  EmbeddedShellWindowId,
  GeneratedModalRendererEntry,
  GeneratedWindowEntry,
  ShellWindowId,
} from './common/shellPresentationConfig';
