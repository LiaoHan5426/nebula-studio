import type { Component } from 'vue';

import type {
  ExactComponentLock,
  LowCodeApplicationDefinitionVersion,
  LowCodeDraftDocument,
  LowCodeNode,
  LowCodeRuntimeContext,
} from '@nebula-studio/low-code-contract';

import type { LowCodeComponentRegistry } from './registry.ts';

import { defineComponent, h, onErrorCaptured, onUnmounted, ref } from 'vue';

import { validateComponentLock } from '@nebula-studio/low-code-contract';

import { resolveProps } from './bindings.ts';
import { IframeVisualHost } from './IframeVisualHost.ts';

const NodeBoundary = defineComponent({
  name: 'LowCodeNodeBoundary',
  props: {
    nodeId: { type: String, required: true },
  },
  setup(props, { slots }) {
    const message = ref('');
    onErrorCaptured((error) => {
      message.value = error instanceof Error ? error.message : String(error);
      return false;
    });
    return () =>
      message.value
        ? h(
            'div',
            {
              class: 'lc-error',
              role: 'alert',
              'data-lc-error': props.nodeId,
            },
            message.value,
          )
        : slots.default?.();
  },
});

function renderNode(
  node: LowCodeNode,
  lock: ExactComponentLock,
  registry: LowCodeComponentRegistry,
  context: LowCodeRuntimeContext,
  mode: 'designer' | 'preview' | 'runtime',
  selectedId?: string,
): ReturnType<typeof h> | undefined {
  if (node.visibility === 'hidden') return undefined;
  const locked = lock.components[node.type];
  const impl = locked ? registry.resolve(node.type, locked) : null;
  const children = [
    ...(node.children ?? []).map((child) =>
      renderNode(child, lock, registry, context, mode, selectedId),
    ),
    ...Object.values(node.slots ?? {}).flatMap((slotNodes) =>
      slotNodes.map((child) =>
        renderNode(child, lock, registry, context, mode, selectedId),
      ),
    ),
  ].filter((child): child is ReturnType<typeof h> => child !== undefined);

  const isolated = node.isolation === 'iframe' || node.type === 'SandboxFrame';
  const inner = isolated
    ? h(IframeVisualHost, {
        nodeId: node.id,
        data: context.data,
      })
    : impl
      ? h(impl as Component, resolveProps(node.props, node.bindings, context), {
          default: () => children,
        })
      : h(
          'div',
          {
            class: 'lc-error',
            role: 'alert',
            'data-lc-error': node.id,
          },
          `Unknown or unlocked component: ${node.type}`,
        );

  const wrapped =
    mode === 'designer'
      ? h(
          'div',
          {
            'data-lc-node': node.id,
            tabindex: 0,
            role: 'button',
            'aria-selected': node.id === selectedId ? 'true' : 'false',
            draggable: node.id !== 'root',
            onDragstart: (event: DragEvent) => {
              event.stopPropagation();
              event.dataTransfer?.setData('application/x-nebula-node', node.id);
              if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
            },
            class:
              node.id === selectedId ? 'lc-node lc-node--selected' : 'lc-node',
          },
          [inner],
        )
      : inner;

  return h(NodeBoundary, { nodeId: node.id }, () => wrapped);
}

export const LowCodeCompiler = defineComponent({
  name: 'LowCodeCompiler',
  props: {
    definition: {
      type: Object as () =>
        | LowCodeApplicationDefinitionVersion
        | LowCodeDraftDocument,
      required: true,
    },
    componentLock: {
      type: Object as () => ExactComponentLock,
      required: true,
    },
    registry: {
      type: Object as () => LowCodeComponentRegistry,
      required: true,
    },
    context: {
      type: Object as () => LowCodeRuntimeContext,
      required: true,
    },
    mode: {
      type: String as () => 'designer' | 'preview' | 'runtime',
      default: 'runtime',
    },
    selectedId: { type: String, default: '' },
  },
  setup(props) {
    const disposed = ref(false);
    onUnmounted(() => {
      disposed.value = true;
    });
    return () => {
      if (disposed.value) return null;
      try {
        validateComponentLock(props.definition, props.componentLock);
      } catch (error) {
        return h(
          'div',
          { class: 'lc-error', role: 'alert', 'data-lc-error': 'definition' },
          error instanceof Error ? error.message : String(error),
        );
      }
      return h(
        'div',
        { class: 'lc-root', 'data-lc-mode': props.mode },
        renderNode(
          props.definition.tree,
          props.componentLock,
          props.registry,
          props.context,
          props.mode,
          props.selectedId,
        ) ?? [],
      );
    };
  },
});
