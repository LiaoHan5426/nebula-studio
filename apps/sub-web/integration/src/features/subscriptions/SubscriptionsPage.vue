<script setup lang="ts">
import SubscriptionCreateDialog from './components/SubscriptionCreateDialog.vue';
import SubscriptionEventsPanel from './components/SubscriptionEventsPanel.vue';
import SubscriptionsList from './components/SubscriptionsList.vue';
import { useSubscriptionsPage } from './composables/useSubscriptionsPage';

const {
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
} = useSubscriptionsPage();
</script>

<template>
  <div class="page">
    <SubscriptionsList
      :loading="loading"
      :subscriptions="subscriptions"
      :polling-interval-drafts="pollingIntervalDrafts"
      :saving-interval-id="savingIntervalId"
      :interval-notice="intervalNotice"
      @create="openCreate"
      @refresh="loadSubscriptions"
      @activate="handleActivate"
      @deactivate="handleDeactivate"
      @watch="watchEvents"
      @delete="handleDelete"
      @update-polling-draft="setPollingDraft"
      @apply-interval="applyPollingInterval"
    />

    <SubscriptionEventsPanel
      v-if="selectedSubId"
      :selected-sub-id="selectedSubId"
      :description="sseDescription()"
      :connection-state="connectionState"
      :error="error"
      :events="events"
      :status-label="sseStatusLabel"
      :status-variant="sseStatusVariant"
      @clear="clearEvents"
      @disconnect="handleDisconnect"
    />

    <SubscriptionCreateDialog
      :open="showCreate"
      :form="form"
      :create-draft="createDraft"
      :data-sources="dataSources"
      @close="closeCreate"
      @submit="handleCreate"
      @update:form="form = $event"
      @update:create-draft="createDraft = $event"
    />
  </div>
</template>
