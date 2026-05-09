<script setup lang="ts">
import { NebulaButton, NebulaPane } from '@nebula-studio/nebula-ui';

defineProps<{
  responseLogs: string[];
  sendMessageDefault: () => Promise<void>;
  sendMessageTimed: () => Promise<void>;
  sendNotificationDefault: () => Promise<void>;
  sendNotificationWithPermissionDetail: () => Promise<void>;
  sendNotificationWithInfoDetail: () => Promise<void>;
  sendSystemNotification: () => Promise<void>;
}>();
</script>

<template>
  <section>
    <div class="actions">
      <NebulaButton
        variant="secondary"
        class="action-btn"
        tooltip="Message Default"
        @click="sendMessageDefault"
      >
        <span class="action-label">Message Default</span>
      </NebulaButton>
      <NebulaButton
        variant="secondary"
        class="action-btn"
        tooltip="Message Timed"
        @click="sendMessageTimed"
      >
        <span class="action-label">Message Timed</span>
      </NebulaButton>
      <NebulaButton
        variant="secondary"
        class="action-btn"
        tooltip="Notification Default"
        @click="sendNotificationDefault"
      >
        <span class="action-label">Notification Default</span>
      </NebulaButton>
      <NebulaButton
        variant="secondary"
        class="action-btn"
        tooltip="Notification Permission Detail"
        @click="sendNotificationWithPermissionDetail"
      >
        <span class="action-label">Notification Permission Detail</span>
      </NebulaButton>
      <NebulaButton
        variant="secondary"
        class="action-btn"
        tooltip="Notification Info Detail"
        @click="sendNotificationWithInfoDetail"
      >
        <span class="action-label">Notification Info Detail</span>
      </NebulaButton>
      <NebulaButton
        variant="secondary"
        class="action-btn"
        tooltip="Test system notification"
        @click="sendSystemNotification"
      >
        <span class="action-label">Test system notification</span>
      </NebulaButton>
    </div>
    <NebulaPane
      class="response-log"
      v-if="responseLogs.length > 0"
      title="Detail Response Log"
    >
      <p v-for="line in responseLogs" :key="line">
        {{ line }}
      </p>
    </NebulaPane>
  </section>
</template>

<style scoped>
.actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.actions :deep(.nebula-btn) {
  justify-content: flex-start;
  width: 100%;
  max-width: 100%;
  white-space: nowrap;
}

.action-btn {
  min-width: 0;
}

.action-label {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.response-log {
  margin-top: 1rem;
}

.response-log p {
  margin: 0.2rem 0;
  font-size: 0.85rem;
  color: hsl(var(--muted-foreground));
}
</style>
