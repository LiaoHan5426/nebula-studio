import { camelSubscribeRequest } from '@/shared/api/client';
import type {
  ApiResponse,
  PageResponse,
  TableSubscription,
  CamelSubscriptionCreateRequest,
  SubscriptionRequestRecord,
} from '@nebula-studio/contracts/integration';

export const camelSubscribeApi = {
  list(): Promise<ApiResponse<TableSubscription[]>> {
    return camelSubscribeRequest<TableSubscription[]>('');
  },

  get(id: string): Promise<ApiResponse<TableSubscription>> {
    return camelSubscribeRequest<TableSubscription>(`/${id}`);
  },

  create(
    body: CamelSubscriptionCreateRequest,
  ): Promise<ApiResponse<TableSubscription>> {
    return camelSubscribeRequest<TableSubscription>('', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  update(
    id: string,
    body: Partial<CamelSubscriptionCreateRequest>,
  ): Promise<ApiResponse<TableSubscription>> {
    return camelSubscribeRequest<TableSubscription>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete(id: string): Promise<ApiResponse<void>> {
    return camelSubscribeRequest<void>(`/${id}`, { method: 'DELETE' });
  },

  pause(id: string): Promise<ApiResponse<void>> {
    return camelSubscribeRequest<void>(`/${id}/pause`, { method: 'PATCH' });
  },

  resume(id: string): Promise<ApiResponse<void>> {
    return camelSubscribeRequest<void>(`/${id}/resume`, { method: 'PATCH' });
  },

  listRequests(
    params: { page?: number; pageSize?: number; status?: string } = {},
  ): Promise<ApiResponse<PageResponse<SubscriptionRequestRecord>>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('pageSize', String(params.pageSize));
    if (params.status) query.set('status', params.status);
    return camelSubscribeRequest<PageResponse<SubscriptionRequestRecord>>(
      `/request?${query.toString()}`,
    );
  },

  approveRequest(
    requestId: string,
    approvedBy = 'admin',
  ): Promise<ApiResponse<SubscriptionRequestRecord>> {
    return camelSubscribeRequest<SubscriptionRequestRecord>(
      `/request/${requestId}/approve`,
      { method: 'PATCH', body: JSON.stringify({ approvedBy }) },
    );
  },

  rejectRequest(
    requestId: string,
    reason: string,
    approvedBy = 'admin',
  ): Promise<ApiResponse<SubscriptionRequestRecord>> {
    return camelSubscribeRequest<SubscriptionRequestRecord>(
      `/request/${requestId}/reject`,
      {
        method: 'PATCH',
        body: JSON.stringify({ approvedBy, reason }),
      },
    );
  },
};
