<!--
  应用集成面板组件（应用坞）。

  从 `frontend/App.vue` 提取（Plan-11 Task 9）。
  展示集成应用网格、拖拽排序、添加/隐藏应用。
-->
<script setup lang="ts">
import { ref } from 'vue';
import type { EmbeddedShellWindowId } from '@nebula-studio/app-shell';
import { getShellIntegratedAppMeta } from '@nebula-studio/app-shell';
import { NebulaButton, NebulaDrag } from '@nebula-studio/nebula-ui';

const props = defineProps<{
  /** 面板是否可见 */
  open: boolean;
  /** 面板是否可关闭 */
  closable: boolean;
  /** 集成网格视图 ID（v-model，可拖拽排序） */
  gridViewIds: string[];
  /** 待启用的休眠应用 ID 列表 */
  dormantIntegrableIds: string[];
}>();

const emit = defineEmits<{
  /** 进入子应用 */
  'select-app': [viewId: string];
  /** 隐藏应用 */
  'hide-app': [viewId: string];
  /** 启用应用 */
  'enable-app': [viewId: string];
  /** 拖拽排序完成 */
  reorder: [orderedViewIds: string[]];
  /** 关闭面板 */
  close: [];
}>();

const isSorting = ref(false);
const addPickerOpen = ref(false);
let suppressTileClickUntilTs = 0;

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
    />
    <div class="integration-panel">
      <div class="integration-panel-head">
        <h2 id="integration-dialog-title" class="integration-title">
          应用集成
        </h2>
        <NebulaButton v-if="closable" variant="ghost" @click="$emit('close')">
          关闭
        </NebulaButton>
      </div>
      <p class="integration-desc">
        点击图标可进入子应用；右上角可隐藏已添加应用；使用加号可重新启用。
      </p>
      <div class="integration-panel-body">
        <div class="integration-grid">
          <NebulaDrag
            v-model="gridViewIds"
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
                  ×
                </button>
                <span
                  class="integration-tile-icon"
                  aria-hidden="true"
                  v-html="
                    getShellIntegratedAppMeta(viewId as EmbeddedShellWindowId)
                      .iconSvg
                  "
                />
                <span class="integration-tile-label">{{
                  getShellIntegratedAppMeta(viewId as EmbeddedShellWindowId)
                    .label
                }}</span>
              </div>
            </template>
          </NebulaDrag>
          <button
            v-if="dormantIntegrableIds.length > 0"
            type="button"
            class="integration-tile integration-tile-add"
            :class="{ 'is-open': addPickerOpen }"
            :aria-expanded="addPickerOpen"
            aria-controls="integration-add-list"
            @click="addPickerOpen = !addPickerOpen"
          >
            <span class="integration-plus" aria-hidden="true">+</span>
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
                <span
                  class="integration-tile-icon sm"
                  aria-hidden="true"
                  v-html="
                    getShellIntegratedAppMeta(viewId as EmbeddedShellWindowId)
                      .iconSvg
                  "
                />
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
  padding: 22px 24px 24px;
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

.integration-panel-head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
}

.integration-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: hsl(var(--foreground));
  letter-spacing: 0.2px;
}

.integration-desc {
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: hsl(var(--muted-foreground));
}

.integration-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 220px));
  gap: 16px;
  justify-content: flex-start;
  margin-top: 18px;
}

.integration-grid-apps {
  display: contents;
}

.integration-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 132px;
  padding: 16px 12px;
  color: hsl(var(--foreground));
  cursor: pointer;
  user-select: none;
  background: hsl(var(--muted) / 38%);
  border: 1px solid hsl(var(--border) / 72%);
  border-radius: 14px;
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
  width: 22px;
  height: 22px;
  padding: 0;
  font-size: 14px;
  line-height: 1;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: hsl(var(--background) / 35%);
  border: 1px solid hsl(var(--border) / 65%);
  border-radius: 999px;
}

.integration-tile-hide:hover {
  color: hsl(var(--danger));
  background: hsl(var(--danger) / 10%);
  border-color: hsl(var(--danger) / 35%);
}

.integration-tile:hover {
  background: hsl(var(--primary) / 10%);
  border-color: hsl(var(--primary) / 42%);
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
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.integration-tile-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  color: hsl(var(--foreground));
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
</style>
