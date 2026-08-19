import type { TenantRecord } from '@/features/tenant/api';
import type { UserRecord } from '@nebula-studio/contracts/system';

import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { tenantApi } from '@/features/tenant/api';
import { tenantUsersApi } from '@/features/tenant/usersApi';
import { getAuthUserId } from '@/shared/auth/session';
import { useAuth } from '@/shared/composables/useAuth';
import { isApiSuccess } from '@/shared/types';

export type TenantFormMode = 'create' | 'edit';

export interface TenantForm {
  tenantId?: string;
  userId: string;
  slug: string;
  tenantName: string;
  description: string;
  status: string;
  authType: string;
}

export const AUTH_TYPES = ['API_KEY', 'JWT', 'NONE'] as const;

export function resolveBoundUsername(
  userId: string | undefined,
  consoleUsers: Array<{ id: string; username: string }>,
) {
  if (!userId) return '未绑定';
  return consoleUsers.find((user) => user.id === userId)?.username ?? '未绑定';
}

export function useTenantPage() {
  const router = useRouter();
  const { isPlatformAdmin, username } = useAuth();
  const tenants = ref<TenantRecord[]>([]);
  const consoleUsers = ref<UserRecord[]>([]);
  const loading = ref(false);
  const usersLoading = ref(false);
  const pendingDeleteTenant = ref<null | TenantRecord>(null);
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

  function boundUsername(userId?: string) {
    return resolveBoundUsername(userId, consoleUsers.value);
  }

  async function loadConsoleUsers() {
    if (!isPlatformAdmin.value) return;
    usersLoading.value = true;
    try {
      const response = await tenantUsersApi.listForBinding();
      if (isApiSuccess(response)) {
        consoleUsers.value = response.data.records ?? [];
      }
    } finally {
      usersLoading.value = false;
    }
  }

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

  onMounted(() => {
    void loadTenants();
    void loadConsoleUsers();
  });

  return {
    AUTH_TYPES,
    consoleUsers,
    form,
    formMode,
    isPlatformAdmin,
    loadConsoleUsers,
    loadTenants,
    loading,
    pageDescription,
    pageTitle,
    pendingDeleteTenant,
    previewTenantId,
    resolveBoundUsername: boundUsername,
    router,
    saving,
    showFormDialog,
    tenants,
    username,
    usersLoading,
  };
}
