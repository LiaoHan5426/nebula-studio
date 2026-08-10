import type { ComputedRef } from 'vue';

import type { LayoutHostMode } from '@nebula-studio/app-shell';

import { computed } from 'vue';

import {
  getLayoutHostMode,
  getWebShellEmbedSurface,
} from '@nebula-studio/app-shell';

export function useShellHosted(): {
  embedSurface: ComputedRef<null | string>;
  hostMode: ComputedRef<LayoutHostMode>;
  isShellHosted: ComputedRef<boolean>;
} {
  const embedSurface = computed(() =>
    typeof window !== 'undefined' ? getWebShellEmbedSurface() : null,
  );
  const hostMode = computed(() => getLayoutHostMode(embedSurface.value));
  const isShellHosted = computed(() => hostMode.value === 'shell-hosted');

  return { embedSurface, hostMode, isShellHosted };
}
