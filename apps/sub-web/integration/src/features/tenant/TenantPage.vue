<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NebulaButton, NebulaTable } from '@nebula-studio/nebula-ui';

import { tenantApi } from '@/shared/api/integration';
import { isApiSuccess } from '@/shared/types';

const columns = [
  { key: 'tenantId', label: '租户ID', width: 200 },
  { key: 'tenantName', label: '租户名称', width: 180 },
  { key: 'authType', label: '验证方式', width: 150 },
  { key: 'status', label: '状态', width: 100 },
  { key: 'createdAt', label: '创建时间', width: 180 },
  { key: 'actions', label: '操作', width: 240 },
];

const tenants = ref<Array<Record<string, unknown>>>([]);
const loading = ref(false);
const pendingDeleteTenant = ref<Record<string, unknown> | null>(null);

onMounted(() => {
  loadTenants();
});

async function loadTenants() {
  loading.value = true;
  try {
    const response = await tenantApi.list(1, 50);
    if (isApiSuccess(response)) {
      const payload = response.data as
        | { items?: Array<Record<string, unknown>> }
        | Array<Record<string, unknown>>;
      tenants.value = Array.isArray(payload) ? payload : (payload?.items ?? []);
    }
  } finally {
    loading.value = false;
  }
}

function handleEdit(tenant: Record<string, unknown>) {
  console.warn('Edit tenant:', tenant);
}

function handleAuthorize(tenant: Record<string, unknown>) {
  console.warn('Authorize tenant:', tenant);
}

function handleDelete(tenant: Record<string, unknown>) {
  pendingDeleteTenant.value = tenant;
}

function cancelDelete() {
  pendingDeleteTenant.value = null;
}

async function confirmDelete() {
  const tenant = pendingDeleteTenant.value;
  if (!tenant) return;
  const tenantId = tenant.tenantId as string;
  if (!tenantId) return;
  const response = await tenantApi.delete(tenantId);
  pendingDeleteTenant.value = null;
  if (isApiSuccess(response)) {
    await loadTenants();
  }
}
</script>

<template>
  <div class="tenant-page">
    <header class="tenant-page__header">
      <div>
        <h2 class="tenant-page__title">租户管理</h2>
        <p class="tenant-page__desc">
          租户独立于系统用户体系，便于灵活管理使用。可单独设置租户调用接口等所需的验证方式，可单独授权租户使用接口。
        </p>
      </div>
    </header>

    <div class="tenant-page__actions">
      <NebulaButton variant="primary" @click="() => {}">
        新增租户
      </NebulaButton>
    </div>

    <NebulaTable
      :columns="columns"
      :data="tenants"
      :loading="loading"
      row-key="tenantId"
    >
      <template #status="{ row }">
        <span :class="['status-badge', row.status]">
          {{
            row.status === 'active' || row.status === 'ACTIVE' ? '正常' : '禁用'
          }}
        </span>
      </template>
      <template #authType="{ row }">
        <span class="auth-type">{{ row.authType || '-' }}</span>
      </template>
      <template #actions="{ row }">
        <div class="action-btns">
          <NebulaButton
            size="small"
            variant="ghost"
            @click="handleAuthorize(row)"
          >
            授权
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

    <div
      v-if="pendingDeleteTenant"
      class="tenant-page__confirm-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tenant-delete-title"
    >
      <div class="tenant-page__confirm">
        <h3 id="tenant-delete-title" class="tenant-page__confirm-title">
          确认删除租户
        </h3>
        <p class="tenant-page__confirm-desc">
          确定删除租户「{{
            pendingDeleteTenant.tenantName || pendingDeleteTenant.tenantId
          }}」吗？此操作不可恢复。
        </p>
        <div class="tenant-page__confirm-actions">
          <NebulaButton variant="secondary" @click="cancelDelete">
            取消
          </NebulaButton>
          <NebulaButton variant="primary" @click="confirmDelete">
            删除
          </NebulaButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tenant-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.tenant-page__header {
  padding: 16px 20px;
  background: hsl(var(--card));
  border-radius: 8px;
}

.tenant-page__title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
}

.tenant-page__desc {
  margin: 0;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.tenant-page__actions {
  display: flex;
  gap: 8px;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
}

.status-badge.active {
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 12%);
}

.status-badge.inactive {
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted));
}

.auth-type {
  font-size: 13px;
}

.action-btns {
  display: flex;
  gap: 4px;
}

.tenant-page__confirm-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 45%);
}

.tenant-page__confirm {
  width: min(420px, calc(100vw - 32px));
  padding: 20px;
  background: hsl(var(--card));
  border-radius: 8px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 18%);
}

.tenant-page__confirm-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
}

.tenant-page__confirm-desc {
  margin: 0 0 16px;
  font-size: 14px;
  color: hsl(var(--muted-foreground));
}

.tenant-page__confirm-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
