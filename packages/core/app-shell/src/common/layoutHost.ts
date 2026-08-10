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

/** 子应用在壳层 iframe 内嵌时为 shell-hosted，独立打开为 standalone */
export function getLayoutHostMode(
  embedSurface?: null | string,
): LayoutHostMode {
  const surface =
    embedSurface ??
    (typeof window !== 'undefined' ? getWebShellEmbedSurface() : null);
  if (!surface || surface === 'login') return 'standalone';
  if (SHELL_HOSTED_SURFACES.has(surface) && isShellIframeEmbed()) {
    return 'shell-hosted';
  }
  return 'standalone';
}
