import type {
  AuthMode,
  BackendLoginResult,
  OrgSummary,
} from '@nebula-studio/contracts/auth';

export type {
  AuthMode,
  BackendLoginResult,
  OrgSummary,
} from '@nebula-studio/contracts/auth';

interface BackendLoginResponse {
  data?: {
    token?: string;
    username?: string;
    userId?: string | number;
    roles?: string[];
    needsOrgSelection?: boolean;
    organizations?: OrgSummary[];
    currentOrgId?: string;
    currentOrgName?: string;
  };
  isSuccess?: boolean;
  code?: number;
  error?: string;
}

interface BackendModeResponse {
  data?: AuthMode;
  isSuccess?: boolean;
  code?: number;
}

function isResponseOk(body: { isSuccess?: boolean; code?: number }): boolean {
  return body.isSuccess === true || body.code === 200;
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error('请求失败，请检查服务是否可用');
  }
  return (await response.json()) as T;
}

export async function fetchAuthMode(): Promise<AuthMode> {
  const body = await parseJson<BackendModeResponse>(
    await fetch('/api/auth/mode', { credentials: 'include' }),
  );
  if (!isResponseOk(body) || !body.data) {
    return { authType: 'token', orgEnabled: false, multiOrgEnabled: false };
  }
  return body.data;
}

async function fetchMe(token?: string): Promise<{
  username?: string;
  userId?: string | number;
  roles?: string[];
  organizations?: OrgSummary[];
}> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const body = await parseJson<{
    data?: {
      username?: string;
      userId?: string | number;
      roles?: string[];
      organizations?: OrgSummary[];
    };
    isSuccess?: boolean;
    code?: number;
  }>(
    await fetch('/api/auth/me', {
      credentials: 'include',
      headers,
    }),
  );
  return isResponseOk(body) ? (body.data ?? {}) : {};
}

export async function loginWithBackendAuth(
  username: string,
  password?: string,
): Promise<BackendLoginResult> {
  const trimmed = username.trim();
  if (!trimmed) throw new Error('请输入用户名');

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: trimmed, password: password ?? '' }),
  });
  let body: BackendLoginResponse | null = null;
  try {
    body = (await response.json()) as BackendLoginResponse;
  } catch {
    // The status-based error below is more useful than a JSON parse error.
  }
  if (!response.ok || !body || !isResponseOk(body)) {
    throw new Error(body?.error || '登录失败，请检查用户名和密码');
  }
  if (!body.data) throw new Error('登录响应无效');

  const result: BackendLoginResult = {
    token: body.data.token,
    username: body.data.username ?? trimmed,
    userId: body.data.userId,
    roles: body.data.roles,
    needsOrgSelection: body.data.needsOrgSelection,
    currentOrgId: body.data.currentOrgId,
    currentOrgName: body.data.currentOrgName,
    organizations: body.data.organizations,
  };
  if (
    result.token &&
    (!result.roles?.length || !result.organizations?.length)
  ) {
    try {
      const profile = await fetchMe(result.token);
      result.username = profile.username ?? result.username;
      result.userId = profile.userId ?? result.userId;
      result.roles = profile.roles ?? result.roles;
      if (result.needsOrgSelection && !result.organizations?.length) {
        result.organizations = profile.organizations;
      }
    } catch {
      // 登录已成功时，资料补全失败不应阻止进入应用；子应用仍会再次同步 profile。
    }
  }
  return result;
}

export async function completeLoginWithOrg(
  orgId: string,
  token?: string,
): Promise<BackendLoginResult> {
  if (!orgId.trim()) throw new Error('请选择组织');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch('/api/auth/login/complete', {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify({ orgId }),
  });
  if (!response.ok) throw new Error('组织选择失败');
  const body = (await response.json()) as BackendLoginResponse;
  if (!isResponseOk(body) || !body.data) {
    throw new Error('组织选择响应无效');
  }
  const result: BackendLoginResult = {
    token: body.data.token ?? token,
    username: body.data.username ?? '',
    userId: body.data.userId,
    roles: body.data.roles,
    currentOrgId: body.data.currentOrgId,
    currentOrgName: body.data.currentOrgName,
    needsOrgSelection: false,
  };
  if (result.token && !result.roles?.length) {
    try {
      const profile = await fetchMe(result.token);
      result.username = profile.username ?? result.username;
      result.userId = profile.userId;
      result.roles = profile.roles;
    } catch {
      // See loginWithBackendAuth: profile sync is best-effort.
    }
  }
  return result;
}
