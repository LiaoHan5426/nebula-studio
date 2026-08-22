import type { ApiResponse, ReleaseRecord } from '@/shared/types';

import { apiRequest, governanceRequest, RELEASE_BASE } from '@/shared/api/client';

export const releaseApi = {
  deployRelease(
    releaseId: string,
    operatorId?: string,
  ): Promise<ApiResponse<ReleaseRecord>> {
    const query = operatorId ? `?operatorId=${operatorId}` : '';
    return apiRequest(RELEASE_BASE, `/${releaseId}/deploy${query}`, {
      method: 'POST',
    });
  },

  deploy(requestId: string): Promise<ApiResponse<ReleaseRecord>> {
    return governanceRequest('/release/deploy', {
      method: 'POST',
      body: JSON.stringify({ requestId }),
    });
  },

  rollback(
    releaseId: string,
    operatorId?: string,
  ): Promise<ApiResponse<ReleaseRecord>> {
    const query = operatorId ? `?operatorId=${operatorId}` : '';
    return governanceRequest(`/release/${releaseId}/rollback${query}`, {
      method: 'POST',
    });
  },

  getRelease(releaseId: string): Promise<ApiResponse<ReleaseRecord>> {
    return governanceRequest(`/release/${releaseId}`);
  },

  listReleases(tenantId?: string): Promise<ApiResponse<ReleaseRecord[]>> {
    const query = tenantId ? `?tenantId=${tenantId}` : '';
    return governanceRequest(`/releases${query}`);
  },

  approve(
    releaseId: string,
    operatorId?: string,
  ): Promise<ApiResponse<ReleaseRecord>> {
    const query = operatorId ? `?operatorId=${operatorId}` : '';
    return governanceRequest(`/release/${releaseId}/approve${query}`, {
      method: 'POST',
    });
  },
};
