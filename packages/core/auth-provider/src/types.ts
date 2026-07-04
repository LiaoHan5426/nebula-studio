/**
 * Auth session shape used across all sub-apps.
 */
export interface AuthSession {
  user: string;
  token?: string;
  roles?: string[];
  userId?: string;
}

/**
 * Listener called when the auth session changes.
 */
export type AuthSessionListener = (session: AuthSession | null) => void;

/**
 * AuthProvider interface — single source of truth for authentication state.
 */
export interface AuthProvider {
  /** Read the current session (null if not authenticated). */
  getSession(): AuthSession | null;

  /** Write a new session (or null to clear). Notifies all listeners. */
  setSession(session: AuthSession | null): void;

  /** Check whether the current session has a valid token. */
  hasValidSession(): boolean;

  /** Clear the current session. Equivalent to `setSession(null)`. */
  clearSession(): void;

  /** Register a listener. Returns a dispose function. */
  onSessionChange(listener: AuthSessionListener): () => void;
}
