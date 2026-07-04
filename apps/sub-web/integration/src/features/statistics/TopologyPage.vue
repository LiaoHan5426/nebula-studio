<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { NebulaButton, NebulaPane, NebulaTag } from '@nebula-studio/nebula-ui';

import { monitorApi } from '@/shared/api/consoleApi';
import { camelTopologyApi } from '@/shared/api/topologyApi';
import { useTenant } from '@/shared/composables/useTenant';
import { isApiSuccess } from '@/shared/types';
import type {
  TopologyError,
  TopologyTrace,
} from '@nebula-studio/contracts/integration';

// 通用拓扑视图模型（来自 monitorApi.topologyNodes，返回 Record<string, unknown>[]）
// 与 contracts/integration/topology 的 TopologyNodeData 不同：
// 此处包含渲染坐标 (x/y) 和可视化类型联合，属于视图层 view-model。
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

// Camel route topology
const routeId = ref('');
const routeInput = ref('');
const traces = ref<TopologyTrace[]>([]);
const errors = ref<TopologyError[]>([]);
const activeTab = ref<'topology' | 'traces' | 'errors'>('topology');
const tracesLoading = ref(false);

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
  if (routeId.value) {
    loadRouteDetails();
  }
}

async function handleLoadRoute() {
  if (!routeInput.value.trim()) return;
  routeId.value = routeInput.value.trim();
  await loadRouteDetails();
}

async function loadRouteDetails() {
  if (!routeId.value) return;
  tracesLoading.value = true;
  try {
    const [tracesRes, errorsRes] = await Promise.all([
      camelTopologyApi.getTraces(routeId.value),
      camelTopologyApi.getErrors(routeId.value),
    ]);
    if (isApiSuccess(tracesRes)) {
      traces.value = tracesRes.data ?? [];
    }
    if (isApiSuccess(errorsRes)) {
      errors.value = errorsRes.data ?? [];
    }
  } finally {
    tracesLoading.value = false;
  }
}

async function handleClearTraces() {
  if (!routeId.value) return;
  await camelTopologyApi.clearTraces(routeId.value);
  traces.value = [];
}

function traceStatusVariant(status: string) {
  if (status === 'SUCCESS' || status === 'COMPLETED') return 'success';
  if (status === 'FAILED' || status === 'ERROR') return 'danger';
  return 'default';
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
        <input
          v-model="routeInput"
          class="topology-page__route-input"
          placeholder="输入 Route ID 查看追踪"
          @keydown.enter="handleLoadRoute"
        />
        <NebulaButton variant="secondary" @click="handleLoadRoute">
          查询路由
        </NebulaButton>
        <NebulaButton variant="secondary" @click="handleRefresh">
          刷新
        </NebulaButton>
      </div>
    </header>

    <div class="topology-page__content">
      <!-- Tab 切换 -->
      <div class="topology-tabs">
        <button
          class="topology-tab"
          :class="{ 'topology-tab--active': activeTab === 'topology' }"
          @click="activeTab = 'topology'"
        >
          拓扑图
        </button>
        <button
          v-if="routeId"
          class="topology-tab"
          :class="{ 'topology-tab--active': activeTab === 'traces' }"
          @click="activeTab = 'traces'"
        >
          调用链 ({{ traces.length }})
        </button>
        <button
          v-if="routeId"
          class="topology-tab"
          :class="{ 'topology-tab--active': activeTab === 'errors' }"
          @click="activeTab = 'errors'"
        >
          异常 ({{ errors.length }})
        </button>
      </div>

      <!-- 拓扑图 -->
      <div v-if="activeTab === 'topology'" class="topology-graph-wrapper">
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

      <!-- 调用链追踪 -->
      <div v-if="activeTab === 'traces'" class="topology-detail">
        <div class="topology-detail__toolbar">
          <NebulaButton variant="secondary" @click="loadRouteDetails">
            刷新
          </NebulaButton>
          <NebulaButton variant="secondary" @click="handleClearTraces">
            清除追踪
          </NebulaButton>
        </div>
        <div v-if="tracesLoading" class="topology-detail__empty">加载中…</div>
        <div v-else-if="traces.length === 0" class="topology-detail__empty">
          暂无追踪记录
        </div>
        <div v-else class="topology-detail__list">
          <div
            v-for="trace in traces"
            :key="trace.id"
            class="topology-detail__item"
          >
            <div class="topology-detail__item-head">
              <NebulaTag :variant="traceStatusVariant(trace.status)">
                {{ trace.status }}
              </NebulaTag>
              <span class="topology-detail__time">{{ trace.timestamp }}</span>
            </div>
            <p class="topology-detail__meta">
              耗时: {{ trace.duration }}ms · Route: {{ trace.routeId }}
            </p>
          </div>
        </div>
      </div>

      <!-- 异常记录 -->
      <div v-if="activeTab === 'errors'" class="topology-detail">
        <div class="topology-detail__toolbar">
          <NebulaButton variant="secondary" @click="loadRouteDetails">
            刷新
          </NebulaButton>
        </div>
        <div v-if="errors.length === 0" class="topology-detail__empty">
          暂无异常记录
        </div>
        <div v-else class="topology-detail__list">
          <div
            v-for="err in errors"
            :key="err.id"
            class="topology-detail__item topology-detail__item--error"
          >
            <div class="topology-detail__item-head">
              <NebulaTag variant="danger">ERROR</NebulaTag>
              <span class="topology-detail__time">{{ err.timestamp }}</span>
            </div>
            <p class="topology-detail__message">{{ err.message }}</p>
            <pre v-if="err.stackTrace" class="topology-detail__stack">{{
              err.stackTrace
            }}</pre>
          </div>
        </div>
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
  align-items: flex-start;
  justify-content: space-between;
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
  display: flex;
  flex: 1;
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
  gap: 6px;
  align-items: center;
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
  overflow: auto;
  background: hsl(var(--card));
  border-radius: 8px;
}

.topology-graph.loading {
  pointer-events: none;
  opacity: 0.6;
}

.topology-node {
  position: absolute;
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 8px 12px;
  font-size: 12px;
  white-space: nowrap;
  background: hsl(var(--background));
  border: 2px solid;
  border-radius: 8px;
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

.topology-page__route-input {
  padding: 6px 10px;
  font-size: 13px;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.topology-tabs {
  display: flex;
  gap: 4px;
  padding-bottom: 0;
  border-bottom: 1px solid hsl(var(--border));
}

.topology-tab {
  padding: 8px 16px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
}

.topology-tab--active {
  color: hsl(var(--foreground));
  border-bottom-color: hsl(var(--primary));
}

.topology-graph-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.topology-detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.topology-detail__toolbar {
  display: flex;
  gap: 8px;
}

.topology-detail__empty {
  padding: 24px;
  color: hsl(var(--muted-foreground));
  text-align: center;
}

.topology-detail__list {
  display: grid;
  gap: 8px;
}

.topology-detail__item {
  padding: 12px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.topology-detail__item-head {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
}

.topology-detail__time {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.topology-detail__meta {
  margin: 0;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.topology-detail__message {
  margin: 6px 0 0;
  font-size: 13px;
  color: hsl(var(--destructive, 0 84% 60%));
}

.topology-detail__stack {
  max-height: 200px;
  padding: 8px;
  margin-top: 8px;
  overflow: auto;
  font-size: 11px;
  line-height: 1.4;
  background: hsl(var(--muted) / 40%);
  border-radius: 4px;
}
</style>
