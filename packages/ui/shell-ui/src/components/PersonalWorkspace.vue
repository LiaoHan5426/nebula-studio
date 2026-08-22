<script setup lang="ts">
import type {
  WorkspaceLink,
  WorkspaceModel,
  WorkspaceSummary,
} from '../types/workspace';

import { computed } from 'vue';

import {
  NebulaButton,
  NebulaEmptyState,
  NebulaIcon,
  NebulaPageHeader,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

const props = defineProps<{
  model: WorkspaceModel;
  username?: string;
}>();

const emit = defineEmits<{
  activate: [item: WorkspaceLink];
  manageApps: [];
  search: [];
}>();

const greeting = computed(() => {
  const hour = new Date().getHours();
  const prefix = hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';
  return props.username ? `${prefix}，${props.username}` : prefix;
});

function summaryVariant(
  tone: WorkspaceSummary['tone'],
): 'danger' | 'default' | 'info' | 'success' | 'warning' {
  if (tone === 'danger') return 'danger';
  if (tone === 'neutral') return 'default';
  return tone ?? 'default';
}
</script>

<template>
  <main class="personal-workspace" tabindex="-1">
    <NebulaPageHeader
      eyebrow="Personal workspace"
      :title="greeting"
      description="从最近访问继续工作，或处理申请、待办与运行异常。"
      help-href="/guide/workspace"
    >
      <template #actions>
        <NebulaButton variant="outline" @click="emit('manageApps')">
          管理应用
        </NebulaButton>
        <NebulaButton variant="primary" @click="emit('search')">
          全局搜索
        </NebulaButton>
      </template>
    </NebulaPageHeader>

    <section class="personal-workspace__summaries" aria-label="工作摘要">
      <button
        v-for="summary in model.summaries"
        :key="summary.id"
        type="button"
        class="personal-workspace__summary"
        :disabled="!summary.action"
        @click="summary.action && emit('activate', summary.action)"
      >
        <span class="personal-workspace__summary-label">
          {{ summary.label }}
        </span>
        <strong>{{ summary.value }}</strong>
        <NebulaTag :variant="summaryVariant(summary.tone)">
          {{ summary.description }}
        </NebulaTag>
      </button>
    </section>

    <div class="personal-workspace__columns">
      <section class="personal-workspace__panel">
        <header>
          <div>
            <p class="personal-workspace__eyebrow">Continue</p>
            <h2>最近访问</h2>
          </div>
        </header>
        <ul v-if="model.recent.length" class="personal-workspace__list">
          <li v-for="item in model.recent" :key="item.id">
            <button type="button" @click="emit('activate', item)">
              <NebulaIcon :icon="item.icon || 'history'" />
              <span>
                <strong>{{ item.title }}</strong>
                <small>{{ item.description || item.meta }}</small>
              </span>
              <NebulaIcon icon="arrow-right" />
            </button>
          </li>
        </ul>
        <NebulaEmptyState
          v-else
          title="还没有最近访问"
          description="打开应用或资源后，这里会保留继续工作的入口。"
        >
          <template #actions>
            <NebulaButton variant="outline" @click="emit('manageApps')">
              打开应用启动器
            </NebulaButton>
          </template>
        </NebulaEmptyState>
      </section>

      <section class="personal-workspace__panel">
        <header>
          <div>
            <p class="personal-workspace__eyebrow">Shortcuts</p>
            <h2>快捷操作</h2>
          </div>
        </header>
        <div class="personal-workspace__quick-actions">
          <button
            v-for="item in model.quickActions"
            :key="item.id"
            type="button"
            @click="emit('activate', item)"
          >
            <NebulaIcon :icon="item.icon || 'add'" size="20" />
            <span>
              <strong>{{ item.title }}</strong>
              <small>{{ item.description }}</small>
            </span>
          </button>
        </div>
      </section>
    </div>

    <section class="personal-workspace__panel">
      <header>
        <div>
          <p class="personal-workspace__eyebrow">Resources</p>
          <h2>常用资源</h2>
        </div>
        <NebulaButton variant="ghost" size="sm" @click="emit('search')">
          查找更多
        </NebulaButton>
      </header>
      <div
        v-if="model.commonResources.length"
        class="personal-workspace__resources"
      >
        <button
          v-for="item in model.commonResources"
          :key="item.id"
          type="button"
          @click="emit('activate', item)"
        >
          <NebulaIcon :icon="item.icon || 'database'" size="20" />
          <span>
            <strong>{{ item.title }}</strong>
            <small>{{ item.description }}</small>
          </span>
          <NebulaTag variant="info">{{ item.meta || '资源' }}</NebulaTag>
        </button>
      </div>
      <NebulaEmptyState
        v-else
        title="尚未固定常用资源"
        description="Phase 4 接入资源目录后，收藏和已获批资源会汇总到这里。"
      />
    </section>
  </main>
</template>

<style scoped>
.personal-workspace {
  box-sizing: border-box;
  display: grid;
  gap: var(--surface-gap-comfortable);
  width: 100%;
  min-height: 100%;
  padding: var(--surface-padding-comfortable);
  overflow: auto;
}

.personal-workspace__summaries {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-3);
}

.personal-workspace__summary {
  display: grid;
  gap: var(--space-2);
  min-width: 0;
  padding: var(--space-4);
  color: hsl(var(--foreground));
  text-align: left;
  cursor: pointer;
  background: hsl(var(--card) / 84%);
  border: 1px solid hsl(var(--border) / 72%);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
}

.personal-workspace__summary:disabled {
  cursor: default;
}

.personal-workspace__summary strong {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  line-height: 1;
}

.personal-workspace__summary-label {
  font-size: var(--font-size-caption);
  color: hsl(var(--muted-foreground));
}

.personal-workspace__columns {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(18rem, 0.9fr);
  gap: var(--space-4);
}

.personal-workspace__panel {
  min-width: 0;
  padding: var(--space-5);
  background: hsl(var(--card) / 72%);
  border: 1px solid hsl(var(--border) / 68%);
  border-radius: var(--radius-lg);
}

.personal-workspace__panel > header {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.personal-workspace__panel h2,
.personal-workspace__eyebrow {
  margin: 0;
}

.personal-workspace__panel h2 {
  font-size: var(--font-size-section);
}

.personal-workspace__eyebrow {
  margin-bottom: var(--space-1);
  font-size: var(--font-size-caption);
  font-weight: 700;
  color: hsl(var(--primary));
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.personal-workspace__list {
  display: grid;
  gap: var(--space-2);
  padding: 0;
  margin: 0;
  list-style: none;
}

.personal-workspace__list button,
.personal-workspace__quick-actions button,
.personal-workspace__resources button {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  width: 100%;
  padding: var(--space-3);
  color: hsl(var(--foreground));
  text-align: left;
  cursor: pointer;
  background: hsl(var(--muted) / 24%);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
}

.personal-workspace__list button:hover,
.personal-workspace__quick-actions button:hover,
.personal-workspace__resources button:hover {
  background: hsl(var(--primary) / 8%);
  border-color: hsl(var(--primary) / 28%);
}

.personal-workspace__list span,
.personal-workspace__quick-actions span,
.personal-workspace__resources span {
  display: grid;
  flex: 1;
  gap: 2px;
  min-width: 0;
}

.personal-workspace small {
  overflow: hidden;
  text-overflow: ellipsis;
  color: hsl(var(--muted-foreground));
  white-space: nowrap;
}

.personal-workspace__quick-actions,
.personal-workspace__resources {
  display: grid;
  gap: var(--space-2);
}

.personal-workspace__resources {
  grid-template-columns: repeat(auto-fit, minmax(min(17rem, 100%), 1fr));
}

@media (width <= 64rem) {
  .personal-workspace__summaries {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .personal-workspace__columns {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (width <= 36rem) {
  .personal-workspace {
    padding: var(--surface-padding-compact);
  }

  .personal-workspace__summaries {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
