<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NebulaButton, NebulaTable } from '@nebula-studio/nebula-ui';

const columns = [
  { key: 'serviceId', label: '服务ID', width: 180 },
  { key: 'serviceName', label: '服务名称', width: 150 },
  { key: 'serviceType', label: '服务类型', width: 120 },
  { key: 'version', label: '版本', width: 80 },
  { key: 'datasource', label: '关联数据源', width: 150 },
  { key: 'status', label: '状态', width: 100 },
  { key: 'createdAt', label: '创建时间', width: 180 },
  { key: 'actions', label: '操作', width: 180 },
];

// 模拟数据
const services = ref([
  {
    serviceId: 'svc-001',
    serviceName: '用户查询服务',
    serviceType: 'database',
    version: '1.0.0',
    datasource: 'MySQL主库',
    status: 'registered',
    createdAt: '2024-03-01 10:00:00',
  },
  {
    serviceId: 'svc-002',
    serviceName: '订单查询服务',
    serviceType: 'database',
    version: '1.0.0',
    datasource: 'PostgreSQL订单库',
    status: 'registered',
    createdAt: '2024-03-05 14:30:00',
  },
  {
    serviceId: 'svc-003',
    serviceName: 'HTTP调用服务',
    serviceType: 'protocol',
    version: '1.0.0',
    datasource: '-',
    status: 'registered',
    createdAt: '2024-03-10 09:15:00',
  },
]);

const loading = ref(false);

onMounted(() => {
  loadServices();
});

async function loadServices() {
  loading.value = true;
  // TODO: 调用 API 获取服务注册列表
  setTimeout(() => {
    loading.value = false;
  }, 300);
}

function handleEdit(service: (typeof services.value)[0]) {
  void service;
}

function handlePublish(service: (typeof services.value)[0]) {
  void service;
}

function handleDelete(service: (typeof services.value)[0]) {
  void service;
}

const serviceTypeMap: Record<string, string> = {
  database: '数据库接口',
  protocol: '协议接口',
};

const statusMap: Record<string, string> = {
  registered: '已注册',
  published: '已发布',
  offline: '已下线',
};
</script>

<template>
  <div class="service-register-page">
    <header class="service-register-page__header">
      <div>
        <h2 class="service-register-page__title">服务注册</h2>
        <p class="service-register-page__desc">
          注册原子接口信息。创建原子接口时，可以选择接口类型：数据库接口（需选择数据源）或协议接口（选择连接协议，填写地址端口等信息）。
        </p>
      </div>
    </header>

    <div class="service-register-page__actions">
      <NebulaButton variant="primary" @click="() => {}">
        创建数据库接口
      </NebulaButton>
      <NebulaButton variant="secondary" @click="() => {}">
        创建协议接口
      </NebulaButton>
    </div>

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
          <NebulaButton
            size="small"
            variant="ghost"
            @click="handlePublish(row)"
          >
            发布
          </NebulaButton>
          <NebulaButton size="small" variant="ghost" @click="handleEdit(row)">
            编辑
          </NebulaButton>
          <NebulaButton size="small" variant="ghost" @click="handleDelete(row)">
            删除
          </NebulaButton>
        </div>
      </template>
    </NebulaTable>
  </div>
</template>

<style scoped>
.service-register-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.service-register-page__header {
  padding: 16px 20px;
  background: hsl(var(--card));
  border-radius: 8px;
}

.service-register-page__title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
}

.service-register-page__desc {
  margin: 0;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.service-register-page__actions {
  display: flex;
  gap: 8px;
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

.status-badge.registered {
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 12%);
}

.status-badge.published {
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
