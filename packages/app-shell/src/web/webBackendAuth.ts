export interface BackendLoginResult {
  token: string;
  username: string;
}

interface BackendLoginResponse {
  data?: BackendLoginResult;
  isSuccess?: boolean;
  success?: boolean;
  code?: number;
}

/** Web 壳登录：调用 Nebula 后端 `/api/auth/login` 获取 JWT */
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: trimmed, password: password ?? 'demo' }),
  });

  if (!response.ok) {
    throw new Error('登录失败，请检查服务是否可用');
  }

  const body = (await response.json()) as BackendLoginResponse;
  const ok =
    body.isSuccess === true ||
    body.success === true ||
    body.code === 200 ||
    Boolean(body.data?.token);

  if (!ok || !body.data?.token) {
    throw new Error('登录响应无效');
  }

  return {
    token: body.data.token,
    username: body.data.username ?? trimmed,
  };
}
