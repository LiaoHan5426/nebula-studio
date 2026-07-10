<template>
  <div class="executor-routes-page">
    <div class="page-header">
      <h2>Executor 路由</h2>
      <button class="btn-refresh" @click="loadRoutes">刷新</button>
    </div>
    <div v-if="loading" class="page__empty">加载中...</div>
    <div v-else class="page__layout">
      <table class="routes-table">
        <thead>
          <tr>
            <th>路由 ID</th>
            <th>端点</th>
            <th>状态</th>
            <th>调用量</th>
            <th>错误率</th>
            <th>延迟(ms)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="route in routes"
            :key="route.routeId"
            :class="{ selected: selectedRoute?.routeId === route.routeId }"
          >
            <td>{{ route.routeId }}</td>
            <td>{{ route.endpoint }}</td>
            <td>{{ route.status }}</td>
            <td>{{ route.callCount }}</td>
            <td>{{ formatRate(route.errorRate) }}</td>
            <td>{{ formatLatency(route.avgLatencyMs) }}</td>
            <td>
              <button class="btn-link" @click="loadRouteDetail(route.routeId)">
                详情
              </button>
            </td>
          </tr>
          <tr v-if="routes.length === 0">
            <td colspan="7">暂无路由</td>
          </tr>
        </tbody>
      </table>

      <aside v-if="selectedRoute" class="route-detail">
        <h3>路由详情</h3>
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
          <dt v-if="selectedRoute.description">描述</dt>
          <dd v-if="selectedRoute.description">
            {{ selectedRoute.description }}
          </dd>
        </dl>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

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

<style scoped>
.executor-routes-page {
  padding: 16px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.page__layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 16px;
}

.routes-table {
  width: 100%;
  border-collapse: collapse;
}

.routes-table th,
.routes-table td {
  padding: 8px;
  text-align: left;
  border: 1px solid var(--border-color, #e5e7eb);
}

.routes-table tr.selected {
  background: hsl(var(--muted) / 30%);
}

.route-detail {
  padding: 12px;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
}

.route-detail dl {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 8px;
  margin: 0;
  font-size: 13px;
}

.route-detail dt {
  color: hsl(var(--muted-foreground));
}

.btn-link {
  padding: 0;
  color: hsl(var(--primary));
  cursor: pointer;
  background: none;
  border: none;
}

.page__empty {
  padding: 24px;
  color: hsl(var(--muted-foreground));
}
</style>
