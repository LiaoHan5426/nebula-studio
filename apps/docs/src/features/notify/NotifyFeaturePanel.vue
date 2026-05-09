<script setup lang="ts">
import { NebulaButton, NebulaPane } from '@nebula-studio/nebula-ui';
import DocsApiTable from '../../components/DocsApiTable.vue';
import DocsDemoSection from '../../components/DocsDemoSection.vue';

defineProps<{
  responseLogs: string[];
  sendMessageDefault: () => Promise<void>;
  sendMessageTimed: () => Promise<void>;
  sendNotificationDefault: () => Promise<void>;
  sendNotificationWithPermissionDetail: () => Promise<void>;
  sendNotificationWithInfoDetail: () => Promise<void>;
  sendSystemNotification: () => Promise<void>;
}>();

const apiRows = [
  {
    name: 'sendMessageDefault()',
    type: '() => Promise<void>',
    description: '发送默认消息通知，用于验证基础 message 流程。',
  },
  {
    name: 'sendMessageTimed()',
    type: '() => Promise<void>',
    description: '发送带超时参数的消息通知，验证自动关闭行为。',
  },
  {
    name: 'sendNotificationDefault()',
    type: '() => Promise<void>',
    description: '发送基础 notification 通知并展示默认操作。',
  },
  {
    name: 'sendNotificationWithPermissionDetail()',
    type: '() => Promise<void>',
    description: '发送权限相关 detail payload，验证 detail modal 交互。',
  },
  {
    name: 'sendNotificationWithInfoDetail()',
    type: '() => Promise<void>',
    description: '发送信息类 detail payload，验证日志返回与确认流程。',
  },
  {
    name: 'sendSystemNotification()',
    type: '() => Promise<void>',
    description: '触发系统通知桥接调用，验证桌面通知能力。',
  },
];

const baseExampleCode = `页面示例（Vue）：

\`\`\`vue
<template>
  <DocsDemoSection title="基础调用">
    <NebulaButton @click="sendMessageDefault">Message Default</NebulaButton>
    <NebulaButton @click="sendMessageTimed">Message Timed</NebulaButton>
    <NebulaButton @click="sendNotificationDefault">Notification Default</NebulaButton>
  </DocsDemoSection>
</template>
\`\`\`

逻辑示例（TS）：

\`\`\`ts
await sendAppNotify('message', 'info', {
  message: 'Message 默认仅可通过关闭按钮关闭。',
});

await sendAppNotify('message', 'success', {
  message: 'Message 3 秒后自动关闭，同时支持手动关闭。',
  showCloseButton: true,
  durationMs: 3000,
});

await sendAppNotify('notification', 'warning', {
  message: 'Notification 默认定时关闭（5 秒）。',
});
\`\`\``;

const detailExampleCode = `页面示例（Vue）：

\`\`\`vue
<template>
  <DocsDemoSection title="增强详情">
    <NebulaButton @click="sendNotificationWithPermissionDetail">
      Notification Permission Detail
    </NebulaButton>
    <NebulaButton @click="sendNotificationWithInfoDetail">
      Notification Info Detail
    </NebulaButton>
    <NebulaButton @click="sendSystemNotification">
      Test system notification
    </NebulaButton>
  </DocsDemoSection>
</template>
\`\`\`

逻辑示例（TS）：

\`\`\`ts
await sendAppNotify('notification', 'danger', {
  title: 'Permission Required',
  message: '点击查看详情并选择权限处理方式。',
  requestId: \`perm-\${Date.now()}\`,
  detail: {
    title: '文件系统权限请求',
    content: '请选择允许、拒绝，或稍后再说。',
    mode: 'choice',
    choices: [
      { key: 'allow', label: '允许', variant: 'primary' },
      { key: 'deny', label: '拒绝', variant: 'danger' },
      { key: 'later', label: '稍后提醒', variant: 'default' },
    ],
  },
});

await sendSystemNotification({
  title: 'Docs System Notification',
  body: 'This is a system-level notification test.',
});
\`\`\`

> 在 Web 发布环境中，系统通知依赖浏览器 Notification 权限。`;
</script>

<template>
  <section class="notify-docs">
    <DocsDemoSection
      title="基础调用"
      description="用于验证 message 与 notification 的标准触发流程。"
      :code="baseExampleCode"
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

    <DocsDemoSection
      title="增强详情"
      description="用于验证 detail modal、权限类响应与信息详情提交。"
      :code="detailExampleCode"
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
    <NebulaPane
      class="response-log"
      v-if="responseLogs.length > 0"
      title="Detail Response Log"
    >
      <p v-for="line in responseLogs" :key="line">
        {{ line }}
      </p>
    </NebulaPane>
    <DocsApiTable title="Notify API" :rows="apiRows" />
  </section>
</template>

<style scoped>
.notify-docs {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

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

.response-log {
  margin-top: 0.35rem;
}

.response-log p {
  margin: 0.24rem 0;
  font-size: 0.88rem;
  color: hsl(var(--muted-foreground));
  line-height: 1.45;
}
</style>
