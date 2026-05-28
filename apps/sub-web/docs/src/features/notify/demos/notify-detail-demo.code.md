```vue
<script setup lang="ts">
import { NebulaButton } from '@nebula-studio/nebula-ui';
import DocsDemoSection from '../../../components/DocsDemoSection.vue';

defineProps<{
  sendNotificationWithPermissionDetail: () => Promise<void>;
  sendNotificationWithInfoDetail: () => Promise<void>;
  sendSystemNotification: () => Promise<void>;
}>();

/*
 * await sendAppNotify('notification', 'danger', {
 *   title: 'Permission Required',
 *   message: '点击查看详情并选择权限处理方式。',
 *   requestId: `perm-${Date.now()}`,
 *   detail: {
 *     title: '文件系统权限请求',
 *     content: '请选择允许、拒绝，或稍后再说。',
 *     mode: 'choice',
 *     choices: [
 *       { key: 'allow', label: '允许', variant: 'primary' },
 *       { key: 'deny', label: '拒绝', variant: 'danger' },
 *       { key: 'later', label: '稍后提醒', variant: 'default' },
 *     ],
 *   },
 * });
 *
 * await sendSystemNotification({
 *   title: 'Docs System Notification',
 *   body: 'This is a system-level notification test.',
 * });
 */
</script>

<template>
  <DocsDemoSection
    title="增强详情"
    description="用于验证 detail modal、权限类响应与信息详情提交。"
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

> 在 Web 发布环境中，系统通知依赖浏览器 Notification 权限。
