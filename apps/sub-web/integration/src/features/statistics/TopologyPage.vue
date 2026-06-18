<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NebulaButton } from '@nebula-studio/nebula-ui';

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

// 模拟拓扑数据
const nodes = ref<TopologyNode[]>([
  { id: 'tenant-001', name: '测试租户', type: 'tenant', x: 100, y: 200 },
  { id: 'tenant-002', name: '生产租户', type: 'tenant', x: 100, y: 400 },
  { id: 'svc-001', name: '用户查询服务', type: 'service', x: 300, y: 150 },
  { id: 'svc-002', name: '订单查询服务', type: 'service', x: 300, y: 300 },
  { id: 'svc-003', name: '组合服务-用户订单', type: 'service', x: 300, y: 450 },
  { id: 'pre-001', name: '参数转换', type: 'plugin', x: 500, y: 200 },
  { id: 'post-001', name: '结果转换', type: 'plugin', x: 500, y: 350 },
  { id: 'db-001', name: 'MySQL主库', type: 'datasource', x: 700, y: 150 },
  {
    id: 'db-002',
    name: 'PostgreSQL订单库',
    type: 'datasource',
    x: 700,
    y: 300,
  },
]);

const links = ref<TopologyLink[]>([
  { source: 'tenant-001', target: 'svc-001', label: '调用' },
  { source: 'tenant-001', target: 'svc-002', label: '调用' },
  { source: 'tenant-002', target: 'svc-003', label: '调用' },
  { source: 'svc-001', target: 'pre-001', label: '前置处理' },
  { source: 'svc-002', target: 'pre-001', label: '前置处理' },
  { source: 'pre-001', target: 'db-001', label: '查询' },
  { source: 'pre-001', target: 'db-002', label: '查询' },
  { source: 'svc-003', target: 'post-001', label: '后置处理' },
]);

const loading = ref(false);

onMounted(() => {
  loadTopology();
});

async function loadTopology() {
  loading.value = true;
  // TODO: 调用 API 获取服务拓扑
  setTimeout(() => {
    loading.value = false;
  }, 300);
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
