import type { ComputedRef } from 'vue';

import type { LayoutHostMode } from '@nebula-studio/shell-protocol';

import { computed } from 'vue';

import { tryUseNebulaAssembly } from '@nebula-studio/nebula-assembly';
import {
  getLayoutHostMode,
  getWebShellEmbedSurface,
} from '@nebula-studio/shell-protocol';

export function useShellHosted(): {
  embedSurface: ComputedRef<null | string>;
  hostMode: ComputedRef<LayoutHostMode>;
  isShellHosted: ComputedRef<boolean>;
} {
  const assembly = tryUseNebulaAssembly();
  const embedSurface = computed(() =>
    typeof window !== 'undefined' ? getWebShellEmbedSurface() : null,
  );
  const hostMode = computed((): LayoutHostMode => {
    if (assembly) {
      return assembly.host.surface === 'platform-embed'
        ? 'shell-hosted'
        : 'standalone';
    }
    return getLayoutHostMode(embedSurface.value);
  });
  const isShellHosted = computed(() => hostMode.value === 'shell-hosted');

  return { embedSurface, hostMode, isShellHosted };
}
