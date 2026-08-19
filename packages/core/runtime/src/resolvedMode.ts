import type { RuntimeMode } from './detectMode';

import { detectRuntimeMode } from './detectMode';

let resolved: RuntimeMode | undefined;

/**
 * Record the mode chosen at boot. Pages and routers must read this snapshot
 * instead of calling `detectRuntimeMode()` again.
 */
export function setResolvedRuntimeMode(mode: RuntimeMode): void {
  resolved = mode;
  if (typeof window !== 'undefined') {
    window.__NEBULA_RUNTIME_MODE__ = mode;
  }
}

/** Mode last stamped by `bootMicroApp`, falling back to detection before boot. */
export function getResolvedRuntimeMode(): RuntimeMode {
  return resolved ?? detectRuntimeMode();
}

/** @internal */
export function __resetResolvedRuntimeModeForTests(): void {
  resolved = undefined;
  if (typeof window !== 'undefined') {
    delete window.__NEBULA_RUNTIME_MODE__;
  }
}
