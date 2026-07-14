<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  NebulaButton,
  NebulaPane,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { executorRoutesApi } from '@/shared/api/executorApi';
import type { ExecutorRouteView } from '@/shared/api/executorApi';
import { isApiSuccess } from '@/shared/types';

const routes = ref<ExecutorRouteView[]>([]);
const selectedRoute = ref<ExecutorRouteView | null>(null);
const loading = ref(false);

function formatRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

function formatLatency(ms: number): string {
  return ms.toFixed(1);
}

function statusVariant(status: string) {
  return status === 'ACTIVE' ? 'success' : 'default';
}

async function loadRoutes() {
  loading.value = true;
  try {
    const res = await executorRoutesApi.list();
    if (isApiSuccess(res)) {
      routes.value = res.data ?? [];
    } else {
      routes.value = [];
    }
  } catch {
    routes.value = [];
  } finally {
    loading.value = false;
  }
}

async function loadRouteDetail(routeId: string) {
  try {
    const res = await executorRoutesApi.get(routeId);
    if (isApiSuccess(res)) {
      selectedRoute.value = res.data ?? null;
    }
  } catch {
    selectedRoute.value = null;
  }
}

onMounted(loadRoutes);
</script>

<template>
  <div class="page">
    <NebulaPane
      title="Executor 路由"
      description="查看 Executor 路由注册、调用量与健康状态"
    >
      <div class="page__toolbar">
        <NebulaButton variant="outline" @click="loadRoutes">刷新</NebulaButton>
      </div>

      <div
        class="page__layout"
        :class="{ 'page__layout--split': selectedRoute }"
      >
        <div class="page__table-wrap">
          <NebulaTable
            :data="routes"
            :loading="loading"
            row-key="routeId"
            :scroll-x="{ enabled: false }"
          >
            <NebulaTableColumn
              field="routeId"
              title="路由 ID"
              min-width="120"
              show-overflow="tooltip"
            />
            <NebulaTableColumn
              field="endpoint"
              title="端点"
              min-width="140"
              show-overflow="tooltip"
            />
            <NebulaTableColumn field="status" title="状态" width="96">
              <template #default="{ row }">
                <NebulaTag :variant="statusVariant(row.status)">
                  {{ row.status }}
                </NebulaTag>
              </template>
            </NebulaTableColumn>
            <NebulaTableColumn field="callCount" title="调用量" width="88" />
            <NebulaTableColumn field="errorRate" title="错误率" width="88">
              <template #default="{ row }">
                {{ formatRate(row.errorRate) }}
              </template>
            </NebulaTableColumn>
            <NebulaTableColumn field="avgLatencyMs" title="延迟(ms)" width="96">
              <template #default="{ row }">
                {{ formatLatency(row.avgLatencyMs) }}
              </template>
            </NebulaTableColumn>
            <NebulaTableColumn title="操作" width="88">
              <template #default="{ row }">
                <NebulaButton
                  variant="outline"
                  @click.stop="loadRouteDetail(row.routeId)"
                >
                  详情
                </NebulaButton>
              </template>
            </NebulaTableColumn>
          </NebulaTable>
        </div>

        <aside v-if="selectedRoute" class="page__detail">
          <h3 class="page__detail-title">路由详情</h3>
          <dl>
            <dt>路由 ID</dt>
            <dd>{{ selectedRoute.routeId }}</dd>
            <dt>端点</dt>
            <dd>{{ selectedRoute.endpoint }}</dd>
            <dt>状态</dt>
            <dd>{{ selectedRoute.status }}</dd>
            <dt>调用量</dt>
            <dd>{{ selectedRoute.callCount }}</dd>
            <dt>错误率</dt>
            <dd>{{ formatRate(selectedRoute.errorRate) }}</dd>
            <dt>平均延迟</dt>
            <dd>{{ formatLatency(selectedRoute.avgLatencyMs) }} ms</dd>
            <template v-if="selectedRoute.description">
              <dt>描述</dt>
              <dd>{{ selectedRoute.description }}</dd>
            </template>
          </dl>
        </aside>
      </div>
    </NebulaPane>
  </div>
</template>

<style scoped>
.page__detail-title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
}
</style>
