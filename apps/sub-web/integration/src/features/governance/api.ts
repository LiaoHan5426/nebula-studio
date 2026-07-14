import { consoleRequest, governanceRequest } from '@/shared/api/client';
import type {
  ApiResponse,
  GovernancePolicy,
  PageResponse,
  ResourceCreateRequest,
  ResourceQueryParams,
  ResourceRecord,
  ResourceUpdateRequest,
} from '@/shared/types';

export const governanceApi = {
  rateLimitList(
    page = 1,
    size = 20,
    tenantId?: string,
  ): Promise<ApiResponse<PageResponse<Record<string, unknown>>>> {
    const query = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    if (tenantId) query.set('tenantId', tenantId);
    return governanceRequest(`/rate-limit/list?${query.toString()}`);
  },

  rateLimitCreate(
    body: Record<string, unknown>,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return governanceRequest('/rate-limit', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  rateLimitUpdate(
    ruleId: string,
    body: Record<string, unknown>,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return governanceRequest(`/rate-limit/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  rateLimitDelete(ruleId: string): Promise<ApiResponse<void>> {
    return governanceRequest(`/rate-limit/${ruleId}`, { method: 'DELETE' });
  },

  circuitBreakerList(
    page = 1,
    size = 20,
    tenantId?: string,
  ): Promise<ApiResponse<PageResponse<Record<string, unknown>>>> {
    const query = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    if (tenantId) query.set('tenantId', tenantId);
    return governanceRequest(`/circuit-breaker/list?${query.toString()}`);
  },

  circuitBreakerCreate(
    body: Record<string, unknown>,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return governanceRequest('/circuit-breaker', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  circuitBreakerUpdate(
    interfaceId: string,
    body: Record<string, unknown>,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return governanceRequest(`/circuit-breaker/${interfaceId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  whitelistList(
    page = 1,
    size = 20,
    tenantId?: string,
  ): Promise<ApiResponse<PageResponse<Record<string, unknown>>>> {
    const query = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    if (tenantId) query.set('tenantId', tenantId);
    return governanceRequest(`/whitelist/list?${query.toString()}`);
  },

  whitelistCreate(
    body: Record<string, unknown>,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return governanceRequest('/whitelist', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  whitelistUpdate(
    ruleId: string,
    body: Record<string, unknown>,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return governanceRequest(`/whitelist/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  whitelistDelete(ruleId: string): Promise<ApiResponse<void>> {
    return governanceRequest(`/whitelist/${ruleId}`, { method: 'DELETE' });
  },
};

export const resourceApi = {
  list(
    params: ResourceQueryParams,
  ): Promise<ApiResponse<PageResponse<ResourceRecord>>> {
    const query = new URLSearchParams();
    query.set('tenantId', params.tenantId);
    if (params.resourceType) query.set('resourceType', params.resourceType);
    if (params.status) query.set('status', params.status);
    if (params.keyword) query.set('keyword', params.keyword);
    if (params.page) query.set('page', String(params.page));
    if (params.size) query.set('size', String(params.size));
    return consoleRequest(`/resource/list?${query.toString()}`);
  },

  get(resourceId: string): Promise<ApiResponse<ResourceRecord>> {
    return consoleRequest(`/resource/${resourceId}`);
  },

  create(body: ResourceCreateRequest): Promise<ApiResponse<ResourceRecord>> {
    return consoleRequest('/resource', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  update(
    resourceId: string,
    body: ResourceUpdateRequest,
  ): Promise<ApiResponse<ResourceRecord>> {
    return consoleRequest(`/resource/${resourceId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete(resourceId: string): Promise<ApiResponse<void>> {
    return consoleRequest(`/resource/${resourceId}`, { method: 'DELETE' });
  },
};

export const governancePolicyApi = {
  list(resourceId: string): Promise<ApiResponse<GovernancePolicy[]>> {
    return governanceRequest(`/policy?resourceId=${resourceId}`);
  },

  create(
    body: Partial<GovernancePolicy>,
  ): Promise<ApiResponse<GovernancePolicy>> {
    return governanceRequest('/policy', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  update(
    policyId: string,
    body: Partial<GovernancePolicy>,
  ): Promise<ApiResponse<GovernancePolicy>> {
    return governanceRequest(`/policy/${policyId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete(policyId: string): Promise<ApiResponse<void>> {
    return governanceRequest(`/policy/${policyId}`, { method: 'DELETE' });
  },

  toggle(
    policyId: string,
    enabled: boolean,
  ): Promise<ApiResponse<GovernancePolicy>> {
    return governanceRequest(`/policy/${policyId}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    });
  },
};
