<script setup lang="ts">
import type { TaskGuide, TaskGuideId } from '@nebula-studio/app-shell';

import { computed, ref, watch } from 'vue';

import {
  readTaskGuideState,
  resolveHelpTopic,
  TASK_GUIDES,
  writeTaskGuideState,
} from '@nebula-studio/app-shell';
import {
  NebulaButton,
  NebulaDialog,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

const props = defineProps<{
  authenticated: boolean;
  helpKey?: string;
}>();
const emit = defineEmits<{
  navigate: [target: { path: string; viewId: string }];
}>();

const open = defineModel<boolean>('open', { default: false });
const state = ref(readTaskGuideState(window.localStorage));
const activeGuide = ref<TaskGuide>();
const promptedGuides = new Set<TaskGuideId>();
const contextualHelp = computed(() => resolveHelpTopic(props.helpKey));

watch(
  () => props.authenticated,
  (authenticated) => {
    if (
      authenticated &&
      !promptedGuides.has('first-login') &&
      !state.value['first-login']
    ) {
      promptedGuides.add('first-login');
      activeGuide.value = TASK_GUIDES[0];
      open.value = true;
    }
  },
  { immediate: true },
);

watch(
  () => props.helpKey,
  (helpKey) => {
    const id =
      helpKey === 'integration.access-request'
        ? 'first-request'
        : helpKey === 'integration.service-publish'
          ? 'first-publish'
          : undefined;
    if (!id || state.value[id] || promptedGuides.has(id)) return;
    const guide = TASK_GUIDES.find((item) => item.id === id);
    if (!guide) return;
    promptedGuides.add(id);
    activeGuide.value = guide;
    open.value = true;
  },
  { immediate: true },
);

function persist(): void {
  writeTaskGuideState(window.localStorage, state.value);
}

function start(guide: TaskGuide): void {
  activeGuide.value = guide;
  open.value = true;
}

function finish(id: TaskGuideId): void {
  state.value = { ...state.value, [id]: true };
  persist();
  activeGuide.value = undefined;
}

function restart(id: TaskGuideId): void {
  state.value = { ...state.value, [id]: false };
  persist();
  const guide = TASK_GUIDES.find((item) => item.id === id);
  if (guide) start(guide);
}

function openDocs(path: string): void {
  emit('navigate', { viewId: 'docs', path });
  open.value = false;
}

function beginTask(guide: TaskGuide): void {
  if (guide.action) emit('navigate', guide.action);
  open.value = false;
}
</script>

<template>
  <NebulaDialog
    v-model:open="open"
    title="帮助与任务引导"
    description="引导不会遮挡核心操作；可以跳过，并随时从这里重新开始。"
  >
    <section class="context-help">
      <span>当前页面帮助</span>
      <strong>{{ contextualHelp.title }}</strong>
      <NebulaButton variant="outline" @click="openDocs(contextualHelp.path)">
        打开对应文档
      </NebulaButton>
    </section>

    <section v-if="activeGuide" class="active-guide">
      <span>Task guide</span>
      <h3>{{ activeGuide.title }}</h3>
      <p>{{ activeGuide.description }}</p>
      <div class="guide-actions">
        <NebulaButton variant="ghost" @click="finish(activeGuide.id)">
          跳过本次引导
        </NebulaButton>
        <NebulaButton variant="outline" @click="openDocs(activeGuide.helpPath)">
          阅读步骤
        </NebulaButton>
        <NebulaButton v-if="activeGuide.action" @click="beginTask(activeGuide)">
          开始任务
        </NebulaButton>
        <NebulaButton v-else @click="finish(activeGuide.id)">
          我知道了
        </NebulaButton>
      </div>
    </section>

    <section class="guide-list">
      <header>
        <div>
          <span>可重启引导</span>
          <h3>首次任务</h3>
        </div>
      </header>
      <button
        v-for="guide in TASK_GUIDES"
        :key="guide.id"
        type="button"
        @click="state[guide.id] ? restart(guide.id) : start(guide)"
      >
        <div>
          <strong>{{ guide.title }}</strong>
          <p>{{ guide.description }}</p>
        </div>
        <NebulaTag :variant="state[guide.id] ? 'success' : 'default'">
          {{ state[guide.id] ? '重新开始' : '未完成' }}
        </NebulaTag>
      </button>
    </section>
  </NebulaDialog>
</template>

<style scoped>
.context-help,
.active-guide,
.guide-list {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-4);
  background: hsl(var(--muted) / 28%);
  border-radius: var(--radius-md);
}

.context-help {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
}

.context-help span,
.active-guide > span,
.guide-list header span {
  grid-column: 1 / -1;
  font-size: 11px;
  font-weight: 800;
  color: hsl(var(--muted-foreground));
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.active-guide,
.guide-list {
  margin-top: var(--space-3);
}

.active-guide h3,
.active-guide p,
.guide-list h3,
.guide-list p {
  margin: 0;
}

.active-guide p,
.guide-list p {
  color: hsl(var(--muted-foreground));
}

.guide-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: flex-end;
}

.guide-list button {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3);
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md);
}
</style>
