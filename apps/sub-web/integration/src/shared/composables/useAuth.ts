import { computed, ref } from 'vue';

import { authApi } from '@/shared/api/auth';
import {
  clearAuthSession,
  getAuthToken,
  getAuthUsername,
  initAuthCacheFromStorage,
  setAuthSession,
} from '@/shared/auth/session';
import {
  isIntegrationShellEmbed,
  readParentShellAuthSession,
} from '@/shared/composables/useShellEmbed';
import { isApiSuccess } from '@/shared/types';

initAuthCacheFromStorage();

const token = ref<string | null>(getAuthToken());
const username = ref<string | null>(localStorage.getItem('auth_username'));
const loading = ref(false);
const error = ref<string | null>(null);
const shellEmbed = isIntegrationShellEmbed();

export { getAuthToken } from '@/shared/auth/session';

function applyShellSession(user: string, authToken: string): void {
  setAuthSession(user, authToken);
  token.value = authToken;
  username.value = user;
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

/** 发起 API 前确保 embed 模式已同步 Shell 登录态 */
export async function ensureAuthFromShell(): Promise<void> {
  if (!shellEmbed) return;
  if (getAuthToken()) {
    token.value = getAuthToken();
    username.value = getAuthUsername();
    return;
  }
  await bootstrapAuthFromShell();
}

export function useAuth() {
  const isLoggedIn = computed(() => Boolean(token.value ?? getAuthToken()));
  const isShellHosted = computed(() => shellEmbed);

  async function login(user: string, password?: string) {
    loading.value = true;
    error.value = null;
    try {
      const response = await authApi.login(user, password);
      if (!isApiSuccess(response)) {
        error.value = response.error ?? response.message ?? 'Login failed';
        return false;
      }
      setAuthSession(response.data.username, response.data.token);
      token.value = response.data.token;
      username.value = response.data.username;
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Login failed';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    if (shellEmbed) {
      clearAuthSession();
      token.value = null;
      username.value = null;
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
  }

  return {
    token,
    username,
    loading,
    error,
    isLoggedIn,
    isShellHosted,
    login,
    logout,
  };
}
