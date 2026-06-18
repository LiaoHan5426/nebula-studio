<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NebulaButton, NebulaTable } from '@nebula-studio/nebula-ui';

const columns = [
  { key: 'serviceId', label: '服务ID', width: 180 },
  { key: 'serviceName', label: '服务名称', width: 150 },
  { key: 'serviceType', label: '服务类型', width: 120 },
  { key: 'authorizedTenants', label: '已授权租户', width: 200 },
  { key: 'status', label: '授权状态', width: 100 },
  { key: 'updatedAt', label: '更新时间', width: 180 },
  { key: 'actions', label: '操作', width: 150 },
];

// 模拟数据
const services = ref([
  {
    serviceId: 'svc-001',
    serviceName: '用户查询服务',
    serviceType: 'database',
    authorizedTenants: '租户A, 租户B',
    status: 'authorized',
    updatedAt: '2024-03-15 10:00:00',
  },
  {
    serviceId: 'svc-002',
    serviceName: '订单查询服务',
    serviceType: 'database',
    authorizedTenants: '租户A',
    status: 'authorized',
    updatedAt: '2024-03-16 14:30:00',
  },
  {
    serviceId: 'svc-003',
    serviceName: '组合服务-用户订单',
    serviceType: 'composite',
    authorizedTenants: '-',
    status: 'unauthorized',
    updatedAt: '2024-03-10 09:15:00',
  },
]);

const loading = ref(false);

onMounted(() => {
  loadServices();
});

async function loadServices() {
  loading.value = true;
  // TODO: 调用 API 获取服务授权列表
  setTimeout(() => {
    loading.value = false;
  }, 300);
}

function handleAuthorize(service: (typeof services.value)[0]) {
  void service;
}

function handleView(service: (typeof services.value)[0]) {
  void service;
}

const serviceTypeMap: Record<string, string> = {
  database: '数据库接口',
  protocol: '协议接口',
  composite: '组合接口',
};
</script>

<template>
  <div class="service-authorize-page">
    <header class="service-authorize-page__header">
      <div>
        <h2 class="service-authorize-page__title">服务授权</h2>
        <p class="service-authorize-page__desc">
          将已发布的服务授权给对应租户使用。租户可独立设置调用接口所需的验证方式。
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
          {{ row.status === 'authorized' ? '已授权' : '未授权' }}
        </span>
      </template>
      <template #actions="{ row }">
        <div class="action-btns">
          <NebulaButton
            size="small"
            variant="primary"
            @click="handleAuthorize(row)"
          >
            授权
          </NebulaButton>
          <NebulaButton size="small" variant="ghost" @click="handleView(row)">
            查看
          </NebulaButton>
        </div>
      </template>
    </NebulaTable>
  </div>
</template>

<style scoped>
.service-authorize-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.service-authorize-page__header {
  padding: 16px 20px;
  background: hsl(var(--card));
  border-radius: 8px;
}

.service-authorize-page__title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
}

.service-authorize-page__desc {
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

.status-badge.authorized {
  color: hsl(var(--success));
  background: hsl(var(--success) / 12%);
}

.status-badge.unauthorized {
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted));
}

.action-btns {
  display: flex;
  gap: 4px;
}
</style>
