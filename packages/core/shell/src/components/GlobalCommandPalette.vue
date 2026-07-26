<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { NebulaIcon, NebulaTag } from '@nebula-studio/nebula-ui';
import type { GlobalSearchItem, GlobalSearchKind } from '../types/workspace';

const props = defineProps<{
  open: boolean;
  items: GlobalSearchItem[];
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  activate: [item: GlobalSearchItem];
}>();

const query = ref('');
const activeIndex = ref(0);
const input = ref<HTMLInputElement | null>(null);

const kindLabels: Record<GlobalSearchKind, string> = {
  app: '应用',
  resource: '资源',
  document: '文档',
  action: '动作',
};

const filteredItems = computed(() => {
  const keyword = query.value.trim().toLocaleLowerCase();
  if (!keyword) return props.items;
  return props.items.filter((item) =>
    [item.title, item.description, item.meta, ...(item.keywords ?? [])].some(
      (value) => value?.toLocaleLowerCase().includes(keyword),
    ),
  );
});

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    query.value = '';
    activeIndex.value = 0;
    await nextTick();
    input.value?.focus();
  },
);

watch(filteredItems, () => {
  activeIndex.value = 0;
});

function close(): void {
  emit('update:open', false);
}

function activate(item: GlobalSearchItem): void {
  emit('activate', item);
  close();
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault();
    close();
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    activeIndex.value = Math.min(
      activeIndex.value + 1,
      filteredItems.value.length - 1,
    );
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    activeIndex.value = Math.max(activeIndex.value - 1, 0);
  } else if (event.key === 'Enter') {
    const item = filteredItems.value[activeIndex.value];
    if (item) {
      event.preventDefault();
      activate(item);
    }
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="command-palette"
      role="dialog"
      aria-modal="true"
      aria-labelledby="command-palette-title"
      @keydown="onKeydown"
    >
      <button
        type="button"
        class="command-palette__backdrop"
        aria-label="关闭全局搜索"
        @click="close"
      />
      <section class="command-palette__panel">
        <h2 id="command-palette-title" class="sr-only">全局搜索</h2>
        <label class="command-palette__search">
          <NebulaIcon icon="search" aria-hidden="true" />
          <input
            ref="input"
            v-model="query"
            type="search"
            autocomplete="off"
            placeholder="搜索应用、资源、文档或动作"
            aria-label="全局搜索"
          />
          <kbd>Esc</kbd>
        </label>
        <ul
          v-if="filteredItems.length"
          class="command-palette__results"
          role="listbox"
        >
          <li v-for="(item, index) in filteredItems" :key="item.id">
            <button
              type="button"
              :class="{ 'is-active': index === activeIndex }"
              :aria-selected="index === activeIndex"
              role="option"
              @mouseenter="activeIndex = index"
              @click="activate(item)"
            >
              <NebulaIcon :icon="item.icon || 'search'" size="20" />
              <span>
                <strong>{{ item.title }}</strong>
                <small>{{ item.description }}</small>
              </span>
              <NebulaTag variant="default">
                {{ kindLabels[item.kind] }}
              </NebulaTag>
            </button>
          </li>
        </ul>
        <p v-else class="command-palette__empty">
          没有匹配结果。可尝试应用名称、资源类型或任务关键词。
        </p>
        <footer>
          <span><kbd>↑</kbd><kbd>↓</kbd> 选择</span>
          <span><kbd>Enter</kbd> 打开</span>
          <span>快捷键 <kbd>Ctrl K</kbd></span>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.command-palette {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: start center;
  padding: min(16vh, 9rem) var(--space-4) var(--space-4);
}

.command-palette__backdrop {
  position: absolute;
  inset: 0;
  background: hsl(var(--background) / 68%);
  border: 0;
  backdrop-filter: blur(10px);
}

.command-palette__panel {
  position: relative;
  width: min(42rem, 100%);
  overflow: hidden;
  background: hsl(var(--card) / 98%);
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-overlay);
}

.command-palette__search {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-4);
  border-bottom: 1px solid hsl(var(--border));
}

.command-palette__search input {
  flex: 1;
  min-width: 0;
  padding: 0;
  font: inherit;
  color: hsl(var(--foreground));
  outline: 0;
  background: transparent;
  border: 0;
}

.command-palette__results {
  display: grid;
  gap: var(--space-1);
  max-height: min(55vh, 30rem);
  padding: var(--space-2);
  margin: 0;
  overflow: auto;
  list-style: none;
}

.command-palette__results button {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  width: 100%;
  padding: var(--space-3);
  color: hsl(var(--foreground));
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
}

.command-palette__results button.is-active {
  background: hsl(var(--primary) / 9%);
  border-color: hsl(var(--primary) / 28%);
}

.command-palette__results button > span {
  display: grid;
  flex: 1;
  gap: 2px;
  min-width: 0;
}

.command-palette small {
  overflow: hidden;
  text-overflow: ellipsis;
  color: hsl(var(--muted-foreground));
  white-space: nowrap;
}

.command-palette__empty {
  padding: var(--space-8) var(--space-4);
  margin: 0;
  color: hsl(var(--muted-foreground));
  text-align: center;
}

.command-palette footer {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-caption);
  color: hsl(var(--muted-foreground));
  border-top: 1px solid hsl(var(--border));
}

kbd {
  padding: 2px 6px;
  font: inherit;
  background: hsl(var(--muted) / 60%);
  border: 1px solid hsl(var(--border));
  border-radius: 5px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  white-space: nowrap;
  border: 0;
  clip-path: inset(50%);
}
</style>
