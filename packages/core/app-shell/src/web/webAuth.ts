import {
  isWebPresentationHost,
  isWebShellHost,
} from '../common/presentationHost';
import { WEB_SHELL_EMBED_QUERY } from '../common/shellPresentationConfig';
import {
  clearWebAuthSession,
  readWebAuthSession,
  SHELL_AUTH_SESSION_KEY,
} from '@nebula-studio/auth-provider/storage';
import type { ShellAuthSessionPayload } from '@nebula-studio/auth-provider/storage';

export {
  clearWebAuthSession,
  hasValidShellAuthSession,
  readWebAuthSession,
  SHELL_AUTH_SESSION_KEY,
  writeWebAuthSession,
} from '@nebula-studio/auth-provider/storage';
export type { ShellAuthSessionPayload } from '@nebula-studio/auth-provider/storage';

export function getWebShellEmbedSurface(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  // Web: index.html?embed=integration；Electron 壳 iframe: ?renderer=integration
  const fromQuery = params.get(WEB_SHELL_EMBED_QUERY) ?? params.get('renderer');
  if (fromQuery) return fromQuery;
  // History 导航会丢掉 ?embed=；启动时注入的表面 ID 作为稳定回退
  const injected = (window as Window & { __NEBULA_EMBED_SURFACE__?: string })
    .__NEBULA_EMBED_SURFACE__;
  return injected?.trim() ? injected.trim() : null;
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

export const SHELL_AUTH_UNAUTHORIZED_EVENT = 'nebula:auth-unauthorized';

let authUnauthorizedHandling = false;

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

export function redirectShellToWebLogin(returnHref: string): void {
  const u = new URL('index.html', window.location.href);
  u.searchParams.set(WEB_SHELL_EMBED_QUERY, 'login');
  u.searchParams.set('return', returnHref);
  location.replace(u.toString());
}

/** 壳层 iframe 内嵌子应用（Web `embed` / Electron `renderer` 查询参数） */
export function isShellIframeEmbed(): boolean {
  if (typeof window === 'undefined') return false;
  return getWebShellEmbedSurface() !== null && window.parent !== window;
}

/** iframe 与父页 sessionStorage 隔离，从父窗口读取 Shell 会话 */
export function readParentShellAuthSession(): ShellAuthSessionPayload | null {
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

export function isSafeAuthReturnUrl(url: string): boolean {
  try {
    return new URL(url).origin === window.location.origin;
  } catch {
    return false;
  }
}

/** Check whether the current page is embedded for a specific surface (e.g. 'integration', 'settings'). */
export function isSurfaceEmbed(surface: string): boolean {
  return getWebShellEmbedSurface() === surface;
}

/** Check whether the current page is embedded for the given surface AND inside an iframe. */
export function isSurfaceIframeEmbed(surface: string): boolean {
  return (
    isSurfaceEmbed(surface) &&
    typeof window !== 'undefined' &&
    window.parent !== window
  );
}
