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
    needsOrgSelection?: boolean;
    organizations?: OrgSummary[];
    currentOrgId?: string;
    currentOrgName?: string;
  };
  isSuccess?: boolean;
  code?: number;
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

/** Web 壳：读取后端认证模式 */
export async function fetchAuthMode(): Promise<AuthMode> {
  const body = await parseJson<BackendModeResponse>(
    await fetch('/api/auth/mode', { credentials: 'include' }),
  );
  if (!isResponseOk(body) || !body.data) {
    return { authType: 'token', orgEnabled: false, multiOrgEnabled: false };
  }
  return body.data;
}

async function fetchMe(token?: string): Promise<OrgSummary[]> {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const body = await parseJson<{
    data?: { organizations?: OrgSummary[] };
    isSuccess?: boolean;
    code?: number;
  }>(
    await fetch('/api/auth/me', {
      credentials: 'include',
      headers,
    }),
  );
  if (!isResponseOk(body)) {
    return [];
  }
  return body.data?.organizations ?? [];
}

/** Web 壳登录：调用 Nebula 后端 `/api/auth/login` */
export async function loginWithBackendAuth(
  username: string,
  password?: string,
): Promise<BackendLoginResult> {
  const trimmed = username.trim();
  if (!trimmed) {
    throw new Error('请输入用户名');
  }

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: trimmed, password: password ?? 'demo' }),
  });

  if (!response.ok) {
    throw new Error('登录失败，请检查用户名和密码');
  }

  const body = (await response.json()) as BackendLoginResponse;
  const data = body.data;
  const ok =
    isResponseOk(body) || Boolean(data?.token) || Boolean(data?.username);

  if (!ok || !data?.username) {
    throw new Error('登录响应无效');
  }

  const result: BackendLoginResult = {
    token: data.token,
    username: data.username ?? trimmed,
    needsOrgSelection: data.needsOrgSelection,
    currentOrgId: data.currentOrgId,
    currentOrgName: data.currentOrgName,
    organizations: data.organizations,
  };

  if (
    result.needsOrgSelection &&
    !result.organizations?.length &&
    result.token
  ) {
    result.organizations = await fetchMe(result.token);
  }

  return result;
}

/** 多组织用户登录后选择组织 */
export async function completeLoginWithOrg(
  orgId: string,
  token?: string,
): Promise<BackendLoginResult> {
  if (!orgId.trim()) {
    throw new Error('请选择组织');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch('/api/auth/login/complete', {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify({ orgId }),
  });

  if (!response.ok) {
    throw new Error('组织选择失败');
  }

  const body = (await response.json()) as BackendLoginResponse;
  if (!isResponseOk(body) || !body.data) {
    throw new Error('组织选择响应无效');
  }

  return {
    token: body.data.token ?? token,
    username: body.data.username ?? '',
    currentOrgId: body.data.currentOrgId,
    currentOrgName: body.data.currentOrgName,
    needsOrgSelection: false,
  };
}
