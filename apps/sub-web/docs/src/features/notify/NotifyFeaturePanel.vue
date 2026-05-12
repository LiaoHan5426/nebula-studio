<script setup lang="ts">
import { NebulaAnchor } from '@nebula-studio/nebula-ui';
import DocsApiTable from '../../components/DocsApiTable.vue';
import NotifyBasicDemo from './demos/NotifyBasicDemo.vue';
import NotifyDetailDemo from './demos/NotifyDetailDemo.vue';
import { notifyDocAnchorItems } from './demos/notifyDocAnchors';
import NotifyResponseLog from './demos/NotifyResponseLog.vue';
import { notifyApiRows } from './demos/notifyApi';

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
  <div class="notify-layout">
    <NebulaAnchor
      :items="[...notifyDocAnchorItems]"
      title="On This Page"
      responsive
      back-top
      back-top-mode="float"
    />
    <section class="notify-docs">
      <NotifyBasicDemo
        :send-message-default="sendMessageDefault"
        :send-message-timed="sendMessageTimed"
        :send-notification-default="sendNotificationDefault"
      />
      <NotifyDetailDemo
        :send-notification-with-permission-detail="
          sendNotificationWithPermissionDetail
        "
        :send-notification-with-info-detail="sendNotificationWithInfoDetail"
        :send-system-notification="sendSystemNotification"
      />
      <NotifyResponseLog :lines="responseLogs" />
      <DocsApiTable
        section-id="notify-api"
        title="Notify API"
        :rows="notifyApiRows"
      />
    </section>
  </div>
</template>

<style lang="scss" scoped>
.notify-layout {
  position: relative;
}

.notify-docs {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
