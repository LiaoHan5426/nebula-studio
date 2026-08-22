/**
 * Auth session helpers — delegated to `@nebula-studio/auth-provider/session`.
 *
 * All sub-web apps share a single source of truth (sessionStorage via
 * `@nebula-studio/auth-provider`).  This file re-exports the shared helpers
 * so existing `@/shared/auth/session` imports continue to resolve.
 */
export {
  clearAuthSession,
  getAuthRoles,
  getAuthToken,
  getAuthUserId,
  getAuthUsername,
  hasAuthenticatedSession,
  hasValidAuthToken,
  setAuthSession,
} from '@nebula-studio/auth-provider/session';
