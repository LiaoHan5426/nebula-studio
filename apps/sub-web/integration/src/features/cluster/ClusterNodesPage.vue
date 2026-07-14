<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NebulaButton, NebulaPane, NebulaTag } from '@nebula-studio/nebula-ui';

import { clusterApi } from '@/shared/api/clusterApi';
import type { ClusterNode } from '@nebula-studio/contracts/integration';
import { isApiSuccess } from '@nebula-studio/api-client';

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
        <NebulaButton variant="outline" @click="loadNodes">刷新</NebulaButton>
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
