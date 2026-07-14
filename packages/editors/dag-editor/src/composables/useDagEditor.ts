import { MarkerType, Position, useVueFlow } from '@vue-flow/core';
import type { PluginNodeSchema } from '@nebula-studio/nebula-low-render';
import { computed, nextTick, ref, shallowRef, watch } from 'vue';

import type { DagDefinition } from '../types/dag';
import { computeAutoLayout } from '../utils/dagAutoLayout';
import { applyEdgePathOffsets } from '../utils/applyEdgePathOffsets';
import { readStoredPosition } from '../utils/readStoredPosition';
import { resolveNodeDisplayLabel } from '../utils/resolveNodeDisplayLabel';

export interface EditorNode {
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

export interface EditorEdge {
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

export interface UseDagEditorProps {
  modelValue?: DagDefinition | string;
  nodeSchemas?: Record<string, PluginNodeSchema>;
}

export function useDagEditor(
  props: UseDagEditorProps,
  emit: (event: 'update:modelValue', value: DagDefinition) => void,
) {
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
    edges.value = edges.value.filter(
      (edge) => edge.id !== selectedEdgeId.value,
    );
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

  function onFlowInit() {
    fitViewOnInit.value = false;
  }

  function bindCanvasRef(el: HTMLElement | null) {
    canvasRef.value = el;
  }

  return {
    nodes,
    edges,
    selectedNodeId,
    selectedEdgeId,
    canvasRef,
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
  };
}
