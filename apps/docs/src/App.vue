<script setup lang="ts">
import { computed, provide, ref } from 'vue';
import {
  NebulaPane,
  NebulaThemeToggle,
  NebulaTreeMenu,
} from '@nebula-studio/nebula-ui';
import type { NebulaTreeNode } from '@nebula-studio/nebula-ui';
import { WEB_SHELL_EMBED_QUERY } from '@nebula-studio/app-shell';
import { useConfig } from '@nebula-studio-electron/electron-shared-vue';
import DocsNotifyCenter from './features/notify/components/DocsNotifyCenter.vue';
import { useDocsNotify } from './features/notify/composables/useDocsNotify';
import type { DocsFeatureDefinition, FeatureMenuNode } from './features/types';
import {
  DOCS_NAVIGATE_TO_FEATURE,
  type DocsNavigateToFeature,
} from './docsNavigation';

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

const navigateToFeature: DocsNavigateToFeature = (featureId: string) => {
  if (featuresById.has(featureId)) activeFeatureId.value = featureId;
};
provide(DOCS_NAVIGATE_TO_FEATURE, navigateToFeature);

const activeFeature = computed(() => featuresById.get(activeFeatureId.value));
const isNotifyFeatureActive = computed(
  () => activeFeature.value?.id === 'notify',
);
const { theme, toggleTheme } = useConfig();

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
const isWebScope = computed(() => scope() === 'web');

/** Web 壳 iframe 使用 `?embed=docs`（见 `apps/web/src/web-boot.ts`），顶栏已有主题切换，隐藏内容区重复开关 */
const showInlineWebThemeToggle = computed(() => {
  if (!isWebScope.value) return false;
  const embed = new URLSearchParams(window.location.search).get(
    WEB_SHELL_EMBED_QUERY,
  );
  return embed !== 'docs';
});

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
  <main class="docs-page">
    <div class="docs-shell">
      <aside class="docs-sidebar">
        <div class="brand-block">
          <p class="brand-title">Nebula UI Docs</p>
          <p class="brand-subtitle">组件展示与交互验证</p>
        </div>
        <NebulaTreeMenu
          :tree="featureTree"
          :active-value="activeFeatureId"
          @select="activeFeatureId = $event"
        />
      </aside>
      <section class="docs-content">
        <header class="feature-head">
          <div class="feature-head__top">
            <p class="feature-tag">Component</p>
            <NebulaThemeToggle
              v-if="showInlineWebThemeToggle"
              :theme="theme"
              tooltip="切换明暗主题"
              tooltip-placement="left"
              @update:theme="toggleTheme"
            />
          </div>
          <h1>{{ activeFeature?.title ?? 'No Feature' }}</h1>
          <p class="feature-desc">
            {{ activeFeature?.description ?? '请选择左侧功能项进行验证。' }}
          </p>
          <p class="feature-meta">
            Package <code>@nebula-studio-renderer/docs</code> · Scope
            <code>{{ scope() }}</code>
          </p>
        </header>

        <NebulaPane
          title="基础示例"
          description="以下区域用于展示当前组件能力、交互行为与可视反馈。"
          class="feature-pane"
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
.docs-page {
  min-height: 100vh;
  padding: 1.5rem 1.75rem;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
}

.docs-shell {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 1.5rem;
  max-width: 1240px;
  margin: 0 auto;
}

.docs-sidebar {
  position: sticky;
  top: 1.5rem;
  align-self: start;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

/* NebulaTreeMenu：分组标题与下方条目、分组与分组之间留白 */
.docs-sidebar :deep(.nebula-tree__root) {
  gap: 0.95rem;
}

.docs-sidebar :deep(.nebula-tree__node) {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.docs-sidebar :deep(.nebula-tree__children) {
  gap: 0.42rem;
}

.brand-block {
  padding: 0.95rem 1rem;
  border-radius: 12px;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--card));
}

.brand-title {
  margin: 0;
  font-size: 1.03rem;
  font-weight: 700;
}

.brand-subtitle {
  margin: 0.35rem 0 0;
  font-size: 0.86rem;
  color: hsl(var(--muted-foreground));
  line-height: 1.45;
}

.docs-content {
  min-width: 0;
}

.feature-head {
  margin-bottom: 1rem;
}

.feature-head__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
}

.feature-tag {
  display: inline-flex;
  margin: 0;
  padding: 0.16rem 0.45rem;
  border-radius: 999px;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--accent) / 45%);
  color: hsl(var(--muted-foreground));
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.feature-head h1 {
  margin: 0.55rem 0 0;
  font-size: 1.72rem;
  line-height: 1.2;
}

.feature-desc {
  margin: 0.45rem 0 0;
  color: hsl(var(--muted-foreground));
  font-size: 0.95rem;
  line-height: 1.45;
}

.feature-meta {
  margin: 0.5rem 0 0;
  font-size: 0.88rem;
  color: hsl(var(--muted-foreground));
}

.feature-pane {
  margin-top: 0.75rem;
}

code {
  font-size: 0.88em;
}

@media (width <= 980px) {
  .docs-shell {
    grid-template-columns: 1fr;
  }

  .docs-sidebar {
    position: static;
  }
}
</style>
