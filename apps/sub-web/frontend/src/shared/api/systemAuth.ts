import { authRequest, systemRequest } from '@/shared/api/client';
import type { ApiResponse } from '@nebula-studio/api-client';
import type {
  AuthMe,
  AuthMode,
  OrgPolicy,
  SwitchOrgResult,
} from '@/shared/types';

export const authModeApi = {
  getMode(): Promise<ApiResponse<AuthMode>> {
    return authRequest('/mode');
  },
};

export const authMeApi = {
  getMe(): Promise<ApiResponse<AuthMe>> {
    return authRequest('/me');
  },
};

export const switchOrgApi = {
  switchOrg(orgId: string): Promise<ApiResponse<SwitchOrgResult>> {
    return authRequest('/switch-org', {
      method: 'POST',
      body: JSON.stringify({ orgId }),
    });
  },
};

export const orgPolicyApi = {
  get(): Promise<ApiResponse<OrgPolicy>> {
    return systemRequest('/org-policy');
  },

  update(policy: OrgPolicy): Promise<ApiResponse<OrgPolicy>> {
    return systemRequest('/org-policy', {
      method: 'PUT',
      body: JSON.stringify(policy),
    });
  },
};
