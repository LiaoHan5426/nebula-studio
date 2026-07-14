import { computed, onMounted, ref } from 'vue';

import { subscriptionApi } from '@/features/subscription/api';
import { dataSourceApi } from '@/shared/api/integration';
import { useSubscriptionEvents } from '@/shared/composables/useSubscriptionEvents';
import { useTenant } from '@/shared/composables/useTenant';
import type { DataSourceConfig, TableSubscription } from '@/shared/types';
import { isApiSuccess } from '@/shared/types';

import {
  buildCreateConfig,
  mapSubscriptionList,
  pollingIntervalSec,
} from '../mappers';
import {
  DEFAULT_CREATE_DRAFT,
  DEFAULT_SUBSCRIPTION_FORM,
  POLLING_INTERVAL_UPDATE_NOTICE,
} from '../types';
import type { CreateFormDraft, SubscriptionFormState } from '../types';

export function useSubscriptionsPage() {
  const { currentTenantId } = useTenant();

  const subscriptions = ref<TableSubscription[]>([]);
  const dataSources = ref<DataSourceConfig[]>([]);
  const loading = ref(false);
  const showCreate = ref(false);
  const selectedSubId = ref<string | null>(null);

  const form = ref<SubscriptionFormState>({ ...DEFAULT_SUBSCRIPTION_FORM });
  const createDraft = ref<CreateFormDraft>({ ...DEFAULT_CREATE_DRAFT });

  const pollingIntervalDrafts = ref<Record<string, number>>({});
  const savingIntervalId = ref<string | null>(null);
  const intervalNotice = ref<string | null>(null);

  const { events, connectionState, error, connect, disconnect, clearEvents } =
    useSubscriptionEvents();

  function sseDescription(): string {
    switch (connectionState.value) {
      case 'connected':
        return '已连接';
      case 'connecting':
        return '连接中…';
      case 'error':
        return error.value ?? '连接失败';
      default:
        return '未连接';
    }
  }

  const sseStatusLabel = computed(() => {
    switch (connectionState.value) {
      case 'connected':
        return 'SSE 已连接';
      case 'connecting':
        return 'SSE 连接中';
      case 'error':
        return 'SSE 异常';
      default:
        return 'SSE 未连接';
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

  onMounted(async () => {
    await Promise.all([loadSubscriptions(), loadDataSources()]);
  });

  async function loadSubscriptions() {
    loading.value = true;
    try {
      const response = await subscriptionApi.list({
        tenantId: currentTenantId.value || undefined,
      });
      if (isApiSuccess(response)) {
        subscriptions.value = mapSubscriptionList(response.data);
        for (const sub of subscriptions.value) {
          pollingIntervalDrafts.value[sub.subscriptionId] =
            pollingIntervalSec(sub);
        }
      }
    } finally {
      loading.value = false;
    }
  }

  async function loadDataSources() {
    const response = await dataSourceApi.list();
    if (isApiSuccess(response)) {
      dataSources.value = response.data;
      if (!form.value.dataSourceId && response.data[0]) {
        form.value.dataSourceId = response.data[0].dataSourceId;
      }
    }
  }

  async function handleCreate() {
    const tenantId = currentTenantId.value;
    if (!tenantId) return;

    const config = buildCreateConfig(form.value, createDraft.value);
    const response = await subscriptionApi.create(tenantId, config);
    if (isApiSuccess(response)) {
      showCreate.value = false;
      await loadSubscriptions();
    }
  }

  async function handleActivate(id: string) {
    await subscriptionApi.resume(id);
    await loadSubscriptions();
  }

  async function handleDeactivate(id: string) {
    await subscriptionApi.pause(id);
    await loadSubscriptions();
  }

  async function handleDelete(id: string) {
    if (selectedSubId.value === id) handleDisconnect();
    await subscriptionApi.delete(id);
    await loadSubscriptions();
  }

  async function applyPollingInterval(sub: TableSubscription) {
    intervalNotice.value = POLLING_INTERVAL_UPDATE_NOTICE;
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
          ? '订阅处于 ERROR 状态，请先点击「激活」恢复轮询后再监听'
          : '请先激活订阅后再监听事件';
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
