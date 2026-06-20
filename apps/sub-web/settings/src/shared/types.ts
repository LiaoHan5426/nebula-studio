export type { ApiResponse } from '@nebula-studio/api-client';
export { isApiSuccess } from '@nebula-studio/api-client';

export interface PageResult<T> {
  records: T[];
  total: number;
  page: number;
  size: number;
}
