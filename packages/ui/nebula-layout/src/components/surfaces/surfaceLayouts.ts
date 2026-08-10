import type { ExperienceSurface } from '../../types/layout';

import { defineComponent, h } from 'vue';

import NebulaSurfaceLayout from './NebulaSurfaceLayout.vue';

function createSurfaceLayout(
  name: string,
  surface: Extract<
    ExperienceSurface,
    'docs' | 'portal' | 'provider' | 'settings'
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
