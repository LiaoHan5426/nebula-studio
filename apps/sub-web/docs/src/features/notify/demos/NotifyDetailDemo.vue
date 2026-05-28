<script setup lang="ts">
import { NebulaButton } from '@nebula-studio/nebula-ui';
import DocsDemoSection from '../../../components/DocsDemoSection.vue';
import notifyDetailDemoCode from './notify-detail-demo.code.md?raw';

defineProps<{
  sendNotificationWithPermissionDetail: () => Promise<void>;
  sendNotificationWithInfoDetail: () => Promise<void>;
  sendSystemNotification: () => Promise<void>;
}>();

const code = notifyDetailDemoCode;
</script>

<template>
  <DocsDemoSection
    section-id="notify-detail"
    title="增强详情"
    description="用于验证 detail modal、权限类响应与信息详情提交。"
    :code="code"
  >
    <div class="actions">
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
  </DocsDemoSection>
</template>

<style lang="scss" scoped>
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
  min-height: 38px;
  white-space: nowrap;
  background: hsl(var(--secondary) / 92%);
  border-color: hsl(var(--border));
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
