import { parseApiResponse } from './parseApiResponse';
import { trackRequestProgress } from './requestProgress';
import type { ApiClientConfig, ApiRequestOptions, ApiResponse } from './types';

function mergeHeaders(
  base: Record<string, string>,
  extra: HeadersInit | undefined,
): Record<string, string> {
  const headers = { ...base };

  if (extra instanceof Headers) {
    extra.forEach((value, key) => {
      headers[key] = value;
    });
  } else if (Array.isArray(extra)) {
    for (const [key, value] of extra) {
      headers[key] = value;
    }
  } else if (extra) {
    Object.assign(headers, extra);
  }

  return headers;
}

function buildHeaders(
  config: ApiClientConfig,
  options: ApiRequestOptions,
): HeadersInit {
  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (!options.skipAuth && config.getAuthToken) {
    const authToken = config.getAuthToken();
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
  }

  if (!options.skipTenant && config.getTenantId) {
    const tenantId = config.getTenantId();
    if (tenantId) {
      headers['X-Tenant-Id'] = tenantId;
    }
  }

  return mergeHeaders(headers, options.headers);
}

function shouldTrackProgress(
  config: ApiClientConfig,
  options: ApiRequestOptions,
): boolean {
  if (options.skipProgress) {
    return false;
  }
  return config.progress !== false;
}

export function createApiClient(config: ApiClientConfig = {}) {
  async function fetchUrl(
    url: string,
    options: ApiRequestOptions = {},
  ): Promise<Response> {
    const {
      skipAuth: _skipAuth,
      skipTenant: _skipTenant,
      skipProgress: _skipProgress,
      ...fetchOptions
    } = options;
    void _skipAuth;
    void _skipTenant;
    void _skipProgress;

    const request = fetch(url, {
      ...fetchOptions,
      headers: buildHeaders(config, options),
    });

    if (!shouldTrackProgress(config, options)) {
      return request;
    }
    return trackRequestProgress(request);
  }

  async function apiRequest<T>(
    baseUrl: string,
    endpoint: string,
    options: ApiRequestOptions = {},
  ): Promise<ApiResponse<T>> {
    const url = `${baseUrl}${endpoint}`;
    const execute = async (): Promise<ApiResponse<T>> => {
      const response = await fetch(url, {
        ...options,
        headers: buildHeaders(config, options),
      });
      return parseApiResponse<T>(response);
    };

    if (!shouldTrackProgress(config, options)) {
      return execute();
    }
    return trackRequestProgress(execute());
  }

  return {
    apiRequest,
    fetchUrl,
    parseApiResponse,
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
