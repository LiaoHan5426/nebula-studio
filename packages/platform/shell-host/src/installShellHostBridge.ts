import type {
  ShellHostBridge,
  ShellHostKind,
} from '@nebula-studio/shell-protocol';

import { setShellHostBridge } from '@nebula-studio/shell-protocol';

import { createElectronShellHostBridge } from './electron/electronShellHostBridge';
import { createWebShellHostBridge } from './web/webShellHostBridge';

export type { ShellHostBridge, ShellHostKind };

export {
  getShellHostBridge,
  setShellHostBridge,
} from '@nebula-studio/shell-protocol';

type HostRuntimeMode = 'electron' | 'platform-embed' | 'standalone';

/**
 * Composition-root install: Web vs Electron adapters live in shell-host,
 * not app-shell. Host / standalone boot chooses which one is active.
 */
export function installShellHostBridge(mode: HostRuntimeMode): void {
  setShellHostBridge(
    mode === 'electron'
      ? createElectronShellHostBridge()
      : createWebShellHostBridge(),
  );
}
