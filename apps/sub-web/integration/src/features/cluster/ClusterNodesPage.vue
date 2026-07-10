<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NebulaButton, NebulaPane, NebulaTag } from '@nebula-studio/nebula-ui';

import { clusterApi } from '@/shared/api/clusterApi';
import type { ClusterNode } from '@nebula-studio/contracts/integration';
import { isApiSuccess } from '@nebula-studio/contracts/integration';

const nodes = ref<ClusterNode[]>([]);
const loading = ref(false);

onMounted(async () => {
  await loadNodes();
});

async function loadNodes() {
  loading.value = true;
  try {
    const response = await clusterApi.listNodes();
    if (isApiSuccess(response)) {
      nodes.value = response.data;
    }
  } finally {
    loading.value = false;
  }
}

function statusVariant(status?: string) {
  if (status === 'ACTIVE' || status === 'ONLINE') return 'success';
  if (status === 'INACTIVE' || status === 'OFFLINE') return 'danger';
  return 'default';
}

function formatLoad(load?: number) {
  if (typeof load !== 'number') return '—';
  return `${Math.round(load * 100)}%`;
}
</script>

<template>
  <div class="page">
    <NebulaPane title="Executor 节点" description="集群节点注册与心跳状态">
      <div class="page__toolbar">
        <NebulaButton variant="secondary" @click="loadNodes">刷新</NebulaButton>
      </div>

      <div v-if="loading" class="page__empty">加载中…</div>
      <div v-else-if="nodes.length === 0" class="page__empty">暂无注册节点</div>
      <div v-else class="page__list">
        <article v-for="node in nodes" :key="node.nodeId" class="page__card">
          <div class="page__card-head">
            <div>
              <h3>{{ node.nodeName || node.nodeId }}</h3>
              <p class="page__meta">
                {{ node.address || '—' }} · {{ node.role || 'WORKER' }}
              </p>
            </div>
            <NebulaTag :variant="statusVariant(node.status)">{{
              node.status || 'UNKNOWN'
            }}</NebulaTag>
          </div>
          <dl class="page__stats">
            <div>
              <dt>负载</dt>
              <dd>{{ formatLoad(node.loadFactor) }}</dd>
            </div>
            <div>
              <dt>最近心跳</dt>
              <dd>{{ node.lastHeartbeat || '—' }}</dd>
            </div>
            <div>
              <dt>注册时间</dt>
              <dd>{{ node.registeredAt || '—' }}</dd>
            </div>
          </dl>
        </article>
      </div>
    </NebulaPane>
  </div>
</template>

<style scoped>
.page {
  max-width: 1200px;
  padding: 24px;
  margin: 0 auto;
}

.page__toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.page__empty {
  padding: 24px;
  color: hsl(var(--muted-foreground));
  text-align: center;
}

.page__list {
  display: grid;
  gap: 12px;
}

.page__card {
  padding: 16px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.page__card-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.page__card-head h3 {
  font-size: 15px;
  font-weight: 600;
}

.page__meta {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.page__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
}

.page__stats dt {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}

.page__stats dd {
  margin: 4px 0 0;
  font-size: 13px;
  font-weight: 500;
}
</style>
