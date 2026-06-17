import {
  isIntegrationShellEmbed,
  readParentShellAuthSession,
} from '@/shared/composables/useShellEmbed';

const TOKEN_KEY = 'auth_token';

const USERNAME_KEY = 'auth_username';

let tokenCache: string | null = null;

function syncTokenFromParentShell(): string | null {
  if (!isIntegrationShellEmbed()) return null;

  const session = readParentShellAuthSession();

  if (session?.token && session.user) {
    if (tokenCache !== session.token) {
      tokenCache = session.token;

      localStorage.setItem(TOKEN_KEY, session.token);

      localStorage.setItem(USERNAME_KEY, session.user);
    }

    return session.token;
  }

  return null;
}

export function getAuthToken(): string | null {
  const parentToken = syncTokenFromParentShell();

  if (parentToken) return parentToken;

  if (tokenCache) return tokenCache;

  return localStorage.getItem(TOKEN_KEY);
}

export function getAuthUsername(): string | null {
  syncTokenFromParentShell();

  return localStorage.getItem(USERNAME_KEY);
}

export function setAuthSession(user: string, authToken: string): void {
  tokenCache = authToken;

  localStorage.setItem(TOKEN_KEY, authToken);

  localStorage.setItem(USERNAME_KEY, user);
}

export function clearAuthSession(): void {
  tokenCache = null;

  localStorage.removeItem(TOKEN_KEY);

  localStorage.removeItem(USERNAME_KEY);
}

export function initAuthCacheFromStorage(): void {
  tokenCache = localStorage.getItem(TOKEN_KEY);
}
