import { defineComponent, h } from 'vue';

import NebulaSurfaceLayout from './NebulaSurfaceLayout.vue';
import type { ExperienceSurface } from '../../types/layout';

function createSurfaceLayout(
  name: string,
  surface: Extract<
    ExperienceSurface,
    'portal' | 'provider' | 'settings' | 'docs'
  >,
) {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () =>
        h(
          NebulaSurfaceLayout,
          {
            ...attrs,
            surface,
          },
          slots,
        );
    },
  });
}

export const NebulaPortalLayout = createSurfaceLayout(
  'NebulaPortalLayout',
  'portal',
);
export const NebulaProviderLayout = createSurfaceLayout(
  'NebulaProviderLayout',
  'provider',
);
export const NebulaSettingsLayout = createSurfaceLayout(
  'NebulaSettingsLayout',
  'settings',
);
export const NebulaDocsLayout = createSurfaceLayout('NebulaDocsLayout', 'docs');
