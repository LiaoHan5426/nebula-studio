import { apiRequest, AUTH_BASE } from '@/shared/api/client';
import type { ApiResponse } from '@nebula-studio/api-client';
import type {
  AuthProfile,
  IntegrationLoginResult,
} from '@nebula-studio/contracts/auth';

export const authApi = {
  login(
    username: string,
    password?: string,
  ): Promise<ApiResponse<IntegrationLoginResult>> {
    return apiRequest<IntegrationLoginResult>(AUTH_BASE, '/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      skipAuth: true,
    });
  },

  me(): Promise<ApiResponse<AuthProfile>> {
    return apiRequest<AuthProfile>(AUTH_BASE, '/me');
  },
};
