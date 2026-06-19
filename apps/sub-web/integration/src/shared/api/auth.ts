import { apiRequest, AUTH_BASE } from '@/shared/api/client';
import type { ApiResponse, AuthProfile, LoginResult } from '@/shared/types';

export const authApi = {
  login(
    username: string,
    password?: string,
  ): Promise<ApiResponse<LoginResult>> {
    return apiRequest<LoginResult>(AUTH_BASE, '/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      skipAuth: true,
    });
  },

  me(): Promise<ApiResponse<AuthProfile>> {
    return apiRequest<AuthProfile>(AUTH_BASE, '/me');
  },
};
