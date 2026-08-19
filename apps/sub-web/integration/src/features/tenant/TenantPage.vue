<script setup lang="ts">
import type { TenantRecord } from '@/features/tenant/api';

import {
  NebulaButton,
  NebulaDialog,
  NebulaPane,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { tenantApi } from '@/features/tenant/api';
import { AUTH_TYPES, useTenantPage } from '@/features/tenant/useTenantPage';
import { getAuthUserId } from '@/shared/auth/session';
import { isApiSuccess } from '@/shared/types';

const {
  consoleUsers,
  form,
  formMode,
  isPlatformAdmin,
  loadTenants,
  loading,
  pageDescription,
  pageTitle,
  pendingDeleteTenant,
  previewTenantId,
  resolveBoundUsername,
  router,
  saving,
  showFormDialog,
  tenants,
  username,
} = useTenantPage();

function openCreate() {
  formMode.value = 'create';
  form.value = {
    userId: isPlatformAdmin.value ? '' : (getAuthUserId() ?? ''),
    slug: '',
    tenantName: '',
    description: '',
    status: 'ACTIVE',
    authType: 'API_KEY',
  };
  showFormDialog.value = true;
}

function openEdit(tenant: TenantRecord) {
  formMode.value = 'edit';
  form.value = {
    tenantId: tenant.tenantId,
    userId: tenant.userId ?? '',
    slug: tenant.slug ?? '',
    tenantName: tenant.tenantName,
    description: String((tenant as { description?: string }).description ?? ''),
    status: tenant.status ?? 'ACTIVE',
    authType:
      (tenant.authConfig as undefined | { authType?: string })?.authType ??
      'API_KEY',
  };
  showFormDialog.value = true;
}

async function saveTenant() {
  saving.value = true;
  try {
    if (formMode.value === 'create') {
      const response = await tenantApi.create({
        ...(isPlatformAdmin.value
          ? { userId: form.value.userId.trim() || undefined }
          : {}),
        slug: form.value.slug.trim(),
        tenantName: form.value.tenantName.trim(),
        description: form.value.description.trim(),
        status: form.value.status,
        authConfig: { authType: form.value.authType },
      });
      if (isApiSuccess(response)) {
        showFormDialog.value = false;
        await loadTenants();
      }
      return;
    }

    if (!form.value.tenantId) return;
    const response = await tenantApi.update(form.value.tenantId, {
      tenantName: form.value.tenantName.trim(),
      description: form.value.description.trim(),
      status: form.value.status,
      authConfig: { authType: form.value.authType },
    });
    if (isApiSuccess(response)) {
      showFormDialog.value = false;
      await loadTenants();
    }
  } finally {
    saving.value = false;
  }
}

function handleAuthorize(tenant: TenantRecord) {
  void router.push({
    path: '/service/authorize',
    query: { tenantId: tenant.tenantId },
  });
}

function formatTime(value?: string) {
  if (!value) return '-';
  return value.replace('T', ' ').slice(0, 19);
}

function statusVariant(status: string) {
  const normalized = status?.toUpperCase();
  return normalized === 'ACTIVE' ? 'success' : 'default';
}

function handleDelete(tenant: TenantRecord) {
  pendingDeleteTenant.value = tenant;
}

function cancelDelete() {
  pendingDeleteTenant.value = null;
}

async function confirmDelete() {
  const tenant = pendingDeleteTenant.value;
  if (!tenant) return;
  const response = await tenantApi.delete(tenant.tenantId);
  pendingDeleteTenant.value = null;
  if (isApiSuccess(response)) {
    await loadTenants();
  }
}
</script>

<template>
  <div class="page">
    <NebulaPane :title="pageTitle" :description="pageDescription">
      <div class="page__toolbar">
        <NebulaButton variant="primary" @click="openCreate">
          新增租户
        </NebulaButton>
        <NebulaButton variant="outline" @click="loadTenants">刷新</NebulaButton>
      </div>

      <div class="page__table-wrap">
        <NebulaTable
          :data="tenants"
          :loading="loading"
          :scroll-x="{ enabled: false }"
          row-key="tenantId"
        >
          <NebulaTableColumn
            field="tenantId"
            title="租户 ID"
            min-width="120"
            show-overflow="tooltip"
          />
          <NebulaTableColumn
            field="slug"
            title="Slug"
            width="88"
            show-overflow="tooltip"
          />
          <NebulaTableColumn
            field="tenantName"
            title="租户名称"
            min-width="120"
            show-overflow="tooltip"
          />
          <NebulaTableColumn title="验证方式" width="100">
            <template #default="{ row }">
              {{
                (row.authConfig as { authType?: string } | undefined)
                  ?.authType ?? '-'
              }}
            </template>
          </NebulaTableColumn>
          <NebulaTableColumn field="status" title="状态" width="88">
            <template #default="{ row }">
              <NebulaTag :variant="statusVariant(row.status)">
                {{ row.status === 'ACTIVE' ? '正常' : '禁用' }}
              </NebulaTag>
            </template>
          </NebulaTableColumn>
          <NebulaTableColumn field="createdAt" title="创建时间" width="150">
            <template #default="{ row }">
              {{ formatTime(row.createdAt) }}
            </template>
          </NebulaTableColumn>
          <NebulaTableColumn title="操作" width="220">
            <template #default="{ row }">
              <div class="row-actions">
                <NebulaButton variant="outline" @click="handleAuthorize(row)">
                  授权
                </NebulaButton>
                <NebulaButton variant="outline" @click="openEdit(row)">
                  编辑
                </NebulaButton>
                <NebulaButton
                  v-if="isPlatformAdmin"
                  variant="outline"
                  @click="handleDelete(row)"
                >
                  删除
                </NebulaButton>
              </div>
            </template>
          </NebulaTableColumn>
        </NebulaTable>
      </div>
    </NebulaPane>

    <NebulaDialog
      :open="showFormDialog"
      :title="formMode === 'create' ? '新增租户' : '编辑租户'"
      @update:open="showFormDialog = $event"
    >
      <p v-if="formMode === 'create'" class="field-hint">
        预览租户 ID：<strong>{{ previewTenantId }}</strong>
      </p>
      <label v-else class="field">
        <span>租户 ID</span>
        <input :value="form.tenantId" readonly class="field__readonly" />
      </label>

      <label v-if="formMode === 'create' && isPlatformAdmin" class="field">
        <span>绑定系统用户</span>
        <select v-model="form.userId" class="field__select">
          <option value="">不绑定</option>
          <option v-for="user in consoleUsers" :key="user.id" :value="user.id">
            {{ user.username }}
          </option>
        </select>
      </label>
      <p v-else-if="formMode === 'create'" class="field-hint">
        将绑定当前账号：<strong>{{ username }}</strong>
      </p>
      <label v-else class="field">
        <span>绑定系统用户</span>
        <input
          :value="resolveBoundUsername(form.userId)"
          readonly
          class="field__readonly"
        />
      </label>
      <label class="field">
        <span>Slug</span>
        <input
          v-model="form.slug"
          placeholder="例如 a、b、admin"
          :readonly="formMode === 'edit'"
          :class="{ field__readonly: formMode === 'edit' }"
        />
      </label>
      <label class="field">
        <span>租户名称</span>
        <input v-model="form.tenantName" placeholder="Tenant A" />
      </label>
      <label class="field">
        <span>描述</span>
        <input v-model="form.description" placeholder="可选" />
      </label>
      <label class="field">
        <span>验证方式</span>
        <select v-model="form.authType" class="field__select">
          <option v-for="auth in AUTH_TYPES" :key="auth" :value="auth">
            {{ auth }}
          </option>
        </select>
      </label>
      <label class="field">
        <span>状态</span>
        <select v-model="form.status" class="field__select">
          <option value="ACTIVE">正常</option>
          <option value="INACTIVE">禁用</option>
        </select>
      </label>
      <div class="modal__actions">
        <NebulaButton variant="outline" @click="showFormDialog = false">
          取消
        </NebulaButton>
        <NebulaButton variant="primary" :disabled="saving" @click="saveTenant">
          {{ saving ? '保存中…' : '保存' }}
        </NebulaButton>
      </div>
    </NebulaDialog>

    <NebulaDialog
      :open="Boolean(pendingDeleteTenant)"
      title="确认删除租户"
      @update:open="!$event && cancelDelete()"
    >
      <p class="field-hint">
        确定删除租户「{{
          pendingDeleteTenant?.tenantName || pendingDeleteTenant?.tenantId
        }}」吗？此操作不可恢复。
      </p>
      <div class="modal__actions">
        <NebulaButton variant="outline" @click="cancelDelete">
          取消
        </NebulaButton>
        <NebulaButton variant="primary" @click="confirmDelete">
          删除
        </NebulaButton>
      </div>
    </NebulaDialog>
  </div>
</template>

<style scoped>
.field-hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}
</style>
