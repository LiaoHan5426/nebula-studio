<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { NebulaButton } from '@nebula-studio/nebula-ui';

import { monitorApi } from '@/shared/api/consoleApi';
import { useTenant } from '@/shared/composables/useTenant';
import { isApiSuccess } from '@/shared/types';

interface TopologyNode {
  id: string;
  name: string;
  type: 'tenant' | 'service' | 'plugin' | 'datasource';
  x?: number;
  y?: number;
}

interface TopologyLink {
  source: string;
  target: string;
  label?: string;
}

const nodes = ref<TopologyNode[]>([]);
const links = ref<TopologyLink[]>([]);
const loading = ref(false);
const { currentTenantId } = useTenant();

onMounted(() => {
  loadTopology();
});

watch(currentTenantId, () => {
  loadTopology();
});

async function loadTopology() {
  if (!currentTenantId.value) {
    nodes.value = [];
    links.value = [];
    return;
  }
  loading.value = true;
  try {
    const [nodesRes, edgesRes] = await Promise.all([
      monitorApi.topologyNodes(currentTenantId.value),
      monitorApi.topologyEdges(currentTenantId.value),
    ]);

    if (isApiSuccess(nodesRes)) {
      nodes.value = (nodesRes.data ?? []).map((n, index) => ({
        id: String(n.nodeId ?? n.node_id ?? index),
        name: String(n.nodeName ?? n.node_name ?? n.nodeId ?? 'node'),
        type: (n.nodeType ?? n.node_type ?? 'service') as TopologyNode['type'],
        x: 100 + (index % 4) * 180,
        y: 100 + Math.floor(index / 4) * 120,
      }));
    }

    if (isApiSuccess(edgesRes)) {
      links.value = (edgesRes.data ?? []).map((e) => ({
        source: String(e.sourceNodeId ?? e.source_node_id ?? ''),
        target: String(e.targetNodeId ?? e.target_node_id ?? ''),
        label: String(e.edgeType ?? e.edge_type ?? ''),
      }));
    }
  } finally {
    loading.value = false;
  }
}

function handleRefresh() {
  loadTopology();
}

function getNodeIcon(type: TopologyNode['type']): string {
  const iconMap = {
    tenant: '🏢',
    service: '⚙️',
    plugin: '🔌',
    datasource: '🗄️',
  };
  return iconMap[type] || '📦';
}

function getNodeColor(type: TopologyNode['type']): string {
  const colorMap = {
    tenant: 'var(--primary)',
    service: 'var(--success)',
    plugin: 'var(--warning)',
    datasource: 'var(--info)',
  };
  return colorMap[type] || 'var(--muted-foreground)';
}
</script>

<template>
  <div class="topology-page">
    <header class="topology-page__header">
      <div>
        <h2 class="topology-page__title">服务拓扑</h2>
        <p class="topology-page__desc">
          以拓扑图形式展示服务的调用链路，包括租户、服务、插件、数据源之间的调用关系。
        </p>
      </div>
      <div class="topology-page__actions">
        <NebulaButton variant="secondary" @click="handleRefresh">
          刷新
        </NebulaButton>
      </div>
    </header>

    <div class="topology-page__content">
      <div class="topology-legend">
        <div class="legend-item">
          <span class="legend-icon">🏢</span>
          <span>租户</span>
        </div>
        <div class="legend-item">
          <span class="legend-icon">⚙️</span>
          <span>服务</span>
        </div>
        <div class="legend-item">
          <span class="legend-icon">🔌</span>
          <span>插件</span>
        </div>
        <div class="legend-item">
          <span class="legend-icon">🗄️</span>
          <span>数据源</span>
        </div>
      </div>

      <!-- 简化的拓扑图展示 -->
      <div class="topology-graph" :class="{ loading }">
        <div
          v-for="node in nodes"
          :key="node.id"
          class="topology-node"
          :style="{
            left: node.x + 'px',
            top: node.y + 'px',
            borderColor: getNodeColor(node.type),
          }"
        >
          <span class="node-icon">{{ getNodeIcon(node.type) }}</span>
          <span class="node-name">{{ node.name }}</span>
        </div>

        <svg class="topology-links">
          <line
            v-for="(link, index) in links"
            :key="index"
            :x1="nodes.find((n) => n.id === link.source)?.x ?? 0"
            :y1="nodes.find((n) => n.id === link.source)?.y ?? 0"
            :x2="nodes.find((n) => n.id === link.target)?.x ?? 0"
            :y2="nodes.find((n) => n.id === link.target)?.y ?? 0"
            class="topology-link"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.topology-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.topology-page__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 20px;
  background: hsl(var(--card));
  border-radius: 8px;
}

.topology-page__title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
}

.topology-page__desc {
  margin: 0;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.topology-page__actions {
  display: flex;
  gap: 8px;
}

.topology-page__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.topology-legend {
  display: flex;
  gap: 16px;
  padding: 8px 16px;
  background: hsl(var(--card));
  border-radius: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.legend-icon {
  font-size: 14px;
}

.topology-graph {
  position: relative;
  flex: 1;
  min-height: 500px;
  padding: 20px;
  background: hsl(var(--card));
  border-radius: 8px;
  overflow: auto;
}

.topology-graph.loading {
  opacity: 0.6;
  pointer-events: none;
}

.topology-node {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: hsl(var(--background));
  border: 2px solid;
  border-radius: 8px;
  font-size: 12px;
  white-space: nowrap;
  transform: translate(-50%, -50%);
  transition: all 0.2s;
}

.topology-node:hover {
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
}

.node-icon {
  font-size: 14px;
}

.node-name {
  font-weight: 500;
}

.topology-links {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.topology-link {
  stroke: hsl(var(--border));
  stroke-width: 2;
}
</style>
