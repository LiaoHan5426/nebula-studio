<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NebulaButton, NebulaTable } from '@nebula-studio/nebula-ui';

const columns = [
  { key: 'serviceId', label: '服务ID', width: 180 },
  { key: 'serviceName', label: '服务名称', width: 150 },
  { key: 'serviceType', label: '服务类型', width: 120 },
  { key: 'status', label: '运行状态', width: 100 },
  { key: 'rateLimit', label: '限流规则', width: 120 },
  { key: 'circuitBreaker', label: '熔断规则', width: 120 },
  { key: 'whitelist', label: '白名单', width: 100 },
  { key: 'accessControl', label: '访问控制', width: 100 },
  { key: 'actions', label: '操作', width: 150 },
];

// 模拟数据
const services = ref([
  {
    serviceId: 'svc-001',
    serviceName: '用户查询服务',
    serviceType: 'database',
    status: 'online',
    rateLimit: '1000/分钟',
    circuitBreaker: '已启用',
    whitelist: '已配置',
    accessControl: '已启用',
  },
  {
    serviceId: 'svc-002',
    serviceName: '订单查询服务',
    serviceType: 'database',
    status: 'online',
    rateLimit: '500/分钟',
    circuitBreaker: '未启用',
    whitelist: '未配置',
    accessControl: '未启用',
  },
  {
    serviceId: 'svc-003',
    serviceName: 'HTTP调用服务',
    serviceType: 'protocol',
    status: 'online',
    rateLimit: '200/分钟',
    circuitBreaker: '已启用',
    whitelist: '已配置',
    accessControl: '已启用',
  },
]);

const loading = ref(false);

onMounted(() => {
  loadServices();
});

async function loadServices() {
  loading.value = true;
  // TODO: 调用 API 获取服务治理列表
  setTimeout(() => {
    loading.value = false;
  }, 300);
}

function handleOffline(service: (typeof services.value)[0]) {
  void service;
}

function handleConfig(service: (typeof services.value)[0]) {
  void service;
}

const serviceTypeMap: Record<string, string> = {
  database: '数据库接口',
  protocol: '协议接口',
  composite: '组合接口',
};
</script>

<template>
  <div class="service-governance-page">
    <header class="service-governance-page__header">
      <div>
        <h2 class="service-governance-page__title">服务治理</h2>
        <p class="service-governance-page__desc">
          对已发布的服务进行管理，包括下线、限流熔断、白名单、访问控制等。
        </p>
      </div>
    </header>

    <NebulaTable
      :columns="columns"
      :data="services"
      :loading="loading"
      row-key="serviceId"
    >
      <template #serviceType="{ row }">
        <span class="type-badge">{{
          serviceTypeMap[row.serviceType] || row.serviceType
        }}</span>
      </template>
      <template #status="{ row }">
        <span :class="['status-badge', row.status]">
          {{ row.status === 'online' ? '在线' : '离线' }}
        </span>
      </template>
      <template #actions="{ row }">
        <div class="action-btns">
          <NebulaButton size="small" variant="ghost" @click="handleConfig(row)">
            治理配置
          </NebulaButton>
          <NebulaButton
            size="small"
            variant="ghost"
            @click="handleOffline(row)"
          >
            下线
          </NebulaButton>
        </div>
      </template>
    </NebulaTable>
  </div>
</template>

<style scoped>
.service-governance-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.service-governance-page__header {
  padding: 16px 20px;
  background: hsl(var(--card));
  border-radius: 8px;
}

.service-governance-page__title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
}

.service-governance-page__desc {
  margin: 0;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.type-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
  background: hsl(var(--muted));
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
}

.status-badge.online {
  color: hsl(var(--success));
  background: hsl(var(--success) / 12%);
}

.status-badge.offline {
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted));
}

.action-btns {
  display: flex;
  gap: 4px;
}
</style>
