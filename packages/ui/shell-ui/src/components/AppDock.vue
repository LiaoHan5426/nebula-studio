<!--
  应用集成面板组件（应用坞）。

  从 `frontend/App.vue` 提取（Plan-11 Task 9）。
  展示集成应用网格、拖拽排序、添加/隐藏应用。
-->
<script setup lang="ts">
import type { EmbeddedShellWindowId } from '@nebula-studio/app-shell';

import { computed, ref } from 'vue';

import { getShellIntegratedAppMeta } from '@nebula-studio/app-shell';
import { NebulaButton, NebulaDrag, NebulaIcon } from '@nebula-studio/nebula-ui';

const props = defineProps<{
  /** 面板是否可关闭 */
  closable: boolean;
  /** 待启用的休眠应用 ID 列表 */
  dormantIntegrableIds: string[];
  /** 集成网格视图 ID（v-model，可拖拽排序） */
  gridViewIds: string[];
  /** 面板是否可见 */
  open: boolean;
  /** 最近访问顺序 */
  recentViewIds?: string[];
  /** 当前用户角色，用于在启动器入口层过滤无权限应用 */
  roles?: string[];
}>();

const emit = defineEmits<{
  /** 关闭面板 */
  close: [];
  /** 启用应用 */
  'enable-app': [viewId: string];
  /** 隐藏应用 */
  'hide-app': [viewId: string];
  /** 拖拽排序完成 */
  reorder: [orderedViewIds: string[]];
  /** 进入子应用 */
  'select-app': [viewId: string];
  /** grid v-model 更新 */
  'update:gridViewIds': [value: string[]];
}>();

const isSorting = ref(false);
const query = ref('');
const category = ref('all');
const scope = ref<'all' | 'recent'>('all');

const gridModel = computed({
  get: () => props.gridViewIds,
  set: (val: string[]) => emit('update:gridViewIds', val),
});
const addPickerOpen = ref(false);
let suppressTileClickUntilTs = 0;

const categoryOptions = [
  { value: 'all', label: '全部分类' },
  { value: 'product', label: '产品与资源' },
  { value: 'support', label: '帮助与支持' },
  { value: 'settings', label: '设置' },
  { value: 'workspace', label: '工作台' },
];

function canAccess(viewId: string): boolean {
  const required = getShellIntegratedAppMeta(
    viewId as EmbeddedShellWindowId,
  ).roles;
  if (!required?.length || required.includes('authenticated')) return true;
  return required.some((role) => props.roles?.includes(role));
}

const filteredGridViewIds = computed(() => {
  const keyword = query.value.trim().toLocaleLowerCase();
  const recent = new Set(props.recentViewIds ?? []);
  return props.gridViewIds.filter((viewId) => {
    const meta = getShellIntegratedAppMeta(viewId as EmbeddedShellWindowId);
    if (!canAccess(viewId)) return false;
    if (scope.value === 'recent' && !recent.has(viewId)) return false;
    if (category.value !== 'all' && meta.category !== category.value)
      return false;
    return (
      !keyword ||
      [meta.label, meta.description, ...(meta.searchKeywords ?? [])].some(
        (value) => value?.toLocaleLowerCase().includes(keyword),
      )
    );
  });
});

const filtersActive = computed(
  () =>
    query.value.trim() !== '' ||
    category.value !== 'all' ||
    scope.value !== 'all',
);

function draggableItemKey(item: unknown): string {
  return String(item);
}

function onSortStart(): void {
  isSorting.value = true;
}

function onSortEnd(): void {
  isSorting.value = false;
  addPickerOpen.value = false;
  // 避免拖拽松手后浏览器补发 click，误触进入子应用
  suppressTileClickUntilTs = Date.now() + 180;
  emit('reorder', [...props.gridViewIds]);
}

function selectApp(viewId: string): void {
  if (Date.now() < suppressTileClickUntilTs) return;
  emit('select-app', viewId);
}
</script>

<template>
  <div
    v-if="open"
    class="integration-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="integration-dialog-title"
  >
    <button
      type="button"
      class="integration-backdrop"
      aria-label="关闭应用集成"
      @click="closable ? $emit('close') : undefined"
    ></button>
    <div class="integration-panel">
      <div class="integration-panel-head">
        <h2 id="integration-dialog-title" class="integration-title">
          应用启动器
        </h2>
        <NebulaButton v-if="closable" variant="ghost" @click="$emit('close')">
          关闭
        </NebulaButton>
      </div>
      <p class="integration-desc">
        按任务、分类或最近访问查找应用。全部视图下可拖拽调整顺序。
      </p>
      <div class="integration-panel-body">
        <div class="integration-filters" aria-label="应用筛选">
          <label>
            <span class="sr-only">搜索应用</span>
            <input
              v-model="query"
              type="search"
              placeholder="搜索应用"
              autocomplete="off"
            />
          </label>
          <label>
            <span class="sr-only">应用分类</span>
            <select v-model="category">
              <option
                v-for="option in categoryOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </label>
          <div class="integration-scope">
            <button
              type="button"
              :class="{ 'is-active': scope === 'all' }"
              @click="scope = 'all'"
            >
              全部
            </button>
            <button
              type="button"
              :class="{ 'is-active': scope === 'recent' }"
              @click="scope = 'recent'"
            >
              最近
            </button>
          </div>
        </div>
        <div class="integration-grid">
          <NebulaDrag
            v-if="!filtersActive"
            v-model="gridModel"
            class="integration-grid-apps"
            :item-key="draggableItemKey"
            handle=".integration-tile-icon"
            ghost-class="integration-tile-ghost"
            chosen-class="integration-tile-chosen"
            drag-class="integration-tile-drag"
            :animation="180"
            @start="onSortStart"
            @end="onSortEnd"
          >
            <template #item="{ element: viewId }">
              <div
                role="button"
                tabindex="0"
                class="integration-tile"
                :class="{ sorting: isSorting }"
                @click="selectApp(viewId)"
                @keydown.enter.prevent="selectApp(viewId)"
                @keydown.space.prevent="selectApp(viewId)"
              >
                <button
                  type="button"
                  class="integration-tile-hide"
                  title="隐藏应用"
                  aria-label="隐藏应用"
                  @click.stop="emit('hide-app', viewId)"
                >
                  <NebulaIcon icon="close" :size="12" />
                </button>
                <!-- eslint-disable vue/no-v-html -- registry iconSvg is static markup -->
                <span
                  class="integration-tile-icon"
                  aria-hidden="true"
                  v-html="
                    getShellIntegratedAppMeta(viewId as EmbeddedShellWindowId)
                      .iconSvg
                  "
                ></span>
                <!-- eslint-enable vue/no-v-html -->
                <span class="integration-tile-label">{{
                  getShellIntegratedAppMeta(viewId as EmbeddedShellWindowId)
                    .label
                }}</span>
                <span class="integration-tile-description">
                  {{
                    getShellIntegratedAppMeta(viewId as EmbeddedShellWindowId)
                      .description || '打开应用'
                  }}
                </span>
                <span class="integration-tile-launch">打开应用 →</span>
              </div>
            </template>
          </NebulaDrag>
          <template v-else>
            <div
              v-for="viewId in filteredGridViewIds"
              :key="viewId"
              role="button"
              tabindex="0"
              class="integration-tile"
              @click="selectApp(viewId)"
              @keydown.enter.prevent="selectApp(viewId)"
              @keydown.space.prevent="selectApp(viewId)"
            >
              <!-- eslint-disable vue/no-v-html -- registry iconSvg is static markup -->
              <span
                class="integration-tile-icon"
                aria-hidden="true"
                v-html="
                  getShellIntegratedAppMeta(viewId as EmbeddedShellWindowId)
                    .iconSvg
                "
              ></span>
              <!-- eslint-enable vue/no-v-html -->
              <span class="integration-tile-label">
                {{
                  getShellIntegratedAppMeta(viewId as EmbeddedShellWindowId)
                    .label
                }}
              </span>
              <span class="integration-tile-description">
                {{
                  getShellIntegratedAppMeta(viewId as EmbeddedShellWindowId)
                    .description || '打开应用'
                }}
              </span>
              <span class="integration-tile-launch">打开应用 →</span>
            </div>
            <p v-if="!filteredGridViewIds.length" class="integration-empty">
              没有符合当前筛选条件的应用。
            </p>
          </template>
          <button
            v-if="dormantIntegrableIds.length > 0"
            type="button"
            class="integration-tile integration-tile-add"
            :class="{ 'is-open': addPickerOpen }"
            :aria-expanded="addPickerOpen"
            aria-controls="integration-add-list"
            @click="addPickerOpen = !addPickerOpen"
          >
            <NebulaIcon
              class="integration-plus"
              icon="add"
              aria-hidden="true"
            />
            <span class="integration-tile-label">添加应用</span>
          </button>
        </div>

        <div
          v-show="addPickerOpen && dormantIntegrableIds.length > 0"
          id="integration-add-list"
          class="integration-add-panel"
        >
          <p class="integration-add-heading">待启用的应用</p>
          <ul class="integration-add-list">
            <li
              v-for="viewId in dormantIntegrableIds"
              :key="viewId"
              class="integration-add-li"
            >
              <button
                type="button"
                class="integration-add-btn"
                @click="emit('enable-app', viewId)"
              >
                <!-- eslint-disable vue/no-v-html -- registry iconSvg is static markup -->
                <span
                  class="integration-tile-icon sm"
                  aria-hidden="true"
                  v-html="
                    getShellIntegratedAppMeta(viewId as EmbeddedShellWindowId)
                      .iconSvg
                  "
                ></span>
                <!-- eslint-enable vue/no-v-html -->
                <span>{{
                  getShellIntegratedAppMeta(viewId as EmbeddedShellWindowId)
                    .label
                }}</span>
                <span class="integration-add-hint">启用</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.integration-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: stretch;
  justify-content: center;
  pointer-events: auto;
}

.integration-panel {
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
  max-height: 100%;
  padding: clamp(24px, 4vw, 52px);
  overflow: hidden;
  background: hsl(var(--background) / 96%);
}

.integration-backdrop {
  position: absolute;
  inset: 0;
  cursor: pointer;
  background: rgb(8 10 18 / 52%);
  border: 0;
  backdrop-filter: blur(2px);
}

.integration-panel-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.integration-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
  margin-top: var(--space-4);
}

.integration-filters input,
.integration-filters select {
  min-height: 2.5rem;
  padding: 0 var(--space-3);
  font: inherit;
  color: hsl(var(--foreground));
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md);
}

.integration-scope {
  display: flex;
  padding: 3px;
  background: hsl(var(--muted) / 45%);
  border-radius: var(--radius-md);
}

.integration-scope button {
  padding: var(--space-2) var(--space-3);
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: calc(var(--radius-md) - 2px);
}

.integration-scope button.is-active {
  color: hsl(var(--foreground));
  background: hsl(var(--card));
  box-shadow: var(--shadow-soft);
}

.integration-empty {
  grid-column: 1 / -1;
  color: hsl(var(--muted-foreground));
}

.integration-panel-head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
}

.integration-title {
  margin: 0;
  font-size: clamp(26px, 3vw, 38px);
  font-weight: 760;
  color: hsl(var(--foreground));
  letter-spacing: 0.2px;
}

.integration-desc {
  max-width: 46rem;
  margin: 10px 0 0;
  font-size: 15px;
  line-height: 1.5;
  color: hsl(var(--muted-foreground));
}

.integration-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
  justify-content: flex-start;
  margin-top: 18px;
}

.integration-grid-apps {
  display: contents;
}

.integration-tile {
  position: relative;
  display: flex;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  grid-template-rows: auto auto;
  gap: 4px 14px;
  align-items: center;
  min-height: 112px;
  padding: 18px;
  color: hsl(var(--foreground));
  cursor: pointer;
  user-select: none;
  text-align: left;
  background: hsl(var(--card) / 74%);
  border: 1px solid hsl(var(--border) / 72%);
  border-radius: var(--radius-lg);
  transition:
    transform 0.18s ease,
    background 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.integration-tile.sorting {
  cursor: grab;
}

.integration-tile-hide {
  position: absolute;
  top: 6px;
  right: 6px;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  line-height: 0;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: hsl(var(--background) / 35%);
  border: 1px solid hsl(var(--border) / 65%);
  border-radius: 999px;
}

.integration-tile-hide :deep(svg) {
  display: block;
  width: 12px;
  height: 12px;
}

.integration-tile-hide:hover {
  color: hsl(var(--danger));
  background: hsl(var(--danger) / 10%);
  border-color: hsl(var(--danger) / 35%);
}

.integration-tile:hover {
  background: hsl(var(--card));
  border-color: hsl(var(--primary) / 42%);
  box-shadow: 0 14px 32px hsl(var(--foreground) / 7%);
  transform: translateY(-2px);
}

.integration-tile.dragging {
  opacity: 0.88;
}

.integration-tile-ghost {
  background: hsl(var(--primary) / 8%);
  border-color: hsl(var(--primary) / 62%);
  border-style: dashed;
  box-shadow: inset 0 0 0 2px hsl(var(--primary) / 24%);
}

.integration-tile-ghost .integration-tile-hide,
.integration-tile-ghost .integration-tile-icon,
.integration-tile-ghost .integration-tile-label {
  opacity: 0.05;
}

.integration-tile-chosen {
  border-color: hsl(var(--primary) / 55%);
  box-shadow: 0 10px 24px hsl(var(--primary) / 16%);
}

.integration-tile-drag {
  opacity: 0.95;
}

.integration-tile-label {
  grid-row: 1;
  grid-column: 2;
  font-size: 14px;
  font-weight: 700;
}

.integration-tile-description {
  display: -webkit-box;
  grid-row: 2;
  grid-column: 2 / -1;
  overflow: hidden;
  font-size: 12px;
  line-height: 1.5;
  color: hsl(var(--muted-foreground));
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.integration-tile-launch {
  grid-row: 1;
  grid-column: 3;
  font-size: 11px;
  font-weight: 700;
  color: hsl(var(--primary));
  opacity: 0;
  transition: opacity var(--motion-fast, 160ms) ease;
}

.integration-tile:hover .integration-tile-launch,
.integration-tile:focus-visible .integration-tile-launch {
  opacity: 1;
}

.integration-tile-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  grid-row: 1 / span 2;
  grid-column: 1;
  width: 44px;
  height: 44px;
  padding: 10px;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 10%);
  border: 1px solid hsl(var(--primary) / 16%);
  border-radius: 13px;
}

.integration-tile-icon.sm {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
}

.integration-tile-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.integration-tile-add {
  border-style: dashed;
}

.integration-tile-add.is-open {
  border-color: hsl(var(--primary) / 45%);
  border-style: solid;
}

.integration-plus {
  font-size: 34px;
  font-weight: 200;
  line-height: 1;
  color: hsl(var(--muted-foreground));
}

.integration-add-panel {
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid hsl(var(--border) / 65%);
}

.integration-add-heading {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  color: hsl(var(--muted-foreground));
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.integration-add-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.integration-add-li {
  margin: 0;
}

.integration-add-btn {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  color: hsl(var(--foreground));
  text-align: left;
  cursor: pointer;
  background: hsl(var(--muted) / 30%);
  border: 1px solid hsl(var(--border) / 65%);
  border-radius: 12px;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.integration-add-btn:hover {
  background: hsl(var(--primary) / 12%);
  border-color: hsl(var(--primary) / 40%);
}

.integration-add-hint {
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--primary));
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
