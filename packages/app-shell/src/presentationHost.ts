declare global {
  interface Window {
    __NEBULA_PRESENTATION_HOST__?: 'web';
  }
}

export type PresentationHostKind = 'electron' | 'web';

export function markWebPresentationHost(): void {
  if (typeof window === 'undefined') return;
  window.__NEBULA_PRESENTATION_HOST__ = 'web';
}

export function getPresentationHost(): PresentationHostKind {
  if (
    typeof window !== 'undefined' &&
    window.__NEBULA_PRESENTATION_HOST__ === 'web'
  ) {
    return 'web';
  }
  return 'electron';
}

export function isWebPresentationHost(): boolean {
  return getPresentationHost() === 'web';
}
