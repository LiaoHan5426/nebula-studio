import { globalAuthProvider } from './index.ts';
import type { AuthSession } from './types.ts';

/**
 * Imperative auth session helpers for sub-web apps.
 *
 * These functions delegate to the global `AuthProvider` (backed by
 * `@nebula-studio/app-shell` sessionStorage) so that all sub-apps share
 * a single source of truth for authentication state.
 *
 * Previously each sub-web (integration / settings / frontend) maintained
 * its own localStorage- or sessionStorage-based session with duplicated
 * getAuthToken / setAuthSession / clearAuthSession helpers.
 */

// ---------------------------------------------------------------------------
// Token
// ---------------------------------------------------------------------------

/** Return the current auth token, or `null` if not authenticated. */
export function getAuthToken(): string | null {
  return globalAuthProvider.getSession()?.token ?? null;
}

/** Return the current username, or `null`. */
export function getAuthUsername(): string | null {
  return globalAuthProvider.getSession()?.user ?? null;
}

/** Return the current roles (never `null`, always an array). */
export function getAuthRoles(): string[] {
  return globalAuthProvider.getSession()?.roles ?? [];
}

/** Return the current userId, or `null`. */
export function getAuthUserId(): string | null {
  return globalAuthProvider.getSession()?.userId ?? null;
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

/**
 * Persist a full auth session (user + token + roles + userId).
 *
 * This is the single entry point for writing auth state — replaces the
 * per-sub-web `setAuthSession` helpers that previously wrote to
 * localStorage / sessionStorage independently.
 */
export function setAuthSession(
  user: string,
  authToken: string,
  roles: string[] = [],
  userId?: string | number | null,
): void {
  const session: AuthSession = {
    user,
    token: authToken,
    roles,
    userId:
      userId !== null && userId !== undefined ? String(userId) : undefined,
  };
  globalAuthProvider.setSession(session);
}

// ---------------------------------------------------------------------------
// Clear
// ---------------------------------------------------------------------------

/** Clear the current auth session across all sub-apps. */
export function clearAuthSession(): void {
  globalAuthProvider.clearSession();
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * A token is considered valid when it is a non-empty string of at least
 * 20 characters (JWT minimum length heuristic).
 */
export function hasValidAuthToken(): boolean {
  const token = getAuthToken();
  return typeof token === 'string' && token.trim().length >= 20;
}

/** Alias for `hasValidAuthToken` — kept for backward compatibility. */
export function hasAuthenticatedSession(): boolean {
  return hasValidAuthToken();
}
