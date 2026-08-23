import type { RuntimeMode } from './runtimeMode';

import { requireRuntimeMode } from './runtimeMode';

let resolved: RuntimeMode | undefined;

/**
 * Record the mode chosen at boot. Pages and routers must read this snapshot.
 */
export function setResolvedRuntimeMode(mode: RuntimeMode): void {
  resolved = mode;
  if (typeof window !== 'undefined') {
    window.__NEBULA_RUNTIME_MODE__ = mode;
  }
}

/** Mode last stamped by application bootstrap or `window.__NEBULA_RUNTIME_MODE__`. */
export function getResolvedRuntimeMode(): RuntimeMode {
  if (resolved) {
    return resolved;
  }
  resolved = requireRuntimeMode();
  return resolved;
}

/** @internal */
export function __resetResolvedRuntimeModeForTests(): void {
  resolved = undefined;
  if (typeof window !== 'undefined') {
    delete window.__NEBULA_RUNTIME_MODE__;
  }
}
