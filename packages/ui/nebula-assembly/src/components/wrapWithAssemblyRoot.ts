import type { Component } from 'vue';

import { defineComponent, h, onMounted, onUnmounted, ref } from 'vue';

import { tryUseNebulaAssembly } from '../context/useNebulaAssembly';
import {
  applyOverlayStyleAttrs,
  applyStyleContract,
} from '../style/applyStyleContract';
import NebulaOverlayRoot from './NebulaOverlayRoot.vue';

export interface AssemblyRootProps {
  styleContract?: import('../types/style').StyleContract;
}

function createOverlayPortalElement(): HTMLElement {
  const portal = document.createElement('div');
  portal.className = 'nebula-assembly__overlay-container';
  portal.setAttribute('data-nebula-overlay-container', '');
  document.body.appendChild(portal);
  return portal;
}

/**
 * Wrap a root app component with assembly mount root + overlay host.
 * Style contract applies to this wrapper element, not document.documentElement.
 * Overlay teleport target is a body-level portal so dialogs are not clipped
 * by mount-root overflow.
 */
export function wrapWithAssemblyRoot(
  RootComponent: Component,
  props?: AssemblyRootProps,
) {
  return defineComponent({
    name: 'NebulaAssemblyRoot',
    setup(_, { attrs }) {
      const rootRef = ref<HTMLElement | null>(null);
      const assembly = tryUseNebulaAssembly();
      let portal: HTMLElement | null = null;

      if (assembly && typeof document !== 'undefined') {
        portal = createOverlayPortalElement();
        assembly.overlay.setTeleportTarget(portal);
      }

      onMounted(() => {
        const root = rootRef.value;
        if (!root) return;

        const contract = props?.styleContract ??
          assembly?.style ?? { theme: 'system' };
        applyStyleContract(root, contract);
        if (portal) applyOverlayStyleAttrs(portal, contract);
        if (assembly) {
          assembly.mountRoot = root;
        }
      });

      onUnmounted(() => {
        portal?.remove();
        portal = null;
        assembly?.overlay.setTeleportTarget(null);
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
