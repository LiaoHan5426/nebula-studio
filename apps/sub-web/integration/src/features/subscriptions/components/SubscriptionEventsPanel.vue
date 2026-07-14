<script setup lang="ts">
import { NebulaButton, NebulaPane, NebulaTag } from '@nebula-studio/nebula-ui';

import type {
  SseConnectionState,
  SseEventRecord,
} from '@/shared/composables/useSubscriptionEvents';
import type { StatusVariant } from '../types';

defineProps<{
  selectedSubId: string;
  description: string;
  connectionState: SseConnectionState;
  error: string | null;
  events: SseEventRecord[];
  statusLabel: string;
  statusVariant: StatusVariant;
}>();

const emit = defineEmits<{
  clear: [];
  disconnect: [];
}>();
</script>

<template>
  <NebulaPane
    title="SSE 事件面板"
    :description="description"
    class="subscription-events"
  >
    <div class="subscription-events__status">
      <NebulaTag :variant="statusVariant">{{ statusLabel }}</NebulaTag>
      <span class="subscription-events__sub">订阅 {{ selectedSubId }}</span>
    </div>
    <div class="subscription-events__toolbar">
      <NebulaButton variant="outline" @click="emit('clear')">清空</NebulaButton>
      <NebulaButton variant="outline" @click="emit('disconnect')">
        断开
      </NebulaButton>
    </div>
    <div
      v-if="connectionState === 'connecting'"
      class="subscription-events__empty"
    >
      正在建立连接…
    </div>
    <div
      v-else-if="connectionState === 'error'"
      class="subscription-events__empty subscription-events__empty--error"
    >
      {{ error ?? '连接失败' }}
    </div>
    <div
      v-else-if="connectionState === 'connected' && events.length === 0"
      class="subscription-events__empty"
    >
      等待事件…
    </div>
    <div
      v-else-if="connectionState === 'idle'"
      class="subscription-events__empty"
    >
      未连接，请点击「监听事件」建立 SSE 连接
    </div>
    <pre
      v-for="ev in events"
      :key="ev.id + ev.receivedAt"
      class="subscription-events__event"
      >{{ ev.data }}</pre
    >
  </NebulaPane>
</template>

<style scoped>
.subscription-events {
  margin-top: 20px;
}

.subscription-events__status {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.subscription-events__sub {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.subscription-events__toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.subscription-events__empty {
  padding: 24px;
  color: hsl(var(--muted-foreground));
  text-align: center;
}

.subscription-events__empty--error {
  color: hsl(var(--destructive));
}

.subscription-events__event {
  padding: 8px;
  margin-bottom: 8px;
  overflow: auto;
  font-size: 12px;
  background: hsl(var(--muted) / 40%);
  border-radius: 6px;
}
</style>
