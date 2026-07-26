export type AuthFlowStep =
  | 'credentials'
  | 'organization'
  | 'mfa'
  | 'recovery'
  | 'success'
  | 'failure';

export type AuthFailureKind =
  | 'invalid-credentials'
  | 'account-locked'
  | 'network'
  | 'service'
  | 'session-expired'
  | 'permission-changed'
  | 'mfa-required'
  | 'unknown';

export interface AuthFailure {
  kind: AuthFailureKind;
  title: string;
  message: string;
  retryable: boolean;
}

export function classifyAuthFailure(error: unknown): AuthFailure {
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLocaleLowerCase();

  if (/mfa|required.*code|二次验证/.test(normalized)) {
    return {
      kind: 'mfa-required',
      title: '需要二次验证',
      message: '账户需要额外验证后才能继续。',
      retryable: false,
    };
  }
  if (/locked|lockout|账户锁定|账号锁定/.test(normalized)) {
    return {
      kind: 'account-locked',
      title: '账户已被锁定',
      message: '请联系组织管理员解锁账户或确认安全策略。',
      retryable: false,
    };
  }
  if (/401|invalid|credential|password|用户名|密码|凭证/.test(normalized)) {
    return {
      kind: 'invalid-credentials',
      title: '用户名或密码不正确',
      message: '请检查登录信息后重试；密码不会被保留。',
      retryable: true,
    };
  }
  if (/network|fetch|offline|timeout|网络|连接/.test(normalized)) {
    return {
      kind: 'network',
      title: '无法连接认证服务',
      message: '请检查网络连接，恢复后可直接重试。',
      retryable: true,
    };
  }
  if (/403|permission|forbidden|权限/.test(normalized)) {
    return {
      kind: 'permission-changed',
      title: '当前账户没有访问权限',
      message: '请联系组织管理员确认成员身份和应用权限。',
      retryable: false,
    };
  }
  if (/5\d\d|service|unavailable|服务/.test(normalized)) {
    return {
      kind: 'service',
      title: '认证服务暂时不可用',
      message: '服务可能正在维护，请稍后重试。',
      retryable: true,
    };
  }
  return {
    kind: 'unknown',
    title: '登录未完成',
    message: message || '发生未知错误，请重试。',
    retryable: true,
  };
}

export function readAuthEntryContext(search: string): AuthFailureKind | null {
  const reason = new URLSearchParams(search).get('reason');
  if (reason === 'session-expired') return 'session-expired';
  if (reason === 'permission-changed') return 'permission-changed';
  return null;
}
