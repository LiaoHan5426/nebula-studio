<script setup lang="ts">
/**
 * Markdown **同一数据源**：左侧（或独占）`NebulaEditor` 编辑源码，右侧（或独占）`NebulaReader` 预览。
 */
import NebulaEditor from '../NebulaEditor.vue';
import { NebulaReader } from '../reader/NebulaReader';
import type { NebulaMarkdownPaneMode } from '../types';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    mode?: NebulaMarkdownPaneMode;
    editorHeight?: number | string;
    previewMinHeight?: number | string;
    readonly?: boolean;
    placeholder?: string;
  }>(),
  {
    mode: 'split',
    editorHeight: 280,
    previewMinHeight: 240,
    readonly: false,
    placeholder: '',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

function px(v: number | string | undefined, fallback: string): string {
  if (v === undefined) return fallback;
  return typeof v === 'number' ? `${v}px` : v;
}
</script>

<template>
  <div class="nebula-md-pane" :data-mode="mode">
    <section v-if="mode !== 'preview'" class="nebula-md-pane__editor">
      <NebulaEditor
        variant="code"
        code-language="markdown"
        :model-value="modelValue"
        :readonly="readonly"
        :placeholder="placeholder"
        :height="px(editorHeight, '280px')"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </section>
    <section
      v-if="mode !== 'edit'"
      class="nebula-md-pane__preview"
      :style="{ minHeight: px(previewMinHeight, '240px') }"
    >
      <div class="nebula-md-pane__preview-scroll">
        <NebulaReader :source="modelValue" format="markdown" />
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.nebula-md-pane {
  display: grid;
  gap: 0.75rem;
  align-items: stretch;
  width: 100%;
}

.nebula-md-pane[data-mode='split'] {
  grid-template-columns: 1fr 1fr;
}

@media (width <= 900px) {
  .nebula-md-pane[data-mode='split'] {
    grid-template-columns: 1fr;
  }
}

.nebula-md-pane__editor {
  min-width: 0;
}

.nebula-md-pane__preview {
  min-width: 0;
  overflow: hidden;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
}

.nebula-md-pane__preview-scroll {
  max-height: min(72vh, 720px);
  padding: 0.65rem 0.85rem;
  overflow: auto;
}
</style>
