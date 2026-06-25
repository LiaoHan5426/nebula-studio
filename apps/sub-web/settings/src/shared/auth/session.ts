/**
 * Auth session helpers — delegated to `@nebula-studio/auth-provider/session`.
 *
 * Settings-specific org context helpers are kept locally.
 */
export {
  getAuthToken,
  clearAuthSession,
  hasValidAuthToken,
  hasAuthenticatedSession,
  setAuthSession,
} from '@nebula-studio/auth-provider/session';

// ---------------------------------------------------------------------------
// Settings-specific org context (not shared with other sub-web apps)
// ---------------------------------------------------------------------------

let currentOrgId = '';

export function setCurrentOrgId(orgId: string): void {
  currentOrgId = orgId;
}

export function getCurrentOrgId(): string {
  return currentOrgId;
}
