import { computed, ref } from 'vue';

import router from '@/router';
import { authApi } from '@/shared/api/auth';
import {
  clearAuthSession,
  getAuthRoles,
  getAuthToken,
  getAuthUsername,
  hasValidAuthToken,
  initAuthCacheFromStorage,
  setAuthSession,
} from '@/shared/auth/session';
import { isPlatformAdmin as checkPlatformAdmin } from '@/shared/auth/roles';
import {
  isIntegrationShellEmbed,
  readParentShellAuthSession,
} from '@/shared/composables/useShellEmbed';
import { useTenant } from '@/shared/composables/useTenant';
import { isApiSuccess } from '@/shared/types';

initAuthCacheFromStorage();

const token = ref<string | null>(getAuthToken());
const username = ref<string | null>(localStorage.getItem('auth_username'));
const roles = ref<string[]>(getAuthRoles());
const loading = ref(false);
const error = ref<string | null>(null);
const shellEmbed = isIntegrationShellEmbed();
const { resetTenantSession } = useTenant();

export { getAuthToken } from '@/shared/auth/session';

function applyShellSession(
  user: string,
  authToken: string,
  userRoles: string[] = [],
): void {
  setAuthSession(user, authToken, userRoles);
  token.value = authToken;
  username.value = user;
  roles.value = userRoles;
}

/** Web 壳 embed 模式：从父窗口 Shell 会话同步 JWT，避免二次登录 */
export async function bootstrapAuthFromShell(): Promise<void> {
  if (!shellEmbed) return;

  const session = readParentShellAuthSession();
  if (session?.token && session.user) {
    applyShellSession(session.user, session.token);
    return;
  }

  try {
    const parentApi = (
      window.parent as typeof window & {
        api?: {
          auth?: {
            getSession?: () => Promise<{
              user?: string;
              token?: string;
            } | null>;
          };
        };
      }
    ).api;
    const remote = await parentApi?.auth?.getSession?.();
    if (remote?.token && remote.user) {
      applyShellSession(remote.user, remote.token);
    }
  } catch {
    /* ignore cross-frame access errors */
  }
}

/** 刷新后从后端同步角色（JWT 不含 roles 字段） */
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

/** 发起 API 前确保 embed 模式已同步 Shell 登录态 */
export async function ensureAuthFromShell(): Promise<void> {
  if (!shellEmbed) return;
  if (getAuthToken()) {
    token.value = getAuthToken();
    username.value = getAuthUsername();
    roles.value = getAuthRoles();
    return;
  }
  await bootstrapAuthFromShell();
  await syncAuthProfile();
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
