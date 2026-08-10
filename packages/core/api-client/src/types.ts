import type { ApiResponse } from '@nebula-studio/contracts/common';

export type {
  ApiResponse,
  MybatisPage,
  PageResponse,
  PageResult,
} from '@nebula-studio/contracts/common';

export function isApiSuccess<T>(response: ApiResponse<T>): boolean {
  if (typeof response.isSuccess === 'boolean') {
    return response.isSuccess;
  }
  return response.code === 200;
}

export type ApiRequestOptions = RequestInit & {
  skipAuth?: boolean;
  /** Skip top progress bar (e.g. background polling). */
  skipProgress?: boolean;
  skipTenant?: boolean;
};

export interface ApiClientConfig {
  credentials?: RequestCredentials;
  getAuthToken?: () => null | string | undefined;
  getCredentials?: () => RequestCredentials | undefined;
  getOrgId?: () => null | string | undefined;
  getTenantId?: () => null | string | undefined;
  /** Invoked once when a protected request receives HTTP 401. */
  onUnauthorized?: () => Promise<void> | void;
  /** Default true — set false to disable progress for this client instance. */
  progress?: boolean;
}

export interface RequestProgressOptions {
  enabled?: boolean;
  minimum?: number;
  showSpinner?: boolean;
  trickleSpeed?: number;
}
