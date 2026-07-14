<script setup lang="ts">
import '../styles/dag-flow.css';

import { MarkerType } from '@vue-flow/core';
import type { PluginNodeSchema } from '@nebula-studio/nebula-low-render';
import { markRaw } from 'vue';

import { useDagEditor } from '../composables/useDagEditor';
import type { DagDefinition } from '../types/dag';
import DagEditorCanvas from './DagEditorCanvas.vue';
import DagEditorInspector from './DagEditorInspector.vue';
import DagEditorToolbar from './DagEditorToolbar.vue';
import DagFlowNode from './DagFlowNode.vue';
import DagNodePalette from './DagNodePalette.vue';

const props = defineProps<{
  modelValue?: DagDefinition | string;
  nodeSchemas?: Record<string, PluginNodeSchema>;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: DagDefinition];
}>();

const nodeTypes = markRaw({
  'dag-node': markRaw(DagFlowNode),
});

const defaultEdgeOptions = markRaw({
  type: 'smoothstep',
  markerEnd: MarkerType.ArrowClosed,
  pathOptions: { borderRadius: 14, offset: 0 },
  deletable: true,
  selectable: true,
});

const {
  nodes,
  edges,
  selectedNodeId,
  selectedEdgeId,
  fitViewOnInit,
  selectedNodeLabel,
  selectedEdgeLabel,
  selectedSchema,
  selectedConfig,
  selectNode,
  selectEdge,
  clearSelection,
  addNode,
  addNodeFromPalette,
  deleteSelectedNode,
  deleteSelectedEdge,
  onNodesDelete,
  onEdgesDelete,
  onCanvasKeyDown,
  onNodeDragStop,
  autoLayout,
  onFlowInit,
  bindCanvasRef,
} = useDagEditor(props, (event, value) => emit(event, value));
</script>

<template>
  <div class="dag-editor" :class="{ 'dag-editor--with-panel': selectedNodeId }">
    <DagEditorToolbar
      :selected-node-id="selectedNodeId"
      :selected-edge-id="selectedEdgeId"
      :selected-node-label="selectedNodeLabel"
      :selected-edge-label="selectedEdgeLabel"
      :node-count="nodes.length"
      @add-node="addNode()"
      @delete-node="deleteSelectedNode"
      @delete-edge="deleteSelectedEdge"
      @auto-layout="autoLayout"
    />
    <div
      class="dag-editor__main"
      :class="{ 'dag-editor__main--with-panel': selectedNodeId }"
    >
      <DagNodePalette
        class="dag-editor__palette"
        :node-schemas="nodeSchemas"
        @add="addNodeFromPalette"
      />
      <DagEditorCanvas
        v-model:nodes="nodes"
        v-model:edges="edges"
        :node-types="nodeTypes"
        :default-edge-options="defaultEdgeOptions"
        :fit-view-on-init="fitViewOnInit"
        :bind-canvas-ref="bindCanvasRef"
        @init="onFlowInit"
        @node-click="selectNode"
        @edge-click="selectEdge"
        @pane-click="clearSelection"
        @nodes-delete="onNodesDelete"
        @edges-delete="onEdgesDelete"
        @node-drag-stop="onNodeDragStop"
        @keydown="onCanvasKeyDown"
      />
      <DagEditorInspector
        v-if="selectedNodeId"
        v-model:selected-config="selectedConfig"
        :selected-node-label="selectedNodeLabel"
        :selected-schema="selectedSchema"
        @delete-node="deleteSelectedNode"
      />
    </div>
  </div>
</template>

<style scoped>
.dag-editor {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.dag-editor__main {
  display: grid;
  flex: 1 1 auto;
  grid-template-rows: minmax(0, 1fr);
  grid-template-columns: 168px minmax(0, 1fr);
  gap: 10px;
  align-items: stretch;
  min-height: 0;
  overflow: hidden;
}

.dag-editor__main--with-panel {
  grid-template-columns: 168px minmax(0, 1fr) 232px;
}

.dag-editor__palette {
  min-width: 0;
  height: 100%;
  min-height: 0;
  overflow: auto;
}
</style>
