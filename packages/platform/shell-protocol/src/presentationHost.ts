import type { RuntimeMode } from './runtimeMode';

declare global {
  interface Window {
    __NEBULA_EMBED_SURFACE__?: string;
    __NEBULA_PRESENTATION_HOST__?: 'web';
    __NEBULA_RUNTIME_MODE__?: RuntimeMode;
    __NEBULA_SHELL_HOST__?: boolean;
  }
}

/**
 * Boot/presentation marks for Web vs Electron stubs.
 * Do not add overlay, density, editor-host, or style-contract APIs here —
 * those belong in `nebula-assembly` and apps boot adapters.
 */

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
