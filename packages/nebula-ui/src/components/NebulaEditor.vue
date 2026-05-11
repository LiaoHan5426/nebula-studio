<script setup lang="ts">
/**
 * 统一编辑入口：`code` 使用 CodeMirror 6；`richtext` 使用 wangEditor（HTML 字符串）。
 *
 * **顶部工具栏（可选）**
 * - **`embed-preview`**：在组件内分栏嵌入 **`NebulaReader`**，与编辑区统一样式；预览区纵向滚动受限于编辑区高度。
 * - **`show-code-language-switch`**（仅 `variant="code"`）：工具栏内语法下拉，需 **`v-model:code-language`** 与 `bindingFromNebulaEditor` / 内嵌预览一致。
 * - **`v-model:preview-open`**：是否显示内嵌预览（仅 **`embed-preview`** 时 meaningful；默认 `true`）。
 *
 * **与 NebulaReader 预览（外部自行分栏时）**
 * - 使用 **`bindingFromNebulaEditor(v-model, { variant, codeLanguage })`** 得到 `{ source, format }`，
 *   再 `<NebulaReader :source :format />`；代码预览在 **`format="plain"`** 时请加 **`plain-highlight-language`**（与
 *   **`v-model:code-language`** 同步）以启用 highlight.js 语法高亮。
 *
 * **整篇一种语法 vs 一篇多段语法**
 * - `codeLanguage` 表示 **整个编辑区** 的主语言。
 * - 混排多种 fence 语言时将 **主语言设为 `markdown`**，在正文里写 fenced 代码块。
 */
import { computed, useId } from 'vue';
import NebulaCodeEditor from './NebulaCodeEditor.vue';
import NebulaRichEditor from './NebulaRichEditor.vue';
import { NebulaReader } from './NebulaReader';
import { bindingFromNebulaEditor } from '../utils/nebulaEditorReader';
import type {
  NebulaEditorCodeLanguage,
  NebulaEditorVariant,
} from './NebulaEditorTypes';
import { NEBULA_EDITOR_CODE_LANGUAGE_OPTIONS } from './NebulaEditorTypes';

const props = withDefaults(
  defineProps<{
    variant: NebulaEditorVariant;
    modelValue: string;
    /** 仅 `variant="code"` 时生效 */
    codeLanguage?: NebulaEditorCodeLanguage;
    /** 仅 `variant="code"`：工具栏内语言下拉，需配合 `v-model:code-language` */
    showCodeLanguageSwitch?: boolean;
    /** 代码编辑器占位（无障碍）；CodeMirror 当前版本仅作提示属性 */
    placeholder?: string;
    /** 编辑区高度（px 或 css）；内嵌预览时分栏两侧与此对齐 */
    height?: number | string;
    readonly?: boolean;
    /** 仅富文本：是否显示 wangEditor 工具栏（默认只读时隐藏） */
    showToolbar?: boolean;
    toolbarConfig?: Record<string, unknown>;
    editorConfig?: Record<string, unknown>;
    /** 内嵌 NebulaReader 分栏；预览区 `max-height` 与编辑区一致 */
    embedPreview?: boolean;
  }>(),
  {
    codeLanguage: 'typescript',
    showCodeLanguageSwitch: false,
    placeholder: '',
    readonly: false,
    height: undefined,
    showToolbar: undefined,
    toolbarConfig: () => ({}),
    editorConfig: () => ({}),
    embedPreview: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'update:codeLanguage': [value: NebulaEditorCodeLanguage];
}>();

/** 内嵌预览是否展开（仅 `embed-preview` 时使用） */
const previewOpen = defineModel('previewOpen', {
  type: Boolean,
  default: true,
});

const langSelectId = useId();

const chromeVisible = computed(() => {
  if (props.embedPreview) return true;
  return props.variant === 'code' && props.showCodeLanguageSwitch;
});

const readerBinding = computed(() =>
  bindingFromNebulaEditor(props.modelValue, {
    variant: props.variant,
    codeLanguage: props.codeLanguage,
  }),
);

const plainHighlightLanguage = computed(() =>
  readerBinding.value.format === 'plain' ? props.codeLanguage : undefined,
);

const resolvedEditorHeight = computed(
  () => props.height ?? (props.variant === 'code' ? 320 : 420),
);

const showSplitPreview = computed(
  () => props.embedPreview && previewOpen.value,
);

function onCodeLanguageChange(ev: Event): void {
  const el = ev.target as HTMLSelectElement;
  emit('update:codeLanguage', el.value as NebulaEditorCodeLanguage);
}

function togglePreview(): void {
  previewOpen.value = !previewOpen.value;
}
</script>

<template>
  <div class="nebula-editor">
    <div v-if="chromeVisible" class="nebula-editor__chrome">
      <div class="nebula-editor__chrome-start">
        <template v-if="variant === 'code' && showCodeLanguageSwitch">
          <label class="nebula-editor__chrome-label" :for="langSelectId"
            >语法</label
          >
          <select
            :id="langSelectId"
            class="nebula-editor__chrome-select"
            :value="codeLanguage"
            :disabled="readonly"
            @change="onCodeLanguageChange"
          >
            <option
              v-for="opt in NEBULA_EDITOR_CODE_LANGUAGE_OPTIONS"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </template>
      </div>
      <div v-if="embedPreview" class="nebula-editor__chrome-end">
        <button
          type="button"
          class="nebula-editor__preview-toggle"
          :aria-pressed="previewOpen"
          @click="togglePreview"
        >
          {{ previewOpen ? '隐藏预览' : '预览' }}
        </button>
      </div>
    </div>

    <!-- code -->
    <template v-if="variant === 'code'">
      <div v-if="showSplitPreview" class="nebula-editor__split">
        <div class="nebula-editor__split-editor">
          <NebulaCodeEditor
            :model-value="modelValue"
            :language="codeLanguage"
            :placeholder="placeholder"
            :height="resolvedEditorHeight"
            :readonly="readonly"
            @update:model-value="emit('update:modelValue', $event)"
          />
        </div>
        <div class="nebula-editor__split-reader">
          <div class="nebula-editor__reader-scroll">
            <NebulaReader
              :source="readerBinding.source"
              :format="readerBinding.format"
              :plain-highlight-language="plainHighlightLanguage"
            />
          </div>
        </div>
      </div>
      <NebulaCodeEditor
        v-else
        :model-value="modelValue"
        :language="codeLanguage"
        :placeholder="placeholder"
        :height="resolvedEditorHeight"
        :readonly="readonly"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </template>

    <!-- richtext -->
    <template v-else>
      <div v-if="showSplitPreview" class="nebula-editor__split">
        <div class="nebula-editor__split-editor">
          <NebulaRichEditor
            :model-value="modelValue"
            :height="resolvedEditorHeight"
            :readonly="readonly"
            :show-toolbar="showToolbar"
            :toolbar-config="toolbarConfig"
            :editor-config="editorConfig"
            @update:model-value="emit('update:modelValue', $event)"
          />
        </div>
        <div class="nebula-editor__split-reader">
          <div
            class="nebula-editor__reader-scroll nebula-editor__reader-scroll--html"
          >
            <NebulaReader
              :source="readerBinding.source"
              :format="readerBinding.format"
            />
          </div>
        </div>
      </div>
      <NebulaRichEditor
        v-else
        :model-value="modelValue"
        :height="resolvedEditorHeight"
        :readonly="readonly"
        :show-toolbar="showToolbar"
        :toolbar-config="toolbarConfig"
        :editor-config="editorConfig"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.nebula-editor {
  width: 100%;
}

.nebula-editor__chrome {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.45rem;
  min-height: 2rem;
}

.nebula-editor__chrome-start {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.nebula-editor__chrome-end {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.nebula-editor__chrome-label {
  flex-shrink: 0;
  font-size: 0.78rem;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
}

.nebula-editor__chrome-select {
  min-width: 9.5rem;
  padding: 0.28rem 0.45rem;
  font-size: 0.82rem;
  color: hsl(var(--foreground));
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  cursor: pointer;
}

.nebula-editor__chrome-select:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.nebula-editor__preview-toggle {
  padding: 0.28rem 0.65rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  background: hsl(var(--secondary));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  cursor: pointer;
}

.nebula-editor__preview-toggle:hover {
  background: hsl(var(--accent));
}

.nebula-editor__split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  align-items: stretch;
  width: 100%;
  min-width: 0;
}

.nebula-editor__split-editor {
  min-width: 0;
  min-height: 0;
}

.nebula-editor__split-reader {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  background: hsl(var(--card));
  overflow: hidden;
}

.nebula-editor__reader-scroll {
  flex: 1 1 auto;
  min-height: 0;
  max-height: 100%;
  overflow: auto;
  padding: 0.65rem 0.85rem;
}

.nebula-editor__reader-scroll--html {
  max-height: 100%;
}

@media (width < 720px) {
  .nebula-editor__split {
    grid-template-columns: 1fr;
  }
}
</style>
