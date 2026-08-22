/** 与 Host `/?embed=` 及 `configs/windows.json` `shell.embedQuery` 一致 */
export const WEB_SHELL_EMBED_QUERY = 'embed' as const;

export function getWebShellEmbedSurface(): null | string {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get(WEB_SHELL_EMBED_QUERY) ?? params.get('renderer');
  if (fromQuery) return fromQuery;
  const injected = window.__NEBULA_EMBED_SURFACE__;
  return injected?.trim() ? injected.trim() : null;
}

/** 壳层 iframe 内嵌子应用（Web `embed` / Electron `renderer` 查询参数） */
export function isShellIframeEmbed(): boolean {
  if (typeof window === 'undefined') return false;
  return getWebShellEmbedSurface() !== null && window.parent !== window;
}

export function isSurfaceEmbed(surface: string): boolean {
  return getWebShellEmbedSurface() === surface;
}

export function isSurfaceIframeEmbed(surface: string): boolean {
  return (
    isSurfaceEmbed(surface) &&
    typeof window !== 'undefined' &&
    window.parent !== window
  );
}
