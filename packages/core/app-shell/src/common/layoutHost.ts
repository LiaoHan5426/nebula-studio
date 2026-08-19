import { getWebShellEmbedSurface, isShellIframeEmbed } from '../web/webAuth';

export type LayoutHostMode = 'shell-hosted' | 'standalone';

export type ShellEmbedSurface = 'docs' | 'integration' | 'login' | 'settings';

export const LAYOUT_PREFERENCES_STORAGE_KEY = 'nebula-layout-preferences';

const SHELL_HOSTED_SURFACES = new Set<string>([
  'docs',
  'integration',
  'settings',
]);

export function isShellEmbedSurface(
  surface: null | string | undefined,
): surface is ShellEmbedSurface {
  return (
    surface === 'settings' ||
    surface === 'integration' ||
    surface === 'docs' ||
    surface === 'login'
  );
}

/**
 * Map boot runtime mode to layout hosting. `platform-embed` is the only
 * shell-hosted surface; Electron/standalone windows are standalone.
 */
export function layoutHostModeFromRuntimeMode(
  mode: 'electron' | 'platform-embed' | 'standalone',
): LayoutHostMode {
  return mode === 'platform-embed' ? 'shell-hosted' : 'standalone';
}

function layoutHostModeFromEmbedSurface(
  surface: null | string | undefined,
): LayoutHostMode {
  if (!surface || surface === 'login') return 'standalone';
  if (SHELL_HOSTED_SURFACES.has(surface) && isShellIframeEmbed()) {
    return 'shell-hosted';
  }
  return 'standalone';
}

/**
 * Compatibility facade for layout storage keys and `useShellHosted` fallback.
 *
 * Prefer assembly `host.surface` (via `useShellHosted`) when Vue context exists.
 * This helper must not grow overlay/theme/editor-host logic — those live in
 * `nebula-assembly`. Host detection order:
 * 1. Explicit `embedSurface` argument (tests / callers)
 * 2. Boot-stamped `window.__NEBULA_RUNTIME_MODE__`
 * 3. Legacy iframe + embed-query heuristic
 */
export function getLayoutHostMode(
  embedSurface?: null | string,
): LayoutHostMode {
  if (embedSurface !== undefined) {
    return layoutHostModeFromEmbedSurface(embedSurface);
  }

  const injected =
    typeof window !== 'undefined' ? window.__NEBULA_RUNTIME_MODE__ : undefined;
  if (
    injected === 'platform-embed' ||
    injected === 'electron' ||
    injected === 'standalone'
  ) {
    return layoutHostModeFromRuntimeMode(injected);
  }

  return layoutHostModeFromEmbedSurface(
    typeof window !== 'undefined' ? getWebShellEmbedSurface() : null,
  );
}
