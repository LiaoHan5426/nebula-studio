<script setup lang="ts">
import type { IDomEditor } from '@wangeditor-next/editor';
import { Editor, Toolbar } from '@wangeditor-next/editor-for-vue';
import { computed, shallowRef, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    /** 工具栏 + 编辑区总高度 */
    height?: number | string;
    readonly?: boolean;
    /** 显示 wangEditor 工具栏（只读时默认隐藏） */
    showToolbar?: boolean;
    toolbarConfig?: Record<string, unknown>;
    editorConfig?: Record<string, unknown>;
  }>(),
  {
    height: 420,
    readonly: false,
    showToolbar: undefined,
    toolbarConfig: () => ({}),
    editorConfig: () => ({}),
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  /** wangEditor 实例就绪（可用于高级定制） */
  ready: [editor: IDomEditor];
}>();

const editorRef = shallowRef<IDomEditor | null>(null);

const htmlModel = computed({
  get: () => props.modelValue ?? '',
  set: (v: string) => emit('update:modelValue', v),
});

const normalizedHeight = computed(() =>
  typeof props.height === 'number' ? `${props.height}px` : props.height,
);

const toolbarVisible = computed(() => {
  if (props.showToolbar !== undefined) return props.showToolbar;
  return !props.readonly;
});

const mergedEditorConfig = computed(() => ({
  ...props.editorConfig,
}));

function handleCreated(editor: IDomEditor) {
  editorRef.value = editor;
  applyReadonly(editor, props.readonly);
  emit('ready', editor);
}

function applyReadonly(editor: IDomEditor, locked: boolean) {
  const ed = editor as IDomEditor & { enable?: (enabled?: boolean) => void };
  ed.enable?.(!locked);
}

watch(
  () => props.readonly,
  (locked) => {
    const ed = editorRef.value;
    if (ed) applyReadonly(ed, locked);
  },
);
</script>

<template>
  <div
    class="nebula-rich-editor"
    :class="{ 'nebula-rich-editor--readonly': readonly }"
    :style="{ height: normalizedHeight }"
  >
    <Toolbar
      v-if="toolbarVisible && editorRef"
      class="nebula-rich-editor__toolbar"
      mode="default"
      :editor="editorRef"
      :default-config="toolbarConfig"
    />
    <div class="nebula-rich-editor__editor-wrap">
      <Editor
        v-model="htmlModel"
        mode="default"
        class="nebula-rich-editor__editor"
        :default-config="mergedEditorConfig"
        @on-created="handleCreated"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.nebula-rich-editor {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  color: hsl(var(--foreground));
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
}

.nebula-rich-editor__toolbar {
  flex: 0 0 auto;
  border-bottom: 1px solid hsl(var(--border));
}

.nebula-rich-editor__editor-wrap {
  flex: 1 1 auto;
  min-height: 0;
}

.nebula-rich-editor__editor {
  height: 100%;
}

.nebula-rich-editor--readonly .nebula-rich-editor__toolbar {
  display: none;
}
</style>
