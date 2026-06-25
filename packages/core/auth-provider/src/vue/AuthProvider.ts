import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';
import { globalAuthProvider } from '../index.ts';
import type { AuthSession } from '../index.ts';

/**
 * AuthProvider Vue component.
 *
 * Provides reactive auth state to descendant components via scoped slot.
 *
 * Usage:
 * ```vue
 * <AuthProvider v-slot="{ session, login, logout }">
 *   <RouterView v-if="session" />
 *   <LoginPage v-else @login="login" />
 * </AuthProvider>
 * ```
 */
export const AuthProviderComponent = defineComponent({
  name: 'AuthProvider',
  setup(_props, { slots }) {
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

    return () => {
      if (!slots.default) return null;
      return slots.default({
        session: session.value,
        isLoggedIn:
          session.value !== null && globalAuthProvider.hasValidSession(),
      });
    };
  },
});
