import type { Component } from 'vue';

import { defineComponent, h, onMounted, ref } from 'vue';

import { tryUseNebulaAssembly } from '../context/useNebulaAssembly';
import { applyStyleContract } from '../style/applyStyleContract';
import NebulaOverlayRoot from './NebulaOverlayRoot.vue';

export interface AssemblyRootProps {
  styleContract?: import('../types/style').StyleContract;
}

/**
 * Wrap a root app component with assembly mount root + overlay host.
 * Style contract applies to this wrapper element, not document.documentElement.
 */
export function wrapWithAssemblyRoot (
  RootComponent: Component,
  props?: AssemblyRootProps,
) {
  return defineComponent({
    name: 'NebulaAssemblyRoot',
    setup (_, { attrs }) {
      const rootRef = ref<HTMLElement | null>(null);

      onMounted(() => {
        const assembly = tryUseNebulaAssembly();
        const root = rootRef.value;
        if (!root) return;

        const contract = props?.styleContract ??
          assembly?.style ?? { theme: 'system' };
        applyStyleContract(root, contract);
        assembly?.overlay.setTeleportTarget(root);
        if (assembly) {
          assembly.mountRoot = root;
        }
      });

      return () =>
        h(
          'div',
          {
            ref: rootRef,
            class: 'nebula-assembly-root',
            style: { width: '100%', height: '100%', minHeight: 0 },
            'data-nebula-assembly': '',
            ...attrs,
          },
          [h(RootComponent), h(NebulaOverlayRoot)],
        );
    },
  });
}
