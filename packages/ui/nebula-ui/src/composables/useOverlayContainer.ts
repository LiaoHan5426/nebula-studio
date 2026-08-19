import type { ComputedRef, InjectionKey, Ref } from 'vue';

import { computed, inject } from 'vue';

/**
 * Optional overlay teleport target. Owned by nebula-ui so assembly can provide
 * it without creating a ui → assembly dependency. Missing inject falls back
 * to document.body.
 */
export const overlayContainerKey: InjectionKey<Ref<HTMLElement | null>> =
  Symbol('nebula-overlay-container');

export function useOverlayTeleportTo(): ComputedRef<HTMLElement | string> {
  const container = inject(overlayContainerKey, null);
  return computed(() => container?.value ?? 'body');
}
