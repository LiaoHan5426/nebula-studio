<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NebulaButton, NebulaTable } from '@nebula-studio/nebula-ui';

const columns = [
  { key: 'serviceId', label: '服务ID', width: 180 },
  { key: 'serviceName', label: '服务名称', width: 150 },
  { key: 'serviceType', label: '服务类型', width: 120 },
  { key: 'version', label: '版本', width: 80 },
  { key: 'registeredAt', label: '注册时间', width: 180 },
  { key: 'status', label: '发布状态', width: 100 },
  { key: 'actions', label: '操作', width: 180 },
];

// 模拟数据
const services = ref([
  {
    serviceId: 'svc-001',
    serviceName: '用户查询服务',
    serviceType: 'database',
    version: '1.0.0',
    registeredAt: '2024-03-01 10:00:00',
    status: 'published',
  },
  {
    serviceId: 'svc-002',
    serviceName: '订单查询服务',
    serviceType: 'database',
    version: '1.0.0',
    registeredAt: '2024-03-05 14:30:00',
    status: 'draft',
  },
  {
    serviceId: 'svc-003',
    serviceName: '组合服务-用户订单',
    serviceType: 'composite',
    version: '1.0.0',
    registeredAt: '2024-03-10 09:15:00',
    status: 'draft',
  },
]);

const loading = ref(false);

onMounted(() => {
  loadServices();
});

async function loadServices() {
  loading.value = true;
  // TODO: 调用 API 获取服务发布列表
  setTimeout(() => {
    loading.value = false;
  }, 300);
}

function handlePublish(service: (typeof services.value)[0]) {
  void service;
}

function handleOffline(service: (typeof services.value)[0]) {
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

const statusMap: Record<string, string> = {
  draft: '草稿',
  published: '已发布',
  offline: '已下线',
};
</script>

<template>
  <div class="service-publish-page">
    <header class="service-publish-page__header">
      <div>
        <h2 class="service-publish-page__title">服务发布</h2>
        <p class="service-publish-page__desc">
          将原子接口、组合接口发布上线。创建组合接口时，可选择已有的原子接口、组合接口进行组合，可能会用到前置处理器、后置处理器、聚合插件、分发插件、转换插件。
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
          {{ statusMap[row.status] || row.status }}
        </span>
      </template>
      <template #actions="{ row }">
        <div class="action-btns">
          <template v-if="row.status === 'draft'">
            <NebulaButton
              size="small"
              variant="primary"
              @click="handlePublish(row)"
            >
              发布
            </NebulaButton>
          </template>
          <template v-else-if="row.status === 'published'">
            <NebulaButton
              size="small"
              variant="ghost"
              @click="handleOffline(row)"
            >
              下线
            </NebulaButton>
          </template>
          <NebulaButton size="small" variant="ghost" @click="handleView(row)">
            查看
          </NebulaButton>
        </div>
      </template>
    </NebulaTable>
  </div>
</template>

<style scoped>
.service-publish-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.service-publish-page__header {
  padding: 16px 20px;
  background: hsl(var(--card));
  border-radius: 8px;
}

.service-publish-page__title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
}

.service-publish-page__desc {
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

.status-badge.draft {
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted));
}

.status-badge.published {
  color: hsl(var(--success));
  background: hsl(var(--success) / 12%);
}

.status-badge.offline {
  color: hsl(var(--destructive));
  background: hsl(var(--destructive) / 12%);
}

.action-btns {
  display: flex;
  gap: 4px;
}
</style>
