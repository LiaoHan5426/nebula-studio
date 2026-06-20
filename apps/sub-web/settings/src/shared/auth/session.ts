const SHELL_SESSION_KEY = 'nebula-studio-auth-session';

const TOKEN_KEY = 'auth_token';

let tokenCache: string | null = null;

let currentOrgId = '';

function readShellSession(): { user?: string; token?: string } | null {
  try {
    let storage = sessionStorage;
    if (typeof window !== 'undefined' && window.parent !== window) {
      const params = new URLSearchParams(window.location.search);
      const surface = params.get('renderer') ?? params.get('embed');
      if (surface) {
        storage = window.parent.sessionStorage;
      }
    }
    const raw = storage.getItem(SHELL_SESSION_KEY);

    if (!raw) return null;

    return JSON.parse(raw) as { user?: string; token?: string };
  } catch {
    return null;
  }
}

function readShellToken(): string | null {
  const token = readShellSession()?.token;

  return typeof token === 'string' && token.length > 0 ? token : null;
}

export function getAuthToken(): string | null {
  const shellToken = readShellToken();

  if (shellToken) {
    tokenCache = shellToken;

    return shellToken;
  }

  if (tokenCache) return tokenCache;

  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  tokenCache = token;

  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthSession(): void {
  tokenCache = null;

  sessionStorage.removeItem(TOKEN_KEY);
}

export function hasAuthenticatedSession(): boolean {
  const shell = readShellSession();

  const token = shell?.token?.trim() ?? getAuthToken()?.trim();

  return Boolean(shell?.user?.trim() && token && token.length >= 20);
}

export function setCurrentOrgId(orgId: string): void {
  currentOrgId = orgId;
}

export function getCurrentOrgId(): string {
  return currentOrgId;
}
