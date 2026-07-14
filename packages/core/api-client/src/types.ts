import type { ApiResponse } from '@nebula-studio/contracts/common';

export type {
  ApiResponse,
  PageResponse,
  MybatisPage,
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
  skipTenant?: boolean;
  /** Skip top progress bar (e.g. background polling). */
  skipProgress?: boolean;
};

export interface ApiClientConfig {
  getAuthToken?: () => string | null | undefined;
  getTenantId?: () => string | null | undefined;
  getOrgId?: () => string | null | undefined;
  credentials?: RequestCredentials;
  getCredentials?: () => RequestCredentials | undefined;
  /** Default true — set false to disable progress for this client instance. */
  progress?: boolean;
  /** Invoked once when a protected request receives HTTP 401. */
  onUnauthorized?: () => void | Promise<void>;
}

export interface RequestProgressOptions {
  enabled?: boolean;
  minimum?: number;
  trickleSpeed?: number;
  showSpinner?: boolean;
}
