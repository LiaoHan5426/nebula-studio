import { getAuthRoles, getAuthUsername } from '@/shared/auth/session';

/** 平台管理员（ADMIN 角色），可管理全部租户与平台配置 */
export function isPlatformAdmin(): boolean {
  const roles = getAuthRoles();
  if (roles.includes('ADMIN')) return true;
  // Shell embed 会话可能尚未同步 roles，演示环境按账号兜底
  return getAuthUsername() === 'admin';
}

/** 普通对接用户（USER 角色），仅使用自己的租户与已授权服务 */
export function isIntegratorUser(): boolean {
  return !isPlatformAdmin();
}
