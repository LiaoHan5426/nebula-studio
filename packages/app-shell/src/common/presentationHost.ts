declare global {
  interface Window {
    __NEBULA_PRESENTATION_HOST__?: 'web';
  }
}

export type PresentationHostKind = 'electron' | 'web';

const WEB_MARK_KEY = '__NEBULA_PRESENTATION_HOST__' as const;
const WEB_SHELL_HOST_KEY = '__NEBULA_SHELL_HOST__' as const;

export function markWebPresentationHost(): void {
  if (typeof window === 'undefined') return;
  Reflect.set(window, WEB_MARK_KEY, 'web');
}

export function markWebShellHost(): void {
  if (typeof window === 'undefined') return;
  Reflect.set(window, WEB_SHELL_HOST_KEY, true);
}

export function isWebShellHost(): boolean {
  if (typeof window === 'undefined') return false;
  return Reflect.get(window, WEB_SHELL_HOST_KEY) === true;
}

export function getPresentationHost(): PresentationHostKind {
  if (
    typeof window !== 'undefined' &&
    Reflect.get(window, WEB_MARK_KEY) === 'web'
  ) {
    return 'web';
  }
  return 'electron';
}

export function isWebPresentationHost(): boolean {
  return getPresentationHost() === 'web';
}
