import type { ApiResponse } from '@/shared/types';

import { isApiSuccess } from '@/shared/types';

export async function unwrapApiData<T>(
  request: Promise<ApiResponse<T>>,
): Promise<T> {
  const response = await request;
  if (!isApiSuccess(response)) {
    throw new Error(response.message || 'errors.generic');
  }
  return response.data;
}
