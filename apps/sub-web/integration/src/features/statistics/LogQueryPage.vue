<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  NebulaButton,
  NebulaDatePicker,
  NebulaTable,
} from '@nebula-studio/nebula-ui';

const columns = [
  { key: 'logId', label: '日志ID', width: 200 },
  { key: 'tenantId', label: '租户ID', width: 150 },
  { key: 'serviceId', label: '服务ID', width: 150 },
  { key: 'serviceName', label: '服务名称', width: 150 },
  { key: 'stepName', label: '步骤名称', width: 150 },
  { key: 'inputParams', label: '入参', width: 150 },
  { key: 'outputParams', label: '出参', width: 150 },
  { key: 'duration', label: '耗时(ms)', width: 100 },
  { key: 'status', label: '状态', width: 100 },
  { key: 'errorMsg', label: '错误信息', width: 200 },
  { key: 'createdAt', label: '执行时间', width: 180 },
];

// 模拟数据
const logs = ref([
  {
    logId: 'log-001',
    tenantId: 'tenant-001',
    serviceId: 'svc-001',
    serviceName: '用户查询服务',
    stepName: '数据库查询',
    inputParams: '{userId: 123}',
    outputParams: '{user: {...}}',
    duration: 45,
    status: 'success',
    errorMsg: '-',
    createdAt: '2024-03-20 10:30:00',
  },
  {
    logId: 'log-002',
    tenantId: 'tenant-001',
    serviceId: 'svc-002',
    serviceName: '订单查询服务',
    stepName: '参数转换',
    inputParams: '{orderId: abc}',
    outputParams: '-',
    duration: 120,
    status: 'error',
    errorMsg: '转换失败：参数格式错误',
    createdAt: '2024-03-20 10:31:00',
  },
  {
    logId: 'log-003',
    tenantId: 'tenant-002',
    serviceId: 'svc-001',
    serviceName: '用户查询服务',
    stepName: '前置处理',
    inputParams: '{userId: 456}',
    outputParams: '{userId: 456}',
    duration: 10,
    status: 'success',
    errorMsg: '-',
    createdAt: '2024-03-20 10:32:00',
  },
]);

const loading = ref(false);
const dateRange = ref<[string, string] | null>(null);

onMounted(() => {
  loadLogs();
});

async function loadLogs() {
  loading.value = true;
  // TODO: 调用 API 获取日志列表
  setTimeout(() => {
    loading.value = false;
  }, 300);
}

function handleSearch() {
  loadLogs();
}

function handleExport() {
  // TODO: 导出日志
}

function handleViewDetail(log: (typeof logs.value)[0]) {
  void log;
}
</script>

<template>
  <div class="log-query-page">
    <header class="log-query-page__header">
      <div>
        <h2 class="log-query-page__title">日志查询</h2>
        <p class="log-query-page__desc">
          记录调用服务时每个步骤的执行情况，包括出入参数、时间、报错信息等。
        </p>
      </div>
    </header>

    <div class="log-query-page__filters">
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
      :data="logs"
      :loading="loading"
      row-key="logId"
    >
      <template #status="{ row }">
        <span :class="['status-badge', row.status]">
          {{ row.status === 'success' ? '成功' : '失败' }}
        </span>
      </template>
      <template #actions="{ row }">
        <NebulaButton
          size="small"
          variant="ghost"
          @click="handleViewDetail(row)"
        >
          详情
        </NebulaButton>
      </template>
    </NebulaTable>
  </div>
</template>

<style scoped>
.log-query-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.log-query-page__header {
  padding: 16px 20px;
  background: hsl(var(--card));
  border-radius: 8px;
}

.log-query-page__title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
}

.log-query-page__desc {
  margin: 0;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.log-query-page__filters {
  display: flex;
  gap: 8px;
  align-items: center;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
}

.status-badge.success {
  color: hsl(var(--success));
  background: hsl(var(--success) / 12%);
}

.status-badge.error {
  color: hsl(var(--destructive));
  background: hsl(var(--destructive) / 12%);
}
</style>
