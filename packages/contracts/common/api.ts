/** Shared API transport types (no runtime dependencies). */
export interface ApiResponse<T = unknown> {
  code?: number;
  data: T;
  error?: string;
  isSuccess?: boolean;
  message?: string;
}

/** MyBatis-Plus standard page response (backend `IPage<T>`). */
export interface MybatisPage<T> {
  current: number;
  pages: number;
  records: T[];
  size: number;
  total: number;
}

/** Generic page result for frontend consumption. */
export interface PageResult<T> {
  page: number;
  records: T[];
  size: number;
  total: number;
}

/** Page response with extra `totalPages` and `pageSize` fields. */
export interface PageResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
