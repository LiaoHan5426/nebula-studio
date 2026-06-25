/**
 * Auth session helpers — delegated to `@nebula-studio/auth-provider/session`.
 *
 * All sub-web apps share a single source of truth (sessionStorage via
 * `@nebula-studio/app-shell`).  This file re-exports the shared helpers
 * so existing `@/shared/auth/session` imports continue to resolve.
 */
export {
  getAuthToken,
  getAuthUsername,
  getAuthRoles,
  getAuthUserId,
  setAuthSession,
  clearAuthSession,
  hasValidAuthToken,
  hasAuthenticatedSession,
} from '@nebula-studio/auth-provider/session';
