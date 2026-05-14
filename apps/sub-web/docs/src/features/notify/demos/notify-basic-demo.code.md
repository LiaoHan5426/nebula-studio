```vue
<script setup lang="ts">
import { NebulaButton } from '@nebula-studio/nebula-ui';
import DocsDemoSection from '../../../components/DocsDemoSection.vue';

defineProps<{
  sendMessageDefault: () => Promise<void>;
  sendMessageTimed: () => Promise<void>;
  sendNotificationDefault: () => Promise<void>;
}>();

/*
 * 逻辑层等价调用（IPC / 业务封装后多为 sendAppNotify）：
 *
 * await sendAppNotify('message', 'info', {
 *   message: 'Message 默认仅可通过关闭按钮关闭。',
 * });
 *
 * await sendAppNotify('message', 'success', {
 *   message: 'Message 3 秒后自动关闭，同时支持手动关闭。',
 *   showCloseButton: true,
 *   durationMs: 3000,
 * });
 *
 * await sendAppNotify('notification', 'warning', {
 *   message: 'Notification 默认定时关闭（5 秒）。',
 * });
 */
</script>

<template>
  <DocsDemoSection
    title="基础调用"
    description="用于验证 message 与 notification 的标准触发流程。"
  >
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
    </div>
  </DocsDemoSection>
</template>

<style scoped>
.actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.8rem;
  margin-top: 0.9rem;
}

.actions :deep(.nebula-btn) {
  justify-content: flex-start;
  width: 100%;
  max-width: 100%;
  white-space: nowrap;
  min-height: 38px;
  border-color: hsl(var(--border));
  background: hsl(var(--secondary) / 92%);
}

.action-btn {
  min-width: 0;
}

.action-label {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.88rem;
}
</style>
```
