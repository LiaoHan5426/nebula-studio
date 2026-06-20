import { getWebShellEmbedSurface } from '../web/webAuth';

export type LayoutHostMode = 'standalone' | 'shell-hosted';

export type ShellEmbedSurface = 'settings' | 'integration' | 'docs' | 'login';

export const LAYOUT_PREFERENCES_STORAGE_KEY = 'nebula-layout-preferences';

const SHELL_HOSTED_SURFACES = new Set<string>([
  'settings',
  'integration',
  'docs',
]);

export function isShellEmbedSurface(
  surface: string | null | undefined,
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
  embedSurface?: string | null,
): LayoutHostMode {
  const surface =
    embedSurface ??
    (typeof window !== 'undefined' ? getWebShellEmbedSurface() : null);
  if (!surface || surface === 'login') return 'standalone';
  if (SHELL_HOSTED_SURFACES.has(surface)) return 'shell-hosted';
  return 'standalone';
}
