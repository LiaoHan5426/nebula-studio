export { isApiSuccess } from '@nebula-studio/api-client';

export interface OrgPolicy {
  enabled: boolean;
  multiOrgEnabled: boolean;
}

export interface AuthMode {
  authType: string;
  orgEnabled: boolean;
  multiOrgEnabled: boolean;
}

export interface OrgSummary {
  id: string;
  orgName: string;
  orgCode: string;
  primary?: boolean;
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
