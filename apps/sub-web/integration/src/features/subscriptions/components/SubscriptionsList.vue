<script setup lang="ts">
import type { TableSubscription } from '@/shared/types';

import { useI18n } from 'vue-i18n';

import { NebulaButton, NebulaPane } from '@nebula-studio/nebula-ui';

import SubscriptionCard from './SubscriptionCard.vue';

defineProps<{
  intervalNotice: null | string;
  loading: boolean;
  pollingIntervalDrafts: Record<string, number>;
  savingIntervalId: null | string;
  subscriptions: TableSubscription[];
}>();

const emit = defineEmits<{
  activate: [id: string];
  'apply-interval': [sub: TableSubscription];
  create: [];
  deactivate: [id: string];
  delete: [id: string];
  refresh: [];
  'update-polling-draft': [subscriptionId: string, value: number];
  watch: [sub: TableSubscription];
}>();

const { t } = useI18n();
</script>

<template>
  <NebulaPane
    :title="t('subscriptions.title')"
    :description="t('subscriptions.description')"
  >
    <div class="page__toolbar">
      <NebulaButton variant="primary" @click="emit('create')">
        {{ t('subscriptions.create') }}
      </NebulaButton>
      <NebulaButton variant="outline" @click="emit('refresh')">
        {{ t('common.refresh') }}
      </NebulaButton>
    </div>

    <div v-if="loading" class="page__empty">{{ t('common.loading') }}</div>
    <div v-else-if="subscriptions.length === 0" class="page__empty">
      {{ t('subscriptions.empty') }}
    </div>
    <div v-else class="page__list">
      <SubscriptionCard
        v-for="sub in subscriptions"
        :key="sub.subscriptionId"
        :subscription="sub"
        :polling-interval-draft="pollingIntervalDrafts[sub.subscriptionId] ?? 2"
        :saving-interval="savingIntervalId === sub.subscriptionId"
        :interval-notice="intervalNotice"
        @activate="emit('activate', sub.subscriptionId)"
        @deactivate="emit('deactivate', sub.subscriptionId)"
        @watch="emit('watch', sub)"
        @delete="emit('delete', sub.subscriptionId)"
        @update:polling-interval="
          emit('update-polling-draft', sub.subscriptionId, $event)
        "
        @apply-interval="emit('apply-interval', sub)"
      />
    </div>
  </NebulaPane>
</template>
