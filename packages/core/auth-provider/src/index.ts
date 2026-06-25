import {
  readWebAuthSession,
  writeWebAuthSession,
  clearWebAuthSession,
  hasValidShellAuthSession,
} from '@nebula-studio/app-shell';
import type { ShellAuthSessionPayload } from '@nebula-studio/app-shell';

import type {
  AuthProvider,
  AuthSession,
  AuthSessionListener,
} from './types.ts';

/**
 * Convert app-shell's ShellAuthSessionPayload to our AuthSession shape.
 */
function toAuthSession(
  payload: ShellAuthSessionPayload | null,
): AuthSession | null {
  if (!payload?.user) return null;
  return { user: payload.user, token: payload.token };
}

function toShellPayload(session: AuthSession | null): ShellAuthSessionPayload {
  if (!session) return { user: '' };
  return { user: session.user, token: session.token };
}

/**
 * Default AuthProvider implementation.
 *
 * Delegates session storage to app-shell's sessionStorage-based functions
 * (readWebAuthSession / writeWebAuthSession) for backward compatibility.
 */
class AuthProviderImpl implements AuthProvider {
  private listeners = new Set<AuthSessionListener>();

  getSession(): AuthSession | null {
    return toAuthSession(readWebAuthSession());
  }

  setSession(session: AuthSession | null): void {
    if (session) {
      writeWebAuthSession(toShellPayload(session));
    } else {
      this.clearSession();
    }
    this.notifyListeners(session);
  }

  hasValidSession(): boolean {
    return hasValidShellAuthSession(readWebAuthSession());
  }

  clearSession(): void {
    clearWebAuthSession();
    this.notifyListeners(null);
  }

  onSessionChange(listener: AuthSessionListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(session: AuthSession | null): void {
    for (const listener of this.listeners) {
      try {
        listener(session);
      } catch (error) {
        console.error('[auth-provider] listener error:', error);
      }
    }
  }
}

/**
 * Global singleton AuthProvider instance.
 *
 * All sub-apps should use this instance rather than creating their own.
 */
export const globalAuthProvider: AuthProvider = new AuthProviderImpl();

export type { AuthProvider, AuthSession, AuthSessionListener };
