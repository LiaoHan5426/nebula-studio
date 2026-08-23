/**
 * Auth session shape used across all sub-apps.
 */
export interface AuthSession {
  roles?: string[];
  token?: string;
  user: string;
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
  /** Clear the current session. Equivalent to `setSession(null)`. */
  clearSession(): void;

  /** Read the current session (null if not authenticated). */
  getSession(): AuthSession | null;

  /** Check whether the current session has a valid token. */
  hasValidSession(): boolean;

  /** Register a listener. Returns a dispose function. */
  onSessionChange(listener: AuthSessionListener): () => void;

  /** Write a new session (or null to clear). Notifies all listeners. */
  setSession(session: AuthSession | null): void;
}
