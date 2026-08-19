import type {
  CreateNebulaComponentContextOptions,
  NebulaAssemblyContext,
} from '../types/context';

import { createEditorHost } from '../editor/createEditorHost';
import { createHostAdapter } from '../host/createHostAdapters';
import { createOverlayService } from '../overlay/createOverlayService';

export function createNebulaComponentContext(
  options: CreateNebulaComponentContextOptions,
): NebulaAssemblyContext {
  return {
    host: options.host,
    style: options.style ?? {},
    overlay: options.overlay ?? createOverlayService(),
    editor: options.editor ?? createEditorHost(),
    mountRoot: options.mountRoot ?? null,
  };
}

export function createDefaultAssemblyContext(
  hostCapabilities: import('../types/host').NebulaHostCapabilitiesInput,
  partial?: Omit<CreateNebulaComponentContextOptions, 'host'>,
): NebulaAssemblyContext {
  return createNebulaComponentContext({
    host: createHostAdapter(hostCapabilities),
    ...partial,
  });
}
