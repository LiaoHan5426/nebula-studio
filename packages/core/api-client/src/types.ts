/** nebula-core ApiResponse */
export interface ApiResponse<T = unknown> {
  code?: number;
  isSuccess?: boolean;
  data: T;
  message?: string;
  error?: string;
}

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

// ---------------------------------------------------------------------------
// Pagination — shared across all sub-web apps
// ---------------------------------------------------------------------------

/** MyBatis-Plus standard page response (backend `IPage<T>`). */
export interface MybatisPage<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

/** Generic page result for frontend consumption. */
export interface PageResult<T> {
  records: T[];
  total: number;
  page: number;
  size: number;
}

/** Page response with extra `totalPages` and `pageSize` fields. */
export interface PageResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
