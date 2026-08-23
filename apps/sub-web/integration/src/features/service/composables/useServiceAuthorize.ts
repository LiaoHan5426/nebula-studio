import type { InterfaceGrantRecord } from '@/features/tenant/api';

import type { AuthorizeRow, GrantForm } from '../authorize/types';

import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { interfacesQueryOptions } from '@/features/interfaces/queryOptions';
import { tenantApi } from '@/features/tenant/api';
import {
  tenantDetailQueryOptions,
  tenantsQueryOptions,
} from '@/features/tenant/queryOptions';
import { getAuthUserId } from '@/shared/auth/session';
import { useAuth } from '@/shared/composables/useAuth';
import { useQuery } from '@tanstack/vue-query';

import {
  buildGrantOptions,
  formatAllowedSummary,
  grantFormFromRow,
  mapAuthorizeRow,
} from '../authorize/mappers';
import { DEFAULT_GRANT_FORM } from '../authorize/types';

export function useServiceAuthorize() {
  const route = useRoute();
  const { isPlatformAdmin } = useAuth();

  const selectedTenantId = ref('');
  const actingId = ref<null | string>(null);
  const showGrantDialog = ref(false);
  const grantTarget = ref<AuthorizeRow | null>(null);
  const grantForm = ref<GrantForm>({ ...DEFAULT_GRANT_FORM });

  const tenantsQuery = useQuery(() =>
    tenantsQueryOptions(isPlatformAdmin.value),
  );
  const servicesQuery = useQuery(() =>
    interfacesQueryOptions(
      isPlatformAdmin.value ? 'authorize-admin' : 'authorizable',
      {
        pageSize: 100,
        scope: isPlatformAdmin.value ? undefined : 'authorizable',
      },
    ),
  );
  const tenantDetailQuery = useQuery(() =>
    tenantDetailQueryOptions(selectedTenantId.value),
  );

  const tenants = computed(() => tenantsQuery.data.value ?? []);
  const services = computed(() => servicesQuery.data.value?.items ?? []);
  const selectedTenant = computed(() => tenantDetailQuery.data.value ?? null);
  const loading = computed(
    () =>
      servicesQuery.isPending.value ||
      (Boolean(selectedTenantId.value) && tenantDetailQuery.isPending.value),
  );

  watch(
    tenants,
    (list) => {
      if (!selectedTenantId.value && list[0]) {
        selectedTenantId.value = list[0].tenantId;
      }
    },
    { immediate: true },
  );

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

  const queryTenantId =
    typeof route.query.tenantId === 'string' ? route.query.tenantId : '';
  if (queryTenantId) {
    selectedTenantId.value = queryTenantId;
  }

  async function loadSelectedTenant(tenantId: string) {
    selectedTenantId.value = tenantId;
    await tenantDetailQuery.refetch();
  }

  async function refreshAll() {
    await Promise.all([
      servicesQuery.refetch(),
      selectedTenantId.value ? tenantDetailQuery.refetch() : Promise.resolve(),
    ]);
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
