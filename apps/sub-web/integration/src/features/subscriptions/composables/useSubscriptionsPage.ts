import type { DataSourceConfig, TableSubscription } from '@/shared/types';

import type { CreateFormDraft, SubscriptionFormState } from '../types';

import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { dataSourcesQueryOptions } from '@/features/datasources/queryOptions';
import { subscriptionApi } from '@/features/subscription/api';
import { useSubscriptionEvents } from '@/shared/composables/useSubscriptionEvents';
import { useTenant } from '@/shared/composables/useTenant';
import { isApiSuccess } from '@/shared/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';

import { buildCreateConfig, pollingIntervalSec } from '../mappers';
import {
  createSubscriptionMutationOptions,
  subscriptionsQueryKey,
  subscriptionsQueryOptions,
} from '../queryOptions';
import { DEFAULT_CREATE_DRAFT, DEFAULT_SUBSCRIPTION_FORM } from '../types';

export function useSubscriptionsPage() {
  const { t } = useI18n();
  const { currentTenantId } = useTenant();
  const queryClient = useQueryClient();

  const showCreate = ref(false);
  const selectedSubId = ref<null | string>(null);
  const form = ref<SubscriptionFormState>({ ...DEFAULT_SUBSCRIPTION_FORM });
  const createDraft = ref<CreateFormDraft>({ ...DEFAULT_CREATE_DRAFT });
  const pollingIntervalDrafts = ref<Record<string, number>>({});
  const savingIntervalId = ref<null | string>(null);
  const intervalNotice = ref<null | string>(null);

  const { events, connectionState, error, connect, disconnect, clearEvents } =
    useSubscriptionEvents();

  const subscriptionsQuery = useQuery(() =>
    subscriptionsQueryOptions(currentTenantId.value || undefined),
  );
  const dataSourcesQuery = useQuery(() => dataSourcesQueryOptions());
  const createMutation = useMutation(createSubscriptionMutationOptions());

  const subscriptions = computed(() => subscriptionsQuery.data.value ?? []);
  const dataSources = computed(
    () => dataSourcesQuery.data.value ?? ([] as DataSourceConfig[]),
  );
  const loading = computed(
    () =>
      subscriptionsQuery.isPending.value || dataSourcesQuery.isPending.value,
  );

  watch(
    subscriptions,
    (list) => {
      for (const sub of list) {
        if (pollingIntervalDrafts.value[sub.subscriptionId] === null) {
          pollingIntervalDrafts.value[sub.subscriptionId] =
            pollingIntervalSec(sub);
        }
      }
    },
    { immediate: true },
  );

  watch(
    dataSources,
    (list) => {
      if (!form.value.dataSourceId && list[0]) {
        form.value.dataSourceId = list[0].dataSourceId;
      }
    },
    { immediate: true },
  );

  function sseDescription(): string {
    switch (connectionState.value) {
      case 'connected':
        return t('subscriptions.sse.connected');
      case 'connecting':
        return t('subscriptions.sse.connecting');
      case 'error':
        return error.value ?? t('subscriptions.sse.failed');
      default:
        return t('subscriptions.sse.idle');
    }
  }

  const sseStatusLabel = computed(() => {
    switch (connectionState.value) {
      case 'connected':
        return t('subscriptions.sse.statusConnected');
      case 'connecting':
        return t('subscriptions.sse.statusConnecting');
      case 'error':
        return t('subscriptions.sse.statusError');
      default:
        return t('subscriptions.sse.statusIdle');
    }
  });

  const sseStatusVariant = computed(() => {
    switch (connectionState.value) {
      case 'connected':
        return 'success';
      case 'connecting':
        return 'warning';
      case 'error':
        return 'danger';
      default:
        return 'default';
    }
  });

  function setPollingDraft(subscriptionId: string, value: number) {
    intervalNotice.value = null;
    pollingIntervalDrafts.value = {
      ...pollingIntervalDrafts.value,
      [subscriptionId]: value,
    };
  }

  async function invalidateSubscriptions() {
    await queryClient.invalidateQueries({
      queryKey: subscriptionsQueryKey(currentTenantId.value || undefined),
    });
  }

  async function loadSubscriptions() {
    await invalidateSubscriptions();
  }

  async function handleCreate() {
    const tenantId = currentTenantId.value;
    if (!tenantId) return;
    const config = buildCreateConfig(form.value, createDraft.value);
    const response = await createMutation.mutateAsync({ tenantId, config });
    if (isApiSuccess(response)) {
      showCreate.value = false;
      await invalidateSubscriptions();
    }
  }

  async function handleActivate(id: string) {
    await subscriptionApi.resume(id);
    await invalidateSubscriptions();
  }

  async function handleDeactivate(id: string) {
    await subscriptionApi.pause(id);
    await invalidateSubscriptions();
  }

  async function handleDelete(id: string) {
    if (selectedSubId.value === id) handleDisconnect();
    await subscriptionApi.delete(id);
    await invalidateSubscriptions();
  }

  async function applyPollingInterval(sub: TableSubscription) {
    intervalNotice.value = t('subscriptions.pollingUpdateNotice');
    void sub;
  }

  function handleDisconnect() {
    disconnect();
    selectedSubId.value = null;
  }

  function watchEvents(sub: TableSubscription) {
    if (sub.status !== 'ACTIVE') {
      selectedSubId.value = sub.subscriptionId;
      disconnect();
      clearEvents();
      connectionState.value = 'error';
      error.value =
        sub.status === 'ERROR'
          ? t('subscriptions.sse.needActivateError')
          : t('subscriptions.sse.needActivate');
      return;
    }
    selectedSubId.value = sub.subscriptionId;
    clearEvents();
    connect(sub.subscriptionId);
  }

  function openCreate() {
    showCreate.value = true;
  }

  function closeCreate() {
    showCreate.value = false;
  }

  return {
    subscriptions,
    dataSources,
    loading,
    showCreate,
    selectedSubId,
    form,
    createDraft,
    pollingIntervalDrafts,
    savingIntervalId,
    intervalNotice,
    events,
    connectionState,
    error,
    sseDescription,
    sseStatusLabel,
    sseStatusVariant,
    setPollingDraft,
    loadSubscriptions,
    handleCreate,
    handleActivate,
    handleDeactivate,
    handleDelete,
    applyPollingInterval,
    handleDisconnect,
    watchEvents,
    clearEvents,
    openCreate,
    closeCreate,
  };
}
