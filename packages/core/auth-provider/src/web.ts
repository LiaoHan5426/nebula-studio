import type { ShellAuthSessionPayload } from './storage.ts';

import {
  getWebShellEmbedSurface,
  isShellIframeEmbed,
  isWebPresentationHost,
  isWebShellHost,
  WEB_SHELL_EMBED_QUERY,
} from '@nebula-studio/shell-protocol';

import {
  clearWebAuthSession,
  readWebAuthSession,
  SHELL_AUTH_SESSION_KEY,
} from './storage.ts';

export const SHELL_AUTH_UNAUTHORIZED_EVENT = 'nebula:auth-unauthorized';

let authUnauthorizedHandling = false;

export function isSafeAuthReturnUrl(url: string): boolean {
  try {
    return new URL(url).origin === window.location.origin;
  } catch {
    return false;
  }
}

export function buildWebShellLoginHref(
  origin: string,
  returnHref: string,
): string {
  const login = new URL('/', origin);
  login.searchParams.set(WEB_SHELL_EMBED_QUERY, 'login');
  login.searchParams.set('return', stripWebIndexHtmlHref(returnHref, origin));
  return login.toString();
}

function stripWebIndexHtmlHref(href: string, origin: string): string {
  try {
    const parsed = new URL(href);
    if (parsed.origin !== new URL(origin).origin) {
      return href;
    }
    if (parsed.pathname.endsWith('/index.html')) {
      parsed.pathname = `${parsed.pathname.slice(0, -'index.html'.length)}`;
      if (parsed.pathname === '') parsed.pathname = '/';
    }
    return parsed.toString();
  } catch {
    return href;
  }
}

export function redirectShellToWebLogin(returnHref: string): void {
  location.replace(buildWebShellLoginHref(window.location.origin, returnHref));
}

/** Web 壳主界面：未登录则整页跳转登录 */
export function shouldRedirectUnauthenticatedWebShell(): boolean {
  if (!isWebPresentationHost()) return false;
  if (getWebShellEmbedSurface() === 'login') return false;
  try {
    const parsed = readWebAuthSession();
    if (!parsed?.user?.trim()) return true;
    const token = parsed.token?.trim();
    if (token) {
      return token.length < 20;
    }
    return false;
  } catch {
    return true;
  }
}

/**
 * API 返回 401 时统一退出：Shell 主窗口跳转登录页；iframe 子应用通知父 Shell；
 * 独立子应用派发 `SHELL_AUTH_UNAUTHORIZED_EVENT` 由各自路由处理。
 */
export async function handleShellAuthUnauthorized(
  returnHref?: string,
): Promise<void> {
  if (authUnauthorizedHandling) return;
  authUnauthorizedHandling = true;
  try {
    if (isShellIframeEmbed()) {
      try {
        const parentApi = (
          window.parent as Window & {
            api?: { auth?: { logout?: () => Promise<void> } };
          }
        ).api;
        await parentApi?.auth?.logout?.();
      } catch {
        /* ignore cross-frame access errors */
      }
      return;
    }

    if (!isWebPresentationHost()) {
      try {
        const api = (
          window as Window & {
            api?: { auth?: { logout?: () => Promise<void> } };
          }
        ).api;
        await api?.auth?.logout?.();
      } catch {
        /* ignore */
      }
      return;
    }

    clearWebAuthSession();

    if (isWebShellHost()) {
      redirectShellToWebLogin(returnHref ?? window.location.href);
      return;
    }

    window.dispatchEvent(new CustomEvent(SHELL_AUTH_UNAUTHORIZED_EVENT));
  } finally {
    window.setTimeout(() => {
      authUnauthorizedHandling = false;
    }, 1500);
  }
}

/** iframe 与父页 sessionStorage 隔离，从父窗口读取 Shell 会话 */
export function readParentShellAuthSession(): null | ShellAuthSessionPayload {
  if (!isShellIframeEmbed()) {
    return readWebAuthSession();
  }
  try {
    const raw = window.parent.sessionStorage.getItem(SHELL_AUTH_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ShellAuthSessionPayload;
  } catch {
    return null;
  }
}
