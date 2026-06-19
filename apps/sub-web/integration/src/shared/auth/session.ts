import {
  isIntegrationShellEmbed,
  readParentShellAuthSession,
} from '@/shared/composables/useShellEmbed';

const TOKEN_KEY = 'auth_token';

const USERNAME_KEY = 'auth_username';

const ROLES_KEY = 'auth_roles';

const USER_ID_KEY = 'auth_user_id';

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

export function getAuthRoles(): string[] {
  syncTokenFromParentShell();
  const raw = localStorage.getItem(ROLES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((role): role is string => typeof role === 'string')
      : [];
  } catch {
    return [];
  }
}

export function getAuthUserId(): string | null {
  syncTokenFromParentShell();
  return localStorage.getItem(USER_ID_KEY);
}

export function setAuthSession(
  user: string,
  authToken: string,
  roles: string[] = [],
  userId?: string | number | null,
): void {
  tokenCache = authToken;

  localStorage.setItem(TOKEN_KEY, authToken);

  localStorage.setItem(USERNAME_KEY, user);

  localStorage.setItem(ROLES_KEY, JSON.stringify(roles));

  if (userId !== null && userId !== undefined && String(userId).length > 0) {
    localStorage.setItem(USER_ID_KEY, String(userId));
  }
}

export function clearAuthSession(): void {
  tokenCache = null;

  localStorage.removeItem(TOKEN_KEY);

  localStorage.removeItem(USERNAME_KEY);

  localStorage.removeItem(ROLES_KEY);

  localStorage.removeItem(USER_ID_KEY);
}

export function initAuthCacheFromStorage(): void {
  tokenCache = localStorage.getItem(TOKEN_KEY);
}

/** JWT 或历史 token 至少应有一定长度；过滤空串与脏数据 */
export function hasValidAuthToken(): boolean {
  const token = getAuthToken();
  return typeof token === 'string' && token.trim().length >= 20;
}
