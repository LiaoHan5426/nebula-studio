export type RuntimeMode = 'electron' | 'platform-embed' | 'standalone';

const MODES = new Set<RuntimeMode>([
  'electron',
  'platform-embed',
  'standalone',
]);

function readStampedMode(): RuntimeMode | undefined {
  if (typeof window === 'undefined') return undefined;
  const injected = window.__NEBULA_RUNTIME_MODE__;
  return injected && MODES.has(injected) ? injected : undefined;
}

/**
 * Host / standalone composition roots must pass or stamp a runtime mode.
 * Do not infer Electron vs Web from `window.electron`.
 */
export function requireRuntimeMode(explicit?: RuntimeMode): RuntimeMode {
  if (explicit && MODES.has(explicit)) {
    return explicit;
  }
  const stamped = readStampedMode();
  if (stamped) {
    return stamped;
  }
  throw new Error(
    'Runtime mode must be stamped by Host or standalone main.ts before bootMicroApp.',
  );
}

/**
 * Federation remotes are never standalone. Keep a Host electron stamp;
 * otherwise use platform-embed. Do not sniff `window.electron`.
 */
export function stampFederationRuntimeMode(): RuntimeMode {
  const mode: RuntimeMode =
    readStampedMode() === 'electron' ? 'electron' : 'platform-embed';
  if (typeof window !== 'undefined') {
    window.__NEBULA_RUNTIME_MODE__ = mode;
  }
  return mode;
}
