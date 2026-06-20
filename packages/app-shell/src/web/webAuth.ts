import { isWebPresentationHost } from '../common/presentationHost';
import { WEB_SHELL_EMBED_QUERY } from '../common/shellPresentationConfig';

export const SHELL_AUTH_SESSION_KEY = 'nebula-studio-auth-session';

export interface ShellAuthSessionPayload {
  user: string;
  token?: string;
}

export function getWebShellEmbedSurface(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(WEB_SHELL_EMBED_QUERY);
}

/** Web 壳主界面：未登录则整页跳转登录 */
export function shouldRedirectUnauthenticatedWebShell(): boolean {
  if (!isWebPresentationHost()) return false;
  if (getWebShellEmbedSurface() === 'login') return false;
  try {
    const raw = sessionStorage.getItem(SHELL_AUTH_SESSION_KEY);
    if (!raw) return true;
    const parsed = JSON.parse(raw) as ShellAuthSessionPayload;
    return !parsed.user?.trim();
  } catch {
    return true;
  }
}

export function redirectShellToWebLogin(returnHref: string): void {
  const u = new URL('index.html', window.location.href);
  u.searchParams.set(WEB_SHELL_EMBED_QUERY, 'login');
  u.searchParams.set('return', returnHref);
  location.replace(u.toString());
}

export function readWebAuthSession(): ShellAuthSessionPayload | null {
  try {
    const raw = sessionStorage.getItem(SHELL_AUTH_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ShellAuthSessionPayload;
  } catch {
    return null;
  }
}

export function writeWebAuthSession(payload: ShellAuthSessionPayload): void {
  sessionStorage.setItem(SHELL_AUTH_SESSION_KEY, JSON.stringify(payload));
}

export function clearWebAuthSession(): void {
  sessionStorage.removeItem(SHELL_AUTH_SESSION_KEY);
}

export function isSafeAuthReturnUrl(url: string): boolean {
  try {
    return new URL(url).origin === window.location.origin;
  } catch {
    return false;
  }
}
