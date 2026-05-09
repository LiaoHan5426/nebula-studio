<script setup lang="ts">
import { computed, ref } from 'vue';
import { NebulaPane, NebulaTreeMenu } from '@nebula-studio/nebula-ui';
import type { NebulaTreeNode } from '@nebula-studio/nebula-ui';
import DocsNotifyCenter from './features/notify/components/DocsNotifyCenter.vue';
import { useDocsNotify } from './features/notify/composables/useDocsNotify';
import type { DocsFeatureDefinition, FeatureMenuNode } from './features/types';

const featureModules = import.meta.glob('./features/**/feature.ts', {
  eager: true,
});

const features = Object.values(featureModules)
  .map((mod) => (mod as { default: DocsFeatureDefinition }).default)
  .toSorted(
    (a, b) =>
      (a.order ?? 1000) - (b.order ?? 1000) || a.title.localeCompare(b.title),
  );

const featuresById = new Map(features.map((feature) => [feature.id, feature]));

function buildFeatureTree(items: DocsFeatureDefinition[]): FeatureMenuNode[] {
  const roots: FeatureMenuNode[] = [];
  for (const feature of items) {
    const path = feature.menuPath ?? [];
    let cursor = roots;
    let keyPrefix = 'root';
    for (const segment of path) {
      const key = `${keyPrefix}/${segment}`;
      let node = cursor.find((item) => item.key === key);
      if (!node) {
        node = { key, title: segment, children: [] };
        cursor.push(node);
      }
      cursor = node.children;
      keyPrefix = key;
    }
    cursor.push({
      key: `${keyPrefix}/${feature.id}`,
      title: feature.title,
      children: [],
      featureId: feature.id,
    });
  }
  return roots;
}

const featureTree: NebulaTreeNode[] = buildFeatureTree(features).map((node) =>
  toNebulaTreeNode(node),
);
const activeFeatureId = ref(features[0]?.id ?? '');
const activeFeature = computed(() => featuresById.get(activeFeatureId.value));
const isNotifyFeatureActive = computed(
  () => activeFeature.value?.id === 'notify',
);

const {
  messageToasts,
  notificationToasts,
  detailModalToast,
  responseLogs,
  removeToast,
  openNotificationDetail,
  submitDetailAction,
  sendMessageDefault,
  sendMessageTimed,
  sendNotificationDefault,
  sendNotificationWithPermissionDetail,
  sendNotificationWithInfoDetail,
  sendSystemNotification,
} = useDocsNotify();

const scope = () =>
  typeof window.api === 'object' && window.api !== null && 'scope' in window.api
    ? String((window.api as { scope?: string }).scope)
    : '?';

function toNebulaTreeNode(node: FeatureMenuNode): NebulaTreeNode {
  return {
    key: node.key,
    title: node.title,
    value: node.featureId,
    children: node.children.map((child) => toNebulaTreeNode(child)),
  };
}
</script>

<template>
  <main class="wrap">
    <h1>Docs</h1>
    <p class="muted">Package <code>@nebula-studio-renderer/docs</code></p>
    <p>
      Preload scope: <code>{{ scope() }}</code>
    </p>
    <div class="layout">
      <NebulaTreeMenu
        :tree="featureTree"
        :active-value="activeFeatureId"
        @select="activeFeatureId = $event"
      />
      <section class="content">
        <NebulaPane
          :title="activeFeature?.title ?? 'No Feature'"
          :description="
            activeFeature?.description ?? '请选择左侧功能项进行验证。'
          "
        >
          <component
            :is="activeFeature?.component"
            v-if="activeFeature?.component"
            v-bind="
              isNotifyFeatureActive
                ? {
                    responseLogs,
                    sendMessageDefault,
                    sendMessageTimed,
                    sendNotificationDefault,
                    sendNotificationWithPermissionDetail,
                    sendNotificationWithInfoDetail,
                    sendSystemNotification,
                  }
                : {}
            "
          />
        </NebulaPane>
      </section>
    </div>
    <DocsNotifyCenter
      :message-toasts="messageToasts"
      :notification-toasts="notificationToasts"
      :detail-modal-toast="detailModalToast"
      @remove="removeToast"
      @open-detail="openNotificationDetail"
      @submit-detail-action="submitDetailAction"
    />
  </main>
</template>

<style scoped>
.wrap {
  min-height: 100vh;
  padding: 2rem;
  font-family: system-ui, sans-serif;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
}

h1 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
}

.muted {
  margin-bottom: 1rem;
  color: hsl(var(--muted-foreground));
}

code {
  font-size: 0.9em;
}

.layout {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-top: 1rem;
}

.content {
  flex: 1;
  min-width: 0;
}
</style>
