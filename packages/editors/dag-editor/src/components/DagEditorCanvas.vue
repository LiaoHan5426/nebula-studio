<script setup lang="ts">
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import '@vue-flow/controls/dist/style.css';

import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import { ConnectionMode, VueFlow } from '@vue-flow/core';
import type { EditorEdge, EditorNode } from '../composables/useDagEditor';

const nodes = defineModel<EditorNode[]>('nodes', { required: true });
const edges = defineModel<EditorEdge[]>('edges', { required: true });

defineProps<{
  nodeTypes: Record<string, unknown>;
  defaultEdgeOptions: Record<string, unknown>;
  fitViewOnInit: boolean;
  bindCanvasRef: (el: HTMLElement | null) => void;
}>();

const emit = defineEmits<{
  nodeClick: [nodeId: string];
  edgeClick: [edgeId: string];
  paneClick: [];
  nodesDelete: [deletedNodes: Array<{ id: string }>];
  edgesDelete: [deletedEdges: Array<{ id: string }>];
  nodeDragStop: [];
  keydown: [event: KeyboardEvent];
  init: [];
}>();
</script>

<template>
  <div
    :ref="(el) => bindCanvasRef(el as HTMLElement | null)"
    class="dag-editor__canvas-wrap"
    tabindex="0"
    @keydown="emit('keydown', $event)"
  >
    <VueFlow
      v-model:nodes="nodes as unknown as import('@vue-flow/core').Node[]"
      v-model:edges="edges as unknown as import('@vue-flow/core').Edge[]"
      :node-types="nodeTypes as any"
      :default-edge-options="defaultEdgeOptions"
      :connection-mode="ConnectionMode.Loose"
      :connection-radius="48"
      :min-zoom="0.35"
      :max-zoom="1.75"
      :fit-view-on-init="fitViewOnInit"
      :delete-key-code="['Backspace', 'Delete']"
      edges-deletable
      edges-selectable
      @init="emit('init')"
      @node-click="({ node }) => emit('nodeClick', node.id)"
      @edge-click="({ edge }) => emit('edgeClick', edge.id)"
      @pane-click="emit('paneClick')"
      @nodes-delete="emit('nodesDelete', $event)"
      @edges-delete="emit('edgesDelete', $event)"
      @node-drag-stop="emit('nodeDragStop')"
    >
      <Background :gap="16" :size="1" />
      <Controls />
    </VueFlow>
  </div>
</template>

<style scoped>
.dag-editor__canvas-wrap {
  align-self: stretch;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  outline: none;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.dag-editor__canvas-wrap:focus-visible {
  box-shadow: 0 0 0 2px hsl(var(--primary) / 35%);
}
</style>
