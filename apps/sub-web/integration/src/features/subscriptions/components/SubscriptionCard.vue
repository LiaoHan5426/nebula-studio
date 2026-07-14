<script setup lang="ts">
import { NebulaButton, NebulaTag } from '@nebula-studio/nebula-ui';

import { SubscribeType } from '@/shared/types';
import type { TableSubscription } from '@/shared/types';

import {
  cdcModeLabel,
  cdcTablesLabel,
  pollingIntervalLabel,
  statusVariant,
} from '../mappers';

defineProps<{
  subscription: TableSubscription;
  pollingIntervalDraft: number;
  savingInterval: boolean;
  intervalNotice: string | null;
}>();

const emit = defineEmits<{
  activate: [];
  deactivate: [];
  watch: [];
  delete: [];
  'update:polling-interval': [value: number];
  'apply-interval': [];
}>();
</script>

<template>
  <article class="subscription-card">
    <div class="subscription-card__head">
      <div>
        <h3>{{ subscription.tableName }}</h3>
        <p class="subscription-card__meta">
          {{ subscription.dataSourceId }} · {{ subscription.subscribeType }}
          <template v-if="subscription.subscribeType === SubscribeType.POLLING">
            · 轮询 {{ pollingIntervalLabel(subscription) }}
          </template>
          <template v-if="subscription.subscribeType === SubscribeType.CDC">
            · {{ cdcModeLabel(subscription) }} · 表
            {{ cdcTablesLabel(subscription) }}
          </template>
        </p>
      </div>
      <NebulaTag :variant="statusVariant(subscription.status)">
        {{ subscription.status }}
      </NebulaTag>
    </div>

    <div
      v-if="subscription.subscribeType === SubscribeType.POLLING"
      class="subscription-card__interval"
    >
      <label class="subscription-card__interval-label">
        <span>轮询间隔（秒）</span>
        <input
          :value="pollingIntervalDraft"
          type="number"
          min="1"
          max="300"
          class="subscription-card__interval-input"
          @input="
            emit(
              'update:polling-interval',
              Number(($event.target as HTMLInputElement).value),
            )
          "
        />
      </label>
      <NebulaButton
        type="button"
        variant="outline"
        :disabled="savingInterval"
        @click="emit('apply-interval')"
      >
        {{ savingInterval ? '保存中…' : '应用频率' }}
      </NebulaButton>
      <p v-if="intervalNotice" class="subscription-card__interval-notice">
        {{ intervalNotice }}
      </p>
    </div>

    <div class="subscription-card__actions">
      <NebulaButton
        v-if="subscription.status !== 'ACTIVE'"
        variant="outline"
        @click="emit('activate')"
      >
        激活
      </NebulaButton>
      <NebulaButton
        v-if="subscription.status === 'ACTIVE'"
        variant="outline"
        @click="emit('deactivate')"
      >
        停用
      </NebulaButton>
      <NebulaButton variant="outline" @click="emit('watch')">
        监听事件
      </NebulaButton>
      <NebulaButton variant="outline" @click="emit('delete')">
        删除
      </NebulaButton>
    </div>
  </article>
</template>

<style scoped>
.subscription-card {
  padding: 16px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.subscription-card__head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.subscription-card__head h3 {
  font-size: 15px;
  font-weight: 600;
}

.subscription-card__meta {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.subscription-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.subscription-card__interval {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-end;
  margin-bottom: 12px;
}

.subscription-card__interval-label {
  display: grid;
  gap: 4px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.subscription-card__interval-input {
  width: 88px;
  padding: 6px 8px;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.subscription-card__interval-notice {
  flex: 1 1 100%;
  margin: 0;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}
</style>
