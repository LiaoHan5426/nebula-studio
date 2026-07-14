/** Shared API transport types (no runtime dependencies). */
export interface ApiResponse<T = unknown> {
  code?: number;
  isSuccess?: boolean;
  data: T;
  message?: string;
  error?: string;
}

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
