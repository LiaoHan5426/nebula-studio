import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { globalAuthProvider } from '../index.ts';
import type { AuthSession } from '../index.ts';

/**
 * Reactive auth composable.
 *
 * Returns the current session state and helper methods.
 * The session is automatically updated when the global auth state changes.
 *
 * Usage:
 * ```ts
 * const { session, isLoggedIn, hasToken } = useAuth();
 * ```
 */
export function useAuth() {
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

  const isLoggedIn = computed(() => session.value !== null);
  const hasToken = computed(() =>
    Boolean(session.value?.token && session.value.token.length >= 20),
  );
  const username = computed(() => session.value?.user ?? null);

  return {
    session,
    isLoggedIn,
    hasToken,
    username,
    /** Direct access to the global AuthProvider for imperative calls. */
    authProvider: globalAuthProvider,
  };
}
