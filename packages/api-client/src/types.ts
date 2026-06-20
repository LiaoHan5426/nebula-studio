/** nebula-core ApiResponse with legacy `success` compat */
export interface ApiResponse<T = unknown> {
  code?: number;
  isSuccess?: boolean;
  /** @deprecated use isSuccess */
  success?: boolean;
  data: T;
  message?: string;
  error?: string;
}

export function isApiSuccess<T>(response: ApiResponse<T>): boolean {
  if (typeof response.isSuccess === 'boolean') {
    return response.isSuccess;
  }
  if (typeof response.success === 'boolean') {
    return response.success;
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
}

export interface RequestProgressOptions {
  enabled?: boolean;
  minimum?: number;
  trickleSpeed?: number;
  showSpinner?: boolean;
}
