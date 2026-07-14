import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { tenantApi } from '@/features/tenant/api';
import type { InterfaceGrantRecord, TenantRecord } from '@/features/tenant/api';
import { interfaceApi } from '@/shared/api/integration';
import { getAuthUserId } from '@/shared/auth/session';
import { useAuth } from '@/shared/composables/useAuth';
import type { ApiInterface } from '@/shared/types';
import { isApiSuccess } from '@/shared/types';

import {
  buildGrantOptions,
  formatAllowedSummary,
  grantFormFromRow,
  mapAuthorizeRow,
} from '../authorize/mappers';
import type { AuthorizeRow, GrantForm } from '../authorize/types';
import { DEFAULT_GRANT_FORM } from '../authorize/types';

export function useServiceAuthorize() {
  const route = useRoute();
  const { isPlatformAdmin } = useAuth();

  const services = ref<ApiInterface[]>([]);
  const tenants = ref<TenantRecord[]>([]);
  const selectedTenant = ref<TenantRecord | null>(null);
  const selectedTenantId = ref('');
  const loading = ref(false);
  const actingId = ref<string | null>(null);
  const showGrantDialog = ref(false);
  const grantTarget = ref<AuthorizeRow | null>(null);
  const grantForm = ref<GrantForm>({ ...DEFAULT_GRANT_FORM });

  const grantMap = computed(() => {
    const map = new Map<string, InterfaceGrantRecord>();
    for (const grant of selectedTenant.value?.interfaceGrants ?? []) {
      if (grant.status === 'ACTIVE') {
        map.set(grant.interfaceId, grant);
      }
    }
    return map;
  });

  const allowedSet = computed(() => {
    const allowed = selectedTenant.value?.allowedInterfaces;
    if (!allowed || allowed.length === 0) return new Set<string>();
    if (allowed.includes('*')) return null;
    return new Set(allowed);
  });

  const wildcardAccess = computed(
    () => selectedTenant.value?.allowedInterfaces?.includes('*') ?? false,
  );

  const authorizeRows = computed<AuthorizeRow[]>(() => {
    const currentUserId = getAuthUserId();
    return services.value.map((intf) =>
      mapAuthorizeRow(intf, {
        wildcard: wildcardAccess.value,
        allowedSet: allowedSet.value,
        grant: grantMap.value.get(intf.interfaceId),
        currentUserId,
      }),
    );
  });

  const allowedSummary = computed(() =>
    formatAllowedSummary(selectedTenant.value),
  );

  const grantDialogTitle = computed(() => {
    if (!grantTarget.value) return '服务授权';
    return grantTarget.value.tenantAuthorized ? '调整授权配额' : '服务授权';
  });

  onMounted(async () => {
    await loadTenants();
    const queryTenantId =
      typeof route.query.tenantId === 'string' ? route.query.tenantId : '';
    if (queryTenantId) {
      selectedTenantId.value = queryTenantId;
    }
    await loadServices();
  });

  watch(selectedTenantId, async (tenantId) => {
    if (tenantId) {
      await loadSelectedTenant(tenantId);
    }
  });

  async function loadTenants() {
    if (isPlatformAdmin.value) {
      const response = await tenantApi.list(1, 100);
      if (isApiSuccess(response)) {
        tenants.value = response.data.items ?? [];
      }
    } else {
      const response = await tenantApi.mine();
      if (isApiSuccess(response)) {
        tenants.value = response.data ?? [];
      }
    }
    if (!selectedTenantId.value && tenants.value[0]) {
      selectedTenantId.value = tenants.value[0].tenantId;
      await loadSelectedTenant(selectedTenantId.value);
    }
  }

  async function loadSelectedTenant(tenantId: string) {
    const response = await tenantApi.get(tenantId);
    if (isApiSuccess(response)) {
      selectedTenant.value = response.data;
    }
  }

  async function loadServices() {
    loading.value = true;
    try {
      const response = await interfaceApi.list({
        pageSize: 100,
        scope: isPlatformAdmin.value ? undefined : 'authorizable',
      });
      if (isApiSuccess(response)) {
        services.value = response.data.items ?? [];
      }
    } finally {
      loading.value = false;
    }
  }

  async function refreshAll() {
    loading.value = true;
    try {
      await Promise.all([
        loadServices(),
        selectedTenantId.value
          ? loadSelectedTenant(selectedTenantId.value)
          : Promise.resolve(),
      ]);
    } finally {
      loading.value = false;
    }
  }

  function openGrantDialog(row: AuthorizeRow) {
    grantTarget.value = row;
    grantForm.value = grantFormFromRow(row);
    showGrantDialog.value = true;
  }

  function closeGrantDialog() {
    showGrantDialog.value = false;
    grantTarget.value = null;
  }

  async function submitGrant() {
    if (!selectedTenantId.value || !grantTarget.value) return;
    actingId.value = grantTarget.value.serviceId;
    try {
      await tenantApi.authorizeInterface(
        selectedTenantId.value,
        [grantTarget.value.serviceId],
        buildGrantOptions(grantForm.value),
      );
      await loadSelectedTenant(selectedTenantId.value);
      closeGrantDialog();
    } finally {
      actingId.value = null;
    }
  }

  async function handleRevoke(row: AuthorizeRow) {
    if (!selectedTenantId.value || row.wildcardAccess) return;
    actingId.value = row.serviceId;
    try {
      await tenantApi.revokeInterface(selectedTenantId.value, row.serviceId);
      await loadSelectedTenant(selectedTenantId.value);
    } finally {
      actingId.value = null;
    }
  }

  return {
    tenants,
    selectedTenant,
    selectedTenantId,
    loading,
    actingId,
    showGrantDialog,
    grantTarget,
    grantForm,
    authorizeRows,
    allowedSummary,
    grantDialogTitle,
    refreshAll,
    openGrantDialog,
    closeGrantDialog,
    submitGrant,
    handleRevoke,
  };
}
