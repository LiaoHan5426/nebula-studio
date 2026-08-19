import './styles/assembly.css';

export { default as NebulaOverlayRoot } from './components/NebulaOverlayRoot.vue';
export { wrapWithAssemblyRoot } from './components/wrapWithAssemblyRoot';
export {
  createDefaultAssemblyContext,
  createNebulaComponentContext,
} from './context/createNebulaComponentContext';
export {
  tryUseEditorHost,
  tryUseNebulaAssembly,
  useEditorHost,
  useNebulaAssembly,
} from './context/useNebulaAssembly';
export { createEditorHost } from './editor/createEditorHost';
export {
  createElectronHostAdapter,
  createHostAdapter,
  createStandaloneHostAdapter,
  createWebHostAdapter,
} from './host/createHostAdapters';
export {
  installNebulaAssembly,
  provideNebulaAssembly,
} from './install/installNebulaAssembly';

export { installNebulaAssemblyFromMode } from './install/installNebulaAssemblyFromMode';
export { createOverlayService } from './overlay/createOverlayService';
export {
  applyStyleContract,
  clearStyleContract,
} from './style/applyStyleContract';
export type {
  CreateNebulaComponentContextOptions,
  InstallNebulaAssemblyFromModeOptions,
  InstallNebulaAssemblyOptions,
  NebulaAssemblyContext,
  RuntimeModeLike,
} from './types/context';
export { nebulaAssemblyKey } from './types/context';
export type {
  EditorDiagnosticMessage,
  EditorHost,
  EditorHostConfigureInput,
  EditorResourceSelection,
  EditorSize,
  EditorTheme,
} from './types/editor';
export type {
  HostAdapter,
  NebulaHostCapabilitiesInput,
  NebulaHostSurface,
} from './types/host';
export type { ConfirmOverlayState, OverlayService } from './types/overlay';
export { overlayContainerKey } from './types/overlay';
export type {
  NebulaDensity,
  NebulaThemeMode,
  StyleContract,
} from './types/style';
