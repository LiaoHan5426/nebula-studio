import { computed, ref } from 'vue';

import router from '@/router';
import { authApi } from '@/shared/api/auth';
import {
  clearAuthSession,
  getAuthRoles,
  getAuthToken,
  getAuthUsername,
  hasValidAuthToken,
  setAuthSession,
} from '@/shared/auth/session';
import { isPlatformAdmin as checkPlatformAdmin } from '@/shared/auth/roles';
import { isSurfaceEmbed } from '@nebula-studio/app-shell';
import { useTenant } from '@/shared/composables/useTenant';
import { isApiSuccess } from '@/shared/types';

const token = ref<string | null>(getAuthToken());
const username = ref<string | null>(getAuthUsername());
const roles = ref<string[]>(getAuthRoles());
const loading = ref(false);
const error = ref<string | null>(null);
const shellEmbed = isSurfaceEmbed('integration');
const { resetTenantSession } = useTenant();

export { getAuthToken } from '@/shared/auth/session';

/**
 * 同步 Shell 会话状态。
 * AuthBootstrap 的 EmbedStrategy 已在启动时完成同步，
 * 此函数仅用于特殊场景（如手动重新同步）。
 */
export async function bootstrapAuthFromShell(): Promise<void> {
  // AuthBootstrap 已在 boot 阶段处理，此处为空操作以保持 API 兼容
}

/**
 * 刷新后从后端同步角色（JWT 不含 roles 字段）。
 * AuthBootstrap 已在启动时同步，此处保留供特殊场景使用。
 */
export async function syncAuthProfile(): Promise<void> {
  if (!hasValidAuthToken()) return;
  if (getAuthRoles().length > 0) {
    roles.value = getAuthRoles();
    return;
  }
  try {
    const response = await authApi.me();
    if (isApiSuccess(response)) {
      const profileRoles = response.data.roles ?? [];
      setAuthSession(
        response.data.username,
        getAuthToken() ?? '',
        profileRoles,
        response.data.userId,
      );
      username.value = response.data.username;
      roles.value = profileRoles;
    }
  } catch {
    /* ignore profile sync errors */
  }
}

/**
 * 确保 embed 模式已同步 Shell 登录态。
 * AuthBootstrap 已在启动时处理，此处保留以保持 API 兼容。
 */
export async function ensureAuthFromShell(): Promise<void> {
  // AuthBootstrap 已在 boot 阶段处理
}

export function useAuth() {
  const isLoggedIn = computed(() => hasValidAuthToken());
  const isShellHosted = computed(() => shellEmbed);
  const isPlatformAdmin = computed(() => checkPlatformAdmin());

  async function login(user: string, password?: string) {
    loading.value = true;
    error.value = null;
    try {
      const response = await authApi.login(user, password);
      if (!isApiSuccess(response)) {
        error.value = response.error ?? response.message ?? 'Login failed';
        return false;
      }
      const userRoles = response.data.roles ?? [];
      // 单写路径：仅通过 setAuthSession（内部委托 globalAuthProvider）
      setAuthSession(
        response.data.username,
        response.data.token,
        userRoles,
        response.data.userId,
      );
      token.value = response.data.token;
      username.value = response.data.username;
      roles.value = userRoles;
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Login failed';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    resetTenantSession();
    if (shellEmbed) {
      // 单写路径：仅通过 clearAuthSession（内部委托 globalAuthProvider）
      clearAuthSession();
      token.value = null;
      username.value = null;
      roles.value = [];
      try {
        const parentApi = (
          window.parent as typeof window & {
            api?: { auth?: { logout?: () => Promise<void> } };
          }
        ).api;
        await parentApi?.auth?.logout?.();
      } catch {
        /* ignore */
      }
      return;
    }
    clearAuthSession();
    token.value = null;
    username.value = null;
    roles.value = [];
    await router.replace({ path: '/login' });
  }

  return {
    token,
    username,
    roles,
    loading,
    error,
    isLoggedIn,
    isShellHosted,
    isPlatformAdmin,
    login,
    logout,
  };
}
