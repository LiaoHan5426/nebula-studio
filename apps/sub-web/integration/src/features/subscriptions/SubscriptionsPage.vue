<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NebulaButton, NebulaPane, NebulaTag } from '@nebula-studio/nebula-ui';

import { dataSourceApi } from '@/shared/api/integration';
import { camelSubscribeApi } from '@/shared/api/subscribeApi';
import { useTenant } from '@/shared/composables/useTenant';
import type {
  DataSourceConfig,
  SubscriptionConfig,
  TableSubscription,
} from '@/shared/types';
import { SubscribeType, isApiSuccess } from '@/shared/types';
import { useSubscriptionEvents } from '@/shared/composables/useSubscriptionEvents';

const { currentTenantId } = useTenant();

const subscriptions = ref<TableSubscription[]>([]);
const dataSources = ref<DataSourceConfig[]>([]);
const loading = ref(false);
const showCreate = ref(false);
const selectedSubId = ref<string | null>(null);

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

function handleDisconnect() {
  disconnect();
  selectedSubId.value = null;
}

const DEFAULT_POLLING_INTERVAL_MS = 2000;

const form = ref<Partial<SubscriptionConfig>>({
  dataSourceId: '',
  tableName: 'demo_orders',
  subscribeType: SubscribeType.POLLING,
  columns: ['*'],
  eventTypes: ['INSERT', 'UPDATE', 'DELETE'],
  pollingConfig: {
    intervalMs: DEFAULT_POLLING_INTERVAL_MS,
    lastModifiedColumn: 'updated_at',
  },
});

const createPollingIntervalSec = ref(2);

const pollingIntervalDrafts = ref<Record<string, number>>({});
const savingIntervalId = ref<string | null>(null);
const intervalNotice = ref<string | null>(null);

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
    const response = await camelSubscribeApi.list();
    if (isApiSuccess(response)) {
      subscriptions.value = response.data;
      for (const sub of response.data) {
        pollingIntervalDrafts.value[sub.subscriptionId] =
          pollingIntervalSec(sub);
      }
    }
  } finally {
    loading.value = false;
  }
}

function pollingIntervalSec(sub: TableSubscription): number {
  const ms =
    sub.config.pollingConfig?.intervalMs ?? DEFAULT_POLLING_INTERVAL_MS;
  return Math.round(ms / 1000);
}

function pollingIntervalLabel(sub: TableSubscription): string {
  return `${pollingIntervalSec(sub)} 秒/次`;
}

async function applyPollingInterval(sub: TableSubscription) {
  intervalNotice.value =
    '轮询间隔修改需后端 PUT /api/console/subscription/{id} 支持，当前版本请删除后重建订阅';
  void sub;
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
  const payload = { ...form.value } as SubscriptionConfig;
  if (payload.subscribeType === SubscribeType.POLLING) {
    payload.pollingConfig = {
      lastModifiedColumn:
        payload.pollingConfig?.lastModifiedColumn ?? 'updated_at',
      pollingQuery: payload.pollingConfig?.pollingQuery ?? null,
      intervalMs: Math.max(1, createPollingIntervalSec.value) * 1000,
    };
  }
  const response = await camelSubscribeApi.create({
    dataSourceId: payload.dataSourceId,
    tableName: payload.tableName,
    subscribeType: payload.subscribeType,
    pollingConfig: payload.pollingConfig as Record<string, unknown>,
    columns: payload.columns,
    eventTypes: payload.eventTypes,
  });
  if (isApiSuccess(response)) {
    showCreate.value = false;
    await loadSubscriptions();
  }
}

async function handleActivate(id: string) {
  await camelSubscribeApi.resume(id);
  await loadSubscriptions();
}

async function handleDeactivate(id: string) {
  await camelSubscribeApi.pause(id);
  await loadSubscriptions();
}

async function handleDelete(id: string) {
  if (selectedSubId.value === id) handleDisconnect();
  await camelSubscribeApi.delete(id);
  await loadSubscriptions();
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

function statusVariant(status: string) {
  if (status === 'ACTIVE') return 'success';
  if (status === 'ERROR') return 'danger';
  if (status === 'SUSPENDED') return 'warning';
  return 'default';
}
</script>

<template>
  <div class="page">
    <NebulaPane title="库表订阅" description="创建订阅并实时监听 SSE 变更事件">
      <div class="page__toolbar">
        <NebulaButton @click="showCreate = true">新建订阅</NebulaButton>
        <NebulaButton variant="secondary" @click="loadSubscriptions"
          >刷新</NebulaButton
        >
      </div>

      <div v-if="loading" class="page__empty">加载中…</div>
      <div v-else-if="subscriptions.length === 0" class="page__empty">
        暂无订阅
      </div>
      <div v-else class="page__list">
        <article
          v-for="sub in subscriptions"
          :key="sub.subscriptionId"
          class="page__card"
        >
          <div class="page__card-head">
            <div>
              <h3>{{ sub.tableName }}</h3>
              <p class="page__meta">
                {{ sub.dataSourceId }} · {{ sub.subscribeType }}
                <template v-if="sub.subscribeType === SubscribeType.POLLING">
                  · 轮询 {{ pollingIntervalLabel(sub) }}
                </template>
              </p>
            </div>
            <NebulaTag :variant="statusVariant(sub.status)">{{
              sub.status
            }}</NebulaTag>
          </div>
          <div
            v-if="sub.subscribeType === SubscribeType.POLLING"
            class="page__interval"
          >
            <label class="page__interval-label">
              <span>轮询间隔（秒）</span>
              <input
                :value="pollingIntervalDrafts[sub.subscriptionId]"
                type="number"
                min="1"
                max="300"
                class="page__interval-input"
                @input="
                  setPollingDraft(
                    sub.subscriptionId,
                    Number(($event.target as HTMLInputElement).value),
                  )
                "
              />
            </label>
            <NebulaButton
              type="button"
              variant="secondary"
              :disabled="savingIntervalId === sub.subscriptionId"
              @click="applyPollingInterval(sub)"
            >
              {{
                savingIntervalId === sub.subscriptionId ? '保存中…' : '应用频率'
              }}
            </NebulaButton>
            <p v-if="intervalNotice" class="page__interval-notice">
              {{ intervalNotice }}
            </p>
          </div>
          <div class="page__actions">
            <NebulaButton
              v-if="sub.status !== 'ACTIVE'"
              variant="secondary"
              @click="handleActivate(sub.subscriptionId)"
            >
              激活
            </NebulaButton>
            <NebulaButton
              v-if="sub.status === 'ACTIVE'"
              variant="secondary"
              @click="handleDeactivate(sub.subscriptionId)"
            >
              停用
            </NebulaButton>
            <NebulaButton variant="secondary" @click="watchEvents(sub)">
              监听事件
            </NebulaButton>
            <NebulaButton
              variant="secondary"
              @click="handleDelete(sub.subscriptionId)"
            >
              删除
            </NebulaButton>
          </div>
        </article>
      </div>
    </NebulaPane>

    <NebulaPane
      v-if="selectedSubId"
      title="SSE 事件面板"
      :description="sseDescription()"
      class="page__events"
    >
      <div class="page__events-toolbar">
        <NebulaButton variant="secondary" @click="clearEvents"
          >清空</NebulaButton
        >
        <NebulaButton variant="secondary" @click="handleDisconnect"
          >断开</NebulaButton
        >
      </div>
      <div v-if="connectionState === 'connecting'" class="page__empty">
        正在建立连接…
      </div>
      <div
        v-else-if="connectionState === 'error'"
        class="page__empty page__empty--error"
      >
        {{ error ?? '连接失败' }}
      </div>
      <div
        v-else-if="connectionState === 'connected' && events.length === 0"
        class="page__empty"
      >
        等待事件…
      </div>
      <div v-else-if="connectionState === 'idle'" class="page__empty">
        未连接，请点击「监听事件」建立 SSE 连接
      </div>
      <pre
        v-for="ev in events"
        :key="ev.id + ev.receivedAt"
        class="page__event"
        >{{ ev.data }}</pre
      >
    </NebulaPane>

    <div
      v-if="showCreate"
      class="modal-overlay"
      @click.self="showCreate = false"
    >
      <NebulaPane title="新建订阅" class="modal">
        <label class="field">
          <span>数据源</span>
          <select v-model="form.dataSourceId" class="field__select">
            <option
              v-for="ds in dataSources"
              :key="ds.dataSourceId"
              :value="ds.dataSourceId"
            >
              {{ ds.name }} ({{ ds.dataSourceId }})
            </option>
          </select>
        </label>
        <label class="field"
          ><span>表名</span><input v-model="form.tableName"
        /></label>
        <label class="field">
          <span>订阅类型</span>
          <select v-model="form.subscribeType" class="field__select">
            <option :value="SubscribeType.POLLING">轮询</option>
            <option :value="SubscribeType.CDC">CDC</option>
            <option :value="SubscribeType.TRIGGER">触发器</option>
          </select>
        </label>
        <label
          v-if="form.subscribeType === SubscribeType.POLLING"
          class="field"
        >
          <span>轮询间隔（秒）</span>
          <input
            v-model.number="createPollingIntervalSec"
            type="number"
            min="1"
            max="300"
          />
          <span class="field__hint">最小 1 秒，默认 2 秒</span>
        </label>
        <div class="modal__actions">
          <NebulaButton variant="secondary" @click="showCreate = false"
            >取消</NebulaButton
          >
          <NebulaButton @click="handleCreate">创建</NebulaButton>
        </div>
      </NebulaPane>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 1200px;
  padding: 24px;
  margin: 0 auto;
}

.page__toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.page__empty {
  padding: 24px;
  color: hsl(var(--muted-foreground));
  text-align: center;
}

.page__empty--error {
  color: hsl(var(--destructive));
}

.page__list {
  display: grid;
  gap: 12px;
}

.page__card {
  padding: 16px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.page__card-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.page__card-head h3 {
  font-size: 15px;
  font-weight: 600;
}

.page__meta {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.page__interval {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-end;
  margin-bottom: 12px;
}

.page__interval-label {
  display: grid;
  gap: 4px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.page__interval-input {
  width: 88px;
  padding: 6px 8px;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.page__interval-notice {
  flex: 1 1 100%;
  margin: 0;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.page__events {
  margin-top: 20px;
}

.page__events-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.page__event {
  padding: 8px;
  margin-bottom: 8px;
  overflow: auto;
  font-size: 12px;
  background: hsl(var(--muted) / 40%);
  border-radius: 6px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 45%);
}

.modal {
  width: min(480px, 92vw);
}

.field {
  display: grid;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 13px;
}

.field input,
.field__select {
  padding: 8px 10px;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.field__hint {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}

.modal__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
