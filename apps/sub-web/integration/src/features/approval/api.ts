import { governanceRequest } from '@/shared/api/client';
import type {
  ApiResponse,
  GovernanceApprovalDecision,
  GovernanceApprovalRequest,
  GovernanceRequest,
} from '@/shared/types';

export const approvalApi = {
  submitRequest(
    body: GovernanceApprovalRequest,
  ): Promise<ApiResponse<GovernanceRequest>> {
    return governanceRequest('/approval/request', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  listRequests(tenantId?: string): Promise<ApiResponse<GovernanceRequest[]>> {
    const query = tenantId ? `?tenantId=${tenantId}` : '';
    return governanceRequest(`/approval/requests${query}`);
  },

  getRequest(requestId: string): Promise<ApiResponse<GovernanceRequest>> {
    return governanceRequest(`/approval/request/${requestId}`);
  },

  decide(
    body: GovernanceApprovalDecision,
  ): Promise<ApiResponse<GovernanceRequest>> {
    return governanceRequest('/approval/decide', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  withdraw(requestId: string): Promise<ApiResponse<void>> {
    return governanceRequest(`/approval/request/${requestId}`, {
      method: 'DELETE',
    });
  },
};
