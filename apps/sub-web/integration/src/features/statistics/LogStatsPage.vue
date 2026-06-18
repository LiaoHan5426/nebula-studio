<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  NebulaButton,
  NebulaDatePicker,
  NebulaTable,
} from '@nebula-studio/nebula-ui';

const columns = [
  { key: 'tenantId', label: '租户ID', width: 150 },
  { key: 'tenantName', label: '租户名称', width: 150 },
  { key: 'serviceId', label: '服务ID', width: 150 },
  { key: 'serviceName', label: '服务名称', width: 150 },
  { key: 'totalCalls', label: '总调用次数', width: 120 },
  { key: 'successCount', label: '成功次数', width: 100 },
  { key: 'failCount', label: '失败次数', width: 100 },
  { key: 'successRate', label: '成功率', width: 100 },
  { key: 'avgDuration', label: '平均耗时(ms)', width: 130 },
  { key: 'updatedAt', label: '统计时间', width: 180 },
];

// 模拟数据
const stats = ref([
  {
    tenantId: 'tenant-001',
    tenantName: '测试租户',
    serviceId: 'svc-001',
    serviceName: '用户查询服务',
    totalCalls: 10500,
    successCount: 10400,
    failCount: 100,
    successRate: '99.05%',
    avgDuration: 45,
    updatedAt: '2024-03-20 10:00:00',
  },
  {
    tenantId: 'tenant-001',
    tenantName: '测试租户',
    serviceId: 'svc-002',
    serviceName: '订单查询服务',
    totalCalls: 8500,
    successCount: 8200,
    failCount: 300,
    successRate: '96.47%',
    avgDuration: 68,
    updatedAt: '2024-03-20 10:00:00',
  },
  {
    tenantId: 'tenant-002',
    tenantName: '生产租户',
    serviceId: 'svc-001',
    serviceName: '用户查询服务',
    totalCalls: 50000,
    successCount: 49800,
    failCount: 200,
    successRate: '99.60%',
    avgDuration: 42,
    updatedAt: '2024-03-20 10:00:00',
  },
  {
    tenantId: 'tenant-002',
    tenantName: '生产租户',
    serviceId: 'svc-003',
    serviceName: 'HTTP调用服务',
    totalCalls: 12000,
    successCount: 11500,
    failCount: 500,
    successRate: '95.83%',
    avgDuration: 120,
    updatedAt: '2024-03-20 10:00:00',
  },
]);

const loading = ref(false);
const dateRange = ref<[string, string] | null>(null);

onMounted(() => {
  loadStats();
});

async function loadStats() {
  loading.value = true;
  // TODO: 调用 API 获取日志统计列表
  setTimeout(() => {
    loading.value = false;
  }, 300);
}

function handleSearch() {
  loadStats();
}

function handleExport() {
  // TODO: 导出统计
}
</script>

<template>
  <div class="log-stats-page">
    <header class="log-stats-page__header">
      <div>
        <h2 class="log-stats-page__title">日志统计</h2>
        <p class="log-stats-page__desc">
          记录每个租户各服务的调用情况，包括成功、失败次数等统计数据。
        </p>
      </div>
    </header>

    <div class="log-stats-page__filters">
      <NebulaDatePicker
        v-model="dateRange"
        type="datetimerange"
        placeholder="选择时间范围"
      />
      <NebulaButton variant="primary" @click="handleSearch">
        查询
      </NebulaButton>
      <NebulaButton variant="secondary" @click="handleExport">
        导出
      </NebulaButton>
    </div>

    <NebulaTable
      :columns="columns"
      :data="stats"
      :loading="loading"
      row-key="tenantId-serviceId"
    >
      <template #successCount="{ row }">
        <span class="count success">{{
          row.successCount.toLocaleString()
        }}</span>
      </template>
      <template #failCount="{ row }">
        <span class="count fail">{{ row.failCount.toLocaleString() }}</span>
      </template>
      <template #successRate="{ row }">
        <span
          :class="[
            'rate-badge',
            parseFloat(row.successRate) >= 99 ? 'high' : 'low',
          ]"
        >
          {{ row.successRate }}
        </span>
      </template>
    </NebulaTable>
  </div>
</template>

<style scoped>
.log-stats-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.log-stats-page__header {
  padding: 16px 20px;
  background: hsl(var(--card));
  border-radius: 8px;
}

.log-stats-page__title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
}

.log-stats-page__desc {
  margin: 0;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.log-stats-page__filters {
  display: flex;
  gap: 8px;
  align-items: center;
}

.count {
  font-weight: 500;
}

.count.success {
  color: hsl(var(--success));
}

.count.fail {
  color: hsl(var(--destructive));
}

.rate-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
}

.rate-badge.high {
  color: hsl(var(--success));
  background: hsl(var(--success) / 12%);
}

.rate-badge.low {
  color: hsl(var(--destructive));
  background: hsl(var(--destructive) / 12%);
}
</style>
