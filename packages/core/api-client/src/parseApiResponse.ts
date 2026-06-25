import type { ApiResponse } from './types';

/** Normalize nebula-core ApiResponse vs raw Spring ResponseEntity bodies */
export async function parseApiResponse<T>(
  response: Response,
): Promise<ApiResponse<T>> {
  if (!response.ok) {
    let message = `HTTP error! status: ${response.status}`;
    try {
      const errBody = (await response.json()) as {
        message?: string;
        error?: string;
      };
      message = errBody.message ?? errBody.error ?? message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (
    response.status === 204 ||
    !contentType.includes('json') ||
    response.headers.get('content-length') === '0'
  ) {
    return { code: 200, isSuccess: true, data: undefined as T };
  }

  const json = (await response.json()) as Record<string, unknown>;
  if (
    json &&
    typeof json === 'object' &&
    'data' in json &&
    ('isSuccess' in json || 'success' in json || 'code' in json)
  ) {
    return json as unknown as ApiResponse<T>;
  }

  return { code: 200, isSuccess: true, data: json as T };
}
