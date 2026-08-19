import type { App, InjectionKey } from 'vue';

import type { EditorHost } from './editor';
import type { HostAdapter } from './host';
import type { OverlayService } from './overlay';
import type { StyleContract } from './style';

export interface NebulaAssemblyContext {
  editor: EditorHost;
  host: HostAdapter;
  mountRoot: HTMLElement | null;
  overlay: OverlayService;
  style: StyleContract;
}

export const nebulaAssemblyKey: InjectionKey<NebulaAssemblyContext> =
  Symbol('nebula-assembly');

export interface CreateNebulaComponentContextOptions {
  editor?: EditorHost;
  host: HostAdapter;
  mountRoot?: HTMLElement | null;
  overlay?: OverlayService;
  style?: StyleContract;
}

export interface InstallNebulaAssemblyOptions extends CreateNebulaComponentContextOptions {
  app: App;
}

export type RuntimeModeLike = 'electron' | 'platform-embed' | 'standalone';

export interface InstallNebulaAssemblyFromModeOptions {
  app: App;
  hostCapabilities: import('./host').NebulaHostCapabilitiesInput;
  mode: RuntimeModeLike;
  mountRoot?: HTMLElement | null;
  style?: StyleContract;
}
