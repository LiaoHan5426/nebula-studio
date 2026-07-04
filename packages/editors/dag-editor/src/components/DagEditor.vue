<script setup lang="ts">
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import '@vue-flow/controls/dist/style.css';
import '../styles/dag-flow.css';

import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import {
  ConnectionMode,
  MarkerType,
  Position,
  VueFlow,
  useVueFlow,
} from '@vue-flow/core';
import { computed, markRaw, nextTick, ref, shallowRef, watch } from 'vue';
import { NebulaButton } from '@nebula-studio/nebula-ui';
import { PluginNodeForm } from '@nebula-studio/nebula-low-render';
import type { PluginNodeSchema } from '@nebula-studio/nebula-low-render';

import DagFlowNode from './DagFlowNode.vue';
import DagNodePalette from './DagNodePalette.vue';
import type { DagDefinition } from '../types/dag';
import { computeAutoLayout } from '../utils/dagAutoLayout';
import { applyEdgePathOffsets } from '../utils/applyEdgePathOffsets';
import { readStoredPosition } from '../utils/readStoredPosition';
import { resolveNodeDisplayLabel } from '../utils/resolveNodeDisplayLabel';

interface EditorNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  sourcePosition: Position;
  targetPosition: Position;
  data: {
    label: string;
    type: string;
    config: Record<string, unknown>;
  };
}

interface EditorEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  markerEnd?: string;
  pathOptions?: {
    borderRadius?: number;
    offset?: number;
  };
  deletable?: boolean;
  selectable?: boolean;
}

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

const nodes = shallowRef<EditorNode[]>([]);
const edges = shallowRef<EditorEdge[]>([]);
const selectedNodeId = ref<string | null>(null);
const selectedEdgeId = ref<string | null>(null);
const canvasRef = ref<HTMLElement | null>(null);
const fitViewOnInit = ref(true);
let skipExternalDefinitionApply = false;
const { onConnect, addEdges, fitView } = useVueFlow();

const selectedNode = computed(() =>
  selectedNodeId.value ? findFlowNode(selectedNodeId.value) : undefined,
);

const selectedNodeLabel = computed(() => {
  const node = selectedNode.value;
  if (!node) return '';
  const type = String(node.data?.type ?? 'INTERFACE');
  const schemaLabel = props.nodeSchemas?.[type]?.label;
  return String(node.data?.label ?? schemaLabel ?? node.id);
});

const selectedEdgeLabel = computed(() => {
  if (!selectedEdgeId.value) return '';
  const edge = edges.value.find((item) => item.id === selectedEdgeId.value);
  if (!edge) return '';
  const source = findFlowNode(edge.source);
  const target = findFlowNode(edge.target);
  const sourceLabel = source?.data?.label ?? edge.source;
  const targetLabel = target?.data?.label ?? edge.target;
  return `${sourceLabel} → ${targetLabel}`;
});

function selectNode(nodeId: string) {
  selectedNodeId.value = nodeId;
  selectedEdgeId.value = null;
  canvasRef.value?.focus();
}

function selectEdge(edgeId: string) {
  selectedEdgeId.value = edgeId;
  selectedNodeId.value = null;
  canvasRef.value?.focus();
}

function clearSelection() {
  selectedNodeId.value = null;
  selectedEdgeId.value = null;
}

function findFlowNode(nodeId: string): EditorNode | undefined {
  const list = nodes.value;
  for (let i = 0; i < list.length; i += 1) {
    if (list[i]?.id === nodeId) return list[i];
  }
  return undefined;
}

function defaultNodePosition(index: number): { x: number; y: number } {
  const col = index % 5;
  const row = Math.floor(index / 5);
  return { x: 48 + col * 132, y: 40 + row * 88 };
}

function buildEdgeId(source: string, target: string): string {
  return `${source}__${target}`;
}

function createFlowNode(
  node: Omit<EditorNode, 'sourcePosition' | 'targetPosition'>,
): EditorNode {
  return {
    ...node,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  };
}

function buildNodePositionMap(): Map<string, { x: number; y: number }> {
  return new Map(nodes.value.map((node) => [node.id, node.position]));
}

function refreshEdgeRouting() {
  if (edges.value.length === 0) return;
  edges.value = applyEdgePathOffsets(edges.value, buildNodePositionMap());
}

function createEdge(source: string, target: string): EditorEdge {
  return {
    id: buildEdgeId(source, target),
    source,
    target,
    sourceHandle: 'source',
    targetHandle: 'target',
    type: 'smoothstep',
    markerEnd: MarkerType.ArrowClosed,
    pathOptions: { borderRadius: 14, offset: 0 },
    deletable: true,
    selectable: true,
  };
}

onConnect((connection) => {
  const source = connection.source;
  const target = connection.target;
  if (!source || !target || source === target) return;

  const exists = edges.value.some(
    (edge) => edge.source === source && edge.target === target,
  );
  if (exists) return;

  addEdges([createEdge(source, target)]);
  refreshEdgeRouting();
  syncDefinition();
});

const selectedSchema = computed((): PluginNodeSchema => {
  if (!selectedNodeId.value) return { fields: [] };
  const node = findFlowNode(selectedNodeId.value);
  const type = String(node?.data?.type ?? 'INTERFACE');
  return props.nodeSchemas?.[type] ?? { label: type, fields: [] };
});

const selectedConfig = computed({
  get() {
    const node = selectedNodeId.value
      ? findFlowNode(selectedNodeId.value)
      : undefined;
    return (node?.data?.config as Record<string, unknown> | undefined) ?? {};
  },
  set(value: Record<string, unknown>) {
    nodes.value = nodes.value.map((node) => {
      if (node.id !== selectedNodeId.value) return node;
      const type = String(node.data?.type ?? 'INTERFACE');
      const label = resolveNodeDisplayLabel(
        type,
        value,
        props.nodeSchemas,
        node.data.label,
      );
      return {
        ...node,
        data: { ...node.data, config: value, label },
      };
    });
    syncDefinition();
  },
});

function buildDefinitionFromGraph(): DagDefinition {
  const definition: DagDefinition = { nodes: {} };
  const nodeList = nodes.value;
  const edgeList = edges.value;
  for (const node of nodeList) {
    const upstream: string[] = [];
    const downstream: string[] = [];
    for (const edge of edgeList) {
      if (edge.target === node.id) upstream.push(edge.source);
      if (edge.source === node.id) downstream.push(edge.target);
    }
    definition.nodes[node.id] = {
      type: String(node.data?.type ?? 'INTERFACE'),
      name: String(node.data?.label ?? node.id),
      config: node.data?.config ?? {},
      upstream,
      downstream,
      position: {
        x: node.position.x,
        y: node.position.y,
      },
    };
  }
  return definition;
}

function applyDefinitionFromProps(value: DagDefinition | string | undefined) {
  const definition =
    typeof value === 'string'
      ? (JSON.parse(value) as DagDefinition)
      : (value ?? { nodes: {} });
  const positions = new Map(
    nodes.value.map((node) => [node.id, node.position] as const),
  );
  const selectedId = selectedNodeId.value;
  const nextNodes: EditorNode[] = [];
  const nextEdges: EditorEdge[] = [];
  const edgeIds = new Set<string>();

  Object.entries(definition.nodes ?? {}).forEach(([nodeId, node], index) => {
    const config = node.config ?? {};
    const label = resolveNodeDisplayLabel(
      node.type,
      config,
      props.nodeSchemas,
      String(node.name ?? nodeId),
    );
    nextNodes.push(
      createFlowNode({
        id: nodeId,
        type: 'dag-node',
        position:
          readStoredPosition(node) ??
          positions.get(nodeId) ??
          defaultNodePosition(index),
        data: {
          label,
          type: node.type,
          config,
        },
      }),
    );
    for (const downstream of node.downstream ?? []) {
      const edgeId = buildEdgeId(nodeId, downstream);
      if (edgeIds.has(edgeId)) continue;
      edgeIds.add(edgeId);
      nextEdges.push(createEdge(nodeId, downstream));
    }
    for (const upstream of node.upstream ?? []) {
      const edgeId = buildEdgeId(upstream, nodeId);
      if (edgeIds.has(edgeId)) continue;
      edgeIds.add(edgeId);
      nextEdges.push(createEdge(upstream, nodeId));
    }
  });

  nodes.value = nextNodes;
  edges.value = nextEdges;
  refreshEdgeRouting();

  if (selectedId && !nextNodes.some((node) => node.id === selectedId)) {
    clearSelection();
  }
}

watch(
  () => props.modelValue,
  (value) => {
    if (skipExternalDefinitionApply) {
      skipExternalDefinitionApply = false;
      return;
    }
    applyDefinitionFromProps(value);
  },
  { immediate: true },
);

watch(
  () => props.nodeSchemas,
  (schemas) => {
    if (!schemas) return;
    let changed = false;
    nodes.value = nodes.value.map((node) => {
      const nextLabel = resolveNodeDisplayLabel(
        node.data.type,
        node.data.config,
        schemas,
        node.data.label,
      );
      if (nextLabel === node.data.label) return node;
      changed = true;
      return { ...node, data: { ...node.data, label: nextLabel } };
    });
    if (changed) {
      skipExternalDefinitionApply = true;
      emit('update:modelValue', buildDefinitionFromGraph());
    }
  },
  { deep: true },
);

function addNode(type = 'INTERFACE', label?: string) {
  const nodeId = `node-${nodes.value.length + 1}-${Date.now()}`;
  const schemaLabel = props.nodeSchemas?.[type]?.label;
  nodes.value = [
    ...nodes.value,
    createFlowNode({
      id: nodeId,
      type: 'dag-node',
      position: defaultNodePosition(nodes.value.length),
      data: {
        label: label ?? schemaLabel ?? nodeId,
        type,
        config: {},
      },
    }),
  ];
  syncDefinition();
}

function addNodeFromPalette(payload: { type: string; label: string }) {
  addNode(payload.type, payload.label);
}

function deleteSelectedNode() {
  if (!selectedNodeId.value) return;
  const id = selectedNodeId.value;
  nodes.value = nodes.value.filter((node) => node.id !== id);
  edges.value = edges.value.filter(
    (edge) => edge.source !== id && edge.target !== id,
  );
  selectedNodeId.value = null;
  refreshEdgeRouting();
  syncDefinition();
}

function deleteSelectedEdge() {
  if (!selectedEdgeId.value) return;
  edges.value = edges.value.filter((edge) => edge.id !== selectedEdgeId.value);
  selectedEdgeId.value = null;
  refreshEdgeRouting();
  syncDefinition();
}

function onNodesDelete(deletedNodes: Array<{ id: string }>) {
  const ids = new Set(deletedNodes.map((node) => node.id));
  edges.value = edges.value.filter(
    (edge) => !ids.has(edge.source) && !ids.has(edge.target),
  );
  if (selectedNodeId.value && ids.has(selectedNodeId.value)) {
    selectedNodeId.value = null;
  }
  refreshEdgeRouting();
  syncDefinition();
}

function onEdgesDelete(deletedEdges: Array<{ id: string }>) {
  const ids = new Set(deletedEdges.map((edge) => edge.id));
  if (selectedEdgeId.value && ids.has(selectedEdgeId.value)) {
    selectedEdgeId.value = null;
  }
  refreshEdgeRouting();
  syncDefinition();
}

function onCanvasKeyDown(event: KeyboardEvent) {
  if (event.key !== 'Delete' && event.key !== 'Backspace') return;
  const target = event.target as HTMLElement | null;
  if (
    target &&
    (target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable)
  ) {
    return;
  }

  if (selectedEdgeId.value) {
    event.preventDefault();
    deleteSelectedEdge();
    return;
  }

  if (selectedNodeId.value) {
    event.preventDefault();
    deleteSelectedNode();
  }
}

function syncDefinition() {
  skipExternalDefinitionApply = true;
  emit('update:modelValue', buildDefinitionFromGraph());
}

function onNodeDragStop() {
  refreshEdgeRouting();
  syncDefinition();
}

function collectLayoutEdges(): Array<{ source: string; target: string }> {
  const seen = new Set<string>();
  const layoutEdges: Array<{ source: string; target: string }> = [];

  const addEdge = (source: string, target: string) => {
    if (!source || !target || source === target) return;
    const key = buildEdgeId(source, target);
    if (seen.has(key)) return;
    seen.add(key);
    layoutEdges.push({ source, target });
  };

  for (const edge of edges.value) {
    addEdge(edge.source, edge.target);
  }

  const rawDefinition = props.modelValue;
  const definition =
    typeof rawDefinition === 'string'
      ? (JSON.parse(rawDefinition) as DagDefinition)
      : rawDefinition;
  for (const [nodeId, node] of Object.entries(definition?.nodes ?? {})) {
    for (const downstream of node.downstream ?? []) {
      addEdge(nodeId, downstream);
    }
    for (const upstream of node.upstream ?? []) {
      addEdge(upstream, nodeId);
    }
  }

  return layoutEdges;
}

async function autoLayout() {
  if (nodes.value.length === 0) return;
  const positions = computeAutoLayout(
    nodes.value.map((node) => node.id),
    collectLayoutEdges(),
  );
  nodes.value = nodes.value.map((node) => ({
    ...node,
    position: positions.get(node.id) ?? node.position,
  }));
  refreshEdgeRouting();
  syncDefinition();
  await nextTick();
  fitView({ padding: 0.18, duration: 200 });
}
</script>

<template>
  <div class="dag-editor" :class="{ 'dag-editor--with-panel': selectedNodeId }">
    <div class="dag-editor__toolbar">
      <NebulaButton variant="secondary" @click="addNode()"
        >新增节点</NebulaButton
      >
      <NebulaButton
        variant="secondary"
        :disabled="!selectedNodeId"
        @click="deleteSelectedNode"
      >
        删除节点
      </NebulaButton>
      <NebulaButton
        variant="secondary"
        :disabled="!selectedEdgeId"
        @click="deleteSelectedEdge"
      >
        删除连线
      </NebulaButton>
      <NebulaButton
        variant="secondary"
        :disabled="nodes.length === 0"
        @click="autoLayout"
      >
        自动布局
      </NebulaButton>
      <span v-if="selectedNodeId" class="dag-editor__selection-hint">
        已选中节点：{{ selectedNodeLabel }}
      </span>
      <span v-else-if="selectedEdgeId" class="dag-editor__selection-hint">
        已选中连线：{{ selectedEdgeLabel }}（Delete 可删除）
      </span>
      <span
        v-else
        class="dag-editor__selection-hint dag-editor__selection-hint--muted"
      >
        从节点拖出到目标节点即可连线；点击连线可选中删除
      </span>
    </div>
    <div
      class="dag-editor__main"
      :class="{ 'dag-editor__main--with-panel': selectedNodeId }"
    >
      <DagNodePalette
        class="dag-editor__palette"
        :node-schemas="nodeSchemas"
        @add="addNodeFromPalette"
      />
      <div
        ref="canvasRef"
        class="dag-editor__canvas-wrap"
        tabindex="0"
        @keydown="onCanvasKeyDown"
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
          @init="fitViewOnInit = false"
          :delete-key-code="['Backspace', 'Delete']"
          edges-deletable
          edges-selectable
          @node-click="({ node }) => selectNode(node.id)"
          @edge-click="({ edge }) => selectEdge(edge.id)"
          @pane-click="clearSelection"
          @nodes-delete="onNodesDelete"
          @edges-delete="onEdgesDelete"
          @node-drag-stop="onNodeDragStop"
        >
          <Background :gap="16" :size="1" />
          <Controls />
        </VueFlow>
      </div>
      <aside v-if="selectedNodeId" class="dag-editor__panel">
        <div class="dag-editor__panel-head">
          <div>
            <p class="dag-editor__panel-kicker">节点配置</p>
            <h4 class="dag-editor__panel-title">{{ selectedNodeLabel }}</h4>
          </div>
          <NebulaButton variant="secondary" @click="deleteSelectedNode">
            删除
          </NebulaButton>
        </div>
        <PluginNodeForm
          v-model="selectedConfig"
          :schema="selectedSchema"
          :show-title="false"
        />
      </aside>
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

.dag-editor__toolbar {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.dag-editor__selection-hint {
  margin-left: auto;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.dag-editor__selection-hint--muted {
  opacity: 0.85;
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

.dag-editor__panel {
  padding: 10px;
  overflow: visible;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.dag-editor__panel-head {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
}

.dag-editor__panel-kicker {
  margin: 0 0 4px;
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}

.dag-editor__panel-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
}
</style>
