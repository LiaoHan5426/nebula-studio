export { isApiSuccess } from '@nebula-studio/api-client';

// Re-export shared types from app-shell (single source of truth)
export type { AuthMode, OrgSummary } from '@nebula-studio/app-shell';

export interface OrgPolicy {
  enabled: boolean;
  multiOrgEnabled: boolean;
}

export interface AuthMe {
  username: string;
  userId: string | number;
  roles: string[];
  currentOrgId?: string;
  currentOrgCode?: string;
  currentOrgName?: string;
  organizations?: OrgSummary[];
}

export interface SwitchOrgResult {
  token?: string;
  currentOrgId?: string;
  currentOrgCode?: string;
  currentOrgName?: string;
}
