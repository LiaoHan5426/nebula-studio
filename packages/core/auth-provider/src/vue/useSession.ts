import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { globalAuthProvider } from '../index.ts';
import type { AuthSession } from '../types.ts';
import {
  getAuthToken,
  getAuthRoles,
  getAuthUserId,
  getAuthUsername,
  hasValidAuthToken,
} from '../session.ts';

/**
 * Reactive auth session composable with full session details.
 *
 * Provides reactive access to token, username, roles, and userId —
 * replacing the per-sub-web `useAuth` composables that previously
 * managed their own localStorage-backed reactive state.
 *
 * Usage:
 * ```ts
 * const { token, username, roles, isLoggedIn, hasToken } = useSession();
 * ```
 */
export function useSession() {
  const session = ref<AuthSession | null>(globalAuthProvider.getSession());

  let dispose: (() => void) | undefined;

  onMounted(() => {
    dispose = globalAuthProvider.onSessionChange((newSession) => {
      session.value = newSession;
    });
  });

  onBeforeUnmount(() => {
    dispose?.();
  });

  const isLoggedIn = computed(() => hasValidAuthToken());
  const hasToken = computed(() => Boolean(getAuthToken()));
  const token = computed(() => getAuthToken());
  const username = computed(() => getAuthUsername());
  const roles = computed(() => getAuthRoles());
  const userId = computed(() => getAuthUserId());

  return {
    session,
    isLoggedIn,
    hasToken,
    token,
    username,
    roles,
    userId,
    /** Direct access to the global AuthProvider for imperative calls. */
    authProvider: globalAuthProvider,
  };
}
