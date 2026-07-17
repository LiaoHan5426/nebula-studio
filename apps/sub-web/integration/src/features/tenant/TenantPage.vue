<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  NebulaButton,
  NebulaPane,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { tenantApi } from '@/features/tenant/api';
import type { TenantRecord } from '@/features/tenant/api';
import { getAuthUserId } from '@/shared/auth/session';
import { useAuth } from '@/shared/composables/useAuth';
import { isApiSuccess } from '@/shared/types';

type TenantFormMode = 'create' | 'edit';

interface TenantForm {
  tenantId?: string;
  userId: string;
  slug: string;
  tenantName: string;
  description: string;
  status: string;
  authType: string;
}

const AUTH_TYPES = ['API_KEY', 'JWT', 'NONE'] as const;

/** 控制台可绑定的系统用户（演示环境） */
const CONSOLE_USERS = [
  { userId: '1', username: 'demo', label: 'demo' },
  { userId: '2', username: 'admin', label: 'admin' },
] as const;

function resolveBoundUsername(userId?: string) {
  if (!userId) return '未绑定';
  return (
    CONSOLE_USERS.find((user) => user.userId === userId)?.username ?? '未绑定'
  );
}

const router = useRouter();
const { isPlatformAdmin, username } = useAuth();
const tenants = ref<TenantRecord[]>([]);
const loading = ref(false);
const pendingDeleteTenant = ref<TenantRecord | null>(null);
const showFormDialog = ref(false);
const formMode = ref<TenantFormMode>('create');
const saving = ref(false);

const form = ref<TenantForm>({
  userId: '',
  slug: '',
  tenantName: '',
  description: '',
  status: 'ACTIVE',
  authType: 'API_KEY',
});

const previewTenantId = computed(() => {
  const userId = isPlatformAdmin.value
    ? form.value.userId.trim()
    : (getAuthUserId() ?? '').trim();
  const slug = form.value.slug.trim();
  if (!slug) return '-';
  return userId ? `${userId}_${slug}` : `tenant-${slug}`;
});

const pageTitle = computed(() =>
  isPlatformAdmin.value ? '租户管理' : '我的租户',
);

const pageDescription = computed(() =>
  isPlatformAdmin.value
    ? '平台管理员维护全部对接租户。租户 ID 规则：绑定用户时生成 {userId}_{slug}，未绑定时为 tenant-{slug}。'
    : `管理当前账号（${username.value}）下的对接租户，可新增租户、编辑配置、为租户授权服务。新租户将自动绑定到当前账号，ID 格式为 {userId}_{slug}。`,
);

onMounted(() => {
  void loadTenants();
});

async function loadTenants() {
  loading.value = true;
  try {
    if (isPlatformAdmin.value) {
      const response = await tenantApi.list(1, 50);
      if (isApiSuccess(response)) {
        tenants.value = response.data.items ?? [];
      }
      return;
    }
    const response = await tenantApi.mine();
    if (isApiSuccess(response)) {
      tenants.value = response.data ?? [];
    }
  } finally {
    loading.value = false;
  }
}

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
      (tenant.authConfig as { authType?: string } | undefined)?.authType ??
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
        <NebulaButton variant="primary" @click="openCreate"
          >新增租户</NebulaButton
        >
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

    <div
      v-if="showFormDialog"
      class="modal-overlay"
      @click.self="showFormDialog = false"
    >
      <NebulaPane
        :title="formMode === 'create' ? '新增租户' : '编辑租户'"
        class="modal"
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
            <option
              v-for="user in CONSOLE_USERS"
              :key="user.userId"
              :value="user.userId"
            >
              {{ user.label }}
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
          <NebulaButton
            variant="primary"
            :disabled="saving"
            @click="saveTenant"
          >
            {{ saving ? '保存中…' : '保存' }}
          </NebulaButton>
        </div>
      </NebulaPane>
    </div>

    <div
      v-if="pendingDeleteTenant"
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tenant-delete-title"
      @click.self="cancelDelete"
    >
      <NebulaPane title="确认删除租户" class="modal">
        <p class="field-hint">
          确定删除租户「{{
            pendingDeleteTenant.tenantName || pendingDeleteTenant.tenantId
          }}」吗？此操作不可恢复。
        </p>
        <div class="modal__actions">
          <NebulaButton variant="outline" @click="cancelDelete"
            >取消</NebulaButton
          >
          <NebulaButton variant="primary" @click="confirmDelete"
            >删除</NebulaButton
          >
        </div>
      </NebulaPane>
    </div>
  </div>
</template>

<style scoped>
.field-hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}
</style>
